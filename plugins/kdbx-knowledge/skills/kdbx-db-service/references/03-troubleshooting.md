# Troubleshooting

## Contents

- [Service Components](#service-components)
- [Startup Checklist](#startup-checklist)
- ["KDB-X DB Service not licensed"](#kdb-x-db-service-not-licensed)
- [500 / Timeout After Restarting a Single Container](#500--timeout-after-restarting-a-single-container)
- [Gateway Returns 500 on `/api/v0/tables`](#gateway-returns-500-on-apiv0tables)
- [fxfeed.py: "Unable to connect to localhost:5002"](#fxfeedpy-unable-to-connect-to-localhost5002)
- [inotify "No space left on device"](#inotify-no-space-left-on-device)
- [Import Job Errors: "no file found: /imports/\<filename>"](#import-job-errors-no-file-found-importsfilename)
- [pip install Fails: "externally-managed-environment"](#pip-install-fails-externally-managed-environment)
- [Verifying fxfeed.py is Publishing Data](#verifying-fxfeedpy-is-publishing-data)
- [q Client: `'use` Error (Standard kdb+ vs kdb-x)](#q-client-use-error-standard-kdb-vs-kdb-x)
- [q Client: `'notfound: kx.dbservice_client` or `'notfound: kx.kurl`](#q-client-notfound-kxdbservice_client-or-notfound-kxkurl)
- [q Client: New vs Old API](#q-client-new-vs-old-api)
- [Dashboard "Connection Failed" on Port 10002](#dashboard-connection-failed-on-port-10002)
- [Notebook Kernel Stuck or Hanging](#notebook-kernel-stuck-or-hanging)
- [Log Investigation](#log-investigation)
- [venv / uv Issues](#venv--uv-issues)
- [`shutil.copy2` PermissionError on Docker Volume](#shutilcopy2-permissionerror-on-docker-volume)

This module covers service component descriptions, common errors, and diagnostic procedures. Check here before digging into raw logs.

---

## Service Components

Understanding which container does what helps narrow down the source of an error.

| Container | Role | Common failure modes |
|-----------|------|---------------------|
| **kx-db-rt** | Reliable Transport bus - accepts real-time streaming publishes on port 5002 | License rejection; connection refusal to streaming feed |
| **kx-db-sm** | Storage Manager - receives ingest jobs, writes data to disk | License errors; ingest failures; "not licensed" on /tables endpoint |
| **kx-db-da** | Data Access - serves queries across RDB/IDB/HDB tiers | Query errors; 503 responses |
| **kx-db-rc** | Route Controller - coordinates query routing across DA replicas | Routing errors when DA is unavailable |
| **kx-db-agg** | Aggregator - merges results from multiple DA shards | Incorrect aggregated results; timeout on large queries |
| **kx-db-gw** | Gateway - exposes HTTP REST (port 8080) and q IPC (port 5040) | Proxies errors from SM/DA; 500 during startup |

The gateway proxies errors from the SM and DA components. When you see a 500 at `/api/v0/tables`, the actual error is usually in `kx-db-sm` logs.

---

## Startup Checklist

Run these checks before debugging any specific issue:

```bash
# 1. All 6 containers up
docker compose ps

# 2. Service licensed and responding
curl -s http://localhost:8080/api/v0/tables
# Expected:  [] or a list of table names
# Not ready: empty response or connection refused - wait 15s and retry
# Not licensed: {"code":"500","details":"KDB-X DB Service not licensed"}

# 3. RT bus ready (needed before starting any streaming feed)
docker compose logs kx-db-rt --tail 5
# Healthy: startup/init messages with no ERROR lines
```

---

## "KDB-X DB Service not licensed"

**Diagnose:**

```bash
# Check that a license value is present
grep KDB_LICENSE .env   # run from your db-service directory
# Should show a non-empty value for exactly one of KDB_LICENSE_B64 or KDB_K4LICENSE_B64

# Verify Docker Compose is picking it up
docker compose config | grep -i license
# Should show the base64 value - null or empty means the variable is not being read
```

**Common causes:**

- **Empty placeholder** - the `.env` template ships with `KDB_LICENSE_B64=` blank. Fill in the base64 of your actual license file.
- **Both vars uncommented** - set exactly one of `KDB_LICENSE_B64` (CE) or `KDB_K4LICENSE_B64` (k4). Comment out the other.
- **License lacks DB Service entitlement** - a standard `k4.lic` without the DB Service product entitlement is rejected. Contact KX or email `preview@kx.com`.
- **Expired license** - check expiry: `echo "<base64>" | base64 -d | strings | grep -i expir`

**Fix:**

```bash
# CE license (kc.lic)
base64 -w 0 ~/kc.lic
# paste output as: KDB_LICENSE_B64=<value>  (no "export" prefix)

# OR commercial license (k4.lic)
base64 -w 0 ~/k4.lic
# paste output as: KDB_K4LICENSE_B64=<value>
```

Then restart the full stack:

```bash
docker compose down && docker compose up -d
```

---

## 500 / Timeout After Restarting a Single Container

Restarting only one container leaves the stack in a partially-connected state. The SM re-initialises but the gateway still holds a stale connection, causing write operations and some read paths to return 500 or time out.

**Do not use `docker compose restart <service>` as a fix.** Always do a full down/up:

```bash
docker compose down && docker compose up -d
```

Wait 15 seconds, then re-run the health check.

This also applies after running `init-db.sh` when containers were already started - a single container restart does not refresh the bind mount.

---

## Gateway Returns 500 on `/api/v0/tables`

The gateway starts before the SM and DA are ready. Wait 15 seconds after `docker compose up -d` and retry.

If 500 persists after 30 seconds:

```bash
# SM is the most common source - check for license or init errors
docker compose logs kx-db-sm --tail 30 | grep -i "licen\|ERROR\|error"

# Gateway for routing errors
docker compose logs kx-db-gw --tail 30 | grep -i "500\|ERROR"
```

---

## fxfeed.py: "Unable to connect to localhost:5002"

This error looks like a network problem but is almost always an RT licensing issue. The RT container starts and appears `Up` but silently exits or refuses connections if the license is invalid.

```bash
# Diagnose
docker compose logs kx-db-rt --tail 30
# Look for license errors
```

Fix is the same as the licensing section above - re-encode and update `.env`, then do a full down/up.

---

## inotify "No space left on device"

This message is misleading - it is not a disk space problem. It is the Linux inotify watch limit, triggered when fxfeed.py or the SM container exhausts the available inotify watches.

```bash
# Immediate fix
sudo sysctl fs.inotify.max_user_watches=524288

# Permanent fix (survives reboots)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
```

---

## Import Job Errors: "no file found: /imports/\<filename>"

The SM container mounts `data/imports/` as `/imports`. You must pass only the **filename**, not a host path.

```python
# Wrong
session.import_files(table='quotes', path='../../data/imports/quotes.csv')

# Correct
session.import_files(table='quotes', path='quotes.csv')
```

The file must exist at `<db-service-dir>/data/imports/quotes.csv` on the host before calling `import_files`.

---

## pip install Fails: "externally-managed-environment"

Ubuntu 22.04+ blocks system-wide `pip install` to protect the OS Python installation.

```bash
# Fix - always use a virtualenv
python3 -m venv ~/kx/venv
source ~/kx/venv/bin/activate
pip install --pre --extra-index-url https://portal.dl.kx.com/assets/pypi/ kdbx_db_service_client

# Persist activation
echo 'source ~/kx/venv/bin/activate' >> ~/.bashrc
```

Do NOT use `--break-system-packages` - it can corrupt the OS Python installation.

---

## Verifying fxfeed.py is Publishing Data

No errors from fxfeed.py means the RT client started - it does not mean data is reaching the SM. After the feed has been running for a few seconds, verify:

```bash
curl -s http://localhost:8080/api/v0/tables
# Expected: ["fxquote"]
```

```python
from datetime import date

today = date.today().strftime('%Y.%m.%d')
data = session.query_simple(
    table='fxquote',
    startTS=f'{today}D00:00:00.000',
    endTS=f'{today}D23:59:59.999',
    limit=5,
    return_as='pandas'
)
print(f"Rows in RDB: {len(data)}")   # should be non-zero and growing
```

If `list_tables()` returns `[]` after several seconds, check RT logs:

```bash
docker compose logs kx-db-rt --tail 20
```

---

## q Client: `'use` Error (Standard kdb+ vs kdb-x)

`dbs:use\`kx.dbservice_client` requires the **kdb-x runtime**, not standard kdb+ 4.x.

```
'use
  [0]  dbs:use`kx.dbservice_client
```

Download and use the **kdb-x free community edition** from https://portal.dl.kx.com. It is a drop-in replacement for standard kdb+ and includes the `use` module system.

If you cannot switch to kdb-x, use the Python client or REST API instead - both work without kdb-x.

---

## q Client: `'notfound: kx.dbservice_client` or `'notfound: kx.kurl`

`QPATH` is not set, or `dbservice_client.q` is not installed at the expected location.

```bash
# Diagnose
echo $QPATH
# Should print: /home/<user>/.kx/mod
# If empty: QPATH is not exported in the current shell

# Fix
echo 'export QPATH=$HOME/.kx/mod' >> ~/.bashrc
source ~/.bashrc

# Install the package
mkdir -p ~/.kx/mod/kx
cp /path/to/kdbx-db-service-q-client/dbservice_client.q ~/.kx/mod/kx/
```

The file must be at `$QPATH/kx/dbservice_client.q` for `use\`kx.dbservice_client` to resolve.

Always confirm `QPATH` is set before launching q:

```bash
echo $QPATH   # must not be empty
q -p 10002 -u 1
```

If launching q from a subshell, `QPATH` may not be inherited - exit to your login shell first.

---

## q Client: New vs Old API

The q client has two incompatible generations. If you see errors like `'dbs.set_endpoint` or `'.dbs.query_simple`, you are using the old client API against the new client.

**Old client API (dbs.q / legacy):**

```q
.dbs.set_endpoint["http://localhost:8080"];
res:.dbs.query_simple[query];
```

**New client API (kx.dbservice_client):**

```q
dbs:use`kx.dbservice_client
session:dbs.createSession["localhost:8080"]
res:session.querySimple[query]
```

The new client uses a session object. All calls go through `session.*`. Update legacy q client calls to use the new pattern.

Functions available in the new client:

```
createSession  listTables  describeTable  createTable  dropTable
importFiles    importData  importKDB      getImport    cancelImport
querySimple    querySQL    queryQ
```

---

## Notebook Kernel Stuck or Hanging

Caused by the DB Service not being up when the notebook attempted to connect.

1. Start the DB Service: `docker compose up -d`
2. Wait for it to be ready: `curl -s http://localhost:8080/api/v0/tables`
3. In VSCode or JupyterLab: **Restart Kernel** (not just re-run the cell)
4. Re-run all cells from the top

---

## Log Investigation

```bash
# All containers - last 50 lines
docker compose logs --tail 50

# Specific container - follow live
docker compose logs -f kx-db-gw --tail 20
docker compose logs -f kx-db-sm --tail 20
docker compose logs -f kx-db-rt --tail 20

# Filter for errors
docker compose logs kx-db-sm --tail 50 | grep -i "error\|licen\|fail"

# Monitor SM write activity during ingest
docker compose logs -f kx-db-sm | grep -i "write\|flush\|lag"
```

---

## venv / uv Issues

The DB Service repo uses plain `venv` + pip, not `uv`. There is no `pyproject.toml`.

```bash
# Root venv - use for fxfeed.py and general Python work
source /path/to/db-service/.venv/bin/activate

# Samples venv - for kxi-rtpy streaming samples only
source /path/to/db-service/samples/venv/bin/activate

# Notebooks venv - for JupyterLab notebooks only
source /path/to/db-service/notebooks/venv/bin/activate
```

If `uv run python3 fxfeed.py` fails, use `python3 fxfeed.py` directly with the correct venv activated.

---

## `shutil.copy2` PermissionError on Docker Volume

Docker volume mounts disallow `utime()` metadata updates, which `shutil.copy2` attempts. Use `shutil.copyfile` instead:

```python
# Wrong - fails with PermissionError: [Errno 1] on Docker volumes
shutil.copy2(src, dst)

# Correct
shutil.copyfile(src, dst)
```

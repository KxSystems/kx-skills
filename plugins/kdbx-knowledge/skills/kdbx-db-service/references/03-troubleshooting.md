# Troubleshooting

## Contents

- [Service Components](#service-components)
- [Startup Checklist](#startup-checklist)
- ["KDB-X DB Service not licensed"](#kdb-x-db-service-not-licensed)
- [Restarting a Single Container](#restarting-a-single-container)
- [Gateway Returns 503 or `No aggregator available` at Startup](#gateway-returns-503-or-no-aggregator-available-at-startup)
- [fxfeed.py: "Unable to connect to localhost:5002"](#fxfeedpy-unable-to-connect-to-localhost5002)
- [inotify "No space left on device"](#inotify-no-space-left-on-device)
- [Import Job Errors: "no file found: /imports/\<filename>"](#import-job-errors-no-file-found-importsfilename)
- [Cancel an Import Job](#cancel-an-import-job)
- [pip install Fails: "externally-managed-environment"](#pip-install-fails-externally-managed-environment)
- [Verifying fxfeed.py is Publishing Data](#verifying-fxfeedpy-is-publishing-data)
- [Aggregator OOM: `Agg restarted` / `No aggregator available`](#aggregator-oom-agg-restarted--no-aggregator-available)
- [q Client: `'use` Error (Standard kdb+ vs kdb-x)](#q-client-use-error-standard-kdb-vs-kdb-x)
- [q Client: `tried the following paths:` (client not found)](#q-client-tried-the-following-paths-client-not-found)
- [q Client: New vs Old API](#q-client-new-vs-old-api)
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
| **kx-db-rc** | Resource Coordinator (image `kxi-sg-rc`) - coordinates query routing across DA replicas | Routing errors when DA is unavailable |
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
# Not licensed:        {"code":"500","text":"internal_error","details":"KDB-X DB Service not licensed"}

# 3. RT bus ready (needed before starting any streaming feed)
docker compose logs kx-db-rt --tail 5
# Healthy: startup/init messages with no ERROR lines
```

---

## "KDB-X DB Service not licensed"

**Diagnose:**

```bash
# Check which license variable is set (prints only the variable name and "<set>")
grep -E '^(export )?KDB_(K4)?LICENSE_B64=' .env | sed -E 's/=.*/=<set>/'   # run from your db-service directory
# Expect exactly one active (not commented) line

# Verify Docker Compose is picking it up (prints a count only)
docker compose config --format json | python3 -c 'import sys,json; c=json.load(sys.stdin); k={n for s in c.get("services",{}).values() for n in ("KDB_LICENSE_B64","KDB_K4LICENSE_B64") if (s.get("environment") or {}).get(n) and str((s.get("environment") or {})[n]).strip()}; print("non-empty licence variables:", sorted(k) or "none", "(must be exactly 1; names only)")'
# 0 means the variable is not being read
```

**Common causes:**

- **Licence not filled in** - the upstream `.env` has `KDB_LICENSE_B64` commented out (`# export KDB_LICENSE_B64=`). Uncomment it and set the base64 value, or set `KDB_K4LICENSE_B64` for a k4 licence.
- **Both vars uncommented** - set exactly one of `KDB_LICENSE_B64` (CE) or `KDB_K4LICENSE_B64` (k4). Comment out the other.
- **License lacks DB Service entitlement** - the service returns `KDB-X DB Service not licensed` even though the licence is set and current. The docs leave this rule unstated; contact KX.
- **Expired license** - the `strings | grep -i expir` check does not reliably show expiry (it returned no matches on licence files that were valid). Ask KX for the expiry date.

**Fix:** set the licence variable as described in `references/01-setup.md` Step 4 (the single source for encoding and variable choice; a CE `kc.lic` from before May 2026 must be regenerated). Then restart the full stack:

```bash
docker compose down && docker compose up -d
```

---

## Restarting a Single Container

After `docker compose restart kx-db-agg` on a healthy stack, queries returned `400 No aggregator available` for about 8 seconds, then returned 200 with correct results. No 500 and no stale connection appeared, so a full down/up is not needed for the aggregator.

```bash
docker compose restart kx-db-agg
# wait ~10s, then re-run the query
```

The docs use `docker compose restart kx-db-da kx-db-agg` for custom-code changes (`references/04-advanced-features.md`).

Replacing the `data/imports/` directory is seen by `kx-db-sm` only after `docker compose restart kx-db-sm`; in-place file changes are visible at once. Not documented.

---

## Gateway Returns 503 or `No aggregator available` at Startup

During startup the gateway can answer before the aggregator has registered. After `docker compose restart kx-db-agg`: HTTP 400 with `"ai":"No aggregator available"` (rc 56, ac 17) for about 8 seconds, then 200. The API reference lists 503 "Service unavailable" for every endpoint.

Wait 15 seconds after `docker compose up -d` and retry.

If errors persist after 30 seconds:

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

Fix: set the licence in `.env` (`KDB_LICENSE_B64` for `kc.lic` or `KDB_K4LICENSE_B64` for `k4.lic`, base64, exactly one), then run `docker compose down && docker compose up -d`. The licensing section above has the encoding steps.

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

The SM container mounts `data/imports/` as `/imports`. Pass a path relative to `data/imports/` (a filename, a subdirectory or a glob), not a host path.

```python
# Wrong
session.import_files(table='quotes', path='../../data/imports/quotes.csv')  # noqa: DBS002, DBS007

# Correct
session.import_files(table='quotes', path='quotes.csv')
```

The file must exist at `<db-service-dir>/data/imports/quotes.csv` on the host before calling `import_files`.

---

## Cancel an Import Job

Cancel a batch import with the `jobId` that `import_files` returned:

```python
session.cancel_import(job_id)          # optional assembly=... when the service has more than one
```

REST: `DELETE /api/v0/imports/{jobId}`.

**When cancel works:** while the files are being processed. Once the processed data starts merging into the database, cancel is refused. Job status alone does not show which phase the job is in, so attempt the cancel and handle a refusal. A REST `404` can mean the merge has begun, the job has finished, or the job ID is unknown: check the ID with `get_import(job_id)` before assuming the phase.

## pip install Fails: "externally-managed-environment"

Some Pythons block system-wide `pip install` with a PEP 668 `EXTERNALLY-MANAGED` marker (Debian/Ubuntu system Python, and uv-managed Pythons). With the marker present, `pip install` fails with `error: externally-managed-environment`. Fix: install into a virtualenv, as in `references/01-setup.md` Step 6 (the single source for the commands).

Use the venv instead of `--break-system-packages`, which can corrupt the OS Python installation.

---

## Verifying fxfeed.py is Publishing Data

No errors from fxfeed.py means the RT client started - it does not mean data is reaching the SM. After the feed has been running for a few seconds, verify:

```bash
curl -s http://localhost:8080/api/v0/tables
# Expected: ["fxquote"]
```

```python
import time
from datetime import datetime, timedelta, timezone

# the feed stamps records in UTC, and the service treats timestamps as UTC: use UTC dates
def today_count():
    now = datetime.now(timezone.utc)
    today = now.strftime('%Y.%m.%d')
    tomorrow = (now + timedelta(days=1)).strftime('%Y.%m.%d')
    df = session.query_simple(
        table='fxquote',
        startTS=f'{today}D00:00:00.000',
        endTS=f'{tomorrow}D00:00:00.000',   # endTS is exclusive: the next midnight covers the whole day
        groupBy=['trddate'],
        agg=[['n', 'count', 'sym']],
        return_as='pandas'
    )
    return int(df['n'].sum()) if len(df) else 0

first = today_count()
time.sleep(15)
second = today_count()
print(f"UTC-day rows: {first} then {second} after 15s")   # a live feed makes the second count larger
```

If `list_tables()` returns `[]` after several seconds, check RT logs:

```bash
docker compose logs kx-db-rt --tail 20
```

---

## Aggregator OOM: `Agg restarted` / `No aggregator available`

Symptoms (all the same root cause):

- `400 Agg restarted. You may not have enough memory. Please add parameters or filters or reach out to your admin to resize the Agg.`
- `400 No aggregator available` on every subsequent query.
- `docker ps -a` shows `kx-db-agg` as `Exited (137)`; `docker inspect kx-db-agg --format '{{.State.OOMKilled}}'` returns `true`.

**Cause and fix: see `references/06-query-guide.md` > Push Down Aggregations.** A query fetched raw rows through the aggregator instead of pushing the reduction down server-side - the agg must hold and serialize every row it receives, which blew its memory cap. The compose default for `DS_OTHER_MEM_LIMIT` is `0` (unlimited), so a cap only exists if you set one in `.env`.

**Recover the agg** after it has been killed:

```bash
docker compose restart kx-db-agg
# wait ~10s, then confirm it re-registers (fx_csv is a sample table; use your own table name):
curl -s -H 'Content-Type: application/json' -d '{"query":"SELECT trddate, count(*) AS n FROM fx_csv GROUP BY trddate"}' \
  http://localhost:8080/api/v0/query/sql
```

Raising `DS_OTHER_MEM_LIMIT` only moves the cliff - a multi-million-row raw fetch will exhaust any practical cap. Fix the query first.

---

## q Client: `'use` Error (Standard kdb+ vs kdb-x)

`dbs:use\`kx.dbservice_client` needs the **KDB-X** q runtime. Plain kdb+ fails on `use` with a `'use` error. Use the KDB-X q binary that ships with KDB-X. If KDB-X is not installed, get it from your KX account at portal.dl.kx.com (see `references/01-setup.md`), or use the Python or REST client, which need no q.

If you have no KDB-X q, use the Python client or REST API instead.

---

## q Client: `tried the following paths:` (client not found)

The `use` reference says a missing module lists the paths it tried and signals a `notfound` error. On KDB-X q: it prints `tried the following paths:` followed by the candidate files (for example `.../kx/dbservice_client.k` and `.../kx/dbservice_client.q`). It does not print `'notfound: kx.dbservice_client`. If `QPATH` is set, `use` searches only `$QPATH`, so a QPATH without the client fails even when `~/.kx/mod/kx/dbservice_client.q` exists. If `QPATH` is unset, the default `~/.kx/mod` is searched.

```bash
mkdir -p ~/.kx/mod/kx
cp /path/to/dbservice_client.q ~/.kx/mod/kx/
```

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
res:session.querySimple[`fxquote; `startTS`endTS`limit!("2026-03-02T00:00:00";"2026-03-03T00:00:00";5)]
```

`querySimple` takes the table name first, then a dict of query options. Passing only one dict fails with HTTP 400 `Pre-processing error: length`. With the installed client, 3 rows are returned, and a `groupBy`/`agg` call returns the expected count.

The new client uses a session object. All calls go through `session.*`. Update legacy q client calls to use the new pattern.

Functions available in the new client:

```
createSession  listTables   describeTable  createTable   dropTable
importFiles    importData   importKDB      getImport     cancelImport
deleteRows     getDelete    cancelDelete   querySimple   querySQL
queryQ         queryPreview exportAssembly
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
# Feed venv - for the samples/feed streaming sample (fxfeed.py); created by the README
source /path/to/db-service/samples/feed/venv/bin/activate

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

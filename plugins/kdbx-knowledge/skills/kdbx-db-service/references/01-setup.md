# Setup and Quickstart

This module covers first-time setup from scratch through to a working DB Service with sample data loaded. If the service is already running, skip to the section that applies to your task.

---

## Prerequisites Checklist

Before starting, confirm you have:

- [ ] Docker with `docker compose` capability installed and running
- [ ] A KX account at https://portal.dl.kx.com (free registration)
- [ ] A KX license file (`kc.lic` for Community Edition, or `k4.lic` for commercial)
- [ ] Python 3.x available

---

## Execution Rules for Claude

When performing setup tasks, follow these rules exactly:

**Run commands directly, never via generated scripts.**
Use the Bash tool inline. Do not write `setup.sh`, `bootstrap.sh`, or any wrapper script. If a command fails, diagnose and retry inline.

**For `sudo` commands: use `!` in Claude Code.**
The Bash tool runs non-interactively - `sudo` cannot prompt for a password there. When a step requires `sudo`, tell the user to run it with the `!` prefix in their Claude Code terminal:

```
! sudo apt-get install -y docker-ce docker-compose-plugin
```

**Pause at secrets, not at commands.**
The only time to ask the user to do something themselves is when a secret is needed (sudo password, bearer token, license file). Run all non-privileged steps directly.

---

## Step 1 - Verify Docker

```bash
docker --version
docker compose version
```

If either command fails, install Docker for the user's OS:

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
# Group membership takes effect in new shell sessions. To apply immediately: newgrp docker
```

**macOS:** Install Docker Desktop from https://docs.docker.com/desktop/install/mac-install/

**Windows:** Install Docker Desktop from https://docs.docker.com/desktop/install/windows-install/

After installation, re-run the version checks before continuing.

---

## Step 2 - Clone the DB Service Repo

```bash
git clone https://github.com/KxSystems/kdbx-db-service
cd kdbx-db-service
# or to a specific location:
# git clone https://github.com/KxSystems/kdbx-db-service ~/kx/db-service
```

Confirm with the user where they want the repo before proceeding. All subsequent commands reference this directory.

---

## Step 3 - KX Registry Login

The DB Service Docker images are hosted on the KX private registry at `portal.dl.kx.com`.

Prompt the user:

> "Do you have a KX account at portal.dl.kx.com?
>
> - If yes: go to https://portal.dl.kx.com/auth/token, log in, and paste your bearer token.
> - If no: register for free at https://portal.dl.kx.com, then come back with your bearer token."

Once you have the bearer token, log in:

```bash
docker login -u <email> -p <bearer-token> portal.dl.kx.com
```

Expected output: `Login Succeeded`

---

## Step 4 - License Setup

The DB Service requires a KX license in `.env`. The `.env` template ships with blank placeholder values - you must fill in a real license.

**Community Edition (free):**

If you don't have a `kc.lic` yet, get one from https://developer.kx.com/products/kdb-x/install - register or log in, then follow the instructions to download your community license. The page also shows the base64-encoded value directly; if it does, paste that straight into `.env` and skip the encode step below.

If you already have a `kc.lic` file (e.g. sent by licadmin), base64-encode it:

```bash
# Linux
base64 -w 0 /path/to/kc.lic

# macOS
base64 /path/to/kc.lic
```

Set the output as `KDB_LICENSE_B64` in `.env`.

**Commercial (k4.lic):**

Your `k4.lic` will have been sent by licadmin. Use `KDB_K4LICENSE_B64` instead, encoded the same way.

**Set exactly one license variable.** Comment out the other. If both are uncommented, the service reads the wrong one.

Verify Docker Compose picks it up before starting:

```bash
docker compose config | grep -i license
# Should show the base64 value - if it shows null or empty, the .env value is missing
```

**License must include the DB Service entitlement.** A standard `k4.lic` without this entitlement returns "KDB-X DB Service not licensed". Contact KX or email `preview@kx.com` to obtain an entitled license.

---

## Step 5 - Initialise and Start

> **IMPORTANT: run `init-db.sh` BEFORE `docker compose up -d`.**
> `init-db.sh` creates `data/imports/` and copies sample files into it. Docker bind-mounts this directory into the SM container at startup. If you start the containers first, the SM caches an empty or missing `data/imports/` state.
>
> If you already ran `docker compose up -d` before `init-db.sh`, the recovery sequence is:
>
> ```bash
> bash init-db.sh
> docker compose down && docker compose up -d
> ```
>
> A `docker compose restart kx-db-sm` alone does NOT refresh the bind mount.

```bash
cd /path/to/db-service   # adjust to your clone location
bash init-db.sh
docker compose up -d
```

Wait approximately 15 seconds for all containers to initialise, then run the health check:

```bash
docker compose ps    # all 6 containers should show Up

curl -s http://localhost:8080/api/v0/tables
# Licensed and ready:  [] or a list of table names
# Not licensed:        {"code":"500","details":"KDB-X DB Service not licensed"}
# Still starting:      empty response or connection refused - wait and retry

docker compose logs kx-db-rt --tail 5    # check RT startup for errors
```

If "not licensed", see Step 4 notes and `references/03-troubleshooting.md`.

---

## Step 6 - Install Python Client

Ubuntu 22.04+ and Python 3.12+ enforce PEP 668, which blocks system-wide `pip install`. Always use a virtualenv:

```bash
python3 -m venv ~/kx/venv
source ~/kx/venv/bin/activate
pip install --pre --extra-index-url https://portal.dl.kx.com/assets/pypi/ kdbx_db_service_client
```

To persist the activation across new shell sessions:

```bash
echo 'source ~/kx/venv/bin/activate' >> ~/.bashrc
```

Note: the pip package is `kdbx_db_service_client` but it is imported as `dbservice_client`.

Verify:

```python
import dbservice_client as dbs
session = dbs.Session()
print(session.list_tables())   # should print []
```

---

## Step 7 - Install q Client (Optional)

The q client is needed for q-native workflows. It requires **kdb-x** (not standard kdb+ 4.x) - see `references/03-troubleshooting.md` if you see a `'use` error.

```bash
git clone https://github.com/KxSystems/kdbx-db-service-q-client
mkdir -p ~/.kx/mod/kx
cp kdbx-db-service-q-client/dbservice_client.q ~/.kx/mod/kx/
```

Set `QPATH` so the `use` module system can find the package:

```bash
echo 'export QPATH=$HOME/.kx/mod' >> ~/.bashrc
source ~/.bashrc
```

Verify:

```bash
echo $QPATH                             # should print /home/<user>/.kx/mod
ls $QPATH/kx/dbservice_client.q         # file should exist
```

Start a q session and test:

```q
dbs:use`kx.dbservice_client
session:dbs.createSession["localhost:8080"]
session.listTables[]   / should return ()
```

---

## Verify Service is Running

At any point, use these commands to confirm the service state:

```bash
docker compose ps                                 # container status
docker compose logs -f kx-db-gw --tail 20        # gateway logs
docker compose logs -f kx-db-sm --tail 20        # storage manager logs
docker compose logs --tail 20                     # all components

curl -s http://localhost:8080/api/v0/tables       # quick health check
```

---

## Reset the Service (Deletes All Data)

```bash
cd /path/to/db-service
./reset-db.sh         # requires sudo - will prompt for password
docker compose up -d
```

WARNING: this permanently deletes all ingested data and RT logs. There is no recovery.

---

## .env Key Variables

```bash
DS_REGISTRY=portal.dl.kx.com/   # Docker image registry
DS_TAG=0.1.0-beta.1              # DB Service image tag
DS_RT_TAG=1.18.0                 # Reliable Transport image tag
KDB_LICENSE_B64=                 # CE license (base64 of kc.lic) - set exactly one
# KDB_K4LICENSE_B64=             # k4 license (base64 of k4.lic) - comment out the other
```

**Community Edition memory limits** (CE only - delete these for full license):

```bash
DS_SM_MEM_LIMIT=8g
DS_DA_MEM_LIMIT=6g
DS_OTHER_MEM_LIMIT=512m
```

**CE on Linux with systemd (total stack limit instead of per-component):**

```bash
sudo cp kx-db-service.slice /etc/systemd/system/
# In .env, uncomment:
# export DS_CGROUP_PARENT=kx-db-service.slice
# Delete DS_SM_MEM_LIMIT, DS_DA_MEM_LIMIT, DS_OTHER_MEM_LIMIT
```

---

## Directory Structure

```
<db-service-dir>/
├── docker-compose.yaml
├── init-db.sh                     - first-time setup
├── reset-db.sh                    - wipe all data and reinitialise
├── .env                           - license, image tags, memory limits
├── data/
│   ├── imports/                   - drop CSV/parquet files here for ingest
│   ├── db/                        - persisted database files
│   ├── rt/                        - RT state and session logs
│   └── logs/
├── samples/
│   ├── fxquote.csv.gz             - sample FX quote data
│   ├── instruments.csv
│   └── fxfeed.py                  - sample streaming feed
└── notebooks/
    ├── python_notebook.ipynb
    └── requirements.txt
```

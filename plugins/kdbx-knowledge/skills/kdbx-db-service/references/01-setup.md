# Setup and Quickstart

## Contents

- [Prerequisites Checklist](#prerequisites-checklist)
- [Execution Rules for Claude](#execution-rules-for-claude)
- [Step 1 - Verify Docker](#step-1---verify-docker)
- [Step 2 - Clone the DB Service Repo](#step-2---clone-the-db-service-repo)
- [Step 3 - KX Registry Login](#step-3---kx-registry-login)
- [Step 4 - License Setup](#step-4---license-setup)
- [Step 5 - Initialise and Start](#step-5---initialise-and-start)
- [Step 6 - Install Python Client](#step-6---install-python-client)
- [Step 7 - Install q Client (Optional)](#step-7---install-q-client-optional)
- [Verify Service is Running](#verify-service-is-running)
- [Reset the Service (Deletes All Data)](#reset-the-service-deletes-all-data)
- [.env Key Variables](#env-key-variables)
- [Directory Structure](#directory-structure)

This module covers first-time setup from scratch through to a working DB Service with sample data loaded. If the service is already running, skip to the section that applies to your task.

---

## Prerequisites Checklist

Before starting, confirm you have:

- [ ] Docker with `docker compose` capability installed and running
- [ ] A KX account at https://portal.dl.kx.com (free registration)
- [ ] A KX license file: `kc.lic` (Community Edition, base64 into `KDB_LICENSE_B64`) or `k4.lic` (commercial, base64 into `KDB_K4LICENSE_B64`). See Step 4.
- [ ] Python available

---

## Execution Rules for Claude

When performing setup tasks, follow these rules exactly:

**Run commands directly, inline.**
Use the Bash tool inline, and write wrapper scripts (`setup.sh`, `bootstrap.sh`) only when the user asks. If a command fails, diagnose and retry inline.

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

**Linux, Ubuntu** (Docker's `ubuntu` repository). Give each `sudo` line to the user to run with the `!` prefix:

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

**Linux, Debian** (Docker's `debian` repository; the same steps with `debian` in place of `ubuntu`). Give each `sudo` line to the user to run with the `!` prefix:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list
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

Ask the user whether they have a KX account at portal.dl.kx.com. If yes, they get a bearer token from https://portal.dl.kx.com/auth/token. If no, they sign up for free at the KX Developer Center (https://developer.kx.com). Do not ask for, accept or repeat the token in chat.

Log in in the user's own terminal, so the token is typed at the password prompt and never enters the chat or command history:

```bash
docker login portal.dl.kx.com
```

Or, with the token saved in a file the user controls: `docker login -u <email> --password-stdin portal.dl.kx.com < <token-file>`.

Expected output: `Login Succeeded`

---

## Step 4 - License Setup

The DB Service requires a KX license in `.env`. The upstream `.env` ships with `KDB_LICENSE_B64` commented out and `KDB_K4LICENSE_B64` as a line you set - put your licence in the variable that matches it.

**Community Edition (free):**

A Community Edition `kc.lic` issued before May 2026 must be regenerated (quickstart: "If you're using a Community Edition license from before May 2026, you'll need to generate a new one"). The service rejects an old file with HTTP 500 `KDB-X DB Service not licensed`.

If you need a `kc.lic`, get one from https://developer.kx.com/products/kdb-x/install - register or log in, then follow the instructions to download your community license. The page also shows the base64-encoded value directly; if it does, paste that straight into `.env` and skip the encode step below.

If you already have a `kc.lic` file (e.g. sent by licadmin), base64-encode it:

```bash
# Linux
base64 -w 0 /path/to/kc.lic

# macOS
base64 -b 0 /path/to/kc.lic
```

Set the output as `KDB_LICENSE_B64` in `.env`.

**Commercial (k4.lic):**

Your `k4.lic` will have been sent by licadmin. Use `KDB_K4LICENSE_B64` instead, encoded the same way.

**Set exactly one license variable.** Comment out the other (the upstream `.env` ships `# export KDB_LICENSE_B64=` commented). Compose takes these variables from the shell environment first and then from `.env`, so an edit to `.env` alone did not change the running containers in the test: unset the variable in the shell (or start from a clean shell) and run `docker compose down && docker compose up -d`. The containers also name a `KDB_KXLICENSE_B64` (`kx.lic`) variable in their startup error; not documented.

Verify Docker Compose picks it up before starting:

```bash
docker compose config --format json | python3 -c 'import sys,json; c=json.load(sys.stdin); k={n for s in c.get("services",{}).values() for n in ("KDB_LICENSE_B64","KDB_K4LICENSE_B64") if (s.get("environment") or {}).get(n) and str((s.get("environment") or {})[n]).strip()}; print("non-empty licence variables:", sorted(k) or "none", "(must be exactly 1; names only)")'
# Prints the names of the non-empty licence variables, never their values. Exactly one must be listed.
```

**Entitlement.** With no licence set, the core containers exit at startup with `Environment variables [...] not set` and `Failed to find valid kdb+ license file`. If the service returns `KDB-X DB Service not licensed` with a current licence, the licence probably lacks DB Service entitlement. The docs leave this rule unstated, so contact KX.

---

## Step 5 - Initialise and Start

> **Run `init-db.sh` before `docker compose up -d`.**
> `init-db.sh` creates `data/imports/` and copies the sample files into it. That directory is bind-mounted into `kx-db-sm`.
>
> If `data/imports/` itself was replaced (a new directory), restart `kx-db-sm` or run `docker compose down && docker compose up -d`. Ordinary file changes inside the directory are visible without a restart.

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
# Not licensed:        {"code":"500","text":"internal_error","details":"KDB-X DB Service not licensed"}
# Still starting:      empty response or connection refused - wait and retry

docker compose logs kx-db-rt --tail 5    # check RT startup for errors
```

If "not licensed", see Step 4 notes and `references/03-troubleshooting.md`.

---

## Step 6 - Install Python Client

Some Pythons carry a PEP 668 `EXTERNALLY-MANAGED` marker, which blocks system-wide `pip install` (Debian/Ubuntu system Python, and uv-managed Pythons). With the marker present, `pip install` fails with `error: externally-managed-environment`. Always use a virtualenv.

```bash
python3 -m venv ~/kx/venv
source ~/kx/venv/bin/activate
pip install --pre --extra-index-url https://portal.dl.kx.com/assets/pypi/ "kdbx_db_service_client==0.1.1"
python3 -c "import importlib.metadata as m; print(m.version('kdbx_db_service_client'))"   # must print 0.1.1
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

The q client is needed for q-native workflows. It needs the **KDB-X** q runtime: plain kdb+ has no `use`. Use the KDB-X q binary, the same one the DB Service containers run.

```bash
git clone https://github.com/KxSystems/kdbx-db-service-q-client
mkdir -p ~/.kx/mod/kx
cp kdbx-db-service-q-client/dbservice_client.q ~/.kx/mod/kx/
```

`QPATH` is optional when the client sits in the default module path `~/.kx/mod`, which is what the DB Service quickstart says (`$HOME/.kx/mod`). The kdb-x module framework docs say the default is `$QHOME/mod`, so the official sources conflict; the default is `~/.kx/mod`. `use` loaded `kx.dbservice_client` with QPATH unset. If you set QPATH it replaces the default search path (a QPATH without the client did not fall back to `~/.kx/mod`). Set it only if you install the client elsewhere:

```bash
echo 'export QPATH=$HOME/.kx/mod' >> ~/.bashrc
source ~/.bashrc
```

Verify:

```bash
echo "${QPATH:-unset}"                  # /home/<user>/.kx/mod, or unset (the default is $HOME/.kx/mod)
ls "${QPATH:-$HOME/.kx/mod}"/kx/dbservice_client.q   # file should exist, with or without QPATH
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

Reset deletes every table's data and cannot be undone. Before running it:

1. Inspect the target checkout: `cd /path/to/db-service && docker compose ps`, and confirm the owning project with `docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' kx-db-gw`.
2. Tell the user exactly what will be deleted (all imported tables and the stack's volumes) and ask for an explicit yes.
3. Offer a backup of any data they need before the yes.
4. After the yes, the user runs the reset with the `!` prefix, because it needs sudo: `! ./reset-db.sh`.
5. Before `docker compose up -d`, give the container user ownership of `data/`. After a reset the containers run as `nobody` (uid 65534) and leave `data/` subdirectories unwritable on restart: `docker run --rm -v $(pwd)/data:/data alpine chown -R 65534:65534 /data`. Then Claude runs `docker compose up -d`.

WARNING: this permanently deletes all ingested data and RT logs. There is no recovery.

---

## .env Key Variables

```bash
DS_REGISTRY=portal.dl.kx.com/   # Docker image registry
DS_TAG=0.1.1-beta.1              # DB Service image tag
DS_RT_TAG=1.18.0                 # Reliable Transport image tag
# export KDB_LICENSE_B64=        # CE license (base64 of kc.lic) - set exactly one; uncomment it and set the value
export KDB_K4LICENSE_B64=        # k4 license (base64 of k4.lic) - comment out the other
```

**Memory limits** (optional). The compose defaults are `0`, which means unlimited for every container. The Community Edition 16 GB cap is enforced by the systemd slice (`kx-db-service.slice`, `MemoryMax=16G`), per the kdbx-db-service README. To tighten a container's cap, set these, for example:

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
│   ├── data/                      - sample files; init-db.sh copies these into data/imports/
│   │   ├── fxquote.csv.gz
│   │   ├── instruments.csv
│   │   └── ...
│   ├── feed/                      - sample RT feed (fxfeed.py, rtconfig.json, requirements.txt)
│   └── code/                      - sample custom q (custom.q, midStats.q, spreadStats.q); init-db.sh copies these into code/
├── code/                          - custom q loaded by the service (KXI_CUSTOM_FILE)
└── notebooks/                 - sample notebooks
    ├── python_notebook.ipynb
    └── requirements.txt
```

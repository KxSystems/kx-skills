---
name: kdbx-db-service
description: >
  Operate the KDB-X DB Service (Docker Compose or Kubernetes/Helm): start, reset or configure it, load data
  into it (CSV, Parquet, streaming, JSON, kdb+ HDB, OneTick), query it from Python, q or SQL, and manage
  tables, reference data and deletes, and debug failures. Use when the user says "start my db service",
  "load this CSV into the DB Service", "query the DB Service", "debug a DB Service failure", "run the FX
  recipe" or "which column should I use as prtnCol?". Do NOT use for KX Dashboards, Stream Processor (SP)
  pipelines, generic Docker Compose, or general KDB-X or plain kdb+/q questions; use the kdbx skill for those.
compatibility: >
  Single-node needs Docker Compose, Python 3 with dbservice_client and a KDB-X
  licence; clustered needs Kubernetes and Helm. Needs a shell and network access
  (WebFetch of code.kx.com) for live docs; without network, use the bundled
  references and tell the user the docs could not be checked.
metadata:
  author: KX
  version: 4.2.0
  product: KDB-X DB Service 0.1.1
  documentation: https://code.kx.com/kdb-x/services/db-service/introduction.html
---

# KDB-X DB Service Skill

## Critical Rules

1. **Python goes through `dbservice_client`**; curl is for health checks and raw-response debugging. Write each placeholder the user fills in as a named variable or a quoted string, for example `job_id = "YOUR_JOB_ID"`, so the code parses and runs once the user edits it.
2. **Reduce on the server.** Use `query_simple` `groupBy` + `agg`, or `query_sql` with a `GROUP BY` on every aggregate. An ungrouped `count(*)` returns HTTP 400, and an ungrouped `min`/`max` on a multi-partition table returns one value per partition instead of one number (0.1.1). Count rows per date with `GROUP BY` and sum client-side. A raw fetch of a dense table OOM-kills the aggregator.
3. **Bound every `query_simple`** with full timestamps: `startTS='2026.03.02D00:00:00.000'` or ISO `'2026-03-02T00:00:00'`. The q date literal `'2026.03.02D'` is rejected with HTTP 400 (docs format unspecified). Cap raw rows with `limit=`. In `query_sql`, write dates as `DATE '2026-03-02'` (a q literal such as `2026.03.02` is a SQL parse error). To peek at a few rows or check a schema, use `query_preview(table=..., limit=5)`, not `query_simple`.
4. **Check what is loaded before every import.** Run `list_tables()` and a per-date server-side count for the file's date range, grouped by date: `SELECT trddate, count(sym) AS n FROM trades WHERE trddate >= DATE '2026-01-15' AND trddate < DATE '2026-01-16' GROUP BY trddate` (an ungrouped count fails, rule 2). Done when the count for those dates is zero, or the user has chosen to replace (REST `mode: "overwrite"`, only with the complete dataset for those dates, see Core Operations) or append. `merge` (the default) appends, and importing the same file twice doubled the row count (2 to 4). If the data is already there, tell the user and ask.
5. **Treat deletion as permanent.** Before any delete:
   - **Confirm the scope with the user.** Deletes cannot be undone.
   - **Pass `filter` deliberately.** It is mandatory, and `filter=[]` deletes every row in the window, not none.
   - **Pass a `startTS`/`endTS` window.** Omitting the window deletes the whole table.
   - **Use timezone-naive timestamps.** An aware `datetime` is rejected.
   - **Repair a duplicated partition only by re-import.** Re-import the complete dataset over REST with `mode: "overwrite"` (the Python `import_files` has no `mode` argument), after a backup and the user's confirmation of the scope (Core Operations).
6. **Live docs win over this skill.** The docs may describe a newer product than the 0.1.1 this skill was verified against. Say so when they could not be fetched.
7. **Containers belong to a project.** Before any `docker rm`, `docker compose down` or prune of a `kx-db-*` container, read the owning project (`docker inspect`, label `com.docker.compose.project.working_dir`). Then take one branch:
    - **Owner is the project you are working in** (its `working_dir` is the folder you are in): say so and proceed.
    - **Owner is another project, or unknown:** show the user the owner and proceed only on the user's yes.
8. **`prtnCol` names a timestamp column.** DB Service requires the partition column to be a timestamp type, even where kdb+ conventions would partition by a date. Pick the timestamp column (`ts`, `timestamp`) for `prtnCol`, and keep a separate date column for the date-level queries. See `references/07-tables.md`.

---

## Core Operations

### Ingest steps

Stage, import, poll. The file sits in `data/imports/`. `import_files` takes a path relative to `data/imports/` (a file, a subdirectory such as `quotes/quote.csv`, or a glob such as `quotes/**/quote*.csv`), never a host path. Poll `get_import(job_id=...)` until `completed`.

### Creating tables

Use `import_files(..., createTable=True)`. For schema control use `create_table` with keyword arguments (`references/07-tables.md`).

### Clustered deployments

Define tables in assembly YAML. `create_table`, `drop_table` and `createTable=True` apply only to single-node deployments (`references/04-advanced-features.md`).

### Python and REST

```python
import dbservice_client as dbs
session = dbs.Session()                      # localhost:8080

job = session.import_files(table='fxquote', path='fxquote.csv.gz', createTable=True)   # appends (merge is the default); the Python client has no mode argument
session.get_import(job_id=job['jobId'])      # the id is job['jobId']; poll until status == 'completed' or 'errored'

session.query_simple(table='fxquote', startTS='2026-03-02T00:00:00', endTS='2026-03-03T00:00:00',
                     groupBy=['trddate'], agg=[['n', 'count', 'sym'], ['avg_bid', 'avg', 'bid']], return_as='pandas')
session.query_sql(query="SELECT trddate, count(sym) AS n FROM fxquote GROUP BY trddate", return_as='pandas')
```

Replace instead of append (REST only; the Python `import_files` has no `mode`). **Overwrite deletes every row in each date partition the file touches, not only the rows in the file.** A 1,000-row file overwriting a loaded 194,642-row date left 1,000 rows. Use it only when the file holds the complete dataset for every date it touches, after a backup, and with the user's confirmation of that scope: `POST /api/v0/imports/files` with `{"table": "fxquote", "path": "fxquote.csv.gz", "mode": "overwrite"}`. `mode` takes `overwrite` or `merge` (default), and applies per partition the file touches (`FileIngestRequest`). An overwrite import of a file already loaded left the row count unchanged (194,642, not doubled).

Job status is `pending`, `processing`, `completed`, `errored` or `canceled` (the spec's `BatchImportStatusResponse`). Keep polling while `pending` or `processing`. `affectedTables`, `processedPartitions` and `error` fill in at the end. Import jobs use the key `jobId`, not `name`. The `trddate` examples apply to the FX sample tables; use your own table's columns.

Choose the method for the job: file import (CSV/Parquet/q binary) for bulk, `import_data` JSON for small loads (`insert_as` defaults to `auto`), RT streaming for live feeds, `import_database` for an existing kdb+ HDB.

---

## Start or Check the Service (operational tasks)

Code-only requests skip this section. Done when `docker compose ps` shows 6/6 containers running, the gateway returns 200, and no `kx-db-*` containers from another project.

1. **Pick the project.** Prefer the running stack: `docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' $(docker ps -q --filter name=kx-db-gw)`. Otherwise list `find ~ -maxdepth 5 -name docker-compose.yaml -path '*db-service*' 2>/dev/null` and ask the user which one (use the one they named).
2. **Start order:**
   ```bash
   cd <project-dir>
   bash init-db.sh        # first: creates data/imports/ and copies the sample files in
   docker compose up -d
   sleep 15 && docker compose ps && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/api/v0/tables
   ```
   A licence in `.env` (`KDB_LICENSE_B64` or `KDB_K4LICENSE_B64`) is required; see `references/01-setup.md` Step 4. If `up` ran before `init-db.sh`: `bash init-db.sh && docker compose down && docker compose up -d`.
3. **Name conflicts.** Fixed `kx-db-*` container names collide across compose projects, so `up` fails. Show the owner first: `docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' kx-db-sm`. Then ask the user which project keeps the containers, and run `docker rm` or `docker compose -p <project> down` only after the user confirms. Their volumes hold that project's data.
4. **Sample data** is what `init-db.sh` copies into `data/imports/` (`fxquote.csv.gz`, `instruments.csv`, ...). That directory is bind-mounted into `kx-db-sm`, so run `init-db.sh` before `docker compose up -d` (step 2). If `data/imports/` itself was replaced, restart `kx-db-sm` or run `docker compose down && docker compose up -d`; ordinary file changes inside the directory are visible without a restart. The sample data may already be loaded, so apply Critical Rule 4.
5. **Permissions.** To reduce prompts, offer a project `.claude/settings.json` scoped to this work, and show it to the user first. Review it before saving: `Bash(curl:*)` and `Bash(python3:*)` allow any curl or Python command in the project.
   ```json
   {
     "permissions": {
       "allow": [
         "Bash(docker compose:*)",
         "Bash(curl:*)",
         "Bash(python3:*)",
         "Read(./**)",
         "WebFetch(domain:code.kx.com)"
       ]
     }
   }
   ```

---

## Worked Examples

**Ingest a CSV**

- User says: "I have a CSV of FTSE quotes at ~/trades/quotes.csv, load it into KDB-X."
- Actions: check what is loaded (Critical Rule 4) -> ask the user to copy the file into `data/imports/` -> `session.import_files(table='quotes', path='quotes.csv', createTable=True)` -> poll `get_import(job_id=job['jobId'])` until `completed` -> `query_sql ... GROUP BY` count.
- Done when: job `completed` and the per-date count equals the file's row count.

**Daily OHLC from tick data**

- User says: "Give me daily open/high/low/close bid per symbol for March."
- Actions: `session.query_simple(table='fxquote', startTS='...', endTS='...', groupBy=['trddate','sym'], agg=[['o','first','bid'],['h','max','bid'],['l','min','bid'],['c','last','bid']], return_as='pandas')`.
- Done when: a small aggregated DataFrame comes back; no raw tick rows were fetched.

**Query returns nothing after an ingest**

- User says: "I ingested a file an hour ago and my query returns no data."
- Actions: `get_import` job state -> compare `startTS`/`endTS` to the data's real dates -> check column names (case is kept as ingested; match `describe_table`) -> `docker compose ps`.
- Done when: the cause is named (unfinished job, wrong window, or renamed column) with its fix.

---

## Read More When

| Read                                                                       | When the task                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [`references/01-setup.md`](references/01-setup.md)                         | installs, resets, licenses or configures `.env` for the stack                                     |
| [`references/03-troubleshooting.md`](references/03-troubleshooting.md)     | hits a startup, licence, connection, log or OOM problem                                           |
| [`references/05-ingestion-methods.md`](references/05-ingestion-methods.md) | chooses an ingestion method or needs throughput numbers                                           |
| [`references/06-query-guide.md`](references/06-query-guide.md)             | writes or optimises a query, aggregation or `query_q`                                             |
| [`references/07-tables.md`](references/07-tables.md)                       | needs custom column types, sort attributes or a persistent schema                                 |
| [`references/04-advanced-features.md`](references/04-advanced-features.md) | touches reference data, HDB migration, clustered or multi-assembly, backup, UDFs or `delete_rows` |
| [`references/02-onetick.md`](references/02-onetick.md)                     | pulls OneTick Cloud data                                                                          |
| [`recipes/01-streaming-ingest.md`](recipes/01-streaming-ingest.md)         | plans a live feed into the service (e.g. FX); read before producing a plan                        |
| [`recipes/02-batch-ingest.md`](recipes/02-batch-ingest.md)                 | plans download, clean and ingest (e.g. OneTick, CSV archives); read before producing a plan       |
| [`references/08-live-docs-index.md`](references/08-live-docs-index.md)     | needs exact API parameters or a doc page URL                                                      |

Official documentation: https://code.kx.com/kdb-x/services/db-service/introduction.html

---

## Common Gotchas

| Symptom                                                                        | Cause and fix                                                                                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Row counts doubled after an import                                             | `merge` appended data that was already loaded: replace the partition only with a complete dataset for its dates (REST `mode: "overwrite"`, Core Operations); check counts before importing |
| `docker compose up` fails: container name `kx-db-*` in use                     | Containers of another compose project: show the owner, get the user's confirmation, then remove (Start or Check, step 3)                  |
| `query_sql` `count(*)` returns HTTP 400 | Ungrouped aggregate: add `GROUP BY`                                                                                                        |
| `fxfeed.py`: "Unable to connect to localhost:5002" while `kx-db-rt` is `Up`    | Usually an RT licence failure, not networking: run `docker compose logs kx-db-rt --tail 30`, set exactly one licence variable in `.env`, then `docker compose down && docker compose up -d` (`references/03-troubleshooting.md`) |
| `list_tables()` returns `[]` after ingest                                      | Ingest is async: poll `get_import` until `completed`                                                                                       |
| Cancel a running import, or cancel refused | `session.cancel_import(job_id)` works while files are processed, not once the merge has begun: `references/03-troubleshooting.md` (Cancel an Import Job) |
| `no file found: /imports/<file>`                                               | Pass a path relative to `data/imports/`, not a host path; the file sits in `data/imports/` on the host                                                                       |
| Query returns no data                                                          | `startTS`/`endTS` fall outside the ingested dates                                                                                          |
| "KDB-X DB Service not licensed"                                                | `references/03-troubleshooting.md`, licensing section                                                                                      |
| `400 No aggregator available` right after a restart                             | The aggregator is still starting: wait about 10s and retry (a single `docker compose restart kx-db-agg` recovered in about 10s) |
| `Agg restarted` / `No aggregator available` / `kx-db-agg` exits 137            | A raw fetch OOM-killed the aggregator: push the aggregation down (`references/06-query-guide.md`), then `docker compose restart kx-db-agg` |
| CE memory limit errors on ingest/storage                                       | Set `DS_SM_MEM_LIMIT` / `DS_DA_MEM_LIMIT` in `.env` (`references/01-setup.md`)                                                             |
| `create_table`/`drop_table`/`createTable=True` has no effect                   | Clustered deployment: tables are YAML-only (`references/04-advanced-features.md`)                                                          |
| `assembly must be specified ...` (400)                                         | Multi-assembly: `assembly=` on table/import/config calls, `scope`/`labels` on queries (`references/04-advanced-features.md`)               |
| `foreign keys refer to invalid table`                                          | Create the reference table first and match column types                                                                                    |
| `Cannot delete from object storage tier` (400)                                  | The window starts on or before the object-storage watermark: raise `startTS` past it |
| `q` query misses recent rows or `select *` errors across tiers                 | Use `.kxi.selectTable` (`references/06-query-guide.md`)                                                                                    |
| `'use` error, or `tried the following paths:` in q                 | Needs the KDB-X q runtime (plain kdb+ lacks `use`); a missing client lists candidate paths: `references/03-troubleshooting.md`        |
| `pip install` "externally-managed-environment"                                 | Use a virtualenv: `references/01-setup.md` Step 6 (diagnosis: `references/03-troubleshooting.md`)                                          |
| RT feed: `inotify_add_watch error: 28, No space left on device`                 | The inotify watch limit is used up; raise `fs.inotify.max_user_watches` (`references/03-troubleshooting.md`)                                 |

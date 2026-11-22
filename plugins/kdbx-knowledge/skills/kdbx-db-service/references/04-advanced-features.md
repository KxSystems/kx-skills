# Advanced Features

Detail for features beyond basic ingest and query. `SKILL.md` carries the critical rules; read this file when the task touches one of these topics. Always confirm exact parameters against the live docs linked from `SKILL.md`.

## Contents

- [Reference Data and Foreign Keys](#reference-data-and-foreign-keys)
- [Migrating an Existing kdb+ HDB](#migrating-an-existing-kdb-hdb)
- [Deployment Modes: Single-Node vs Clustered](#deployment-modes-single-node-vs-clustered)
- [Multi-Assembly Targeting](#multi-assembly-targeting)
- [Export Assembly Configuration](#export-assembly-configuration)
- [Backup and Restore (Clustered Only)](#backup-and-restore-clustered-only)
- [Custom Code and UDFs](#custom-code-and-udfs)
- [Delete Rows (Beta)](#delete-rows-beta)

---

## Reference Data and Foreign Keys

Reference data is small, mostly-static, non-timeseries data (e.g. an instrument master) linked to a timeseries table via a foreign key, so queries can pull in reference columns without a manual join.

Define the reference table (keyed, primary key column(s) listed first in `columns`), then link a timeseries column to it with `foreign: "<table>.<column>"` - the column type must match, and the referenced table must exist first (create reference tables before the tables that point at them):

```python
session.create_table(
    table="instruments", type="splayed", primaryKeys=["sym"],      # "splayed_mem" forces fully in-memory
    columns=[{"name": "sym", "type": "symbol"}, {"name": "category", "type": "symbol"}]
)
# in fxquote's own sym column definition:
# {"name": "sym", "type": "symbol", "foreign": "instruments.sym", "attrMem": "grouped", "attrDisk": "parted", "attrOrd": "parted"}
```

Query reference columns by naming them `table.column`. Supported in structured query `agg`/`groupBy`/`filter`, and in q query via `.kxi.selectTable`'s functional `agg`/`groupBy`/`filter`. **Not** supported in a direct `select` (errors), and **not** supported in `query_sql` dotted form (use an explicit SQL join instead). Note `table.column` syntax conflicts with KDB-X's temporal dot notation (`timestamp.second`, etc.) - that's not usable in a structured query because the dot is read as a table reference there.

Gotchas: a reference table cannot be dropped while another table has a `foreign` key pointing at it (drop the referencing table first); importing into a keyed reference table updates existing rows on matching keys rather than appending, unlike a normal append-only timeseries import. This only holds for a table created **with** `primaryKeys`; a reference table auto-created from a CSV via `createTable=True` is not keyed, and in practice a re-import appended (an `instruments` table went from 76 to 152 rows). Create reference tables explicitly with `primaryKeys` if they will be reloaded.

## Migrating an Existing kdb+ HDB

Two different methods - keep them distinct:
- `session.import_database(table="fxquote", path="fxquote-hdb")` - a normal (re-ingesting) import of an existing partitioned kdb+ HDB directory into a table, works like any other import job (poll with `get_import`).
- **Initial import** (`import-initial.html`) - a separate, clustered-only, symlink-based mechanism: it registers already-staged HDB data in place via symbolic links instead of re-ingesting it, which is substantially faster for large datasets. Use this instead of `import_database` when migrating a large existing HDB into a new **clustered** deployment.

---

## Deployment Modes: Single-Node vs Clustered

This skill defaults to **single-node (Docker Compose)**. The DB Service also deploys **clustered**, via Kubernetes + Helm, using the same images and APIs as single-node. The key practical difference: **in a clustered deployment, table management is YAML-only** - `create_table`, `drop_table`, and `import_files(..., createTable=True)` are unavailable; only `list_tables`/`describe_table` are available via API, and tables must already be defined in the assembly YAML. If a task is clearly clustered (user mentions Helm, Kubernetes, assembly YAML, shards, or multiple databases), suggest YAML table definitions rather than the single-node table-management calls - fetch `manage-tables-clustered.html` and `storage-tiers.html` live instead of relying on this skill's single-node-flavored defaults.

## Multi-Assembly Targeting

A deployment can be configured with more than one **assembly** (an independent database with its own tables). When more than one is configured, requests must identify which one they target:

| API | Parameter | Form |
|---|---|---|
| Table management, import, config export | `assembly` (query param) | `?assembly=marketdata-emea` |
| Structured query, q query, preview query | `scope` or `labels` (request body) | `scope: {"assembly": "marketdata-emea"}` / `labels: {"assetClass": "fx"}` |
| SQL query | `scope` only (no `labels` support) | `scope: {"assembly": "marketdata-emea"}` |

`scope` targets exactly one assembly by name; `labels` targets every assembly matching the given key-value pairs (useful for querying across several shards/regions at once). Omitting both queries across every configured assembly. On a single-assembly deployment all three are optional. Common error: `assembly must be specified when the service is configured with more than one assembly` (400) means the parameter was omitted on a multi-assembly deployment. The spec documents an unknown name as HTTP 400 JSON `{"error": "unknown assembly: <name>"}`. **Live on 0.1.1 this differs:** table, config and import calls return HTTP 404 with the plain text `No such database` (for example `?assembly=nope`), and query calls return HTTP 400 JSON (`Scope-table combination not found` for `query/simple`, `No valid targets for specified assembly` for `query/sql`). `dbs.Session(assembly="nope")` raises `DbServiceConnectionError` at construction, before any call is made.

For the non-query APIs (table management, import, delete, config export), the **Python client** takes `assembly` as a plain kwarg on each call (e.g. `session.list_tables(assembly="ratesdb")`, `session.export_assembly(assembly="ratesdb")`, `session.delete_rows(..., assembly="ratesdb")`), or set it once for the whole session with `dbs.Session(assembly="fxdb")`. The installed Python client (0.1.1) takes no `assembly`, `scope` or `labels` argument on `query_simple`, `query_sql`, `query_q` or `query_preview`. The REST `query/simple` body has `scope` and `labels` fields, so a query scoped to one assembly needs a direct REST call.

## Export Assembly Configuration

`GET /api/v0/config/assembly` returns the active assembly as YAML (200, `application/yaml`). Its documented responses are 200, 400, 409 and 503; a 500 is not among them. **On 0.1.1 it returns HTTP 500 `internal_error` "cannot render kdb+ type 101"**, with and without `?assembly=`. Treat it as unavailable for backups and templates.

```python
session.export_assembly()                             # returns the YAML as a string (500 on 0.1.1, see above)
session.export_assembly(filename="assembly.yaml")     # saved to a file
session.export_assembly(assembly="ratesdb")           # multi-assembly deployment
```

## Backup and Restore (Clustered Only)

Single-node deployments hold data on local Docker volumes - back those up at the filesystem level however you already back up the host.

**Restoring after a delete.** Restoring a backup taken before a delete while the RT stream is still running replays the delete on startup, so the restored data is deleted again. Before a restore, record the session ID of every delete applied after the backup (the `name` field of the delete response is the session ID). Set `KXI_IGNORE_DELETE` on the SM to those session IDs, comma-separated, so the replay skips them: `KXI_IGNORE_DELETE=<id1>,<id2>`. Deleted rows cannot be recovered through the DB Service, so back up before any delete on production data. Clustered deployments back up per-tier PVCs via `kubectl` - always back up before a schema change, initial import, or version upgrade, and only after confirming an EOD writedown has completed (check SM logs for `EOD complete, elapsed <time>`). RDB (in-memory) re-ingests from the RT stream on restart and is not backed up. IDB and HDB are on-disk and backed up via a temporary pod mounting the tier's PVC; object storage tiers use your cloud provider's native snapshot/replication features instead. Fetch `backup-restore.html` live for the exact pod/kubectl steps.

---

## Custom Code and UDFs

Custom q code can be loaded into the `da` and `agg` processes to serve your own REST endpoints. Set `KXI_CUSTOM_FILE` (in `.env`) to the path of your q file, as the container sees it - the code directory is mounted at `/code`:

```
export KXI_CUSTOM_FILE=/code/spreadStats.q
```

For multiple files, point `KXI_CUSTOM_FILE` at a single entry-point file that `\l`-loads the rest (relative `\l` paths resolve against `/code`). After `docker compose up -d` (or `docker compose restart kx-db-da kx-db-agg` if only editing a file an existing entry point already loads), a function registered as `.fx.spreadStats` is served at `POST /api/v0/fx/spreadStats` - leading dot dropped, remaining dots become slashes, parameters passed as a JSON object in the request body. Sample analytics ship in `samples/code/` in the DB Service repo; copy them into `code/`. Example call: `curl -s -X POST http://localhost:8080/api/v0/fx/spreadStats -H 'Content-Type: application/json' -d '{"table":"fxquote","startTS":"2026-03-01T00:00:00.000","endTS":"2026-03-03T00:00:00.000"}'`. No Python or q client call for a UDF is given in the live docs, and the response format is not stated. Registration code is covered in the Insights SDK UDA docs (https://code.kx.com/insights/microservices/database/configuration/uda/uda-creation.html). Note: the underlying Insights SDK docs still call these "UDAs" rather than UDFs - same thing, older naming, since this is built on the Insights SDK.

---

## Delete Rows (Beta)

Evaluation/trial use only - both the endpoint and its behavior may change, and **deletion is permanent** (back up before running on production data). `delete_rows` is **asynchronous** - it returns a pending job, and the outcome is read back separately with `get_delete`:

```python
import time

# Delete matching rows within a time window - filter is mandatory ([] deletes every row in the window)
job = session.delete_rows(table="fxquote", startTS="2026.03.02D00:00:00.000", endTS="2026.03.03D00:00:00.000", filter=[["=", "sym", "EURUSD"]])
# poll until a terminal state: pending -> queued -> processing -> completed, or errored/canceled
TERMINAL = {"completed", "errored", "canceled"}
for _ in range(60):
    status = session.get_delete(job["jobId"])
    if status["status"] in TERMINAL:
        break
    time.sleep(5)
else:
    raise TimeoutError(f"delete {job['jobId']} still {status['status']} after 5 minutes")
if status["status"] != "completed":
    # errored: the delete was not performed; keep the job status for diagnosis
    raise RuntimeError(f"delete {job['jobId']} {status['status']}: {status.get('error')}")
# only after completion: clear the tracked status (this does not abort or roll back a delete)
session.cancel_delete(job["jobId"])
# session.delete_rows(..., assembly="ratesdb")  # target a specific assembly on a multi-assembly deployment
```

Gotchas:
- **`filter` is mandatory** - pass `filter=[]` explicitly to delete every row in the window; this is a deliberate safety catch: a missing filter fails rather than widening a delete.
- **Omitting `startTS`/`endTS` deletes the whole table** - on a partitioned table: `delete_rows(table=..., filter=[])` with no window completed and left the table empty. Use the window unless you mean to clear the table. The spec says `startTS`/`endTS` are ignored for a non-partitioned table.
- **Timestamps must be timezone-naive** - the delete API has no `inputTZ` support (unlike `query_simple`), so an aware `datetime` is rejected rather than silently shifted. Convert first, e.g. `ts.astimezone(timezone.utc).replace(tzinfo=None)`.
- **Rows already in the object storage tier cannot be deleted** - a `startTS` on or before the object storage watermark is rejected with HTTP 400 (`Cannot delete from object storage tier, please increase startTS to avoid overlap`, ). Raise `startTS` past the watermark.

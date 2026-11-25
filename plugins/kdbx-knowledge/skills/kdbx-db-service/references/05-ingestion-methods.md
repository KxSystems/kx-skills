# Ingestion Methods

Choosing and running an ingestion method. Method list comes from the live docs (`import.html`); the gotchas below apply to DB Service 0.1.1 on single-node Docker Compose (as of 2026-11-02) - treat them as indicative, not guarantees.

## Contents

- [Choosing a method](#choosing-a-method)
- [Per-method notes](#per-method-notes)

---

## Choosing a method

| Method | Use when | API (Python client) |
|---|---|---|
| **File import** - CSV, Parquet, q binary | Bulk loads of any size; the default choice | `import_files(table=, path=<path relative to data/imports/>)` |
| **kdb database import** | You already have a partitioned kdb+ HDB to re-ingest | `import_database(table=, path=<dir under data/imports/>)` |
| **JSON API import** | Small loads, app-generated rows, tests (not bulk) | `import_data(table=, data=, insert_as='objects'\|'rows')` |
| **Streaming (RT)** | Live feeds | RT client (`rtpy`) publishing to the RT bus (port 5002) |

All file-based methods are asynchronous: poll `get_import(job_id=...)` until `completed`. Merge mode appends, so loading the same data twice duplicates it (SKILL.md Critical Rule 4).

## Per-method notes

- **Sample data:** the three sample files are *different datasets* (CSV = 2026-03-02, Parquet = 2026-03-03, q binary = 2026-03-04, with different row counts); treat each as its own dataset.
- **kdb database import:** table names come from the HDB itself. Stage the HDB directory under `data/imports/`. The host usually has no `q`, and `q` inside the containers needs the full KDB-X startup framework and licence, so build the HDB on the host with PyKX (a licensed `q` runs in-process) instead of trying to run q in a container.
- **JSON import:** `insert_as` defaults to `auto`, and `import_data` without it works on DB Service Version 0.1.1 (Preview 1.1). Batches of ~5,000 rows worked. Row construction in Python is part of the cost.
- **Streaming (RT):** rows land in the in-memory tier first, so on-disk size reads small until they roll to disk. A feed run that fails with `inotify_add_watch error: 28, No space left on device` has used up the inotify watch limit; see `references/03-troubleshooting.md`. The client name and publishing directory are not defined in the RT docs.
- **Counting rows after any method:** use `GROUP BY` (e.g. per date or sym) and sum client-side; ungrouped `count(*)` returns HTTP 400 in `query_sql`.

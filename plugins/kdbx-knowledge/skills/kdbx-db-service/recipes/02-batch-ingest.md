# Recipe: Batch Ingest

**Pattern:** Authenticate with an external data source → download and clean data → ingest into DB Service.

Use this recipe when data arrives as a one-time or scheduled batch - a CSV download, an API pull, or a third-party tick archive - rather than a continuous feed.

## Triggers

Use this recipe when the user asks to set up the **full end-to-end** OneTick batch ingest pipeline. Do NOT use it for isolated sub-tasks (just downloading data, just ingesting).

- "run the OneTick recipe" / "run the OneTick LSE recipe"
- "run the OneTick LSE runbook" / "OneTick LSE runbook"
- Any request to go from a blank state to downloaded and ingested OneTick data in the DB Service

---

## Prerequisites

- Docker running (`docker info` succeeds)
- kdb-x installed and licensed (`$HOME/.kx/kc.lic` present)
- DB Service installed - verify with `find ~ -maxdepth 5 -name docker-compose.yaml -path '*db-service*' 2>/dev/null | head -3`
- Python 3 with `dbservice_client`, `pandas`, and `requests` installed
- OneTick Cloud API credentials (`OT_CLIENT_ID`, `OT_CLIENT_SECRET`) present in the DB Service `.env` - obtain from the OneTick Cloud subscription portal

---

## Planning guide

Before writing any code, form a plan around these three phases:

**1. Data acquisition**
Understand the external source: how to authenticate, what parameters drive the download (date range, instrument list, format), and what the raw data looks like. For OneTick Cloud specifically, consult `references/02-onetick.md` for the auth flow and download patterns. For other sources, identify the equivalent credential and request structure.

**2. Cleaning and mapping**
Raw data rarely matches DB Service schema expectations. Plan the transformation before writing it:
- Column renaming to lowercase, DB-Service-friendly names
- Timestamp conversion (nanoseconds, epoch, strings → pandas datetime → ingest)
- Symbol normalisation (strip source prefixes, enforce consistent formatting)
- Null handling for numeric columns

**3. Schema and ingest**
Design the table schema before ingesting. For batch/historical data, the full date range will land in the HDB tier - ensure `prtnCol` is a timestamp column and `attrDisk: "parted"` is set on the primary sort column. Write the CSV to `data/imports/` (pass only the filename to `import_files`, not the full path) and poll the job until `status == 'completed'`. Consult the live Import and Manage Tables docs for exact API shapes.

---

## Key decisions to make

- **Download scope:** date range, instrument list, fields - be explicit; some APIs silently truncate large requests.
- **Schema:** match column types to the data (float vs long for sizes, timestamp precision).
- **Idempotency:** should re-running drop and recreate the table, or append? For batch demos, drop-and-recreate is simplest.

---

## References

| What | Where |
|------|-------|
| DB Service setup, health check | `references/01-setup.md` |
| OneTick auth, download, ingest | `references/02-onetick.md` |
| Table creation, import API | Live docs - see Module Index in SKILL.md |
| Troubleshooting | `references/03-troubleshooting.md` |

---

## OneTick-specific non-obvious details

These are facts Claude cannot infer from the live docs or references. Apply them when working with the OneTick LSE_SAMPLE dataset.

**Download**
- Always download in two groups of 5 syms and merge - a single 10-sym request silently truncates data.
- `admin_query.otq::list_symbols` returns `#FATAL_ERROR` on some accounts - skip discovery and use the known sym list directly: `BARC, BP., BT.A, CTEC, GLEN, IAG, LGEN, LLOY, RR., VOD`.

**Data shape**
- `_SYMBOL_NAME` has format `LSE_SAMPLE::BARC` - strip the prefix (take everything after `::`).
- Timestamps arrive as nanoseconds in `#TIMESTAMP` - convert with `pd.to_datetime(..., unit="ns")`.
- `MID` and `SPREAD` columns are pre-computed by OneTick - do not recalculate them.

**Schema**
- Table name: `lsequotes`
- Columns: `ts` (timestamp, prtnCol), `sym` (symbol, attrMem: grouped, attrDisk: parted), `bidprice` (float), `askprice` (float), `bidsize` (long), `asksize` (long), `mid` (float), `spread` (float)

**Operations**
- To find the active imports directory, use `docker inspect kx-db-sm` and read the mount whose destination is `/imports`. Do not use `find` - multiple DB Service installs may be present and `find` will pick the wrong one.

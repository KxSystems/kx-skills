# Recipe: Batch Ingest

**Pattern:** Authenticate with an external data source -> download and clean data -> ingest into DB Service.

Use this recipe when data arrives as a one-time or scheduled batch - a CSV download, an API pull, or a third-party tick archive - rather than a continuous feed.

## Triggers

Use this recipe only for the full end-to-end OneTick batch pipeline, from a blank state to downloaded and ingested data. For isolated sub-tasks (just downloading data, or just ingesting), run that single step.

---

## Prerequisites

- Docker running (`docker info` succeeds)
- kdb-x installed for the q client (`use` needs the KDB-X runtime); the DB Service licence is set in the stack's `.env`: `KDB_LICENSE_B64` for a Community Edition `kc.lic` (base64), or `KDB_K4LICENSE_B64` for a commercial `k4.lic` (base64). Set exactly one
- DB Service installed - verify with `find ~ -maxdepth 5 -name docker-compose.yaml -path '*db-service*' 2>/dev/null | head -3`
- Python 3 with `dbservice_client` and `pandas` installed; `uv` installed for the OneTick execution helper
- OneTick Cloud API credentials exported in the shell as `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET` (not the DB Service's own `.env`) - obtain from the OneTick Cloud subscription portal

---

## Planning guide

Before writing any code, form a plan around these three phases:

**1. Data acquisition**
Understand the external source: how to authenticate, what parameters drive the download (date range, instrument list, format), and what the raw data looks like. For OneTick Cloud specifically, consult `references/02-onetick.md` for the auth flow and download patterns. For other sources, identify the equivalent credential and request structure.

**2. Cleaning and mapping**
Raw data rarely matches DB Service schema expectations. Plan the transformation before writing it:

- Column renaming to the names you want to query
- Timestamp conversion (nanoseconds, epoch, strings -> pandas datetime -> ingest)
- Symbol normalisation (strip source prefixes, enforce consistent formatting)
- Null handling for numeric columns

**3. Schema and ingest**
Design the table schema before ingesting. For batch/historical data, the full date range will land in the HDB tier - ensure `prtnCol` is a timestamp column and `attrDisk: "parted"` is set on the primary sort column. Write the CSV to `data/imports/` (pass a path relative to `data/imports/` to `import_files`, not the host path) and poll the job until `status == 'completed'`. Consult the live Import and Manage Tables docs for exact API shapes.

---

## Key decisions to make

- **Download scope:** date range, instrument list, fields - be explicit; some APIs silently truncate large requests.
- **Schema:** match column types to the data (float vs long for sizes, timestamp precision).
- **Idempotency:** should re-running drop and recreate the table, or append? Drop-and-recreate deletes the table's existing data: confirm with the user and offer a backup first, unless the user named a disposable demo table.

---

## References

| What                           | Where                                              |
| ------------------------------ | -------------------------------------------------- |
| DB Service setup, health check | `references/01-setup.md`                           |
| OneTick auth, download, ingest | `references/02-onetick.md`                         |
| Table creation, import API     | Live docs - see `references/08-live-docs-index.md` |
| Troubleshooting                | `references/03-troubleshooting.md`                 |

---

## OneTick-specific non-obvious details

These are facts Claude cannot infer from the live docs or references. Apply them when working with the OneTick LSE_SAMPLE dataset.

**Download**

- Chunking: on the SQL path in `references/02-onetick.md`, one 10-sym query returned the same total as two 5-sym queries (`LSE_SAMPLE.TRD`, VOD/BARC/BP./BT.A/CTEC/GLEN/IAG/LGEN/LLOY/RR. for 2024-01-03 09:00-10:00 UTC: 6,710 = 3,637 + 3,073). Silent truncation applies only to the old OTQ/REST `SYM_LIST` path. If you use that path, split the symbols into groups of 5 and merge; on the SQL path, check row totals against per-group totals.
- Database/symbol discovery via the `onetick-cloud` skill's MCP discovery tools if registered, or go straight to the known sym list: `BARC, BP., BT.A, CTEC, GLEN, IAG, LGEN, LLOY, RR., VOD`.

**Data shape**

- Via `references/02-onetick.md`'s SQL path (the recommended one), `SYMBOL_NAME` is already the bare symbol (e.g. `VOD`, no `LSE_SAMPLE::` prefix) and `TIMESTAMP` is already `datetime64[ns]` - no manual conversion needed.
- Only if falling back to a raw OTQ/REST call directly: the symbol column is `_SYMBOL_NAME` with format `LSE_SAMPLE::BARC` (strip the prefix) and the timestamp column is `#TIMESTAMP` in nanoseconds (convert with `pd.to_datetime(..., unit="ns")`).
- The raw quote table `LSE_SAMPLE.QTE` has no `MID` or `SPREAD` fields (columns: `SYMBOL_NAME`, `TIMESTAMP`, `EXCH_TIME`, `BID_PRICE`, `BID_SIZE`, `ASK_PRICE`, `ASK_SIZE`, `OMDSEQ`). Compute `mid = (bid_price + ask_price) / 2` and `spread = ask_price - bid_price` client-side, or query `LSE_SAMPLE_BARS` `QTE_1M`, which has per-bar `MID_TWAP`, `MID_MEDIAN`, `MID_LAST` and `SPREAD_MIN`, `SPREAD_MAX`, `SPREAD_TWAP`, `SPREAD_MEDIAN`, `SPREAD_LAST`.

**Schema**

- Table name: your choice (the examples use `lsequotes`).
- Columns for the raw quote table, named as you want to query them (the service keeps case): `ts` (timestamp, prtnCol), `sym` (symbol, attrMem: grouped, attrDisk: parted), `bid_price`, `ask_price` (float), `bid_size`, `ask_size` (long). Add `mid` and `spread` (float) only if you compute them on the client.

**Operations**

- To find the active imports directory, use `docker inspect kx-db-sm` and read the mount whose destination is `/imports`. Use `docker inspect`, not `find`: multiple DB Service installs may be present and `find` may pick the wrong one.

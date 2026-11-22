# OneTick Cloud Data

## Contents

- [Prerequisites](#prerequisites)
- [Phase 1 - Get Data via the `onetick-cloud` Helper](#phase-1---get-data-via-the-onetick-cloud-helper)
- [Phase 2 - Clean and Prepare Data](#phase-2---clean-and-prepare-data)
- [Phase 3 - Ingest into DB Service](#phase-3---ingest-into-db-service)
- [OneTick Type Mapping](#onetick-type-mapping)
- [Troubleshooting](#troubleshooting)

This module covers the end-to-end pipeline for pulling market data from OneTick Cloud and ingesting it into the DB Service. It uses the `onetick-cloud` skill's bundled execution helper directly - the same mechanism that skill's own SQL workflow uses - rather than hand-rolling OneTick REST/OTQ calls.

**Time estimate:** 10-20 minutes for a first run; ~5 minutes once you know your database, table, and symbol.

---

## Prerequisites

- [ ] KDB-X DB Service running - see `references/01-setup.md`
- [ ] Python client `kdbx_db_service_client==0.1.1` installed, with `pandas` and `pyarrow` (`pd.read_feather` needs pyarrow in the environment that reads the helper's output); `uv` installed (`brew install uv` or see https://docs.astral.sh/uv/)
- [ ] OneTick Cloud account with API credentials (client ID + client secret), exported as `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET`
  - Sign up / manage: https://authdash.cloud.onetick.com/web_dashboard/?dash=sub_profile
- [ ] The `onetick-cloud` skill installed (it provides the execution helper this module runs). If it isn't:
  ```
  /plugin marketplace add KxSystems/kx-skills
  /plugin install onetick-knowledge@kx-skills
  ```

---

## Phase 1 - Get Data via the `onetick-cloud` Helper

### Locate the helper script

```bash
find ~ -path '*onetick-cloud/scripts/onetick_exec.py' 2>/dev/null | head -1   # no depth limit: plugin installs sit about ten levels below home
```

Substitute the actual path throughout, resolving it on each machine.

### Know your target (discovery)

If the `OneTick-Cloud` MCP server is registered in this session, use its tools first to confirm the real database/table/column names rather than guessing: `list_databases`, `db_table_schemas`, `db_field_descriptions`. If it isn't registered, browse the catalogue manually at https://authdash.cloud.onetick.com/web_dashboard/?dash=databases, or reuse a known-working target (e.g. `LSE_SAMPLE.TRD` for UK equity trades).

### Compose SQL and run it

Apply the same guardrails the `onetick-cloud` skill documents: an explicit timezone on every time literal, `>=`/`<` instead of `BETWEEN` (OneTick rejects `BETWEEN` on `TIMESTAMP`), and a `limit` to bound the result.

The user enters the client secret in their own terminal. Claude never asks for, repeats, stores or writes the secret into a command or file. Use the placeholders below and tell the user to set the values.

```bash
export OTP_CLIENT_ID="<your-client-id>"
export OTP_CLIENT_SECRET="<your-client-secret>"

SQL="select SYMBOL_NAME, TIMESTAMP, PRICE, SIZE
     from LSE_SAMPLE.TRD
     where SYMBOL_NAME='VOD'
       and TIMESTAMP >= '2024-01-03 09:00:00 UTC'
       and TIMESTAMP < '2024-01-03 09:01:00 UTC'
     limit 500000"

uv run "<path-to>/onetick_exec.py" --sql "$SQL"
```

**Useful flags** (from the script's own `argparse` definition):

| Flag | Default | Purpose |
|---|---|---|
| `--sql` | - | Inline SQL (as above) |
| `--sql-file` | - | Read the SQL from a file instead |
| *(stdin)* | - | Pipe SQL in if neither `--sql` nor `--sql-file` is given |
| `--timezone` | `Europe/London` | Timezone for rendered output timestamps |
| `--output` | `${TMPDIR}/onetick-results/<hash>.feather` | Where the full Arrow Feather result is written |
| `--show-sql` / `--no-show-sql` | on | Whether the executed SQL is echoed in the envelope's `sql` field |

The first `uv run` resolves dependencies into a cached venv (slow once, fast after). The command prints a JSON envelope: `{"rows": <total>, "columns": [...], "preview_rows": <int>, "path": "<feather>", "preview": [...], "sql": "..."}`. The **full** result is always on disk at `path`, regardless of row count - stdout only carries a bounded preview.

### Load the result

```python
import pandas as pd
df_raw = pd.read_feather("<path from the envelope>")
print(f"Rows: {len(df_raw)}, Columns: {list(df_raw.columns)}")
print(df_raw.dtypes)
```

Timestamp columns come back already as proper `datetime64[ns]` - no manual nanosecond conversion needed, unlike a raw OneTick REST/OTQ response.

---

## Phase 2 - Clean and Prepare Data

### Identify key columns

```python
print(df_raw.dtypes)
```

- **Timestamp column** - already `datetime64[ns]`. Use it as `prtnCol`.
- **Symbol column** - will get `attrMem: "grouped"`, `attrDisk: "parted"`.
- **Numeric columns** - use `float` for prices/rates, `long` for sizes/counts.

### Rename to your target schema

```python
TABLE_NAME = "<your-table>"

column_map = {
    "TIMESTAMP":    "ts",
    "SYMBOL_NAME":  "sym",
    "PRICE":        "price",
    "SIZE":         "size",
    # If you selected more columns in Phase 1 (e.g. TRADE_TYPE, TRADE_VENUE),
    # add a rename entry for each here - and a matching column in create_table below.
}
df = df_raw.rename(columns=column_map)

# Keep only the columns you need
# df = df.drop(columns=["unwanted_col"])

clean_file = f"{TABLE_NAME}_clean.csv"
df.to_csv(clean_file, index=False)
print(f"Saved {clean_file} with {len(df)} rows")
```

---

## Phase 3 - Ingest into DB Service

### Create schema and ingest

```python
import dbservice_client as dbs
import shutil, os, time

DB_DIR  = "/path/to/db-service"
session = dbs.Session()

# Create schema - adjust columns to match your data
session.create_table(
    table=TABLE_NAME,
    type="partitioned",
    prtnCol="ts",               # timestamp-type column, required
    sortColsDisk=["sym"],
    sortColsOrd=["sym"],
    columns=[
        {"name": "ts",    "type": "timestamp"},
        {"name": "sym",   "type": "symbol", "attrMem": "grouped", "attrDisk": "parted"},
        {"name": "price", "type": "float"},
        {"name": "size",  "type": "long"},
        # Add your other columns
    ]
)

# Copy to imports directory - use shutil.copyfile (not shutil.copy2)
shutil.copyfile(clean_file, os.path.join(DB_DIR, "data", "imports", clean_file))

# Ingest (no createTable - schema already defined above)
job = session.import_files(table=TABLE_NAME, path=clean_file)
jid = job["jobId"]
print(f"Ingest job: {jid}")

# Poll for completion: stop on completed, fail on errored/canceled, time out otherwise
for i in range(30):
    status = session.get_import(job_id=jid)
    print(f"[{i*2}s] {status['status']}")
    if status["status"] == "completed":
        break
    if status["status"] in ("errored", "canceled"):
        raise RuntimeError(f"import {jid} {status['status']}: {status.get('error')}")
    time.sleep(2)
else:
    raise TimeoutError(f"import {jid} still {status['status']} after 60s")
```

Run the count check below only after this loop has returned normally.

### Verify row count

Push the count down with `query_simple`'s `groupBy` + `agg` rather than `len(session.query_simple(...))`, which on OneTick tick data (tens of millions of rows/day) OOMs the aggregator; see `references/06-query-guide.md` > Push Down Aggregations).

```python
# Per-symbol counts, reduced server-side (safe on tables of any size).
# Group by a column this table actually has (the schema above has no trddate; grouping by it returns HTTP 400 "Group column not found").
counts = session.query_simple(
    table=TABLE_NAME,
    startTS=START_TS,   # the download interval, ISO format, e.g. "2026-03-02T00:00:00"
    endTS=END_TS,       # exclusive end of that interval
    groupBy=["sym"],
    agg=[["n", "count", "sym"]],   # count a real, always-populated column (the virtual `i` is rejected)
    return_as="pandas",
)
print(counts)
print(f"Rows in DB: {int(counts['n'].sum())}")   # should match len(df)
```

For a quick look at a few rows, use `session.query_preview(table=TABLE_NAME, limit=5)`.

---

## OneTick Type Mapping

| OneTick/Arrow type (from the Feather result) | DB Service column type |
| --------------------------------------------- | ----------------------- |
| `timestamp[ns]` -> `datetime64[ns]`           | `timestamp`              |
| `double` -> `float64`                         | `float`                  |
| `string` -> `object`                          | `symbol`                 |
| `int64`                                       | `long`                   |

---

## Troubleshooting

| Symptom                                  | Check                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Helper exits non-zero with `{"error": "Missing OneTick credentials: ..."}` | `OTP_CLIENT_ID`/`OTP_CLIENT_SECRET` not exported in this shell - export them, then retry with real values |
| Helper exits non-zero with `{"error": "ERR_..."}` | A OneTick-level SQL error - fix the SQL per the error text (field name, operator, timezone); retry at most ~3 times, each time after a fix |
| `rows: 0` in the envelope on a query that should return data | Symbol/table/date range mismatch - verify via the web dashboard, or run a `select distinct SYMBOL_NAME from <DB>.<TICK_TYPE> ...` diagnostic |
| Ingest job errored | Check `status['error']`; commonly a type mismatch or missing column - re-inspect `df.dtypes` |
| `no file found: /imports/<file>` | File must be copied to `data/imports/` before calling `import_files`; pass a path relative to `data/imports/`, not a host path |
| Column names wrong in query | Column case is kept as ingested - run `describe_table` and query with the same case |
| First `uv run` is slow | Expected - it resolves `onetick-py`/`pandas`/`pyarrow` into a cached venv once; subsequent runs are fast |

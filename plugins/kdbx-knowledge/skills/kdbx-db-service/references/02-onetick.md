# OneTick Cloud Data

## Contents

- [Prerequisites](#prerequisites)
- [Phase 1 - Authenticate with OneTick Cloud](#phase-1---authenticate-with-onetick-cloud)
- [Phase 2 - Discover Available Data](#phase-2---discover-available-data)
- [Phase 3 - Download Data](#phase-3---download-data)
- [Phase 4 - Clean and Prepare Data](#phase-4---clean-and-prepare-data)
- [Phase 5 - Ingest into DB Service](#phase-5---ingest-into-db-service)
- [Phase 6 - Visualise with KX Dashboards (Optional)](#phase-6---visualise-with-kx-dashboards-optional)
- [OneTick Type Mapping](#onetick-type-mapping)
- [Troubleshooting](#troubleshooting)

This module covers the end-to-end pipeline for pulling market data from OneTick Cloud and ingesting it into the DB Service.

**Time estimate:** 20-40 minutes for a first run; ~5 minutes once you know your database, symbols, and OTQ path.

---

## Prerequisites

- [ ] KDB-X DB Service running - see `references/01-setup.md`
- [ ] Python client installed with `pandas`, `requests`
- [ ] OneTick Cloud account with API credentials (client ID + client secret)
  - Sign up / manage: https://authdash.cloud.onetick.com/web_dashboard/?dash=sub_profile

---

## Phase 1 - Authenticate with OneTick Cloud

All API calls require a bearer token obtained via client credentials:

```python
import requests

TOKEN_URL     = "https://cloud-auth.parent.onetick.com/realms/OMD/protocol/openid-connect/token"
REST_URL      = "https://rest.cloud.onetick.com/omdwebapi/rest/"
CLIENT_ID     = "<your-client-id>"      # from OneTick Cloud portal
CLIENT_SECRET = "<your-client-secret>"  # from OneTick Cloud portal

def get_access_token():
    r = requests.post(
        TOKEN_URL,
        data={"grant_type": "client_credentials"},
        auth=(CLIENT_ID, CLIENT_SECRET)
    )
    r.raise_for_status()
    return r.json()["access_token"]

access_token = get_access_token()
print("Authenticated")
```

Tokens expire. If a subsequent request returns a 401, re-call `get_access_token()`.

---

## Phase 2 - Discover Available Data

Before downloading, discover which databases, symbols, and data types are available in your subscription.

### List available databases

```python
params = {
    "query_type": "otq",
    "otq":        "admin_query.otq::list_databases",
    "response":   "csv",
}
r = requests.post(REST_URL, json=params,
                  headers={"Authorization": f"Bearer {access_token}",
                           "Content-Type": "application/json"})
print(r.text[:2000])
```

Browse the full catalogue at: https://authdash.cloud.onetick.com/web_dashboard/?dash=databases

### List symbols in a database

```python
DB = "<your-database>"   # e.g. "LSE_SAMPLE"

params = {
    "query_type": "otq",
    "otq":        "admin_query.otq::list_symbols",
    "response":   "csv",
    "otq_params": f"DB={DB}",
}
r = requests.post(REST_URL, json=params,
                  headers={"Authorization": f"Bearer {access_token}",
                           "Content-Type": "application/json"})
print(r.text[:2000])
```

### Discover available fields

Request a small sample to inspect the column schema:

```python
import io, pandas as pd

SAMPLE_PARAMS = {
    "query_type":             "otq",
    "otq":                    "<your-otq-path>",    # e.g. "quotes.otq::data"
    "s":                      "<start>",             # e.g. "20240103090000.000"
    "e":                      "<start-plus-1min>",   # e.g. "20240103090100.000"
    "timezone":               "UTC",
    "response":               "csv",
    "output_only_one_header": "true",
    "otq_params":             f"DB={DB},DELIM=|,SYM_LIST=<one-symbol>,FIELDS=,LIMIT=100",
}
r = requests.post(REST_URL, json=SAMPLE_PARAMS,
                  headers={"Authorization": f"Bearer {access_token}",
                           "Content-Type": "application/json"})
df_sample = pd.read_csv(io.StringIO(r.text))
print("Available columns:", list(df_sample.columns))
print(df_sample.head())
```

Record the column names exactly as returned. The DB Service lowercases all column names on ingest.

---

## Phase 3 - Download Data

### Request parameter reference

| Parameter                 | Description                     | Example                                        |
| ------------------------- | ------------------------------- | ---------------------------------------------- |
| `otq`                     | OTQ query path (data type)      | `quotes.otq::data`, `trades.otq::data`         |
| `s`                       | Start time `YYYYMMDDHHmmss.mmm` | `20240103090000.000`                           |
| `e`                       | End time `YYYYMMDDHHmmss.mmm`   | `20240103163000.000`                           |
| `timezone`                | Timezone for `s`/`e`            | `UTC`, `US/Eastern`, `Europe/London`           |
| `response`                | Output format                   | `csv`                                          |
| `compression`             | Compress response               | `gzip`                                         |
| `show_times_as_nanos`     | Timestamps as nanoseconds       | `true` (required for kdb timestamp conversion) |
| `output_only_one_header`  | Single header row               | `true`                                         |
| `output_types_in_headers` | Type metadata in header         | `false`                                        |
| `otq_params`              | OTQ-specific parameters         | See table below                                |

**`otq_params` keys:**

| Key         | Description                             | Example                            |
| ----------- | --------------------------------------- | ---------------------------------- |
| `DB`        | OneTick database name                   | `LSE_SAMPLE`                       |
| `DELIM`     | Separator for multi-value fields        | `\|` (pipe)                        |
| `SYM_LIST`  | Symbols to fetch (separated by `DELIM`) | `VOD\|BARC\|LLOY`                  |
| `SYMBOLOGY` | Symbol lookup type                      | empty (native), `ISIN`, `CUSIP`    |
| `ADJUST`    | Apply split/dividend adjustment         | `false`                            |
| `CURRENCY`  | Convert prices to this currency         | empty (native), `USD`              |
| `FIELDS`    | Comma-separated fields to return        | empty (all), `BID_PRICE,ASK_PRICE` |
| `LIMIT`     | Maximum rows                            | `500000`                           |

### Download code

```python
import gzip

DB          = "<your-database>"          # e.g. "LSE_SAMPLE"
OTQ_PATH    = "<your-otq-path>"          # e.g. "quotes.otq::data"
SYM_LIST    = "<sym1>|<sym2>"            # pipe-delimited, e.g. "VOD|BARC"
FIELDS      = ""                         # empty = all fields
START       = "<YYYYMMDDHHmmss.mmm>"
END         = "<YYYYMMDDHHmmss.mmm>"
TIMEZONE    = "UTC"
LIMIT       = "500000"
OUTPUT_FILE = "<your-table-name>.csv"

params = {
    "query_type":              "otq",
    "otq":                     OTQ_PATH,
    "s":                       START,
    "e":                       END,
    "timezone":                TIMEZONE,
    "response":                "csv",
    "compression":             "gzip",
    "output_only_one_header":  "true",
    "output_types_in_headers": "false",
    "show_times_as_nanos":     "true",
    "otq_params":              f"DB={DB},DELIM=|,SYM_LIST={SYM_LIST},SYMBOLOGY=,ADJUST=false,CURRENCY=,FIELDS={FIELDS},LIMIT={LIMIT}",
}

response = requests.post(REST_URL, json=params,
                         headers={"Authorization": f"Bearer {access_token}",
                                  "Content-Type": "application/json"})
response.raise_for_status()

with open(OUTPUT_FILE, "w") as f:
    f.write(gzip.decompress(response.content).decode("utf-8"))

print(f"Downloaded: {OUTPUT_FILE}")

df_raw = pd.read_csv(OUTPUT_FILE)
print(f"Rows: {len(df_raw)}, Columns: {list(df_raw.columns)}")
print(df_raw.head())
```

---

## Phase 4 - Clean and Prepare Data

### Inspect types and identify key columns

```python
df = pd.read_csv(OUTPUT_FILE)
print(df.dtypes)
```

Identify:

- **Timestamp column** - nanosecond integer (from `show_times_as_nanos=true`). Convert to datetime and use as `prtnCol`.
- **Symbol column** - will get `attrMem: "grouped"`, `attrDisk: "parted"`.
- **Numeric columns** - use `float` for prices/rates, `long` for sizes/counts.

### Clean and rename

```python
TIMESTAMP_COL = "#TIMESTAMP"     # nanosecond timestamp column from OneTick
SYMBOL_COL    = "_SYMBOL_NAME"   # symbol column from OneTick
TABLE_NAME    = "<your-table>"

# Convert nanosecond timestamps to datetime
df[TIMESTAMP_COL] = pd.to_datetime(df[TIMESTAMP_COL], unit="ns", errors="coerce")

# Rename to lowercase-friendly names
column_map = {
    TIMESTAMP_COL: "ts",
    SYMBOL_COL:    "sym",
    # Add all other columns, e.g.:
    # "BID_PRICE":   "bidprice",
    # "ASK_PRICE":   "askprice",
    # "BID_SIZE":    "bidsize",
    # "ASK_SIZE":    "asksize",
    # "EXCH_TIME":   "exchtime",
    # "SPREAD":      "spread",
    # "MID":         "mid",
}
df = df.rename(columns=column_map)

# Drop columns you do not need
# df = df.drop(columns=["unwanted_col"])

clean_file = f"{TABLE_NAME}_clean.csv"
df.to_csv(clean_file, index=False)
print(f"Saved {clean_file} with {len(df)} rows")
```

---

## Phase 5 - Ingest into DB Service

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
        {"name": "ts",        "type": "timestamp"},
        {"name": "sym",       "type": "symbol", "attrMem": "grouped", "attrDisk": "parted"},
        # Add your other columns:
        # {"name": "bidprice", "type": "float"},
        # {"name": "askprice", "type": "float"},
        # {"name": "bidsize",  "type": "long"},
        # {"name": "asksize",  "type": "long"},
    ]
)

# Copy to imports directory - use shutil.copyfile (not shutil.copy2)
shutil.copyfile(clean_file, os.path.join(DB_DIR, "data", "imports", clean_file))

# Ingest (no createTable - schema already defined above)
job = session.import_files(table=TABLE_NAME, path=clean_file)
jid = job["name"]
print(f"Ingest job: {jid}")

# Poll for completion
for i in range(30):
    status = session.get_import(job_id=jid)
    print(f"[{i*2}s] {status['status']}")
    if status["status"] in ("completed", "errored"):
        print(status)
        break
    time.sleep(2)
```

### Verify row count

```python
start_date = df['ts'].min().strftime('%Y.%m.%d') + 'D00:00:00.000'
end_date   = df['ts'].max().strftime('%Y.%m.%d') + 'D23:59:59.999'

result = session.query_simple(
    table=TABLE_NAME,
    startTS=start_date,
    endTS=end_date,
    return_as="pandas"
)
print(f"Rows in DB: {len(result)}")   # should match len(df)
print(result.head())
```

---

## OneTick Type Mapping

| OneTick raw type    | After conversion                                        | DB Service column type |
| ------------------- | ------------------------------------------------------- | ---------------------- |
| `int64` nanoseconds | `datetime64[ns]` (via `pd.to_datetime(..., unit='ns')`) | `timestamp`            |
| `float64`           | `float64`                                               | `float`                |
| `object` (string)   | `object`                                                | `symbol`               |
| `int64` (row index) | `int64`                                                 | `long`                 |

---

## Troubleshooting

| Symptom                                  | Check                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `response.raise_for_status()` throws 401 | Token expired - re-run `get_access_token()`                                                                         |
| `response.raise_for_status()` throws 400 | Check `otq_params` syntax - no spaces around `=` or `,`; verify OTQ path exists in your subscription                |
| Empty CSV (header only)                  | Symbol not in the chosen database, or date range has no data - verify via web dashboard                             |
| Ingest job errored                       | Check `status['error']`; commonly a type mismatch or missing column - re-inspect `df.dtypes`                        |
| `no file found: /imports/<file>`         | File must be copied to `data/imports/` before calling `import_files`; pass only the filename                        |
| Rows in DB do not match rows downloaded  | Timestamp column not converting correctly - check `unit="ns"` matches `show_times_as_nanos=true`                    |
| Column names wrong in query              | DB Service lowercases all column names on ingest - use lowercase in all queries                                     |

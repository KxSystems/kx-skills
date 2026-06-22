# Recipe: Streaming Ingest

**Pattern:** Start a live data feed → stream into DB Service.

Use this recipe when the goal is a real-time ingest pipeline: data arrives continuously and should be stored in the DB Service within seconds.

## Triggers

Use this recipe when the user asks to set up the **full end-to-end** FX ingest pipeline. Do NOT use it for isolated sub-tasks (starting just the feed, just the schema, just a query).

- "run the FX recipe" / "run the FX ingest recipe"
- "FX live feed demo"
- "set up the FX live pipeline" / "live FX data pipeline end-to-end"
- Any request to go from a blank state to a running FX feed writing into the DB Service

---

## Prerequisites

- Docker running (`docker info` succeeds)
- kdb-x installed and licensed (`$HOME/.kx/kc.lic` present)
- DB Service installed - verify with `find ~ -maxdepth 5 -name docker-compose.yaml -path '*db-service*' 2>/dev/null | head -3`
- Python 3 with `dbservice_client` installed - verify with `python3 -c "import dbservice_client"`
- `rtpy` installed for the FX feed - install from the DB Service samples directory if missing: `pip install -r "$DB_DIR/samples/requirements.txt"`

---

## Planning guide

Before writing any code, form a plan around these two phases:

**1. Service and schema**
Ensure the DB Service is running and a table exists to receive the feed. Consult `references/01-setup.md` for startup, health check, and reset sequences. Design the schema before the feed starts - the partition column must be a timestamp type, and the primary sort column should carry `attrDisk: "parted"`. Consult the live Manage Tables doc for the exact `create_table` shape.

**2. Feed**
Identify the feed source and how it publishes data - via the RT bus (port 5002), direct REST ingest, or the Python client. The DB Service samples directory typically contains a working feed script. Confirm the schema column names match what the feed produces (DB Service lowercases all column names on ingest).

---

## Key decisions to make

- **Schema:** which columns, what types, what sort/partition strategy?
- **Feed lifecycle:** does the feed need the schema to exist first, or does it create on first write?

---

## References

| What | Where |
|------|-------|
| DB Service setup, reset, health check | `references/01-setup.md` |
| Table creation, import API | Live docs - see Module Index in SKILL.md |
| Troubleshooting | `references/03-troubleshooting.md` |

---

## FX-specific non-obvious details

These are facts Claude cannot infer from the live docs or references. Apply them when working with the sample FX feed.

**Feed**
- Feed script: `samples/fxfeed.py` inside the DB Service directory. Streams EURUSD, GBPUSD, USDJPY ticks via the RT bus (port 5002) at roughly one tick per second per sym.

**Schema**
- Table name: `fxquote`
- Columns: `trddate` (date), `ts` (timestamp, prtnCol), `sym` (symbol, attrMem: grouped, attrDisk: parted), `bid` (float), `ask` (float)
- Sort: `sortColsDisk` and `sortColsOrd` both on `sym`

**Operations**
- After `reset-db.sh`, containers run as `nobody` and leave `data/` subdirectories unwritable on restart. Always fix permissions before restarting: `docker run --rm -v $(pwd)/data:/data alpine chmod -R 777 /data`
- The gateway responds before the SM is fully registered - if `create_table` returns 500, wait 10-15 s and retry.

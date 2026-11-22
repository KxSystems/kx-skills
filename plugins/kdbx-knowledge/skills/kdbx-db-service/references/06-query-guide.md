# Query Guide

Read this when writing or optimising a query: aggregation push-down, `query_simple` parameters, `query_sql` and `query_q` rules. `SKILL.md` holds the critical rules; this file holds the detail.

## Contents

- [Query Examples](#query-examples)
- [Push Down Aggregations](#push-down-aggregations)
- [Additional query_simple Parameters](#additional-query_simple-parameters)
- [Key query rules](#key-query-rules)

---

## Query Examples

```python
# query_simple: full timestamps required; bound with limit= when fetching raw rows
session.query_simple(table='fxquote', startTS='2026.03.02D00:00:00.000', endTS='2026.03.04D00:00:00.000', limit=1000, return_as='pandas')
session.query_sql(query="SELECT sym, avg(bid) FROM fxquote GROUP BY sym", return_as='pandas')
session.query_sql(query="SELECT trddate, count(sym) AS n FROM fxquote WHERE trddate >= DATE '2026-03-02' GROUP BY trddate", return_as='pandas')
session.query_simple(table='fxquote', startTS='2026.03.02D00:00:00.000', endTS='2026.03.03D00:00:00.000', groupBy=['trddate'], agg=[['c','cov','bid','ask']], return_as='pandas')  # two-argument function: two columns
# query_q takes no startTS/endTS kwargs - put the date range inside the q string; prefer .kxi.selectTable over a direct select
session.query_q(query=".kxi.selectTable[([table:`fxquote;startTS:2026.03.02D00:00:00;endTS:2026.03.03D00:00:00;groupBy:`trddate`sym!`trddate`sym;agg:`o`h`l`c!((first;`bid);(max;`bid);(min;`bid);(last;`bid))])]", return_as='pandas')
# Preview: lightweight sampling of data/schema at minimal cost - not for a real result set
session.query_preview(table='fxquote', limit=5, return_as='json')
```

Filter rows on the server inside `.kxi.selectTable`: `filter` is a list of parse-tree triples `(operator; column; values)`, with the value wrapped in `enlist` (the doc example is `(=;`sym;enlist`AAPL)`). Do not filter the returned DataFrame in pandas:

```python
session.query_q(query=".kxi.selectTable[([table:`ny_taxi;startTS:2021.12.01D00:00:00;endTS:2022.01.01D00:00:00;filter:enlist (=;`pickup_borough;enlist`Queens)])]", return_as='pandas')
```

q client:

```q
dbs:use`kx.dbservice_client
session:dbs.createSession["localhost:8080"]
res:session.querySimple[`fxquote; `startTS`endTS`limit!("2026-03-02T00:00:00";"2026-03-03T00:00:00";1000)]
res:session.querySimple[`fxquote; `startTS`endTS`groupBy`agg!("2026-03-02T00:00:00";"2026-03-03T00:00:00";enlist `trddate;enlist (`n;`count;`sym))]
```

Passing a single dict to `querySimple` fails with HTTP 400 `Pre-processing error: length`. To check which tables exist before querying, run `session.listTables[]` (a metadata call, not a query).

## Push Down Aggregations

**Push every aggregation down to the server: reduce rows on the server, not client-side after a raw fetch.** This applies to _any_ aggregation (`count`, `sum`, `avg`, `min`/`max`, `first`/`last`, `var`, `dev`, ...), not just counts. A plain `query_simple` (no `agg`) returns every matching row _through the aggregator_; on a dense table (tick data at tens of millions of rows/day) that can OOM-kill the agg. (An OOM-kill itself was not triggered. The recovery step is `docker compose restart kx-db-agg`, which brings queries back in about 10 seconds.) Use `query_simple`'s structured aggregation (`groupBy` + `agg`) wherever it can express the query - pushed down, it runs server-side and reduces correctly across the RDB/HDB tiers:

```python
session.query_simple(table='mytable', startTS='2026-03-02T00:00:00', endTS='2026-03-03T00:00:00',
                     groupBy=['trddate'],
                     agg=[['n', 'count', 'sym'], ['avg_bid', 'avg', 'bid'], ['hi', 'max', 'ask']],
                     return_as='pandas')
# grand totals: combine the per-group rows client-side, e.g. int(df['n'].sum())
```

**What `query_simple`'s `agg` can push down:** select columns (`["sym","bid"]`), rename them (`[["BidPrice","bid"]]`), and run one aggregation function per output column as `[outName, fn, col]`. The two-argument functions (`wavg`, `wsum`, `cor`, `cov`, `scov`) take a fourth element: `[outName, fn, col1, col2]`. The set of supported functions is defined by the API and **can change between releases** - the authoritative, current list is in the `query/simple` request schema, so fetch it from the Module Index to confirm rather than trusting this snapshot. As of writing the spec lists: `all, any, avg, cor, count, cov, dev, distinct, first, last, max, min, prd, scov, sdev, sum, svar, var, wavg, wsum`. For a row count, name a real column - the virtual `i` is rejected.

**How to decide if it can be pushed down - let the API tell you, not only the snapshot list.** The `agg` target is always a _bare column name_, never an expression. Try the `query_simple` `agg` form first; the error response is an unambiguous signal of the boundary:

- `Aggregation function not supported: <fn>` -> that function isn't available in `agg` in this release (confirm against the live spec; it may have been added/removed).
- `Aggregation function rank mismatch` -> right function, wrong argument count (e.g. a two-arg function passed one column - use the `[out, fn, col1, col2]` form).
- `Agg column not found: <x>` -> you passed an expression or a non-existent column; `agg` takes bare columns only.

When the aggregation genuinely is not expressible through `agg` - a **computed expression** (e.g. `sum(price*size)`, an inline VWAP `sum(bid*ask)/sum(ask)`), a **function the spec doesn't list**, or **post-aggregation / multi-table logic** - fall back to **`query_sql`** (free-form `SELECT`; supports computed expressions, e.g. `SELECT trddate, sum(bid*ask)/sum(ask) AS vwap ... GROUP BY trddate`) or **`query_q`** (arbitrary q/qSQL). Both still push down server-side - bound them with a date range / `where` so they scan only the needed partitions.

**Reductions that span tiers:** `query_simple agg` and `query_sql ... GROUP BY` both push down and reduce correctly. A plain `query_q ... by <key>` pushes down unsafely for a cross-tier reduction - the gateway runs the query independently on every tier and by default _razes_ (concatenates) the per-tier results; razing keyed tables resolves duplicate keys by last-write-wins, so a key present in both tiers gets overwritten rather than combined. A bare aggregation with no grouping returns one value per partition for `min`/`max` (on a multi-partition table) and HTTP 400 for `count(*)`. **Custom reductions:** a q lambda in `query_simple`'s `agg` is rejected on 0.1.1 (`Aggregation function not supported`). Use `query_sql` with `GROUP BY` for a custom reduction.

**Window functions** (moving average, running sum, lag) are not aggregates, so `query_simple`'s `agg` cannot express them. Use `query_q` with `.kxi.selectTable`, grouped per symbol with a dictionary `groupBy`: `.kxi.selectTable[([table:`fxquote;startTS:2026.03.02D00:00:00;endTS:2026.03.03D00:00:00;groupBy:(enlist `sym)!(enlist `sym);agg:(enlist `sma)!(enlist (mavg;5;`bid))])]`. The result holds one moving-average list per symbol. Without the per-symbol group the window runs across symbols. Keep the `startTS`/`endTS` window so only the needed partitions are scanned.

**Non-decomposable ops** (`med`/percentiles, full sorts, high-cardinality `distinct`) push down only within a single partition: q's `med`/`by` across partitions errors with `'part`. Constrain to a single partition / date and reduce there.

**Verify an ingest with a `GROUP BY` count, not `len(session.query_simple(...))`, on a large table** - see the row-count recipe in `references/02-onetick.md`.

## Additional `query_simple` Parameters

Beyond `table`/`startTS`/`endTS`/`filter`/`groupBy`/`agg`:

| Parameter                               | Purpose                                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sortCols`                              | Sort the result - `["sym","ts"]` (ascending), `[["sym","asc"],["ts","desc"]]`, or `["sym","ts","desc"]` (all descending)                                                        |
| `temporality`                           | `"snapshot"` (default: one continuous block between `startTS`/`endTS`) or `"slice"` (same time-of-day window repeated across every day in the range)                            |
| `fill`                                  | `"forward"` (carry last non-null forward) or `"zero"` (null -> type-zero)                                                                                                       |
| `limit`                                 | Beyond a plain row count: a tuple `[skip, take]` pages through large results, e.g. `[200, 100]`; negative `limit` counts from the end                                           |
| `inputTZ` / `outputTZ` / `outputTZCols` | All DB Service timestamps are stored as UTC; these convert `startTS`/`endTS` interpretation and specific output columns to a named tz-database zone (e.g. `"America/New_York"`) |

## Key query rules

1. Always provide `startTS`/`endTS` to `query_simple` - unbounded queries scan all partitions. The server accepts a query without them. `startTS`/`endTS` need a full timestamp (`'2026.03.02D00:00:00.000'` or ISO `'2026-03-02T00:00:00'`); the q date literal `'2026.03.02D'` is rejected with HTTP 400. For a quick peek at the data, use `query_preview` (rule 3 below).
2. `query_sql` WHERE clauses use SQL literals, not q literals: `WHERE trddate >= DATE '2026-03-02'` or `WHERE ts >= TIMESTAMP '2026-03-02T00:00:00'` (a q-style `2026.03.02` gives a SQL parse error).
3. To peek at a few rows or check a schema, use `query_preview(table=..., limit=5)`: it returns a small sample, not a result set. Do not run `query_simple` over a wide window for this.
4. Use `return_as='pandas'` for DataFrame output, `'json'` (default), or `'pykx'`.
5. **For `query_q`, prefer `.kxi.selectTable[...]` over a direct `select ... from <table>`.** A direct select against a table name queries the tiers' raw internal representation and can: miss late-arriving data in the IDB, miss reference-table updates made between end-of-interval cycles, and break on `select *` because the RDB/IDB/HDB have different internal metadata columns (so the default raze can't combine them). `.kxi.selectTable` hides those internal columns and handles all of this correctly - use a direct select only when you are deliberately querying HDB-only historical data and late data is not a concern. `.kxi.selectTable` also resolves `table.column` reference-data lookups, which a direct select cannot do at all.

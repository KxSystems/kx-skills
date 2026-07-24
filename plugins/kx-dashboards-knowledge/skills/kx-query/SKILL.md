---
name: kx-query
description: "Use this when creating or changing a KX Dashboards data source: choose the data type, write or validate a kdb+/SQL query, wire ViewState parameters, set polling or streaming, or bind query results to widgets. Read it before generating queries for charts, grids, forms, maps, or actions in a dashboard."
requires:
  - kx-dashboard-core
---

# KX Query & Data Sources

> Depends on **kx-dashboard-core** for the dashboard envelope, ViewState schema, and binding patterns.

This skill uses **progressive disclosure**: the hazards, workflow, and validation rules are here; the connection/data-source JSON schemas, query patterns, pivot config, reserved-word list, and dashboard-oriented q snippets live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/schema.md](reference/schema.md) | The connection file format, `_dataType`/`_subscriptionType` values, and the full JSON template for every data source kind (query, analytic, virtual, pykx, polling, streaming, update query, ViewState params). |
| [reference/query-patterns.md](reference/query-patterns.md) | kdb+ query idioms, filtering by ViewState type (symbol / string `like` / list), component-side binding, and symbol-vs-string handling. |
| [reference/pivot-grid.md](reference/pivot-grid.md) | The Pivot Grid data source (`key: "Datatable"`) — pivot attributes, `_layout`, `_mappings`, and the full template. |
| [reference/reserved-words.md](reference/reserved-words.md) | The reserved-word list and the validation algorithm to run before accepting any kdb+ query string. |
| [reference/q-language.md](reference/q-language.md) | Dashboard-oriented q snippets only — the few q patterns that matter specifically when writing KX Dashboards data sources (not general q fundamentals like operators, iterators, system commands, or data types). |

---

## ⚠️ Hazards

1. **Always write both `_autoExecute` and `_autoExec`** — some versions only honour one.
2. **`_connection` must match the connection file `name` field exactly** (case-sensitive).
3. **`_subscriptionType: "streaming"` requires a streaming-capable connection** — don't use it with static kdb+ processes.
4. **ViewState param `value` must use the template syntax** (`<%group/name%>` or `<%name%>`), not a raw value.
5. **`_dataType: "pykx"` requires PyKX to be installed** on the kdb+ process.
6. **Polling interval is in seconds** (`_subscriptionInterval`). Minimum meaningful value is `1`.
7. **Reserved words must never appear as assignment targets** — assigning to a reserved word (e.g. `sum: 5`) raises `'assign` at runtime. **Run reserved-word validation before accepting any query.** See the Reserved Word Validation section below.
8. **Analytics run a named function, not a query.** `_selectedAnalytic` is a dotted kdb+ function name (e.g. `.fx.sub`), not a table. A **streaming** analytic must copy its `_analyticParams` into `_streamingParameters` (identical) — the subscription reads its arguments from `_streamingParameters`. See the Analytic Data Source section in `reference/schema.md`.


---

## Workflow

1. **Confirm the connection.** You need a connection name that matches the connection file `name` field exactly (case-sensitive). Connection file format is in `reference/schema.md`.
2. **Choose the data source type.** Pick `_dataType` (query / analytic / virtual / pykx / builder) and `_subscriptionType` (static / polling / streaming / subscription). See the tables and per-type JSON templates in `reference/schema.md`.
3. **Write the query string.** Use the kdb+/SQL idioms in `reference/query-patterns.md`. For a Pivot Grid, do NOT aggregate in the query — use the pivot attributes in `reference/pivot-grid.md`.
4. **Wire ViewState parameters.** Add `_queryParams` entries with `<%group/name%>` template syntax and the correct kdb+ `type`; match each to a ViewState. Symbol / string / list filter patterns are in `reference/query-patterns.md`.
5. **Validate reserved words.** Run the reserved-word check in `reference/reserved-words.md` against the query string and reject on any match. This is mandatory (Hazard 7).
6. **Bind the source to components.** Reference it via `{ "_dashboardsType": "data", "value": "<name>" }` and/or a `query` action (see `reference/query-patterns.md`).
7. **Check against the Hazards above** — set both `_autoExecute` and `_autoExec`, confirm streaming needs, and use per-second polling intervals.

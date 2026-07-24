# kx-query — Data Source Schema

> Connection file format, data source types, and the full JSON for every data source kind. Back to [SKILL.md](../SKILL.md).

**Contents:** Connection File · Data Source Types · Query · Analytic · Virtual · PyKX · ViewState Params · Polling · Streaming · Update Query

---

## Connection File

Lives at `~/.kx/dashboards/data/connections/{name}.json`. The `name` field must exactly match `_connection` in every data source that uses it.

```json
{
  "name": "tradefeed",
  "dbtype": "q",
  "tls": "off",
  "host": "localhost",
  "port": "6812",
  "user": "",
  "pass": "",
  "database": ""
}
```

**`dbtype`:** `"q"` (kdb+) | `"sql"` (ANSI SQL) | `"influxdb"` | `"presto"`


---

## Data Source Types

Set inside `"data": {}` at the dashboard root. Each key is the data source name referenced by components.

### `_dataType` values

| Value | Description |
|---|---|
| `"query"` | kdb+ or SQL query string |
| `"analytic"` | Named server-side analytic |
| `"virtual"` | JavaScript transform on existing data |
| `"pykx"` | PyKX (Python) expression on the kdb+ process |
| `"builder"` | Visual query builder output |

### `_subscriptionType` values

| Value | Behaviour |
|---|---|
| `"static"` | Executes once on load (or manual refresh) |
| `"polling"` | Re-executes every `_subscriptionInterval` seconds |
| `"streaming"` | Receives pushed updates via the kdb+ subscription mechanism |
| `"subscription"` | Alias for streaming in some versions |

---

## Query Data Source (kdb+ / SQL)

```json
"MyQuery": {
  "_pagingType": "NONE",
  "_autoExecute": true,
  "_autoExec": true,
  "_columns": ["col1", "col2"],
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_connection_Viewstate": "",
  "_mappings": {},
  "_maxRows": 2000,
  "_subscriptionType": "static",
  "_subscriptionInterval": 3,
  "_layout": [
    { "isExpanded": true,  "weight": 2 },
    { "isExpanded": false, "weight": 1 },
    { "isExpanded": false, "weight": 1 },
    { "isExpanded": true,  "weight": 1 },
    { "isExpanded": true,  "weight": 2 }
  ],
  "_queryString": "<q or SQL query>",
  "_queryParams": [],
  "_subscriptionKey": "",
  "_hasUpdateQuery": false,
  "_updateQueryParams": [],
  "_updateQueryString": "",
  "_updateType": "query",
  "_pageSize": 2000,
  "_serverPaging": false
}
```

> Set `_pagingType: "SERVER"` and `_serverPaging: true` for large tables with server-side paging.

---

## Analytic Data Source

An analytic runs a **named server-side function** (not a query string). `_selectedAnalytic` is the fully-qualified kdb+ function name — a dotted namespace path such as `.fx.sub`, **not** a table name. Its arguments come from `_analyticParams`. Analytics can be **static** (run once / on demand) or **streaming** (subscribe to pushed updates).

### Static analytic

```json
"quoteBoard": {
  "_dataType": "analytic",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_selectedAnalytic": ".chart.fx",
  "_analyticParams": [],
  "_subscriptionType": "static",
  "_subscriptionKey": "",
  "_autoExecute": true,
  "_autoExec": true
}
```

### Streaming analytic

A streaming analytic subscribes to updates the kdb+ process pushes. It **must duplicate its parameters into `_streamingParameters`** (identical to `_analyticParams`) — the subscription reads its arguments from there, not from `_analyticParams`.

```json
"fxStream": {
  "_dataType": "analytic",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_selectedAnalytic": ".fx.sub",
  "_subscriptionType": "streaming",
  "_subscriptionInterval": 3,
  "_subscriptionKey": "Date",
  "_isStreamingSubscription": false,
  "_analyticParams": [
    {
      "id": "x",
      "name": "x",
      "type": "symbol",
      "description": "default parameter",
      "required": true,
      "value": "<%selected%>",
      "isViewState": true
    }
  ],
  "_streamingParameters": [
    {
      "id": "x",
      "name": "x",
      "type": "symbol",
      "description": "default parameter",
      "required": true,
      "value": "<%selected%>",
      "isViewState": true
    }
  ],
  "_autoExecute": true,
  "_autoExec": true
}
```

### `_analyticParams` / `_streamingParameters` object

Each entry is one argument passed to the analytic function:

| Field | Meaning |
|---|---|
| `id` / `name` | Parameter identifier — match the analytic's signature. |
| `type` | kdb+ type: `"symbol"` \| `"string"` \| `"int"` \| `"long"` \| `"float"` \| `"date"` \| `"timestamp"` \| `"time"` \| `"list"`. |
| `description` | Free-text description (optional). |
| `required` | `true` if the analytic requires the argument. |
| `value` | A fixed literal, **or** a ViewState template (`"<%name%>"` / `"<%Group/name%>"`) when `isViewState` is `true`. |
| `isViewState` | `true` = `value` is a ViewState reference (re-runs/re-subscribes when it changes); `false` = literal. |

- `_subscriptionKey` is the key column updates arrive on (e.g. `"sym"`, `"Date"`); empty string when the result is not keyed.
- **Static:** use `_subscriptionType: "static"`, omit `_streamingParameters` and `_subscriptionInterval`. Params may still be fixed literals or ViewState-driven.
- **Streaming:** set `_subscriptionType: "streaming"`, keep `_streamingParameters` in sync with `_analyticParams`, and set `_subscriptionInterval` (seconds).

---

## Virtual (JavaScript) Data Source

Runs JavaScript in the browser against the result of another data source. Use for lightweight client-side transforms.

```json
"MyVirtual": {
  "_dataType": "virtual",
  "_dataSource": "kdb",
  "_virtualQueryString": "return data.filter(r => r.price > 100);",
  "_virtualParams": [],
  "_autoExecute": true,
  "_autoExec": true
}
```

`data` inside `_virtualQueryString` is the raw row array from the upstream query.

---

## PyKX Data Source

```json
"MyPyKX": {
  "_dataType": "pykx",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "import pandas as pd\nreturn q('select from trade').pd()",
  "_queryParams": [],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "static"
}
```

---

## ViewState-Driven Query Parameters

Add entries to `_queryParams` to make query values dynamic. The `value` field uses `<%…%>` template syntax.

```json
"_queryParams": [
  {
    "name": "sym",
    "index": 0,
    "type": "symbol",
    "value": "<%Trade Filters/sym%>",
    "IsKdbParam": true,
    "isViewState": true
  },
  {
    "name": "days",
    "index": 1,
    "type": "int",
    "value": "<%Trade Filters/days%>",
    "IsKdbParam": true,
    "isViewState": true
  }
]
```

**`type`:** `"symbol"` | `"string"` | `"int"` | `"long"` | `"float"` | `"boolean"` | `"date"` | `"timestamp"` | `"time"` | `"list"`

**Template syntax:**
- Grouped ViewState: `"<%Group Name/paramName%>"`
- Flat ViewState:    `"<%paramName%>"`

The kdb+ query receives the params positionally:

```q
{[sym;days] select last price by date from trade where sym=sym, date >= .z.d - days}
```

---

## Polling Data Source

```json
"LivePrices": {
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "tradefeed",
  "_queryString": "select last bid, last ask by sym from quote",
  "_queryParams": [],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "polling",
  "_subscriptionInterval": 5,
  "_columns": ["sym", "bid", "ask"],
  "_maxRows": 500,
  "_pagingType": "NONE"
}
```

---

## Streaming Data Source

```json
"LiveTrades": {
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "tradefeed",
  "_queryString": "select from trade",
  "_queryParams": [],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "streaming",
  "_subscriptionKey": "",
  "_columns": ["time", "sym", "price", "size"],
  "_maxRows": 10000,
  "_pagingType": "NONE"
}
```

> Set `"showLoadingIndicators": false` on dashboards with streaming sources to prevent visual flashing.

---

## Update Query (Incremental Refresh)

For data sources that require a separate query to fetch only the delta:

```json
"_hasUpdateQuery": true,
"_updateQueryString": "select from trade where time > <%lastUpdateTime%>",
"_updateQueryParams": [
  { "name": "lastUpdateTime", "index": 0, "type": "timestamp",
    "value": "<%_settings/dashboardStartTimestamp%>", "IsKdbParam": true, "isViewState": true }
],
"_updateType": "query"
```

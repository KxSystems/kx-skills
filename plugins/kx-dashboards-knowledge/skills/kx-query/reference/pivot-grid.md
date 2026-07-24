# kx-query — Pivot Grid Data Source

> The pivot-specific data source used only when binding a Pivot Grid (key: "Datatable") component. Back to [SKILL.md](../SKILL.md).

**Contents:** Key rule · Pivot-specific attributes · _layout · _mappings · Pivot Data Source Template

---

## Pivot Grid Data Source

Used exclusively when binding a **Pivot Grid** (`key: "Datatable"`) component. See `kx-pivot-grid` for the full component schema.

### Key rule
**Do not implement aggregation in the query string.** Use the dedicated pivot attributes below instead. The server handles aggregation internally.

### Pivot-specific attributes

| Attribute | Description |
|---|---|
| `_aggregateCols` | Array of column names to aggregate. |
| `_aggregateFns` | Array of aggregate functions, one per `_aggregateCols` entry (same index). Allowed: `"avg"` `"sum"` `"first"` `"last"` `"min"` `"max"` `"count"`. Default to `"avg"` when unspecified. |
| `_aggregateLabels` | Optional display labels, one per `_aggregateCols` entry. Use `""` when no label given. |
| `_breakdownCols` | Array of columns used for grouping / drill-down. Columns described as "group by", "pivot on", or "break down by" belong here. |
| `_pivotSource` | Always `"query"`. |
| `_pivotType` | Always `"server"`. |
| `_columnLabel` | Always `""`. |
| `_table` | Always `""`. |
| `_aggFn` | Always `"avg"`. |
| `_topX` | Always `""`. |
| `_ordering` | Always `""`. |
| `_from` / `_to` | Always `""`. |

### `_layout` (Pivot Grid — differs from standard query)

```json
"_layout": [
  { "isExpanded": true,  "weight": 2 },
  { "isExpanded": true,  "weight": 1 },
  { "isExpanded": false, "weight": 1 },
  { "isExpanded": true,  "weight": 0 },
  { "isExpanded": true,  "weight": 2 }
]
```

### `_mappings` (Pivot Grid)

```json
"_mappings": {
  "key": "<first element of _breakdownCols>",
  "mappings": {},
  "value": "<first element of _breakdownCols>"
}
```

### Pivot Data Source Template

```json
"<dataSourceName>": {
  "_pagingType": "NONE",
  "_autoExecute": true,
  "_autoExec": true,
  "_columns": ["<col1>", "<col2>"],
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_connection_Viewstate": "",
  "_mappings": { "key": "<first_breakdownCol>", "mappings": {}, "value": "<first_breakdownCol>" },
  "_maxRows": 2000,
  "_subscriptionType": "static",
  "_subscriptionInterval": 3,
  "_layout": [
    { "isExpanded": true,  "weight": 2 },
    { "isExpanded": true,  "weight": 1 },
    { "isExpanded": false, "weight": 1 },
    { "isExpanded": true,  "weight": 0 },
    { "isExpanded": true,  "weight": 2 }
  ],
  "_queryString": "<q or SQL query — no aggregation in the query itself>",
  "_queryParams": [],
  "_subscriptionKey": "",
  "_hasUpdateQuery": false,
  "_updateQueryParams": [],
  "_updateQueryString": "",
  "_updateType": "query",
  "_aggregateCols":   ["<aggCol1>", "<aggCol2>"],
  "_aggregateFns":    ["<fn1>",     "<fn2>"],
  "_aggregateLabels": ["<label1>",  "<label2>"],
  "_breakdownCols":   ["<brkCol1>", "<brkCol2>"],
  "_columnLabel": "",
  "_pivotSource": "query",
  "_pivotType": "server",
  "_table": "",
  "_aggFn": "avg",
  "_topX": "",
  "_ordering": "",
  "_from": "",
  "_to": ""
}
```

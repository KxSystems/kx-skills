[← Back to SKILL.md](../SKILL.md)

# kx-datagrid — generate.js Config & Worked Examples

> The `generate.js` config field reference for `componentType: "datagrid"`, plus six worked NLQ → JSON examples covering sparse grids, negative highlighting, grouping, row-click navigation, gradient highlight rules, and a full trade-blotter generate.js config.

**Contents:** generate.js config (Datagrid) · 1. Trades grid (sparse) · 2. Highlight negative PnL · 3. Group by sector with sum row · 4. Row click — navigate to screen · 5. Gradient highlight rule · 6. Full trade blotter — generate.js config

---

## generate.js config (Datagrid)

Set `componentType: "datagrid"`.

| Field | Description |
|---|---|
| `dataSource` | Name of the data source (string key in `data: {}`) |
| `columns` | Array of column config objects (see below) |
| `basics` | Datagrid Basics overrides |
| `selection` | Selection block overrides |
| `style` | Style block overrides |
| `fileExport` | FileExport block overrides |
| `groupingConfiguration` | `[{ "ColumnProperty": "<field>" }]` |

---

## Examples

### 1. Trades grid (sparse)

```json
{
  "Basics": { "Data": { "_dashboardsType": "data", "value": "Trades" }, "Filtering": "Quick Search" },
  "ColumnsConfiguration": [
    { "Field": "symbol",    "DisplayName": "Symbol", "Format": "General",          "TextAlign": "left" },
    { "Field": "quantity",  "DisplayName": "Qty",    "Format": "Formatted Number", "Precision": 0,  "TextAlign": "right" },
    { "Field": "fillRatio", "DisplayName": "Fill %", "Format": "Percentage",       "Precision": 2,  "TextAlign": "right" }
  ]
}
```

### 2. Highlight negative PnL

```json
{
  "ColumnsConfiguration": [
    { "Field": "pnl", "DisplayName": "PnL", "Format": "Number", "Precision": 2, "HighlightNegativeColor": "#ff0000", "TextAlign": "right" }
  ]
}
```

### 3. Group by sector with sum row

```json
{
  "Basics": { "EnableGrouping": true },
  "GroupingConfiguration": [{ "ColumnProperty": "sector" }],
  "SummaryRow_Groupings": [{ "Function": "SUM", "Column": "notional", "Label": "Total Notional", "Color": "#1f7a1f" }]
}
```

### 4. Row click — navigate to screen

```json
{
  "Selection": {
    "Mode": "Single Row",
    "Actions": [{
      "_Type": "nav", "TriggerColumn": "*", "Trigger": "Click",
      "SelectDashboardScreen": { "dashboard": "<this>", "screen": "Detail", "_dashboardsType": "navigation" }
    }]
  }
}
```

### 5. Gradient highlight rule

```json
{
  "HighlightRules": [{
    "Name": "risk-gradient", "Enabled": true,
    "Target": "risk", "ConditionSource": "<this>",
    "RuleType": "gradient", "TargetElement": "background",
    "RuleMin": 0, "RuleMax": 100,
    "Palette": [{ "color": "#b71c1c" }, { "color": "#F57F17" }, { "color": "#33691E" }]
  }]
}
```

### 6. Full trade blotter — generate.js config

```json
{
  "componentType": "datagrid",
  "name": "Trade Blotter",
  "dataSource": "trades",
  "dataSources": [{
    "name": "trades", "connection": "html5evalcongroup",
    "queryString": "select from TradeData",
    "columns": ["time","sym","side","price","size","pnl"],
    "subscriptionType": "streaming"
  }],
  "columns": [
    { "field": "time",  "displayName": "Time",   "format": "Time",    "textAlign": "left" },
    { "field": "sym",   "displayName": "Symbol", "format": "General", "textAlign": "left" },
    { "field": "side",  "displayName": "Side",   "format": "General", "textAlign": "center" },
    { "field": "price", "displayName": "Price",  "format": "Number",  "precision": 4, "highlightChanges": true },
    { "field": "size",  "displayName": "Size",   "format": "Number",  "precision": 0, "footer": "Sum" },
    { "field": "pnl",   "displayName": "P&L",    "format": "Number",  "precision": 2, "highlightNegativeColor": "#ff4444", "footer": "Sum" }
  ],
  "basics": { "filtering": "Quick Search", "sortColumn": "time", "sortOrder": "descending" },
  "style": { "theme": "Dark", "rowHeight": 25 }
}
```

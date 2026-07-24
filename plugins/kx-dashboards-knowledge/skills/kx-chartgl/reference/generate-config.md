# kx-chartgl — generate.js Config Schema

> The `generate.js` `componentType: "chartgl"` config envelope and series fields. Back to [SKILL.md](../SKILL.md).

**Contents:** Config Schema · Series fields

---

## generate.js Config Schema

```json
{
  "componentType": "chartgl",
  "name": "<dashboard name>",
  "theme": "Dark",
  "chartName": "<optional chart title>",
  "xAxisType": "Category",
  "yAxisType": "Linear",
  "dataSources": [
    {
      "name": "<dataSourceName>",
      "connection": "<connectionName>",
      "queryString": "<kdb+ query — must return scalars, not lists>",
      "columns": ["col1", "col2"],
      "subscriptionType": "static",
      "params": []
    }
  ],
  "viewStates": [
    { "name": "sym",                "type": "symbol", "default": "EUR/USD" },
    { "name": "Trade Filters/days", "type": "int",    "default": 20 }
  ],
  "series": [ /* see series fields below */ ],
  "xAxes": [ /* override: [{ position, type }] */ ],
  "yAxes": [ /* override: [{ position, type, stacked? }] */ ],
  "columns": [ /* all column names from the query */ ],
  "overrideRules": [],
  "hierarchicalRules": [],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 20, "colSpan": 36 },
  "dropdown": { "dataSource": "<name>", "viewState": "<vs>", "valueColumn": "<col>", "label": "Symbol:" },
  "dropdownLayout": { "row": 20, "column": 6, "rowSpan": 2, "colSpan": 9 }
}
```

### Series fields

| Field | Required | Values / Notes |
|---|---|---|
| `name` | ✓ | Display name in legend |
| `type` | ✓ | `"Line"` \| `"Bar"` \| `"Bubble"` \| `"Waterfall"` \| `"Candlestick"` \| `"Bounds"` \| `"Baseline"` \| `"Heatmap"` |
| `dataSource` | ✓ | Must match a `dataSources[].name` |
| `xCol` | ✓ | Column name for X axis |
| `yCol` | ✓ | Column name for Y axis (`null` for Candlestick) |
| `color` | — | Hex colour; defaults to KX palette cycle |
| `xAxisId` | — | `"X-Axis 1"` (default) or `"X-Axis 2"`, etc. |
| `yAxisId` | — | `"Y-Axis 1"` (default) or `"Y-Axis 2"`, etc. |
| `opacity` | — | `0–100`, default `80` |
| `cacheStreamingData` | — | Boolean, default `false` |
| `showCurrentTick` | — | Boolean, default `false` |
| `legend` | — | `true` (default) \| `false` |
| `lineThickness` | — | Line only. Integer, default `1` |
| `lineStyle` | — | Line only. `"None"` \| `"Dashed"` \| `"Dotted"` |
| `fill` | — | Line only. `"No Fill"` \| `"Solid"` \| `"Gradient"` \| `"Above"` \| `"Below"` |
| `interpolation` | — | Line only. `"Linear"` \| `"Stepped"` \| `"Monotone"` |
| `barWidth` | — | Bar only. `0–100` percentage, default `95` |
| `orientation` | — | Bar only. `"Vertical"` \| `"Horizontal"` |
| `radiusCol` | — | Bubble only. Column name or `"Fixed Size"` |
| `radiusScaling` | — | Bubble only. Integer, default `4` |
| `open/high/low/close` | — | Candlestick only. Column names for OHLC |
| `bullColor` | — | Candlestick only. Hex string or ViewState binding |
| `bearColor` | — | Candlestick only. Hex string or ViewState binding |
| `wickColor` | — | Candlestick only. Hex string |

For grouped ViewState paths use `"viewStatePath"` instead of `"viewState"` in params: `{ "name": "s", "type": "symbol", "viewStatePath": "Trade Filters/sym" }`.


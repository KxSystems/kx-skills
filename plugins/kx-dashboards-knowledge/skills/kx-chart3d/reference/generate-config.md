# kx-chart3d — generate.js Config Schema

> The `generate.js` `componentType: "chart3d"` config keys, layer fields, and axis fields. Back to [SKILL.md](../SKILL.md).

**Contents:** Config Schema · Layer fields · Axis fields

---

## generate.js Config Schema

```json
{
  "componentType": "chart3d",
  "name": "<dashboard name>",
  "theme": "Dark",
  "chartName": "<optional chart title>",
  "dataSources": [
    {
      "name": "<dataSourceName>",
      "connection": "<connectionName>",
      "queryString": "<kdb+ query>",
      "columns": ["col1", "col2", "col3"],
      "subscriptionType": "static"
    }
  ],
  "viewStates": [
    { "name": "sym", "type": "symbol", "default": "EUR/USD" }
  ],
  "layers": [
    {
      "name": "Layer 1",
      "type": "dot",
      "dataSource": "<dataSourceName>",
      "xCol": "<x-column>",
      "yCol": "<y-column>",
      "zCol": "<z-column>",
      "volumeCol": ""
    }
  ],
  "xAxis": { "type": "Linear", "label": "", "format": "General", "precision": 2, "dateFormat": "YYYY-MM-DD", "prefix": "", "suffix": "", "useMin": false, "axisMin": 0, "useMax": false, "axisMax": 10 },
  "yAxis": { "type": "Linear", "label": "", "format": "General", "precision": 2, "dateFormat": "YYYY-MM-DD", "prefix": "", "suffix": "", "useMin": false, "axisMin": 0, "useMax": false, "axisMax": 10 },
  "zAxis": { "type": "Linear", "label": "", "format": "General", "precision": 2, "dateFormat": "YYYY-MM-DD", "prefix": "", "suffix": "", "useMin": false, "axisMin": 0, "useMax": false, "axisMax": 10 },
  "volume": { "useMin": false, "axisMin": 0, "useMax": false, "axisMax": 10 },
  "position": { "horizontal": 0.0873, "vertical": 0.001241, "distance": 2.5 },
  "colorScheme": [ { "type": "#hex" } ],
  "verticalRatio": 70,
  "keepAspectRatio": false,
  "advancedTooltip": "<table>{{#each points}}<tr><td>{{xLabel}}</td><td>{{x}}</td></tr>...</table>",
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 20, "colSpan": 36 },
  "dropdown": { "dataSource": "<name>", "viewState": "<vs>", "valueColumn": "<col>", "label": "Symbol:" },
  "dropdownLayout": { "row": 20, "column": 6, "rowSpan": 2, "colSpan": 9 }
}
```

### Layer fields

| Field | Required | Notes |
|---|---|---|
| `name` | ✓ | Display name in settings panel |
| `type` | ✓ | One of the 10 layer types (see table below) |
| `dataSource` | ✓ | Must match a `dataSources[].name` |
| `xCol` | ✓ | Column name for X axis |
| `yCol` | ✓ | Column name for Y axis |
| `zCol` | ✓ | Column name for Z axis |
| `volumeCol` | 4D only | Column for 4th dimension (color/size). Leave `""` for 3D layers. |

### Axis fields (xAxis / yAxis / zAxis)

| Field | Notes |
|---|---|
| `type` | `"Linear"` \| `"Category"` \| `"Time"` (Z axis: `"Linear"` or `"Category"` only — `"Time"` is silently converted to `"Linear"`) |
| `label` | Axis label string |
| `format` | `"General"` \| `"Number"` \| `"Smart Number"` \| `"Formatted Number"` \| `"Datetime"` |
| `precision` | Decimal places (ignored when `format` is `"General"`) |
| `dateFormat` | One of the supported date format strings (default: `"YYYY-MM-DD"`) |
| `prefix` / `suffix` | Strings prepended/appended to axis labels |
| `useMin` / `axisMin` | Set to `true` + a number to fix the minimum axis bound |
| `useMax` / `axisMax` | Set to `true` + a number to fix the maximum axis bound |


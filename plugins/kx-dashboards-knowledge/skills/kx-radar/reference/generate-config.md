# kx-radar — generate.js Config Reference

> Config keys for `generate.js` with `componentType: "radar"`. Back to [SKILL.md](../SKILL.md).

**Contents:** Quick Start · Minimal config · All config keys · Layer object

---

## generate.js — Quick Start

`generate.js` (in `kx-dashboard-core/`) now supports `componentType: "radar"`.

```bash
node generate.js --config radar.config.json [--out dashboard.json] [--deploy]
```

### Minimal config

```json
{
  "name":          "Monthly Radar",
  "componentType": "radar",
  "theme":         "Dark",
  "dataSource":    "radarData",
  "radarColumn":   "Month",
  "columns":       ["Month","Dataset1","Dataset2","Dataset3"],
  "layers": [
    { "data": "Dataset1", "display": "Dataset 1" },
    { "data": "Dataset2", "display": "Dataset 2" },
    { "data": "Dataset3", "display": "Dataset 3" }
  ],
  "dataSources": [{
    "name":        "radarData",
    "connection":  "html5evalcongroup",
    "queryString": "tab:flip `Month`Dataset1`Dataset2`Dataset3!(`Jan`Feb`Mar`Apr`May`Jun; 10 20 15 30 25 20f; 5 15 20 10 30 25f; 20 10 25 15 20 30f); tab",
    "columns":     ["Month","Dataset1","Dataset2","Dataset3"]
  }]
}
```

### All config keys

| Key | Type | Default | Description |
|---|---|---|---|
| `componentType` | string | `"chartgl"` | Set to `"radar"` |
| `dataSource` | string | — | Data source name (must match a `dataSources[].name`) |
| `radarColumn` | string | `""` | Axis/label column name |
| `layers` | array | `[]` | Series definitions (see below) |
| `chartType` | string | `"radar"` | `"radar"` or `"polarArea"` |
| `name` | string | `""` | Widget title |
| `theme` | string | `"Dark"` | `"Dark"` or `"Light"` |
| `columns` | string[] | `[]` | All column names for possibleColumns / possibleLabels |
| `focus` | string | — | ViewState path for Focus binding |
| `selected` | string | — | ViewState path for Selected binding |
| `selectedAttr` | string | — | Column used for selected value on click |
| `legend.show` | boolean | `true` | Show/hide legend |
| `legend.position` | string | `"top"` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` |
| `legend.labelColor` | string | `"#ffffff"` | Legend label colour |
| `animations.enabled` | boolean | `false` | Enable Chart.js animations |
| `animations.duration` | number | `20` | Animation duration (ms) |
| `animations.easing` | string | `"linear"` | Easing function (30 options) |
| `ticks.beginAtZero` | boolean | `false` | Force scale to start at 0 |
| `ticks.format` | string | `"General"` | `"General"` \| `"Number"` \| `"Smart Number"` \| `"Formatted Number"` \| `"Datetime"` |
| `ticks.precision` | number | `0` | Decimal places (ignored for `"General"`) |
| `ticks.prefix` | string | `""` | Value prefix e.g. `"$"` |
| `ticks.suffix` | string | `""` | Value suffix e.g. `"%"` |
| `ticks.fontSize` | number | `12` | Tick label font size |
| `ticks.pointLabels` | number | `12` | Outer axis label font size |
| `ticks.hideTrailingZeroes` | boolean | `false` | Strip trailing zeros |
| `gridLineOpacity` | number | `35` | Grid line opacity (1–100) |
| `angleLineOpacity` | number | `35` | Angle line opacity (1–100) |
| `fileExport.showScreenshot` | boolean | `false` | PNG export button |
| `fileExport.showExportCsvButton` | boolean | `false` | CSV export button |
| `fileExport.showExportExcelButton` | boolean | `false` | Excel export button |
| `padding` | object | `{top:2,bottom:2,left:2,right:2}` | Chart padding (px) |
| `chartLayout` | object | `{row:0,column:0,rowSpan:20,colSpan:36}` | Widget grid placement |

### Layer object

```json
{
  "data":         "<column-name>",
  "display":      "<legend label>",
  "color":        "#0061FF",
  "borderColor":  "#ffffff",
  "useColor":     false,
  "colorOpacity": 35,
  "pointStyle":   "circle",
  "pointRadius":  2
}
```

`color` defaults to the KX palette in order if omitted.  
`pointStyle` values: `""` | `"circle"` | `"cross"` | `"crossRot"` | `"dash"` | `"line"` | `"rect"` | `"rectRounded"` | `"rectRot"` | `"star"` | `"triangle"`


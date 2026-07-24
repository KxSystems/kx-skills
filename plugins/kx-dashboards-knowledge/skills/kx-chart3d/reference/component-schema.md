# kx-chart3d — Component JSON Schema Reference

> Layer types, the full options envelope, and every sub-block: Basics, Layers, Axes, Position, and Style. Back to [SKILL.md](../SKILL.md).

**Contents:** Layer Types · Full Component Schema · Basics · Layers · Axes · Position (Camera) · Style

---

## Layer Types

| Type | Dimensions | Description |
|---|---|---|
| `dot` | 3D | Scatter plot — one point per row at (X, Y, Z) |
| `line` | 3D | Line plot — points connected in data order |
| `bar` | 3D | Vertical bars rising from the XY plane |
| `surface` | 3D | Continuous mesh surface over an XY grid |
| `grid` | 3D | Grid/mesh chart (discrete surface) |
| `dot-line` | 3D | Dots with a vertical line dropping to the floor |
| `dot-color` | 4D | Scatter dots colored by a 4th Volume column |
| `dot-size` | 4D | Scatter dots sized by a 4th Volume column |
| `bar-color` | 4D | Bars colored by a 4th Volume column |
| `bar-size` | 4D | Bars sized by a 4th Volume column |

**Choose by intent:**
- Scatter / clustering → `dot`
- Time-series trace → `line`
- Grouped counts / aggregates → `bar`
- Continuous mathematical function → `surface`
- Color-encode a 4th variable → `dot-color` or `bar-color`
- Size-encode a 4th variable → `dot-size` or `bar-size`

---

## Full Component Schema

```json
{
  "id": "<uuid>",
  "key": "Chart3D",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "20",
  "hasOnSettingsChange": true,
  "options": {
    "version": "4.7.7",
    "possibleAxis": ["<col1>", "<col2>", "<col3>"],
    "possibleColumns": ["<col1>", "<col2>", "<col3>"],
    "possibleLabels": [],
    "possibleRules": [],
    "possiblePalettes": [" ", ".palette_default", ".palette_gradient", ".palette_pastel", ".palette_colorblind"],
    "Basics": {
      "Name": "",
      "Focus": "",
      "Theme": "Dark",
      "Selected": "",
      "SelectedAttr": ""
    },
    "Layers": [
      {
        "possibleLayerAxis": ["<col1>", "<col2>", "<col3>"],
        "_Id": "L0",
        "_Type": "dot",
        "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
        "Name": "Layer 1",
        "XAxis": "<x-column>",
        "YAxis": "<y-column>",
        "ZAxis": "<z-column>",
        "Volume": ""
      }
    ],
    "X": {
      "AxisType": "Linear",
      "Label": "",
      "Format": "General",
      "Precision": 2,
      "DateFormat": "YYYY-MM-DD",
      "Prefix": "",
      "Suffix": "",
      "UseMin": false,
      "AxisMin": 0,
      "UseMax": false,
      "AxisMax": 10
    },
    "Y": {
      "AxisType": "Linear",
      "Label": "",
      "Format": "General",
      "Precision": 2,
      "DateFormat": "YYYY-MM-DD",
      "Prefix": "",
      "Suffix": "",
      "UseMin": false,
      "AxisMin": 0,
      "UseMax": false,
      "AxisMax": 10
    },
    "Z": {
      "AxisType": "Linear",
      "Label": "",
      "Format": "General",
      "Precision": 2,
      "DateFormat": "YYYY-MM-DD",
      "Prefix": "",
      "Suffix": "",
      "UseMin": false,
      "AxisMin": 0,
      "UseMax": false,
      "AxisMax": 10
    },
    "Volume": {
      "UseMin": false,
      "AxisMin": 0,
      "UseMax": false,
      "AxisMax": 10
    },
    "Position": {
      "Horizontal": 0.0873,
      "Vertical": 0.001241,
      "Distance": 2.5
    },
    "Style": {
      "palettes": "",
      "fill": "transparent",
      "stroke": "#ffffff",
      "advanced": "",
      "advancedTooltip": "<table>{{#each points}}<tr><td>{{xLabel}}</td><td>{{x}}</td></tr><tr><td>{{yLabel}}</td><td>{{y}}</td></tr><tr><td>{{zLabel}}</td><td>{{z}}</td></tr>{{/each}}</table>",
      "VerticalRatio": 70,
      "KeepAspectRatio": false,
      "ColorPalette": {
        "ColorScheme": [
          { "type": "#F8696B" }, { "type": "#F98570" }, { "type": "#FBA276" },
          { "type": "#FCBF7B" }, { "type": "#FEDC81" }, { "type": "#EEE683" },
          { "type": "#CCDD82" }, { "type": "#A9D27F" }, { "type": "#86C97E" },
          { "type": "#63BE7B" }
        ]
      }
    },
    "Alignment": {
      "paddingLeft": "0",
      "paddingRight": "0",
      "paddingTop": "0",
      "paddingBottom": "0"
    },
    "format": {
      "widgetTitle": "",
      "titleFontSize": "16",
      "titleHorizontal": "Center",
      "titlePaddingLeft": 0,
      "titlePaddingRight": 0,
      "titlePaddingTop": 0,
      "titlePaddingBottom": 0
    }
  }
}
```

---

## Basics

```json
{
  "Name": "",
  "Focus": "",
  "Theme": "Dark",
  "Selected": "",
  "SelectedAttr": ""
}
```

| Field | Notes |
|---|---|
| `Name` | Chart title / display name |
| `Focus` | ViewState binding for drill-down focus (flat or grouped path) |
| `Theme` | `"Dark"` (default) \| `"Light"` |
| `Selected` | ViewState that receives the clicked point's value |
| `SelectedAttr` | Column name whose value is published on click (e.g. `"sym"`) |

**Click interaction:** clicking a data point writes the value of the `SelectedAttr` column to the `Selected` ViewState. Bind `Selected` to a ViewState and `SelectedAttr` to a column to drive cross-component filtering.

---

## Layers

Each entry in `Layers` defines one 3D/4D series. All layers in a chart share the same X/Y/Z axis configuration.

### Layer fields

| Field | Required | Notes |
|---|---|---|
| `_Id` | ✓ | Unique within Layers: `"L0"`, `"L1"`, … |
| `_Type` | ✓ | One of the 10 layer types |
| `Data` | ✓ | `{ "_dashboardsType": "data", "value": "<dsName>" }` |
| `Name` | ✓ | Display name (shown in settings panel header) |
| `XAxis` | ✓ | Column name for the X axis |
| `YAxis` | ✓ | Column name for the Y axis |
| `ZAxis` | ✓ | Column name for the Z axis |
| `Volume` | 4D only | Column name for the 4th dimension. Leave `""` for 3D-only layers. |
| `possibleLayerAxis` | ✓ | All column names from the query — populates axis dropdowns in the settings UI |

### Multiple layers

Multiple layers can bind to the same or different data sources. Each layer uses the same global X/Y/Z axis settings. When layers share a data source, the runtime reuses the same DataSource subscription.

```json
"Layers": [
  {
    "possibleLayerAxis": ["time", "bid", "ask"],
    "_Id": "L0", "_Type": "line",
    "Data": { "_dashboardsType": "data", "value": "fxData" },
    "Name": "Bid line",
    "XAxis": "time", "YAxis": "bid", "ZAxis": "ask", "Volume": ""
  },
  {
    "possibleLayerAxis": ["time", "bid", "ask"],
    "_Id": "L1", "_Type": "dot",
    "Data": { "_dashboardsType": "data", "value": "fxData" },
    "Name": "Bid dots",
    "XAxis": "time", "YAxis": "bid", "ZAxis": "ask", "Volume": ""
  }
]
```

---

## Axes

### X and Y axis schema

```json
{
  "AxisType": "Linear",
  "Label": "",
  "Format": "General",
  "Precision": 2,
  "DateFormat": "YYYY-MM-DD",
  "Prefix": "",
  "Suffix": "",
  "UseMin": false,
  "AxisMin": 0,
  "UseMax": false,
  "AxisMax": 10
}
```

### Z axis schema

Identical to X/Y but `AxisType` only accepts `"Linear"` or `"Category"` — **`"Time"` is not supported on Z**.

### Volume axis schema

```json
{
  "UseMin": false,
  "AxisMin": 0,
  "UseMax": false,
  "AxisMax": 10
}
```

No label, format, or axis type — range control only.

### Axis type rules

| Axis | Supported `AxisType` values | Notes |
|---|---|---|
| X | `"Linear"` \| `"Category"` \| `"Time"` | Use `"Time"` with `Format: "Datetime"` and a `DateFormat` value |
| Y | `"Linear"` \| `"Category"` \| `"Time"` | — |
| Z | `"Linear"` \| `"Category"` | ⚠️ Time not supported |

### Format values

| `Format` | Notes |
|---|---|
| `"General"` | Default — no formatting; `Precision` is ignored |
| `"Number"` | Fixed decimal places (respects `Precision`) |
| `"Smart Number"` | Auto K/M/B suffix |
| `"Formatted Number"` | Locale thousands separator |
| `"Datetime"` | Formats numeric timestamps; set `DateFormat` |

### DateFormat options

`"YYYY-MM-DD"` · `"YYYY-MMM-DD"` · `"YYYY-MMMM-DD"` · `"YYYY-MM"` · `"YYYY-MMM"` · `"YYYY-MMMM"` · `"MMM DD"` · `"MMM Do"` · `"YYYY-MM-DD HH:mm:ss"` · `"YYYY-MM-DD hh:mm:ss"` · `"YYYY-MM-DD kk:mm:ss"` · `"hh:mm:ss"` · `"kk:mm:ss"` · `"hh:mm:ss.SS"` · `"hh:mm"` · `"kk:mm"` · `"mm:ss"` · `"mm:ss.SS"`

### Axis range control

```json
"UseMin": true, "AxisMin": 0,
"UseMax": true, "AxisMax": 100
```

Leave both as `false` for auto-scaling.

---

## Position (Camera)

```json
{
  "Horizontal": 0.0873,
  "Vertical": 0.001241,
  "Distance": 2.5
}
```

| Field | Notes |
|---|---|
| `Horizontal` | Azimuth angle (radians, stored as float). Default: `0.0873` |
| `Vertical` | Elevation angle (float). Default: `0.001241` |
| `Distance` | Camera distance from chart center. Default: `2.5` |

Camera movements are persisted back to `Position` in real time. **Double-clicking** the chart resets to the values stored in `Position`.

---

## Style

```json
{
  "palettes": "",
  "fill": "transparent",
  "stroke": "#ffffff",
  "advanced": "",
  "advancedTooltip": "<table>{{#each points}}<tr><td>{{xLabel}}</td><td>{{x}}</td></tr><tr><td>{{yLabel}}</td><td>{{y}}</td></tr><tr><td>{{zLabel}}</td><td>{{z}}</td></tr>{{/each}}</table>",
  "VerticalRatio": 70,
  "KeepAspectRatio": false,
  "ColorPalette": {
    "ColorScheme": [
      { "type": "#F8696B" }, { "type": "#F98570" }, { "type": "#FBA276" },
      { "type": "#FCBF7B" }, { "type": "#FEDC81" }, { "type": "#EEE683" },
      { "type": "#CCDD82" }, { "type": "#A9D27F" }, { "type": "#86C97E" },
      { "type": "#63BE7B" }
    ]
  }
}
```

| Field | Notes |
|---|---|
| `stroke` | Axis lines, grid, and label color. Dark theme: `"#ffffff"`, Light theme: `"#000000"` |
| `fill` | Chart background. `"transparent"` inherits from the widget tile. |
| `VerticalRatio` | Height of the 3D box as a percentage of available height (0–100). Default: 70. |
| `KeepAspectRatio` | When `true`, the 3D box preserves its aspect ratio on resize. |
| `palettes` | Global palette theme selector. Matches `possiblePalettes` entries. |
| `ColorPalette.ColorScheme` | Array of `{ "type": "#hex" }`. Used for `dot-color` and `bar-color` layers. Default is a 10-step red-to-green gradient. |
| `advancedTooltip` | Handlebars template rendered on hover. |
| `advanced` | Raw CSS injected into the component element. |

### Theme and stroke

| `Basics.Theme` | Recommended `Style.stroke` |
|---|---|
| `"Dark"` | `"#ffffff"` |
| `"Light"` | `"#000000"` |

The component auto-sets `stroke` when the dashboard theme changes — do not hard-code a conflicting value.

### `dot-color` palette direction

For `dot-color` layers the runtime **reverses** the `ColorScheme` array before mapping to values. With the default gradient:
- Highest Volume value → `#F8696B` (red)
- Lowest Volume value → `#63BE7B` (green)

To invert (green=high, red=low), reverse the order of entries in `ColorScheme`.

### Custom tooltip template variables

| Variable | Description |
|---|---|
| `{{x}}` | Formatted X axis value |
| `{{y}}` | Formatted Y axis value |
| `{{z}}` | Formatted Z axis value |
| `{{xLabel}}` | X axis label string (from `X.Label`) |
| `{{yLabel}}` | Y axis label string (from `Y.Label`) |
| `{{zLabel}}` | Z axis label string (from `Z.Label`) |
| `{{style}}` | vis.js point style string |
| `{{cols}}` | Raw data object for the point (all column values) |

Default template:
```handlebars
<table>
  {{#each points}}
  <tr><td>{{xLabel}}</td><td>{{x}}</td></tr>
  <tr><td>{{yLabel}}</td><td>{{y}}</td></tr>
  <tr><td>{{zLabel}}</td><td>{{z}}</td></tr>
  {{/each}}
</table>
```


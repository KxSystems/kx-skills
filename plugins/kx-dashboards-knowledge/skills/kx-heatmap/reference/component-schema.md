[← Back to SKILL.md](../SKILL.md)

# kx-heatmap — Component JSON Schema

> The full Heatmap (Treemap) component JSON plus the per-section field tables: Basics, Data[] layers, ColorPalette, NodeLabel, GroupBy, Tooltip, and Animation.

**Contents:** Basics · Data[] — layer definitions · ColorPalette · NodeLabel · GroupBy · Tooltip · Animation · Full Component JSON

---

## Basics

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
  "Selected": { "_dashboardsType": "viewstate", "value": "<selectedNodeViewState>" },
  "SelectedAttr": "<column-to-publish-on-click>",
  "Focus": { "_dashboardsType": "viewstate", "value": "<focusViewState>" },
  "Theme": "Dark",
  "Actions": []
}
```

| Field | Notes |
|---|---|
| `Data` | Data source with the rows to tile. Each row becomes one node. |
| `Selected` | ViewState — receives the value of `SelectedAttr` column when a node is clicked. |
| `SelectedAttr` | Column whose value is published to `Selected` on click. Typically the same as `Data[0].Column`. |
| `Focus` | Optional ViewState — zooms the treemap to the focused node group. |
| `Actions` | Click / double-click / hover actions triggered on node selection. |

---

## Data[] — layer definitions

Defines how to map data source columns to node display, size, and colour. Usually one entry is enough.

```json
"Data": [
  {
    "Name": "Price Change",
    "Column": "sym",
    "Size": "mcap",
    "Color": "pctChange",
    "HighlightRules": []
  }
]
```

| Field | Notes |
|---|---|
| `Name` | Layer label shown in the legend. |
| `Column` | Column used as the node label (display name). |
| `Size` | Column whose value determines tile area. Use a positive numeric column. |
| `Color` | Column used for colour scaling (only relevant when `ColorType` is `"Scaled"`, `"Gradient"`, or `"Gradient Percentage"`). |
| `HighlightRules` | Array of conditional highlight rules (see below). |

### HighlightRules entry

```json
{
  "BackgroundColor": "#F8696B",
  "ConditionOperator": ">",
  "ConditionSource": "pctChange",
  "ConditionValue": "0",
  "Inverse": false,
  "Opacity": 100
}
```

Operators: `""` · `"search"` · `"contains"` · `"starts with"` · `"ends with"` · `"=="` · `"<"` · `">"` · `"<="` · `">="` · `"!="` · `"Fill Left-to-Right"` · `"Fill Right-to-Left"`

---

## ColorPalette

```json
"ColorPalette": {
  "ColorType": "Gradient",
  "FixedColor": "#0061FF",
  "HoverColor": "",
  "SelectedColor": "",
  "SelectedColorScheme": "red green",
  "ColorScheme": [
    { "type": "#63BE7B" },
    { "type": "#EEE683" },
    { "type": "#F8696B" }
  ]
}
```

| `ColorType` | Behaviour |
|---|---|
| `"Fixed"` | All nodes use `FixedColor`. |
| `"Iterative"` | Cycles through `ColorScheme` for each leaf node. |
| `"Iterative Children"` | Cycles `ColorScheme` per parent group. |
| `"Scaled"` | Maps `Color` column value linearly onto `ColorScheme`. |
| `"Gradient"` | Gradient from `ColorScheme` min to max based on `Color` column. |
| `"Gradient Percentage"` | Gradient based on percentage change in `Color` column. |

Built-in `SelectedColorScheme` names: `"default"` · `"blue green"` · `"green blue"` · `"green red"` · `"green yellow"` · `"red green"` · `"yellow green"`

---

## NodeLabel

Controls text displayed inside each tile.

```json
"NodeLabel": {
  "Show": true,
  "Format": "General",
  "Precision": 0,
  "Scale": true,
  "ShowLegend": true,
  "ShowAbsolute": false,
  "customLabel": "",
  "labelColor": "#ffffff",
  "Prefix": "",
  "Suffix": "",
  "HideTrailingZeros": false,
  "gapWidth": 2,
  "upperLabel": false,
  "upperLabelColour": "#000",
  "upperFontSize": "12",
  "upperLabelHeight": "15",
  "BorderColor": "#f0f0f0",
  "BorderWidth": 2,
  "showColorScaleIndex": true
}
```

| Field | Notes |
|---|---|
| `Show` | `true` — show label inside each tile. |
| `Format` | `"General"` \| `"Number"` \| `"Smart Number"` \| `"Formatted Number"` \| `"Datetime"` |
| `Precision` | Decimal places for numeric formats. |
| `Scale` | `true` — scale node font size to tile area. |
| `ShowLegend` | `true` — show the colour scale legend. |
| `customLabel` | Plain-text Handlebars template for node text. No HTML — use plain separators, e.g. `"{{sym}} | {{pctChange}}%"`. Overrides default column display when non-empty. |
| `upperLabel` | `true` — show a header bar above each tile (GroupBy header). |
| `showColorScaleIndex` | `true` — show min/max colour scale index below the legend. |

---

## GroupBy

Creates a hierarchical treemap by grouping nodes under a parent column.

```json
"GroupBy": {
  "UseGroupBy": true,
  "GroupByColumns": "sector",
  "ShowHeader": true,
  "ScaleByChildren": false,
  "headerColor": "#ffffff"
}
```

When `UseGroupBy: true`, `GroupByColumns` defines the parent group. Nodes within the same group are nested under the same parent tile. `ShowHeader: true` renders the group name above the tile cluster.

---

## Tooltip

```json
"Tooltip": {
  "ShowTooltip": true,
  "TooltipTemplate": "<table>...</table>"
}
```

`TooltipTemplate` is a Handlebars template with special variables:
- `{{_name}}` — tile name (Column value)
- `{{_label}}` — layer name
- `{{_value}}` — Size column value
- `{{_color}}` — tile colour hex

---

## Animation

```json
"Animation": {
  "Duration": 1500,
  "Easing": "quinticInOut"
}
```

`Duration`: 0–3000 ms. `Easing`: any ECharts easing string (e.g. `"linear"`, `"cubicInOut"`, `"bounceOut"`).

---

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "Heatmap",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "5",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.3.0.1",
    "possibleColumns": [""],
    "possibleLabels": [""],
    "possiblePalettes": [""],
    "Basics": {
      "Name": "",
      "Data": { "_dashboardsType": "data", "value": "<dataSource>" },
      "Selected": { "_dashboardsType": "viewstate", "value": "<selectedSym>" },
      "SelectedAttr": "sym",
      "Focus": "",
      "Theme": "Dark",
      "Actions": []
    },
    "Data": [
      {
        "Name": "Price Change",
        "Column": "sym",
        "Size": "mcap",
        "Color": "pctChange",
        "HighlightRules": []
      }
    ],
    "ColorPalette": {
      "ColorType": "Gradient",
      "FixedColor": "#0061FF",
      "HoverColor": "",
      "SelectedColor": "",
      "SelectedColorScheme": "red green",
      "ColorScheme": [
        { "type": "#63BE7B" }, { "type": "#EEE683" }, { "type": "#F8696B" }
      ]
    },
    "NodeLabel": {
      "Show": true,
      "Format": "General",
      "Precision": 0,
      "Scale": true,
      "ShowLegend": true,
      "ShowAbsolute": false,
      "customLabel": "{{sym}} | {{pctChange}}%",
      "labelColor": "#ffffff",
      "Prefix": "",
      "Suffix": "",
      "HideTrailingZeros": false,
      "gapWidth": 2,
      "upperLabel": false,
      "upperLabelColour": "#000",
      "upperFontSize": "12",
      "upperLabelHeight": "15",
      "BorderColor": "#f0f0f0",
      "BorderWidth": 2,
      "showColorScaleIndex": true
    },
    "Tooltip": {
      "ShowTooltip": true,
      "TooltipTemplate": "<table><thead><tr style=\"padding-right: 10px;\"><th>{{_name}}</th><th></th></tr></thead><tr><td>{{_label}}:</td><td style=\"padding-right: 10px; text-align: left;\"><span style=\"padding-left:10px\">{{_value}}</span></td></tr></table>"
    },
    "GroupBy": {
      "UseGroupBy": false,
      "GroupByColumns": "",
      "ShowHeader": false,
      "ScaleByChildren": false,
      "headerColor": "#ffffff"
    },
    "Animation": {
      "Duration": 1500,
      "Easing": "quinticInOut"
    },
    "FileExport": {
      "FileName": [],
      "ShowExportCsvButton": false,
      "ShowExportExcelButton": false,
      "ShowScreenshot": false,
      "ScreenshotButton": "Export Png",
      "Actions": []
    },
    "Style": { "advanced": "" }
  }
}
```

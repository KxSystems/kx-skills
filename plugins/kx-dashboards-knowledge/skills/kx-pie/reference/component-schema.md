[← Back to SKILL.md](../SKILL.md)

# kx-pie — Component JSON Schema Reference

> The canonical PieJS `options` object, every sub-section schema block, and the full field tables.

**Contents:** Top-Level Component Wrapper · Basics · DataSet · DataSet.Layers · HighlightRules · Legend · InnerLabel · Style · Animations · Padding · FileExport

---

## Top-Level Component Wrapper

```json
{
  "id": "<uuid>",
  "key": "PieJS",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "1009",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.3.0.1",
    "Basics": { ... },
    "DataSet": { ... },
    "Legend": { ... },
    "Padding": { ... },
    "Style": { ... },
    "Animations": { ... },
    "InnerLabel": { ... },
    "FileExport": { ... }
  }
}
```

---

## Basics

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "Theme": "Dark",
  "Focus": "",
  "Selected": "",
  "SelectedAttr": "",
  "PopoutSelected": false,
  "PopoutSelectedSize": 10,
  "FixedColumn": "",
  "Actions": []
}
```

| Field | Notes |
|---|---|
| `Data` | Bind to a data source. |
| `Theme` | `"Light"` \| `"Dark"` |
| `Focus` | ViewState path. Clicking a segment writes the segment label to this ViewState to filter other components. |
| `Selected` | ViewState path. Stores the selected segment label; clicking again deselects. |
| `SelectedAttr` | Column name used for selection value (defaults to the label column). |
| `PopoutSelected` | `true` to scale out the selected segment. |
| `PopoutSelectedSize` | Pop-out scale amount (1–100, default `10`). |
| `Actions` | Click/Hover action list — see Actions section below. |

### Actions array item

> See **kx-actions** for full action type reference. PieJS supports `"map"`, `"nav"`, `"query"`, and `"url"` types. Triggers: `"Click"` or `"Hover"`.

---

## DataSet

```json
{
  "Label": "<label-column>",
  "DonutRatio": 35,
  "Rotation": 50,
  "Circumference": 100,
  "Layers": [
    {
      "Segment": "<value-column>",
      "Display": "",
      "UseColor": true,
      "Color": "#0061FF",
      "BorderColor": "#ffffff",
      "ColorOpacity": 85,
      "HighlightRules": []
    }
  ]
}
```

| Field | Notes |
|---|---|
| `Label` | Column whose values become the segment labels (categorical axis). |
| `DonutRatio` | Donut hole size as a percentage of the chart radius. `0` = solid pie, `35` = default donut. Range 1–100. |
| `Rotation` | Starting rotation (0–100). |
| `Circumference` | Visible arc as a percentage (0–100). `100` = full circle. |
| `Layers` | Array of value layers. Each adds a concentric ring or pie data series. |

## DataSet.Layers

### Layer item

```json
{
  "Segment": "<value-column>",
  "Display": "",
  "UseColor": true,
  "Color": "#0061FF",
  "BorderColor": "#ffffff",
  "ColorOpacity": 85,
  "HighlightRules": []
}
```

| Field | Notes |
|---|---|
| `Segment` | Numeric column to use as the segment value. |
| `Display` | Override display name shown in legend. Leave `""` to use the column name. |
| `UseColor` | `true` to use the `Style.chartBarColors` palette. `false` to use `Color`. |
| `Color` | Fallback colour when `UseColor` is `false`. |
| `BorderColor` | Segment border/stroke colour. |
| `ColorOpacity` | Colour opacity 1–100 (default `85`). |
| `HighlightRules` | Conditional formatting rules applied to this layer. |

## HighlightRules

### HighlightRules item

```json
{
  "RuleName": "",
  "RuleSource": "<column>",
  "RuleOperation": "==",
  "RuleValue": "<match-value>",
  "RuleColor": "#ffffff",
  "RuleBorderColor": "#ffffff",
  "Show": false
}
```

**`RuleOperation` values:** `""` | `"search"` | `"contains"` | `"starts with"` | `"ends with"` | `"=="` | `"<"` | `">"` | `"<="` | `">="` | `"!="` | `"Fill Left-to-Right"` | `"Fill Right-to-Left"`

| Field | Notes |
|---|---|
| `RuleSource` | Column to evaluate against `RuleValue`. |
| `RuleColor` | Segment colour when rule matches. |
| `Show` | Show this rule in the legend. |

---

## Legend

```json
{
  "Display": true,
  "FullWidth": true,
  "Reverse": false,
  "Position": "top",
  "LabelColor": "#898989",
  "LabelFontFamily": "Helvetica",
  "LabelFontSize": 12,
  "BoxWidth": 40,
  "Padding": 10,
  "UsePointStyle": true,
  "Mode": "Toggle Hidden",
  "LegendScroll": true
}
```

| Field | Notes |
|---|---|
| `Display` | Show or hide the legend. |
| `Position` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` |
| `Mode` | `"Toggle Hidden"` (click to hide segment) \| `"Select Only"` (click to select without hiding). |
| `UsePointStyle` | Use small circles instead of rectangles as legend markers. |
| `LegendScroll` | Enable scrolling when legend overflows. |

---

## InnerLabel (segment labels and donut centre text)

```json
{
  "Innertitle": "",
  "InnertitleFont": "Verdana",
  "InnertitleSize": 12,
  "InnertitleColor": "#ffffff",
  "ShowPieceLabel": false,
  "ShowZero": false,
  "PieceLabelArc": false,
  "PieceLabelOverlap": false,
  "PieceLabelRender": "percentage",
  "PieceLabelPosition": "default",
  "PieceLabelTemplate": "",
  "PieceLabelColor": "#ffffff",
  "FontSize": 12,
  "Format": "General",
  "Precision": 2,
  "HideTrailingZeroes": false,
  "DateFormat": "YYYY-MM-DD",
  "Prefix": "",
  "Suffix": ""
}
```

| Field | Notes |
|---|---|
| `Innertitle` | Static text displayed at the centre of a donut chart. |
| `InnertitleFont` | `"Verdana"` \| `"fontawesome"` \| `"Arial"` \| `"Helvetica"` \| `"Times"` \| `"Courier"` |
| `ShowPieceLabel` | Show labels directly on segments. |
| `PieceLabelRender` | `"percentage"` \| `"value"` \| `"label"` |
| `PieceLabelPosition` | `"default"` \| `"border"` \| `"outside"` |
| `PieceLabelTemplate` | Handlebars template overriding `PieceLabelRender` when set. |
| `Format` | `"General"` \| `"Number"` \| `"Smart Number"` \| `"Datetime"` |
| `Precision` | Decimal places for numeric labels (0–10). |
| `Prefix` / `Suffix` | Text prepended/appended to formatted label values. |

---

## Style (colour palette)

```json
{
  "palettes": "",
  "chartBarColors": [
    { "type": "#0061FF" },
    { "type": "#7995b8" },
    { "type": "#808387" },
    { "type": "#a69775" },
    { "type": "#749450" },
    { "type": "#51966a" },
    { "type": "#e2c7c0" },
    { "type": "#9acad6" },
    { "type": "#1995a3" },
    { "type": "#484d6e" }
  ],
  "advanced": "",
  "advancedTooltip": ""
}
```

`chartBarColors` is applied cyclically across segments. `advancedTooltip` accepts a Handlebars template for custom tooltips.

---

## Animations

```json
{
  "Enabled": false,
  "Easing": "easeOutQuart",
  "Duration": 500
}
```

Animations are disabled by default for better responsiveness on live data. When enabling, set `Duration` (ms) and choose an `Easing` function.

**`Easing` options:** `"linear"` | `"easeInQuad"` | `"easeOutQuad"` | `"easeInOutQuad"` | `"easeInCubic"` | `"easeOutCubic"` | `"easeInOutCubic"` | `"easeInQuart"` | `"easeOutQuart"` | `"easeInOutQuart"` | `"easeInQuint"` | `"easeOutQuint"` | `"easeInOutQuint"` | `"easeInSine"` | `"easeOutSine"` | `"easeInOutSine"` | `"easeInExpo"` | `"easeOutExpo"` | `"easeInOutExpo"` | `"easeInCirc"` | `"easeOutCirc"` | `"easeInOutCirc"` | `"easeInElastic"` | `"easeOutElastic"` | `"easeInOutElastic"` | `"easeInBack"` | `"easeOutBack"` | `"easeInOutBack"` | `"easeInBounce"` | `"easeOutBounce"` | `"easeInOutBounce"`

---

## Padding

```json
{
  "Top": 2,
  "Bottom": 2,
  "Left": 2,
  "Right": 2
}
```

---

## FileExport

```json
{
  "ShowExportCsvButton": false,
  "ShowExportExcelButton": false,
  "ShowScreenshot": false,
  "ScreenshotButton": "Export Png",
  "FileName": []
}
```

**`ScreenshotButton`:** `"Export Png"` | `"Copy to Clipboard"` | `"Export Png & Copy to Clipboard"`

`FileName` is an array of `{ "FileNamePart": "<text>" }` objects that are concatenated to form the export filename.

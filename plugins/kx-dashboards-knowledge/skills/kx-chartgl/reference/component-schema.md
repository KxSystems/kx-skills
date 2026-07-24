# kx-chartgl — Component JSON Schema Reference

> The raw KX Dashboards ChartGL component structure — options envelope, axes, all 8 layer types, rules, overlay, export. Back to [SKILL.md](../SKILL.md).

**Contents:** Options Structure · Basics · Axes · Layers (Line · Bar/Waterfall · Bubble · Candlestick · Bounds · Baseline · Heatmap) · Override Rules · Highlight Rules · Overlay · FileExport · Annotations

---

## Options Structure

```json
{
  "version": "v2.18.0",
  "possibleLegendGroups": ["None"],
  "possiblePositions": ["Top","Bottom","Left","Right"],
  "Style": { "advanced": "", "cssClasses": "" },
  "Basics": {},
  "Layers": [],
  "Xaxes": [],
  "Yaxes": [],
  "Overlay": {},
  "Legend": { "Position": "Top", "UseCustomLegend": false, "CustomLegend": "", "LegendGroups": [] },
  "Annotations": { "ShowAnnotateControl": false, "Annotations": "" },
  "FileExport": {},
  "OverrideRules": [],
  "HierarchicalRules": [],
  "Alignment": { /* shared — see kx-dashboard-core */ },
  "format":    { /* shared — see kx-dashboard-core */ },
  "possiblePalettes": [" ",".palette_default",".palette_gradient",".palette_pastel",".palette_colorblind"]
}
```

---

## Basics

```json
{
  "Name": "",
  "Hover": "", "Selected": "", "Focus": "",
  "SelectFirstPoint": false,
  "RangeSelection": false,
  "Zoom": true,
  "Duration": 400,
  "Easing": "easeOutQuart",
  "TrackLoadTime": false, "LoadTime": "",
  "UsePatterns": false,
  "UseHierarchicalRules": true
}
```

| Field | Notes |
|---|---|
| `Zoom` / `RangeSelection` | Mutually exclusive — always set both explicitly |
| `UsePatterns` | Adds fill patterns to Bar layers (accessibility / print) |
| `SelectFirstPoint` | Auto-selects first data point on load |
| `Easing` | `easeOutQuart` (default) · `easeInQuad` · `easeOutQuad` · `easeInOutQuad` · `easeInCubic` · `easeOutCubic` · `easeInOutCubic` · `easeInQuart` · `easeInOutQuart` · `easeInQuint` · `easeOutQuint` · `easeInSine` · `easeOutSine` · `easeInExpo` · `easeOutExpo` · `easeInCirc` · `easeOutCirc` · `easeOutBounce` · `easeInBack` · `easeOutBack` · `bounce` · `elastic` |

---

## Axes

### Axis schema

```json
{
  "Bounds": "", "Type": "Linear", "Position": "Bottom",
  "Width": 0, "Ticks": 10, "Color": "",
  "FilterUnique": false, "Sort": false, "Stacked": false,
  "Title": { "Display": false, "LabelString": "", "FontSize": 16 },
  "Range": {
    "UseMinMax": false, "Min": "", "Max": "",
    "SetMinMaxOnLoad": false, "SelectionMin": "", "SelectionMax": "",
    "ResetToNull": true, "Buffer": 0
  },
  "Gridlines": { "GridlinesOffset": false, "GridlinesColor": "", "GridlinesOpacity": 15 },
  "Format": {
    "Display": true, "Rotation": 0, "BeginAtZero": false,
    "ShowMajorUnits": false,
    "Break": 86400000, "Distribution": "Linear",
    "TriggerBreak": 86400000, "IntervalLength": 0,
    "Format": "Number", "DateFormat": "",
    "Precision": 2, "FontSize": 12,
    "Prefix": "", "Suffix": "", "HideTrailingZeroes": false,
    "MultiAxis": []
  }
}
```

**Y-axis differences from X-axis:**
- `"Position": "Left"` or `"Right"`
- Add `"StackedGap": false` at root
- Remove `"MultiAxis"` from `Format`
- Set `"Stacked": true` for stacked bars

### Axis type rules

| `Type` | `FilterUnique` | `Format.Format` | Extra fields |
|---|---|---|---|
| `"Category"` | `true` | `"Number"` | — |
| `"Linear"` | `false` | `"Number"` | — |
| `"Time"` | `false` | `"DateTime"` | `"TickSpacing": "Number of Ticks"` at root; supply `DateFormat` |
| `"Logarithmic"` | `false` | `"Number"` | ⚠️ Not `"Log"` — that silently falls back to Linear |

### Y-axis range control

```json
"Range": {
  "UseMinMax": true, "Min": "0.6", "Max": "1.5",
  "SetMinMaxOnLoad": false, "ResetToNull": true, "Buffer": 0
}
```

Leave `UseMinMax: false` for auto-scale. Use `Buffer` to add padding without fixing absolute bounds.

### Multiple axes

Axis IDs are `"X-Axis 1"`, `"X-Axis 2"`, etc. and `"Y-Axis 1"`, `"Y-Axis 2"`, etc. All layer `possibleXAxes` / `possibleYAxes` must list **every** axis ID defined in the chart.

```json
"yAxes": [
  { "position": "Left",  "type": "Linear" },
  { "position": "Right", "type": "Linear" }
],
"series": [
  { "name": "EUR/USD Bid", "yAxisId": "Y-Axis 1", ... },
  { "name": "USD/JPY Bid", "yAxisId": "Y-Axis 2", ... }
]
```

---

## Layers

### Common fields (all layer types)

```json
{
  "_Id": "L0",
  "_Type": "Line",
  "Name": "Series Name",
  "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
  "XAxis": "<x-column>", "YAxis": "<y-column>",
  "XAxisId": "X-Axis 1", "YAxisId": "Y-Axis 1", "XAxisMulti": "",
  "Color": "#0061FF", "Opacity": 80,
  "LegendGroup": "None", "ColorData": "None",
  "ShowCurrentTick": false, "CacheStreamingData": false,
  "Legend": true, "Enabled": true,
  "PaletteTheme": " ",
  "Palette": [
    {"type":"#0061FF"},{"type":"#F23A66"},{"type":"#009BAB"},
    {"type":"#7647CC"},{"type":"#FFC300"},{"type":"#9FA3A6"},
    {"type":"#003A99"},{"type":"#A90B31"},{"type":"#005D67"},{"type":"#452481"}
  ],
  "Actions": [],
  "HighlightRules": [],
  "Labels": {
    "Align": "center", "Color": "#000000", "Enabled": false,
    "Font": { "Bold": false, "Size": 12 },
    "Frequency": 1, "Offset": "0", "Rotation": 0, "MaxLabels": 10,
    "Template": "{{x}}, {{toFixed y 2}}"
  },
  "possibleXAxes": ["X-Axis 1"], "possibleYAxes": ["Y-Axis 1"],
  "possibleActionsColumns": ["None","<thisX>","<thisY>","<thisName>"],
  "possibleColorColumns": ["None"],
  "possibleIconColumns": [""],
  "possibleRadiusData": ["Fixed Size"],
  "possibleLayers": [], "possibleRulesColumns": [],
  "possibleXColumns": [], "possibleYColumns": ["*"], "possibleMultiColumns": ["","*"]
}
```

Populate all `possible*` arrays with actual query column names.
**`Labels.Align`:** `"center"` | `"right"` | `"bottom"` | `"left"` | `"top"`

---

### Line layer (`_Type: "Line"`)

Add a `Line` block. See the Bubbles-on-Line section below before adding a `Bubbles` block.

```json
"Line": {
  "LineThickness": 1, "LineStyle": "None",
  "DashGap": 1, "DashWidth": 1,
  "Fill": "No Fill",
  "FillColor": "#0061FF", "FillOpacity": 80, "FadeToTransparent": false,
  "SpanGaps": false,
  "Interpolation": { "Interpolation": "Linear", "SteppedLine": "After", "SegmentLength": 20 },
  "PaletteTheme": "", "FillPalette": []
}
```

| Field | Values |
|---|---|
| `LineStyle` | `"None"` \| `"Dashed"` \| `"Dotted"` |
| `Fill` | `"No Fill"` \| `"Solid"` \| `"Gradient"` \| `"Above"` \| `"Below"` |
| `Interpolation.Interpolation` | `"Linear"` \| `"Stepped"` \| `"Monotone"` |

### ⚠️ Bubbles on Line layers — two legitimate patterns

**Pattern A — Visible point markers (`RadiusScaling > 0`):**
```json
"Line": { "LineThickness": 1, "LineStyle": "None", "Fill": "No Fill" },
"Bubbles": { "Color": "#61a8f9", "Opacity": 100, "RadiusData": "Fixed Size", "RadiusScaling": 8, "ScaleOnZoom": true, "Icon": "" }
```

**Pattern B — Suppressed markers, clean line (`RadiusScaling: 0`, no `Color`):**
```json
"Bubbles": { "RadiusData": "", "RadiusScaling": 0, "ScaleOnZoom": true, "Icon": "", "SetIconFromData": false }
```

**The bug case:** A `Bubbles` block with `Color` + `RadiusData: "Fixed Size"` + `RadiusScaling > 0` on **Layer 0** causes KX to render the layer as Bubble type. Fix: remove `Color` from the `Bubbles` block, or set `RadiusScaling: 0`.

---

### Bar / Waterfall layer (`_Type: "Bar"` or `"Waterfall"`)

```json
"Bars": {
  "BarWidth": 95, "BarFixedWidth": 10,
  "BarWidthType": "Percentage",
  "BarOrientation": "Vertical",
  "BorderWidth": 0, "BorderOpacity": 100,
  "BorderColor": "#0061FF",
  "BorderPalette": []
}
```

| Field | Values |
|---|---|
| `BarWidthType` | `"Percentage"` \| `"Fixed Width"` |
| `BarOrientation` | `"Vertical"` \| `"Horizontal"` |

For **horizontal stacked bars**: set `Stacked: true` on the X-axis (not Y-axis) and `BarOrientation: "Horizontal"` on each Bar layer.

---

### Bubble layer (`_Type: "Bubble"`)

```json
"Bubbles": {
  "RadiusData": "Fixed Size",
  "RadiusScaling": 4, "ScaleOnZoom": true,
  "SetIconFromData": false,
  "Icon": "", "DataIcon": "", "DataIconColor": ""
}
```

`RadiusData` accepts `"Fixed Size"` or a column name for dynamic sizing.

---

### Candlestick layer (`_Type: "Candlestick"`)

OHLC columns are mapped as direct fields on the layer. **Do not set `YAxis`.** Both `Bubbles: {}` and `Bars: {}` must be present as empty objects or the KX runtime errors. Bull/Bear colours can be hard-coded hex or ViewState-bound (recommended for theme-switchable dashboards).

```json
{
  "_Id": "L0", "_Type": "Candlestick", "Name": "OHLC",
  "Data": { "_dashboardsType": "data", "value": "<ohlcDataSource>" },
  "XAxis": "Time", "XAxisId": "X-Axis 1", "YAxisId": "Y-Axis 1",
  "Opacity": 100, "LegendGroup": "None", "Legend": true, "Enabled": true,
  "Open": "Open", "High": "High", "Low": "Low", "Close": "Close",
  "CandlestickFormat": {
    "BarWidth": 95, "BarFixedWidth": 10,
    "BarWidthType": "Percentage", "BarOrientation": "Vertical",
    "BullColor":    { "_dashboardsType": "viewstate", "value": "Colors/Green" },
    "BearColor":    { "_dashboardsType": "viewstate", "value": "Colors/Red" },
    "NeutralColor": "#ffffff",
    "WickColor":    "#7b8284"
  },
  "Bubbles": {}, "Bars": {},
  "Actions": [], "HighlightRules": [],
  "Labels": { "Align": "center", "Color": "#000000", "Enabled": false, "Font": { "Bold": false, "Size": 12 }, "Frequency": 1, "Offset": "0", "Rotation": 0, "MaxLabels": 10, "Template": "{{x}}, {{toFixed y 2}}" }
}
```

Hard-coded alternative: `"BullColor": "#00ff00"`. ViewState binding is recommended for dashboards with a theme-switcher.

---

### Bounds layer (`_Type: "Bounds"`)

Draws a shaded region between two X coordinate columns. Used for highlighting time ranges or value bands.

```json
{
  "_Type": "Bounds",
  "x1": "<x1-column>",
  "x2": "<x2-column>",
  "Color": "#0061FF",
  "Opacity": 40
}
```

---

### Baseline layer (`_Type: "Baseline"`)

Draws a reference line at a fixed value on the X or Y axis.

```json
{
  "_Type": "Baseline",
  "Axis": "Y-Axis",
  "Value": "0.5",
  "Color": "#FFC300"
}
```

**`Axis`:** `"X-Axis"` | `"Y-Axis"` (default `"Y-Axis"`)

---

### Heatmap layer (`_Type: "Heatmap"`)

Renders a 2D heatmap within ChartGL using coordinate bounds and a score column.

```json
{
  "_Type": "Heatmap",
  "HeatmapX1": "<x1Col>",
  "HeatmapX2": "<x2Col>",
  "HeatmapY1": "<y1Col>",
  "HeatmapY2": "<y2Col>",
  "Score": "<scoreCol>"
}
```

---

## Override Rules (`OverrideRules`)

Override rules apply to the whole chart.

```json
// Colour a specific y-column
{ "RuleType": "Column", "RuleName": "Highlight Ask",
  "RuleTarget": "ask", "UsePalette": false, "RuleColor": "#F23A66",
  "RuleColumnsPaletteTheme": "", "RuleColumnsPalette": [] }

// Override a layer's colour palette
{ "RuleType": "Layer", "RuleName": "Remap Bid",
  "RuleTarget": "Bid", "RulePaletteTheme": "", "RuleColorPalette": [] }

// Add axis prefix / suffix / precision dynamically
{ "RuleType": "Axis", "RuleName": "Price suffix",
  "RuleTargetAxis": "Y-Axis 1",
  "RuleProperty": "Suffix", "RuleCondition": "ask", "RuleAction": " USD" }
```

**`RuleProperty`:** `"Prefix"` | `"Suffix"` | `"Decimal Places"`

---

## Highlight Rules (per layer, in `HighlightRules`)

```json
// Discrete — colour points meeting a condition
{ "RuleType": "discrete", "RuleName": "Large Spread",
  "RuleTarget": "ask", "RuleSource": "spread",
  "RuleOperation": ">", "RuleValue": "0.005",
  "RuleColor": "#FF4444", "Show": false }

// Gradient — colour scale over a value range
{ "RuleType": "gradient", "RuleName": "Bid Depth",
  "RuleTarget": "bid", "RuleSource": "bidSize",
  "RuleMin": 0, "RuleMax": 1000000,
  "Palette": [{"type":"#cc6677"},{"type":"#ddcc77"},{"type":"#117733"}],
  "Show": false }
```

**`RuleOperation`:** `""` | `"search"` | `"regexp"` | `"contains"` | `"starts with"` | `"ends with"` | `"=="` | `"<"` | `">"` | `"<="` | `">="` | `"!="` | `"in"`

---

## Overlay

```json
{
  "ShowCrosshairs": true, "ShowCoordinates": true, "SnapToPoint": true,
  "ShowColorPicker": false,
  "UseCustomTooltip": false,
  "CustomTooltip": "<table><thead><tr><th>{{this.0.xAxis}}</th><th></th></tr></thead><tbody>{{#each this}}<tr><td width=\"{{width}}\"><i class=\"{{icon}}\" style=\"color:{{color}}; {{image}};\"></i> {{name}}: </td><td>{{yAxis}}</td></tr>{{/each}}</tbody></table>",
  "ShowAllLayers": true, "ShowAllPoints": false, "GroupByLayer": false
}
```

- Set `UseCustomTooltip: true` when providing a custom `CustomTooltip` template — without the flag the template is ignored.
- `ShowColorPicker`: enables right-click colour override on data points.
- `GroupByLayer`: groups tooltip entries by layer rather than X value.

---

## FileExport

```json
{
  "ShowExportCsvButton": false, "ShowExportExcelButton": false,
  "ShowExportPngButton": false,
  "PngButton": "Export Png",
  "UseChartFormat": false,
  "FileName": [], "Actions": []
}
```

**`PngButton`:** `"Export Png"` | `"Copy to Clipboard"` | `"Export Png & Copy to Clipboard"`

---

## Annotations

```json
{ "ShowAnnotateControl": false, "Annotations": "" }
```

Set `ShowAnnotateControl: true` to enable the annotation toolbar on the chart.

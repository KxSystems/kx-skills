[← Back to SKILL.md](../SKILL.md)

# kx-heatmap — Common Patterns

> Copy-ready worked patterns for the most common Heatmap (Treemap) shapes.

**Contents:** Market map — tile by market cap, colour by % change · Sector-grouped treemap · Fixed colour (portfolio composition)

---

## Market map — tile by market cap, colour by % change

```json
// Data source: returns rows with sym, mcap, pctChange columns
"Basics": {
  "Data": { "_dashboardsType": "data", "value": "marketData" },
  "Selected": { "_dashboardsType": "viewstate", "value": "selectedSym" },
  "SelectedAttr": "sym"
},
"Data": [{ "Name": "Market", "Column": "sym", "Size": "mcap", "Color": "pctChange", "HighlightRules": [] }],
"ColorPalette": { "ColorType": "Gradient", "SelectedColorScheme": "red green" },
"NodeLabel": { "customLabel": "{{sym}} | {{pctChange}}%", "Show": true }
```

---

## Sector-grouped treemap

```json
"GroupBy": {
  "UseGroupBy": true,
  "GroupByColumns": "sector",
  "ShowHeader": true,
  "ScaleByChildren": false,
  "headerColor": "#333333"
}
```

Nodes are grouped under their `sector` value. Each sector gets a labelled parent tile.

---

## Fixed colour (portfolio composition)

```json
"ColorPalette": {
  "ColorType": "Iterative",
  "SelectedColorScheme": "default"
},
"Data": [{ "Name": "Holdings", "Column": "fund", "Size": "weight", "Color": "", "HighlightRules": [] }]
```

Each fund gets a distinct colour from the scheme; `Size` drives tile area by portfolio weight.

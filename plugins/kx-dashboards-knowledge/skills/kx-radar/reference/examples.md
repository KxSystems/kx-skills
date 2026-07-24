# kx-radar — Worked Examples

> Six few-shot NLQ → radar config examples. Back to [SKILL.md](../SKILL.md).

**Contents:** Basic single series · Multi-series palette · Polar area animation · State health styling · 5-series star points · Export + click-to-select

---

## Worked Examples

### Example 1 — Basic single series (dark theme)

**NLQ:** "Create a radar chart showing Dataset1 by Month"

```json
{
  "name":          "Monthly Dataset 1",
  "componentType": "radar",
  "theme":         "Dark",
  "dataSource":    "radarData",
  "radarColumn":   "Month",
  "columns":       ["Month","Dataset1","Dataset2","Dataset3","Dataset4","Dataset5","Dataset6","Dataset7","Dataset8"],
  "layers": [
    { "data": "Dataset1", "display": "Dataset 1", "color": "#0061FF" }
  ],
  "dataSources": [{
    "name":        "radarData",
    "connection":  "html5evalcongroup",
    "queryString": "tab:flip `Month`Dataset1`Dataset2`Dataset3`Dataset4`Dataset5`Dataset6`Dataset7`Dataset8!(`January`February`March`April`May`June`July`August`September`October`November`December; -21 35 -93 -69 -1 77 19 -90 -95 -14 -39 -19f; -39 -5 66 -69 80 -39 93 73 12 38 -59 46f; -3 -29 -38 -61 -56 25 27 -23 -83 5 -42 73f; 92 -20 -72 87 59 42 79 32 39 49 33 -97f; 245 -432 570 456 407 -625 -688 659 -627 -907 -662 811f; 8 49 30 74 100 22 50 40 56 52 38 63f; 30 26 42 93 6 77 51 61 23 51 40 34f; 96 48 38 42 74 81 60 96 7 27 58 50f); tab",
    "columns":     ["Month","Dataset1","Dataset2","Dataset3","Dataset4","Dataset5","Dataset6","Dataset7","Dataset8"]
  }]
}
```

---

### Example 2 — Multi-series with KX colour palette

**NLQ:** "Create a radar chart showing Dataset1, Dataset2, and Dataset3 by Month using the KX colour palette"

`useColor: true` enables per-point palette colouring on every layer.

```json
{
  "name":          "Monthly Multi-Series",
  "componentType": "radar",
  "theme":         "Dark",
  "dataSource":    "radarData",
  "radarColumn":   "Month",
  "columns":       ["Month","Dataset1","Dataset2","Dataset3"],
  "layers": [
    { "data": "Dataset1", "display": "Dataset 1", "useColor": true },
    { "data": "Dataset2", "display": "Dataset 2", "useColor": true },
    { "data": "Dataset3", "display": "Dataset 3", "useColor": true }
  ],
  "dataSources": [{ "name": "radarData", "connection": "html5evalcongroup",
    "queryString": "...", "columns": ["Month","Dataset1","Dataset2","Dataset3"] }]
}
```

---

### Example 3 — Polar area with animation

**NLQ:** "Show a polar area chart with Dataset1 and Dataset2 by Month, animate with easeOutQuart over 500ms"

```json
{
  "name":          "Monthly Polar Area",
  "componentType": "radar",
  "chartType":     "polarArea",
  "theme":         "Dark",
  "dataSource":    "radarData",
  "radarColumn":   "Month",
  "columns":       ["Month","Dataset1","Dataset2"],
  "layers": [
    { "data": "Dataset1", "display": "Dataset 1", "color": "#0061FF" },
    { "data": "Dataset2", "display": "Dataset 2", "color": "#F23A66" }
  ],
  "animations": { "enabled": true, "duration": 500, "easing": "easeOutQuart" },
  "dataSources": [{ "name": "radarData", "connection": "html5evalcongroup",
    "queryString": "...", "columns": ["Month","Dataset1","Dataset2"] }]
}
```

> `AngleLineOpacity` is hidden in the Properties UI for polar area but is still written to JSON by `makeRadarWidget` — this is correct.

---

### Example 4 — State health data with styling

**NLQ:** "Radar chart for US state health showing Obesity and Diabetes by State, legend at bottom, begin at zero, format to 1 decimal place with % suffix"

```json
{
  "name":          "State Health Metrics",
  "componentType": "radar",
  "theme":         "Dark",
  "dataSource":    "stateHealth",
  "radarColumn":   "State",
  "columns":       ["State","Obesity","Diabetes","PhysicalInactivity","Smoking","Hypertension"],
  "layers": [
    { "data": "Obesity",  "display": "Obesity" },
    { "data": "Diabetes", "display": "Diabetes" }
  ],
  "legend": { "show": true, "position": "bottom" },
  "ticks":  { "beginAtZero": true, "format": "Number", "precision": 1, "suffix": "%" },
  "dataSources": [{
    "name": "stateHealth", "connection": "html5evalcongroup",
    "queryString": "(\"SFFFFF\";enlist csv) 0: `:sample/data/USStateHealth.csv",
    "columns": ["State","Obesity","Diabetes","PhysicalInactivity","Smoking","Hypertension"]
  }]
}
```

---

### Example 5 — Dataset1 through Dataset5 with star points

**NLQ:** "Create a radar chart showing Dataset1 through Dataset5 by Month, star point style, radius 5"

```json
{
  "name":          "Monthly 5-Series Radar",
  "componentType": "radar",
  "theme":         "Dark",
  "dataSource":    "radarData",
  "radarColumn":   "Month",
  "columns":       ["Month","Dataset1","Dataset2","Dataset3","Dataset4","Dataset5"],
  "layers": [
    { "data": "Dataset1", "display": "Dataset 1", "pointStyle": "star", "pointRadius": 5 },
    { "data": "Dataset2", "display": "Dataset 2", "pointStyle": "star", "pointRadius": 5 },
    { "data": "Dataset3", "display": "Dataset 3", "pointStyle": "star", "pointRadius": 5 },
    { "data": "Dataset4", "display": "Dataset 4", "pointStyle": "star", "pointRadius": 5 },
    { "data": "Dataset5", "display": "Dataset 5", "pointStyle": "star", "pointRadius": 5 }
  ],
  "dataSources": [{ "name": "radarData", "connection": "html5evalcongroup",
    "queryString": "...", "columns": ["Month","Dataset1","Dataset2","Dataset3","Dataset4","Dataset5"] }]
}
```

---

### Example 6 — Export + click-to-select

**NLQ:** "Radar chart showing Dataset1 by Month, CSV and screenshot export, clicking a segment selects the month"

```json
{
  "name":          "Monthly Radar with Export",
  "componentType": "radar",
  "theme":         "Dark",
  "dataSource":    "radarData",
  "radarColumn":   "Month",
  "columns":       ["Month","Dataset1"],
  "selectedAttr":  "Month",
  "selected":      "selectedMonth",
  "layers": [{ "data": "Dataset1", "display": "Dataset 1" }],
  "fileExport": { "showScreenshot": true, "showExportCsvButton": true },
  "viewStates": [
    { "name": "selectedMonth", "type": "symbol", "default": "" }
  ],
  "dataSources": [{ "name": "radarData", "connection": "html5evalcongroup",
    "queryString": "...", "columns": ["Month","Dataset1"] }]
}
```


# kx-chart3d — Config Examples

> Four worked NLQ → JSON examples with companion data sources. Back to [SKILL.md](../SKILL.md).

**Contents:** 3D dot (Cars) · 3D bar (Airports, Category axes) · 3D line (streaming) · 4D dot-color

---

## Config Examples

### Example 1 — 3D dot chart, Cars dataset

**Prompt:** `Create a 3D dot chart of Cars — Horsepower on X, Miles_per_Gallon on Y, Weight_in_lbs on Z`

```json
{
  "id": "<uuid>",
  "key": "Chart3D",
  "definitionId": "20",
  "hasOnSettingsChange": true,
  "options": {
    "version": "4.7.7",
    "possibleAxis": ["Horsepower", "Miles_per_Gallon", "Weight_in_lbs"],
    "possibleColumns": ["Horsepower", "Miles_per_Gallon", "Weight_in_lbs"],
    "possibleLabels": [], "possibleRules": [],
    "possiblePalettes": [" ", ".palette_default", ".palette_gradient", ".palette_pastel", ".palette_colorblind"],
    "Basics": { "Name": "Cars — 3D Dot Chart", "Focus": "", "Theme": "Dark", "Selected": "", "SelectedAttr": "" },
    "Layers": [{
      "possibleLayerAxis": ["Horsepower", "Miles_per_Gallon", "Weight_in_lbs"],
      "_Id": "L0", "_Type": "dot",
      "Data": { "_dashboardsType": "data", "value": "carsData" },
      "Name": "Cars",
      "XAxis": "Horsepower", "YAxis": "Miles_per_Gallon", "ZAxis": "Weight_in_lbs", "Volume": ""
    }],
    "X": { "AxisType": "Linear", "Label": "Horsepower", "Format": "Number", "Precision": 0, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
    "Y": { "AxisType": "Linear", "Label": "Miles per Gallon", "Format": "Number", "Precision": 1, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
    "Z": { "AxisType": "Linear", "Label": "Weight (lbs)", "Format": "Number", "Precision": 0, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
    "Volume": { "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
    "Position": { "Horizontal": 0.0873, "Vertical": 0.001241, "Distance": 2.5 },
    "Style": {
      "palettes": "", "fill": "transparent", "stroke": "#ffffff", "advanced": "",
      "advancedTooltip": "<table>{{#each points}}<tr><td>{{xLabel}}</td><td>{{x}}</td></tr><tr><td>{{yLabel}}</td><td>{{y}}</td></tr><tr><td>{{zLabel}}</td><td>{{z}}</td></tr>{{/each}}</table>",
      "VerticalRatio": 70, "KeepAspectRatio": false,
      "ColorPalette": { "ColorScheme": [{"type":"#F8696B"},{"type":"#F98570"},{"type":"#FBA276"},{"type":"#FCBF7B"},{"type":"#FEDC81"},{"type":"#EEE683"},{"type":"#CCDD82"},{"type":"#A9D27F"},{"type":"#86C97E"},{"type":"#63BE7B"}] }
    },
    "Alignment": { "paddingLeft": "0", "paddingRight": "0", "paddingTop": "0", "paddingBottom": "0" },
    "format": { "widgetTitle": "Cars — Horsepower / MPG / Weight", "titleFontSize": "16", "titleHorizontal": "Center", "titlePaddingLeft": 0, "titlePaddingRight": 0, "titlePaddingTop": 0, "titlePaddingBottom": 0 }
  }
}
```

**Companion data source** (add to dashboard `"data": {}` block):

```json
"carsData": {
  "_dataType": "query",
  "_subscriptionType": "static",
  "_connection": "<connectionName>",
  "_autoExecute": true,
  "_autoExec": true,
  "query": "select Horsepower, Miles_per_Gallon, Weight_in_lbs from Cars"
}
```

---

### Example 2 — 3D bar chart, Airports with Category axes

**Prompt:** `3D bar chart of Airports — continent on X (Category), type on Y (Category), elevation_ft on Z`

```json
{
  "Layers": [{
    "possibleLayerAxis": ["continent", "type", "elevation_ft"],
    "_Id": "L0", "_Type": "bar",
    "Data": { "_dashboardsType": "data", "value": "airportsData" },
    "Name": "Airports",
    "XAxis": "continent", "YAxis": "type", "ZAxis": "elevation_ft", "Volume": ""
  }],
  "X": { "AxisType": "Category", "Label": "Continent", "Format": "General", "Precision": 2, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Y": { "AxisType": "Category", "Label": "Type", "Format": "General", "Precision": 2, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Z": { "AxisType": "Linear", "Label": "Elevation (ft)", "Format": "Number", "Precision": 0, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 }
}
```

**Companion data source:**

```json
"airportsData": {
  "_dataType": "query",
  "_subscriptionType": "static",
  "_connection": "<connectionName>",
  "_autoExecute": true,
  "_autoExec": true,
  "query": "select continent, type, elevation_ft from Airports"
}
```

---

### Example 3 — 3D line chart, dfxQuote streaming

**Prompt:** `3D line chart from dfxQuote — time on X (Time axis), bid on Y, ask on Z`

```json
{
  "Layers": [{
    "possibleLayerAxis": ["time", "bid", "ask"],
    "_Id": "L0", "_Type": "line",
    "Data": { "_dashboardsType": "data", "value": "fxData" },
    "Name": "FX Quote",
    "XAxis": "time", "YAxis": "bid", "ZAxis": "ask", "Volume": ""
  }],
  "X": { "AxisType": "Time", "Label": "Time", "Format": "Datetime", "Precision": 2, "DateFormat": "hh:mm:ss", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Y": { "AxisType": "Linear", "Label": "Bid", "Format": "Number", "Precision": 4, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Z": { "AxisType": "Linear", "Label": "Ask", "Format": "Number", "Precision": 4, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 }
}
```

**Companion data source (streaming):**

```json
"fxData": {
  "_dataType": "query",
  "_subscriptionType": "streaming",
  "_connection": "<connectionName>",
  "_autoExecute": true,
  "_autoExec": true,
  "query": "select time, bid, ask from dfxQuote"
}
```

---

### Example 4 — 4D dot-color chart (Volume-encoded color)

**Prompt:** `4D scatter of dfxQuote — bid on X, ask on Y, spread on Z, color by volume`

```json
{
  "Layers": [{
    "possibleLayerAxis": ["bid", "ask", "spread", "vol"],
    "_Id": "L0", "_Type": "dot-color",
    "Data": { "_dashboardsType": "data", "value": "fxData" },
    "Name": "FX 4D",
    "XAxis": "bid", "YAxis": "ask", "ZAxis": "spread", "Volume": "vol"
  }],
  "X": { "AxisType": "Linear", "Label": "Bid", "Format": "Number", "Precision": 4, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Y": { "AxisType": "Linear", "Label": "Ask", "Format": "Number", "Precision": 4, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Z": { "AxisType": "Linear", "Label": "Spread", "Format": "Number", "Precision": 5, "DateFormat": "YYYY-MM-DD", "Prefix": "", "Suffix": "", "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 },
  "Volume": { "UseMin": false, "AxisMin": 0, "UseMax": false, "AxisMax": 10 }
}
```

> ⚠️ `dot-color` reverses the palette at runtime. With the default scheme, the **highest** `vol` value renders as `#F8696B` (red) and the **lowest** as `#63BE7B` (green). Reverse the `ColorScheme` array to swap this.


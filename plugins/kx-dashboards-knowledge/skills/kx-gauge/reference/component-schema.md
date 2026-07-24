[← Back to SKILL.md](../SKILL.md)

# kx-gauge — Component Schema & Field Reference

> The raw KX Dashboards Gauge/Bullet component structure, ChartType/Format field tables, highlight rules, tooltip template, and schema migration history.

**Contents:** Gauge Full Component Schema · Bullet Chart Full Component Schema · ChartType Properties Reference · Highlight Rules · Format Properties · Tooltip · Schema Upgrade History

---

`key: "Gauge"` · `definitionId: "11178"`

## Gauge — Full Component Schema

```json
{
  "id": "<uuid>", "key": "Gauge",
  "containerId": null, "components": [], "widgets": [],
  "definitionId": "11178", "hasOnSettingsChange": true,
  "options": {
    "version": "v2.2.8.1",
    "possibleColumns": [],
    "Basics": {
      "Name": "",
      "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
      "Title": "",
      "ShowTitle": false,
      "ChartType": {
        "_Type": "Gauge",
        "DataColumn": "<value-column>",
        "Min": 0,
        "Max": 100,
        "Color": "#0061FF",
        "LabelFontSize": 30,
        "BarWidth": 10,
        "PointerWidth": 6,
        "ShowLabel": true,
        "ShowProgress": true,
        "AxisLabels": false,
        "AxisTicks": false
      },
      "HighlightRules": []
    },
    "Format": {
      "Format": "Number",
      "Precision": 2,
      "HideTrailingZeroes": false,
      "Prefix": "",
      "Suffix": ""
    },
    "Tooltip": {
      "ShowTooltip": true,
      "UseCustomTooltip": false,
      "CustomTooltip": "<table>\n    {{#if this.0.title}}<thead><tr><th>{{this.0.title}}</thead><th></tr>{{/if}}\n    <tbody>{{#each this}}\n        <tr>\n            <td>{{dataCol}}: </td>\n            <td>{{dataVal}}</td>\n        </tr>\n        {{/each}}\n    </tbody>\n</table>"
    },
    "Style": { "advanced": "", "cssClasses": "" },
    "Alignment": {},
    "format": {}
  }
}
```

---

## Bullet Chart — Full Component Schema

```json
{
  "id": "<uuid>", "key": "Gauge",
  "containerId": null, "components": [], "widgets": [],
  "definitionId": "11178", "hasOnSettingsChange": true,
  "options": {
    "version": "v2.2.8.1",
    "possibleColumns": [],
    "Basics": {
      "Name": "",
      "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
      "ChartType": {
        "_Type": "Bullet",
        "ProgressData": "<progress-value-column>",
        "Target": "<target-value-column>",
        "AxisData": "<axis-label-column>",
        "ProgressColor": "#0061FF",
        "TargetColor": "#F23A66",
        "Transposed": true,
        "Min": 0,
        "Max": 300
      },
      "HighlightRules": []
    },
    "Format": {
      "Format": "Number",
      "Precision": 2,
      "HideTrailingZeroes": false,
      "Prefix": "",
      "Suffix": ""
    },
    "Tooltip": {
      "ShowTooltip": true,
      "UseCustomTooltip": false,
      "CustomTooltip": "<table>\n    {{#if this.0.title}}<thead><tr><th>{{this.0.title}}</thead><th></tr>{{/if}}\n    <tbody>{{#each this}}\n        <tr>\n            <td>{{dataCol}}: </td>\n            <td>{{dataVal}}</td>\n        </tr>\n        {{/each}}\n    </tbody>\n</table>"
    },
    "Style": { "advanced": "", "cssClasses": "" },
    "Alignment": {},
    "format": {}
  }
}
```

**`Transposed: true`** = horizontal bars (default). **`Transposed: false`** = vertical bars.

---

## ChartType Properties Reference

### Gauge (`_Type: "Gauge"`)

| Property | Type | Default | Description |
|---|---|---|---|
| `DataColumn` | string | `""` | Column from the data source to display |
| `Min` | number | `0` | Minimum axis value |
| `Max` | number | `100` | Maximum axis value |
| `Color` | string (hex) | `"#0061FF"` | Default arc/pointer colour (used when no highlight rules) |
| `LabelFontSize` | number | `30` | Value label font size (px) |
| `BarWidth` | number | `10` | Thickness of the arc track |
| `PointerWidth` | number | `6` | Width of the pointer needle |
| `ShowLabel` | boolean | `true` | Show/hide the value label; opacity set to 0.0001 when hidden to preserve pointer colour |
| `ShowProgress` | boolean | `true` | Show a filled progress arc. When `true`, highlight rule colours are not applied to the arc |
| `AxisLabels` | boolean | `false` | Show numeric labels along the arc |
| `AxisTicks` | boolean | `false` | Show tick marks along the arc |

### Bullet (`_Type: "Bullet"`)

| Property | Type | Default | Description |
|---|---|---|---|
| `ProgressData` | string | `""` | Column for the progress (actual) bar values |
| `Target` | string | `""` | Column for the target marker values |
| `AxisData` | string | `""` | Column used for axis category labels |
| `ProgressColor` | string (hex) | `"#0061FF"` | Colour of the progress bar |
| `TargetColor` | string (hex) | `"#F23A66"` | Colour of the target marker |
| `Transposed` | boolean | `true` | `true` = horizontal, `false` = vertical |

---

## Highlight Rules

Highlight rules set colour bands on the track (Gauge) or background segments (Bullet).

```json
"HighlightRules": [
  { "RuleColor": "#00c853", "RuleOperation": "<",  "RuleValue": "50"  },
  { "RuleColor": "#ffd600", "RuleOperation": "<=", "RuleValue": "80"  },
  { "RuleColor": "#d50000", "RuleOperation": "<=", "RuleValue": "100" }
]
```

- **`RuleOperation`**: `"<"` or `"<="` only.
- **`RuleValue`**: absolute number within `[Min, Max]` (Gauge), or a raw data value (Bullet).
- Rules are sorted ascending by value before being applied.
- For Gauge: each rule value is normalised as `(value − Min) / (Max − Min)` to produce a 0–1 colour stop for eCharts.
- When `ShowProgress: true` on a Gauge, highlight rule colours are suppressed (progress arc uses `Color`).

---

## Format Properties

| Property | Type | Default | Options |
|---|---|---|---|
| `Format` | string | `"Number"` | `"Number"`, `"Smart Number"`, `"Formatted Number"` |
| `Precision` | number | `2` | Decimal places |
| `HideTrailingZeroes` | boolean | `false` | Strip trailing zeros after decimal |
| `Prefix` | string | `""` | String prepended to the formatted value |
| `Suffix` | string | `""` | String appended to the formatted value |

**Format behaviour:**
- `"Number"` — `value.toFixed(precision)`
- `"Formatted Number"` — locale-formatted with thousands separators and precision
- `"Smart Number"` — auto-scales large numbers (K, M, B) with precision

---

## Tooltip

The tooltip fires on `mousemove`. For Gauge, it uses a circular hit-test (distance from centre ≤ radius). For Bullet, it converts pixel position to grid index via eCharts `convertFromPixel`.

### Default Handlebars template

```handlebars
<table>
    {{#if this.0.title}}<thead><tr><th>{{this.0.title}}</thead><th></tr>{{/if}}
    <tbody>{{#each this}}
        <tr>
            <td>{{dataCol}}: </td>
            <td>{{dataVal}}</td>
        </tr>
        {{/each}}
    </tbody>
</table>
```

### Custom tooltip template variables

| Variable | Description |
|---|---|
| `this[].dataCol` | Column name (Gauge: `DataColumn`; Bullet: `ProgressData`) |
| `this[].dataVal` | Formatted value (prefix + formatted number + suffix) |
| `this[].title` | Widget title (only when `ShowTitle: true` on Gauge) |
| `this[].data` | Object of all column key→value pairs at the hovered data point |

---

## Schema Upgrade History

The widget runs migration functions on load to bring older saved settings up to date:

| Version | Migration |
|---|---|
| `4.7.7.1` | Adds `Basics.Name`, `Basics.ChartType = "Gauge"`, `Tooltip`, `ShowTitle/Title`, `Format` defaults |
| `4.7.7.2` | Moves flat gauge props (`DataColumn`, `Min`, `Max`, etc.) into `Basics.ChartType.*` and sets `_Type = "Gauge"` |
| `v2.2.8.1` | Adds `BarWidth: 10` and `PointerWidth: 6` defaults if missing |

Always set `"version": "v2.2.8.1"` in new components to skip all migrations.

# kx-radar — Component JSON Schema Reference

> The full KX Dashboards Radar component options block and the flip-select wide-table pattern. Back to [SKILL.md](../SKILL.md).

**Contents:** Full Component Schema · flip select — wide-table pattern

---

## Full Component Schema

Returned by `makeRadarWidget(config)` and embedded in the widget wrapper by `generateDashboard()`.

```json
{
  "id": "<uuid>",
  "key": "Radar",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "1008",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.12.0.1",
    "Basics": {
      "Name": "",
      "ChartType": "radar",
      "Data":     { "_dashboardsType": "data", "value": "<dataSourceName>" },
      "Focus":    "",
      "Selected": "",
      "SelectedAttr": "",
      "SelectedObjectRouting": []
    },
    "_note_Basics": "Focus and Selected are empty string when unbound. When bound: { \"_dashboardsType\": \"viewstate\", \"value\": \"<viewstatePath>\" }",
    "DataSet": {
      "Radar":            "<axis-column>",
      "RadarColor":       "#ffffff",
      "RadarColorAngle":  "#ffffff",
      "GridLineOpacity":  35,
      "AngleLineOpacity": 35,
      "Layers": [
        {
          "Data":         "<series-column or { \"_dashboardsType\":\"viewstate\",\"value\":\"<vs>\" }>",
          "Color":        "#0061FF",
          "BorderColor":  "#ffffff",
          "UseColor":     false,
          "ColorOpacity": 35,
          "Display":      "",
          "PointStyle":   "",
          "PointRadius":  2
        }
      ]
    },
    "Legend": {
      "Show":       true,
      "LabelColor": "#ffffff",
      "Position":   "top"
    },
    "Padding": { "Top": 2, "Bottom": 2, "Left": 2, "Right": 2 },
    "Animations": { "Enabled": false, "Duration": 20, "Easing": "linear" },
    "ticks": {
      "display":            true,
      "fontColor":          "rgba(0, 0, 0, 0.75)",
      "_note_fontColor":    "Light default. Dark theme: rgba(255,255,255,0.75)",
      "fontSize":           12,
      "showLabelBackdrop":  false,
      "backdropColor":      "rgba(255, 255, 255, 0.75)",
      "_note_backdropColor":"Light default. Dark theme: rgba(0,0,0,0.75)",
      "backdropPaddingX":   2,
      "backdropPaddingY":   2,
      "beginAtZero":        false,
      "maxTicksLimit":      11,
      "Format":             "General",
      "Precision":          0,
      "HideTrailingZeroes": false,
      "DateFormat":         "YYYY-MM-DD",
      "Prefix":             "",
      "Suffix":             "",
      "pointLabels":        12
    },
    "Tooltip": {
      "handlebarhelper": [],
      "isStacked": false,
      "advancedTooltip": "<div>{{#each dataSet}}<table><tbody>{{#eq @index 0}} <tr><td colspan=\"3\">{{legend}}</td> </tr> {{/eq}} <tr> <td><svg style=\"width:15px;height:15px\"> <circle fill=\"{{color}}\" width=\"2\" stroke=\"white\" r=\"6\" cy=\"8\" cx=\"8\"></circle> </svg></td> <td> {{layerKey}}</td>  <td>{{layerValue}}</td>  </tr></tbody>  </table>  {{/each}}</div>"
    },
    "ColorPallette": {
      "palettes": [],
      "chartBarColors": [
        {"type":"#0061FF"},{"type":"#F23A66"},{"type":"#009BAB"},{"type":"#7647CC"},
        {"type":"#FFC300"},{"type":"#9FA3A6"},{"type":"#003A99"},{"type":"#A90B31"},
        {"type":"#005D67"},{"type":"#452481"}
      ],
      "scheme": "default"
    },
    "FileExport": {
      "ShowScreenshot": false,
      "ShowExportCsvButton": false,
      "ShowExportExcelButton": false,
      "ScreenshotButton": "Export Png",
      "FileName": [],
      "Actions": []
    },
    "possibleColumns":  ["<col1>", "<col2>"],
    "possibleLabels":   ["<col1>", "<col2>"],
    "possibleRules":    ["<col1>", "<col2>"],
    "possiblePalettes": [" ",".palette_default",".palette_gradient",".palette_pastel",".palette_colorblind"],
    "Style":     { "advanced": "", "cssClasses": "" },
    "_note_Alignment_format": "Per NLX-008 (verified v1.4), Alignment and format must be populated as fully-populated objects to match the authoritative reference export, not left as {}. The exact field values are not recorded in this skill's files — populate them from the reference export 'USAirports Radar — Departures by State' before shipping; do not invent values.",
    "Alignment": {},
    "format":    {}
  }
}
```

> `Focus` and `Selected` default to `""`. Bind only when a ViewState path is named in the prompt.  
> `possibleColumns`, `possibleLabels`, and `possibleRules` must all be set to the same list of query output column names. For a direct `select from Table` query use all table columns. For a `flip select` query the output is always `["Property","Value"]`.

### flip select — wide-table pattern

When a table has many numeric columns and the prompt asks to compare them on a single radar, use `flip select` to pivot the columns into `Property` / `Value` rows:

```q
flip select DiabetesRate,ObesityRate,InactivityRate,HypertensionRate
  from StateData where State=s, Date=d
```

This returns a 2-column table (`Property` = metric name, `Value` = metric value). Set:
- `DataSet.Radar = "Property"`
- `DataSet.Layers[0].Data = "Value"`
- `possibleColumns = possibleLabels = possibleRules = ["Property","Value"]`

This is the standard pattern for health / financial / sensor metrics on a single-state or single-entity radar.

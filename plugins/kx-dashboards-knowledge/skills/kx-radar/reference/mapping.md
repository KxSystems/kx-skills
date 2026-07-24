# kx-radar — NL → JSON Mapping

> Natural-language phrasing mapped to config keys, plus colour and easing enums. Back to [SKILL.md](../SKILL.md).

**Contents:** NL → JSON Mapping Rules · Named colours → hex · Valid easing values

---

## NL → JSON Mapping Rules

| Natural Language | `config` key | Effect |
|---|---|---|
| axis / label / category column | `radarColumn` | `DataSet.Radar` |
| data series / values column | `layers[n].data` | `DataSet.Layers[n].Data` |
| series display name / legend label | `layers[n].display` | `DataSet.Layers[n].Display` |
| "use KX colour palette" / "colour by segment" | `layers[n].useColor: true` | palette mode per data point |
| series fill colour | `layers[n].color` | `DataSet.Layers[n].Color` |
| fill opacity | `layers[n].colorOpacity` | 1–100 |
| point style | `layers[n].pointStyle` | one of 11 enum values |
| point radius / size | `layers[n].pointRadius` | 1–10 |
| polar area chart | `chartType: "polarArea"` | changes chart shape |
| legend at bottom / left / right | `legend.position` | `"bottom"` \| `"left"` \| `"right"` |
| hide legend | `legend.show: false` | `Legend.Show = false` |
| begin scale at zero | `ticks.beginAtZero: true` | `ticks.beginAtZero = true` |
| number format / decimal places | `ticks.format`, `ticks.precision` | `"Number"` + precision |
| prefix / suffix | `ticks.prefix`, `ticks.suffix` | prepend/append to tick labels |
| hide trailing zeros | `ticks.hideTrailingZeroes: true` | strip trailing `.0` |
| animate / animation | `animations.enabled: true`, `.duration`, `.easing` | enables Chart.js animation |
| dark theme | `theme: "Dark"` | `fontColor = rgba(255,255,255,0.75)`, `backdropColor = rgba(0,0,0,0.75)` |
| light theme | `theme: "Light"` | `fontColor = rgba(0,0,0,0.75)`, `backdropColor = rgba(255,255,255,0.75)` |
| export CSV | `fileExport.showExportCsvButton: true` | shows CSV export button |
| export Excel | `fileExport.showExportExcelButton: true` | shows Excel export button |
| export PNG / screenshot | `fileExport.showScreenshot: true` | shows PNG export button |
| click selects value | `selectedAttr: "<axis-column>"` | writes selected row to ViewState |

### Named colours → hex
`blue→#0061FF` · `red/pink→#F23A66` · `teal→#009BAB` · `purple→#7647CC` · `yellow→#FFC300` · `grey→#9FA3A6` · `dark blue→#003A99` · `dark red→#A90B31` · `dark teal→#005D67` · `dark purple→#452481`

### Valid easing values
`linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, **`easeOutQuart`**, `easeInOutQuart`, `easeInQuint`, `easeOutQuint`, `easeInOutQuint`, `easeInSine`, `easeOutSine`, `easeInOutSine`, `easeInExpo`, `easeOutExpo`, `easeInOutExpo`, `easeInCirc`, `easeOutCirc`, `easeInOutCirc`, `easeInElastic`, `easeOutElastic`, `easeInOutElastic`, `easeInBack`, `easeOutBack`, `easeInOutBack`, `easeInBounce`, `easeOutBounce`, `easeInOutBounce`


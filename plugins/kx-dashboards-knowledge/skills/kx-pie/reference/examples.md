[← Back to SKILL.md](../SKILL.md)

# kx-pie — Worked Examples

> Copy-ready PieJS configurations.

---

## Minimal Working Example — Donut Chart

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
    "Basics": {
      "Name": "My Donut Chart",
      "Data": { "_dashboardsType": "data", "value": "<dataSourceId>" },
      "Theme": "Dark",
      "Focus": "",
      "Selected": "",
      "SelectedAttr": "",
      "PopoutSelected": false,
      "PopoutSelectedSize": 10,
      "FixedColumn": "",
      "Actions": []
    },
    "DataSet": {
      "Label": "<label-col>",
      "DonutRatio": 35,
      "Rotation": 50,
      "Circumference": 100,
      "Layers": [
        {
          "Segment": "<value-col>",
          "Display": "",
          "UseColor": true,
          "Color": "#0061FF",
          "BorderColor": "#ffffff",
          "ColorOpacity": 85,
          "HighlightRules": []
        }
      ]
    },
    "Legend": {
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
    },
    "Padding": { "Top": 2, "Bottom": 2, "Left": 2, "Right": 2 },
    "Style": {
      "palettes": "",
      "chartBarColors": [
        { "type": "#0061FF" }, { "type": "#7995b8" }, { "type": "#808387" },
        { "type": "#a69775" }, { "type": "#749450" }, { "type": "#51966a" },
        { "type": "#e2c7c0" }, { "type": "#9acad6" }, { "type": "#1995a3" },
        { "type": "#484d6e" }
      ],
      "advanced": "",
      "advancedTooltip": ""
    },
    "Animations": { "Enabled": false, "Easing": "", "Duration": 0 },
    "InnerLabel": {
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
    },
    "FileExport": {
      "ShowExportCsvButton": false,
      "ShowExportExcelButton": false,
      "ShowScreenshot": false,
      "ScreenshotButton": "Export Png",
      "FileName": []
    }
  }
}
```

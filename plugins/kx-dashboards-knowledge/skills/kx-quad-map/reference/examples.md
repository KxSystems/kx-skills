[← Back to SKILL.md](../SKILL.md)

# kx-quad-map — Worked Examples

> A complete, copy-ready QuadMap configuration.

---

## Minimal Working Example — Circle Layer

```json
{
  "id": "<uuid>",
  "key": "QuadMap",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "1036",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.19.0",
    "Basics": {
      "Name": "My Map",
      "MapGeneration": "WMTS",
      "Projection": "WGS 84",
      "CenterLat": 51.5,
      "CenterLng": -0.1,
      "Zoom": 6,
      "FitToData": true,
      "DefaultLayer": "Open Street (Default)",
      "TileServer": "",
      "TileServerProjection": "Mercator"
    },
    "WTMS": {
      "URL": "",
      "WrapX": false,
      "OriginX": -180,
      "OriginY": 90
    },
    "Points": [
      {
        "possiblePoints": [],
        "DataType": "Circle",
        "Name": "Locations",
        "Visible": true,
        "Cluster": false,
        "Coordinates": "lat/lng",
        "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
        "ID": "<id-col>",
        "Latitude": "<lat-col>",
        "Longitude": "<lng-col>",
        "Circle": {
          "Radius": "",
          "FillColor": "",
          "StrokeColor": "",
          "StrokeWidth": ""
        },
        "ShowTooltip": false,
        "Tooltip": "{{<id-col>}}",
        "Labels": { "UseLabel": false, "Label": "", "Size": 8, "OffsetX": 0, "OffsetY": 0, "TextBaseLine": "center", "Color": "#ffffff" },
        "Selected": { "Color": "#ff0000", "Column": "", "SelectedItem": "" },
        "Actions": []
      }
    ],
    "Annotation": {
      "Filter": true,
      "FilteredIds": "",
      "Zoom": true,
      "Selected": "",
      "HideOnDraw": false
    },
    "Export": {
      "Filename": "",
      "Data": "",
      "TriggerExport": ""
    },
    "Style": { "advanced": "" },
    "format": {}
  }
}
```

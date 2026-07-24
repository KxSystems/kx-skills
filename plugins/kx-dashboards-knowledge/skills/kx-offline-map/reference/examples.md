# kx-offline-map — Examples

> Reusable tooltip Handlebars pattern and a minimal working Points-layer component. Back to [SKILL.md](../SKILL.md).

**Contents:** Typical Tooltip Handlebars Pattern · Minimal Working Example — Points Layer

---

## Typical Tooltip Handlebars Pattern

```html
<div style="font-size:10px">
  Name: {{name}}<br>
  Value: {{addCommas (toFixed value 2)}}
</div>
```

---

## Minimal Working Example — Points Layer

```json
{
  "key": "OfflineMap",
  "definitionId": "1035",
  "options": {
    "Basics": { "Name": "My Map" },
    "MapDetails": {
      "Latitude": 46.5928,
      "Longitude": 8.3221,
      "Zoom": 1,
      "Theme": "dark",
      "Offline": true,
      "UrlStyle": "",
      "RenderWorldCopies": true,
      "Projection": "mercator"
    },
    "Points": [
      {
        "possiblePoints": [""],
        "Name": "Locations",
        "Cluster": true,
        "ClusterMaxZoom": 14,
        "ClusterRadius": 50,
        "PointsInView": true,
        "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
        "ID": "<id-col>",
        "Latitude": "<lat-col>",
        "Longitude": "<lng-col>",
        "ShowTooltip": false,
        "Tooltip": "{{<id-col>}}",
        "Actions": []
      }
    ]
  }
}
```

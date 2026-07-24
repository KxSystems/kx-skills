# kx-offline-map — Map Layer & Feature Blocks

> Field blocks and tables for every map sub-section: Points, Circles, Lines, Heatmap, HeatmapGrid, AnimatedCircles, ConcentricCircles, Layers, Bounds, Annotation, Icons, NightDayLayer, TileServer, ExternalAPI, Export, and Interactions. Back to [SKILL.md](../SKILL.md).

**Contents:** Points · Circles · Lines · Heatmap · HeatmapGrid · AnimatedCircles · ConcentricCircles · Layers · Bounds · Annotation · Icons · NightDayLayer · TileServer · ExternalAPI · Export · Interactions

---

## Points (array of point layer objects)

Each entry in the `Points` array is one point layer. Bind `DataSource` to a data source.

```json
[
  {
    "possiblePoints": [""],
    "Name": "",
    "Cluster": true,
    "ClusterMaxZoom": 14,
    "ClusterRadius": 50,
    "PointsInView": true,
    "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
    "ID": "<id-column>",
    "Latitude": "<lat-column>",
    "Longitude": "<lng-column>",
    "Altitude": "",
    "Icon": "<icon-column>",
    "IconScale": "<scale-column>",
    "IconRotation": "<rotation-column>",
    "IconOpacity": 100,
    "IconInterpolate": false,
    "IconScaleInterpolate": {
      "ZoomStop1": 1,
      "ZoomStop2": 6,
      "Stop1Percent": 25,
      "Exponential": 2
    },
    "Color": "<color-column>",
    "UseLabel": false,
    "Label": "<label-column>",
    "LabelSize": "",
    "ShowTooltip": false,
    "Tooltip": "<handlebars-template>",
    "TrackSelected": false,
    "ZoomOnSelect": false,
    "Selected": {
      "Color": "#ff0000",
      "Column": "",
      "SelectedItem": "",
      "SelectedZoomedItems": ""
    },
    "Actions": [
      {
        "Current": "<source-column>",
        "Target": { "_dashboardsType": "viewstate", "value": "<viewstate-path>" },
        "_Type": "map",
        "Trigger": "Click",
        "Value": ""
      }
    ]
  }
]
```

**Trigger values for Actions:** `"Hover"` | `"Click"` | `"Double Click"` | `"Right Click"`

---

## Circles (array of circle layer objects)

```json
[
  {
    "possibleCircles": [""],
    "Name": "",
    "Cluster": false,
    "ClusterMaxZoom": 14,
    "ClusterRadius": 50,
    "CirclesInView": false,
    "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
    "ID": "<id-column>",
    "Latitude": "<lat-column>",
    "Longitude": "<lng-column>",
    "Altitude": "",
    "Tooltip": "<handlebars-template>",
    "ShowTooltip": false,
    "Color": "<color-column>",
    "Radius": "<radius-column>",
    "StrokeWidth": "",
    "StrokeColor": "",
    "CircleOpacity": 100,
    "UseLabel": false,
    "Label": "<label-column>",
    "LabelSize": "",
    "TrackSelected": false,
    "ZoomOnSelect": false,
    "Selected": {
      "Color": "#ff0000",
      "Column": "",
      "SelectedItem": "",
      "SelectedZoomedItems": ""
    },
    "Actions": []
  }
]
```

---

## Lines (array of line layer objects)

```json
[
  {
    "possibleLines": [""],
    "Name": "",
    "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
    "ID": "<id-column>",
    "Latitude": "<lat-column>",
    "Longitude": "<lng-column>",
    "Tooltip": "<handlebars-template>",
    "ShowTooltip": false,
    "Color": "<color-column>",
    "Width": "<width-column>",
    "UseLabel": false,
    "Label": "",
    "LabelSize": "",
    "Gradient": false,
    "GradientType": "linear",
    "GradientSource": "",
    "Colors": [
      { "index": 0,   "color": "#2166AC" },
      { "index": 20,  "color": "#67A9CF" },
      { "index": 40,  "color": "#D1E5F0" },
      { "index": 60,  "color": "#FDDBC7" },
      { "index": 80,  "color": "#EF8A62" },
      { "index": 100, "color": "#B2182B" }
    ],
    "CurrentPoint": "",
    "LinesInView": false,
    "Point": {
      "Color": "<endpoint-color-column>",
      "Size": "<endpoint-size-column>"
    },
    "Actions": []
  }
]
```

---

## Heatmap

Density heatmap layer. One heatmap per map (not an array).

```json
{
  "possibleHeatmap": [""],
  "Name": "",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "Weight": "<weight-column>",
  "ShowTooltip": false,
  "ShowBaseCircles": true,
  "ShowGradient": false,
  "Tooltip": "<handlebars-template>",
  "PaletteTheme": "",
  "Actions": [],
  "Colors": [
    { "color": "#2166AC" },
    { "color": "#67A9CF" },
    { "color": "#D1E5F0" },
    { "color": "#FDDBC7" },
    { "color": "#EF8A62" },
    { "color": "#B2182B" }
  ]
}
```

---

## HeatmapGrid

Grid-bucketed heatmap (squares or hexagons).

```json
{
  "possibleHeatmap": [""],
  "Name": "",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "GridSize": 50,
  "Shape": "square",
  "ShowZero": true,
  "ShowTooltip": false,
  "Tooltip": "<handlebars-template>",
  "Min": 0,
  "Max": 0,
  "PaletteTheme": "",
  "Actions": [],
  "Colors": [
    { "color": "#2166AC" },
    { "color": "#67A9CF" },
    { "color": "#D1E5F0" },
    { "color": "#FDDBC7" },
    { "color": "#EF8A62" },
    { "color": "#B2182B" }
  ]
}
```

**`Shape`:** `"square"` | `"hexagon"`

---

## AnimatedCircles

Pulsing animated circles — useful for alerts or live event markers.

```json
{
  "possibleAnimatedCircles": [""],
  "Name": "",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "Altitude": "",
  "ShowTooltip": false,
  "Tooltip": "<handlebars-template>",
  "Color": "<color-column>",
  "Radius": "<radius-column>",
  "UseLabel": false,
  "Label": "",
  "LabelSize": "",
  "Actions": []
}
```

---

## ConcentricCircles

Multi-ring concentric circles centred on data points — useful for range rings or zone overlays.

```json
{
  "possibleConcentricCircles": [""],
  "Datasource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "Id": "<id-column>",
  "Lat": "<lat-column>",
  "Lng": "<lng-column>",
  "Radius": "<radius-column>",
  "Colors": "<colors-column-or-literal>",
  "BorderWidth": 1,
  "FilterPoints": "",
  "Name": ""
}
```

---

## Layers

GeoJSON / raster / video / hosted layer overlays using MapLibre GL layer definitions.

```json
{
  "DataSource": {
    "possibleLayers": [],
    "possibleLayersIds": [],
    "Name": "",
    "File": "",
    "FileId": "",
    "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
    "Id": "<id-column>",
    "DataValue": "<value-column>",
    "ShowTooltip": true,
    "UseMinMax": false,
    "MinRange": 0,
    "MaxRange": 100,
    "ShowZero": true,
    "Tooltip": "<handlebars-template>",
    "Actions": [],
    "PaletteTheme": "",
    "Palette": [
      { "type": "#F8696B" },
      { "type": "#63BE7B" }
    ]
  },
  "Video": [
    { "file": "<video-url>", "coordinates": [], "order": 0, "image": "" }
  ],
  "Hosted": [
    { "file": "<geojson-url>", "Name": "", "properties": "", "Tooltip": "", "ShowTooltip": false }
  ],
  "Simple": [
    { "datatype": "geojson", "Name": "", "data": "", "properties": "", "Tooltip": "", "ShowTooltip": false }
  ],
  "Raster": [
    { "Name": "", "TileUrl": "<tile-url>", "TileSize": 256 }
  ]
}
```

**`Simple.datatype`:** `"geojson"` | `"vector"`

---

## Bounds

Controls auto-fit and click-to-zoom behaviour.

```json
{
  "Current": "",
  "PointClick": true,
  "PointClickRadius": 30,
  "PointClickBounds": ""
}
```

Bind `"Current"` to a ViewState containing a `[west, south, east, north]` bounding box array to fit the map on load.

---

## Annotation

User-drawn polygon / shape annotation tool.

```json
{
  "Enable": true,
  "Filter": true,
  "Zoom": true,
  "Selected": ""
}
```

| Field | Notes |
|---|---|
| `Enable` | Show annotation drawing toolbar. |
| `Filter` | Filter points inside drawn annotation. |
| `Zoom` | Zoom to drawn annotation extent. |
| `Selected` | ViewState path to write the selected annotation GeoJSON. |

---

## Icons

Array of built-in icon registrations. Always include the full default list below — the map requires these to be present. Reference any registered `name` value in `Points[n].Icon`.

```json
[
  { "name": "arrow" },
  { "name": "arrow2" },
  { "name": "arrow3" },
  { "name": "arrow4" },
  { "name": "airplane" },
  { "name": "airplane-fighter" },
  { "name": "airplane-fighter2" },
  { "name": "airplane-fighter3" },
  { "name": "airplane-fighter4" },
  { "name": "airplane-jumbo" },
  { "name": "airplane-front" },
  { "name": "airplane-jet" },
  { "name": "airplane-land" },
  { "name": "airplane-paper" },
  { "name": "airplane-private" },
  { "name": "airplane-takeoff" },
  { "name": "airplane-top" },
  { "name": "airport" },
  { "name": "anchor" },
  { "name": "arrow" },
  { "name": "bus" },
  { "name": "clock" },
  { "name": "cloudy" },
  { "name": "default" },
  { "name": "drone" },
  { "name": "helicopter" },
  { "name": "passport" },
  { "name": "ship-container" },
  { "name": "signpost" },
  { "name": "surveillance" },
  { "name": "taxi" },
  { "name": "wifi" },
  { "name": "rain" },
  { "name": "rainHeavy" },
  { "name": "sea" },
  { "name": "sun" },
  { "name": "sunshine" }
]
```

---

## NightDayLayer

Renders a night/day terminator overlay.

```json
{
  "Show": false,
  "Current": ""
}
```

`"Current"` can be bound to a ViewState containing an ISO timestamp to animate the terminator over time.

---

## TileServer

Configure a self-hosted MapLibre tile server (used when `MapDetails.Offline: true`).

```json
{
  "Enable": false,
  "Style": "",
  "Font": "Open Sans Bold",
  "UseApiUrl": false,
  "ApiUrl": ""
}
```

| Field | Notes |
|---|---|
| `Enable` | Must be `false` when `Offline: true`. |
| `Style` | Style JSON URL for the local tile server. |
| `Font` | Font stack for labels on the tile server. |
| `UseApiUrl` | Use a custom API URL for the tile server. |
| `ApiUrl` | Custom tile server API URL. |

---

## ExternalAPI

Overlay tiles from an external provider (e.g. ArcGIS, HERE) on top of the base map.

```json
{
  "Enable": false,
  "URL": "",
  "Key": "",
  "Style": "arcgis/streets"
}
```

---

## Export

Trigger a map image export programmatically.

```json
{
  "Filename": "<output-filename>",
  "Data": "",
  "TriggerExport": { "_dashboardsType": "viewstate", "value": "<triggerViewState>" }
}
```

---

## Interactions

Enable or disable individual map interaction controls.

```json
{
  "scrollZoom": true,
  "boxZoom": true,
  "dragRotate": true,
  "dragPan": true,
  "keyboard": true,
  "doubleClickZoom": true,
  "touchZoomRotate": true
}
```

Set any field to `false` to disable that interaction (e.g. lock the map to prevent user panning).

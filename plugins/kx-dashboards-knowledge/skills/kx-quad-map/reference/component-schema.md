[← Back to SKILL.md](../SKILL.md)

# kx-quad-map — Component JSON Schema Reference

> The canonical QuadMap `options` object, the full per-layer schemas (Circle / Icon / Line), the WTMS / Annotation / Export field tables, and the sub-sections summary.

**Contents:**
- [Top-Level Component Wrapper](#top-level-component-wrapper)
- [Basics](#basics)
- [WTMS (WMTS Service Config)](#wtms-wmts-service-config)
- [Points (array of data layer objects)](#points-array-of-data-layer-objects)
  - [Common Properties (all layer types)](#common-properties-all-layer-types)
  - [Circle Layer](#circle-layer)
  - [Icon Layer](#icon-layer)
  - [Line Layer](#line-layer)
- [Annotation](#annotation)
- [Export](#export)
- [Sub-Sections — Summary](#sub-sections--summary)

---

## Top-Level Component Wrapper

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
    "Basics": { ... },
    "WTMS": { ... },
    "Points": [ ... ],
    "Annotation": { ... },
    "Export": { ... },
    "Style": { "advanced": "" },
    "format": {}
  }
}
```

---

## Basics

Controls initial camera position, base layer, and tile server source.

```json
{
  "Name": "",
  "MapGeneration": "WMTS",
  "Projection": "WGS 84",
  "CenterLat": 0,
  "CenterLng": 0,
  "Zoom": 2,
  "FitToData": true,
  "DefaultLayer": "none",
  "TileServer": "",
  "TileServerProjection": "Mercator"
}
```

| Field | Notes |
|---|---|
| `MapGeneration` | Always `"WMTS"` — the only supported generation mode. |
| `Projection` | WMTS tile projection: `"WGS 84"` (EPSG:4326) or `"Mercator"` (EPSG:3857). |
| `CenterLat` / `CenterLng` | Initial map centre. |
| `Zoom` | Initial zoom level (0–28). |
| `FitToData` | `true` to auto-zoom and fit the map extent to loaded data. |
| `DefaultLayer` | Base map layer: `"none"` \| `"Open Street (Default)"` \| `"Tile Server"`. |
| `TileServer` | URL of a custom XYZ/TMS tile server. Used when `DefaultLayer` is `"Tile Server"`. |
| `TileServerProjection` | Projection of the custom tile server: `"WGS 84"` or `"Mercator"`. |

---

## WTMS (WMTS Service Config)

Configure a WMTS tile service. Note: the JSON key is `WTMS` (not `WMTS`).

```json
{
  "URL": "",
  "WrapX": false,
  "OriginX": -180,
  "OriginY": 90
}
```

| Field | Notes |
|---|---|
| `URL` | WMTS capabilities or tile URL. |
| `WrapX` | Wrap tiles across the antimeridian. |
| `OriginX` | Tile grid origin X (longitude). Default `-180`. |
| `OriginY` | Tile grid origin Y (latitude). Default `90`. |

---

## Points (array of data layer objects)

Each entry in `Points` is one data layer. Set `DataType` to `"Circle"`, `"Icon"`, or `"Line"` to select the layer type. The remaining properties depend on the chosen `DataType`.

### Common Properties (all layer types)

```json
{
  "possiblePoints": [],
  "DataType": "Circle",
  "Name": "",
  "Visible": true,
  "Coordinates": "lat/lng",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "ShowTooltip": false,
  "Tooltip": "{{id}}",
  "Labels": {
    "UseLabel": false,
    "Label": "",
    "Size": 8,
    "OffsetX": 0,
    "OffsetY": 0,
    "TextBaseLine": "center",
    "Color": "#ffffff"
  },
  "Selected": {
    "Color": "#ff0000",
    "Column": "",
    "SelectedItem": ""
  },
  "Actions": []
}
```

**`Coordinates`:** `"lat/lng"` (WGS 84) | `"x/y"` (Cartesian)

**`Actions` array item:**
```json
{
  "Current": "<source-column>",
  "Target": { "_dashboardsType": "viewstate", "value": "<viewstate-path>" },
  "_Type": "map",
  "Trigger": "Click"
}
```

**`Trigger` values:** `"Click"` | `"Hover"`

---

### Circle Layer

Add `"DataType": "Circle"` and a `Circle` sub-object. Supports optional clustering.

```json
{
  "possiblePoints": [],
  "DataType": "Circle",
  "Name": "My Circles",
  "Visible": true,
  "Cluster": false,
  "Coordinates": "lat/lng",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "Circle": {
    "Radius": "",
    "FillColor": "",
    "StrokeColor": "",
    "StrokeWidth": ""
  },
  "ShowTooltip": false,
  "Tooltip": "{{id}}",
  "Labels": { "UseLabel": false, "Label": "", "Size": 8, "OffsetX": 0, "OffsetY": 0, "TextBaseLine": "center", "Color": "#ffffff" },
  "Selected": { "Color": "#ff0000", "Column": "", "SelectedItem": "" },
  "Actions": []
}
```

**`Circle` field defaults — use `""` unless a data column matches:**

| Field | Set to a column name only if the data contains a column resembling… |
|---|---|
| `Radius` | `radius`, `r`, `size`, `scale` |
| `FillColor` | `fillColor`, `fill`, `color`, `colour` |
| `StrokeColor` | `strokeColor`, `stroke`, `border`, `borderColor` |
| `StrokeWidth` | `strokeWidth`, `lineWidth`, `width`, `thickness` |

If no column name closely matches the property type, leave the field as `""`.

---

### Icon Layer

Add `"DataType": "Icon"` and an `Icon` sub-object. Supports optional clustering.

```json
{
  "possiblePoints": [],
  "DataType": "Icon",
  "Name": "My Icons",
  "Visible": true,
  "Cluster": false,
  "Coordinates": "lat/lng",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "Icon": {
    "Src": "<image-src-column>",
    "Color": "<fill-color-column>",
    "Opacity": 1,
    "Position": "base"
  },
  "ShowTooltip": false,
  "Tooltip": "{{id}}",
  "Labels": { "UseLabel": false, "Label": "", "Size": 8, "OffsetX": 0, "OffsetY": 0, "TextBaseLine": "center", "Color": "#ffffff" },
  "Selected": { "Color": "#ff0000", "Column": "", "SelectedItem": "" },
  "Actions": []
}
```

**`Icon.Position`:** `"base"` (anchor at bottom) | `"center"` (anchor at centre)

---

### Line Layer

Add `"DataType": "Line"` and a `Line` sub-object. Rows with the same `ID` value are joined into a single line geometry when `GroupCoordinate` is `true`.

```json
{
  "possiblePoints": [],
  "DataType": "Line",
  "Name": "My Lines",
  "Visible": true,
  "Coordinates": "lat/lng",
  "DataSource": { "_dashboardsType": "data", "value": "<dataSourceId>" },
  "ID": "<id-column>",
  "Latitude": "<lat-column>",
  "Longitude": "<lng-column>",
  "Line": {
    "GroupCoordinate": true,
    "Width": 2,
    "Color": "#ff0000",
    "Simplify": false,
    "Tolerance": 100,
    "DBColor": "",
    "DBWidth": ""
  },
  "ShowTooltip": false,
  "Tooltip": "{{id}}",
  "Labels": { "UseLabel": false, "Label": "", "Size": 8, "OffsetX": 0, "OffsetY": 0, "TextBaseLine": "center", "Color": "#ffffff" },
  "Selected": { "Color": "#ff0000", "Column": "", "SelectedItem": "" },
  "Actions": []
}
```

| Field | Notes |
|---|---|
| `GroupCoordinate` | Join rows sharing the same `ID` into one line. |
| `DBColor` | Column that overrides `Color` per-line. |
| `DBWidth` | Column that overrides `Width` per-line. |
| `Simplify` | Apply Douglas-Peucker simplification. |
| `Tolerance` | Simplification tolerance (0–10000). |

---

## Annotation

User-drawn polygon and circle annotation tool with optional spatial filtering.

```json
{
  "Filter": true,
  "FilteredIds": "",
  "Zoom": true,
  "Selected": "",
  "HideOnDraw": false
}
```

| Field | Notes |
|---|---|
| `Filter` | Filter data layers to points inside the drawn shape. |
| `FilteredIds` | ViewState path to write the comma-separated IDs of filtered points. |
| `Zoom` | Zoom to the drawn annotation extent. |
| `Selected` | ViewState path to write the selected annotation's GeoJSON. |
| `HideOnDraw` | Hide data layers while drawing for faster responsiveness on large datasets. |

---

## Export

Trigger a PNG map image export via a ViewState change.

```json
{
  "Filename": "map-export",
  "Data": "",
  "TriggerExport": { "_dashboardsType": "viewstate", "value": "<triggerViewState>" }
}
```

| Field | Notes |
|---|---|
| `Filename` | Output filename (without extension). |
| `Data` | ViewState path where the exported Base64 PNG string is written. |
| `TriggerExport` | Bind to a ViewState; any value change triggers export. **Both forms are valid:** the bound form is the viewstate object shown above (`{ "_dashboardsType": "viewstate", "value": "<triggerViewState>" }`); the unbound form is the empty string `""` (as emitted in the minimal example when no export trigger is wired). Use `""` when export is not used. |

---

## Sub-Sections — Summary

| Section | Type | Purpose |
|---|---|---|
| `Basics` | object | Camera position, projection, base layer selection |
| `WTMS` | object | WMTS tile service URL and grid origin |
| `Points` | array | Data layers (Circle / Icon / Line) |
| `Annotation` | object | User-drawn polygon/circle annotation and spatial filter |
| `Export` | object | Programmatic PNG map image export |
| `Style` | object | Advanced CSS injection |

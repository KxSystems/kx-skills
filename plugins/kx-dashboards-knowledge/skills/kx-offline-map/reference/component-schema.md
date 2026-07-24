# kx-offline-map — Component JSON Schema

> The full OfflineMap options envelope, initial camera/tile settings, sub-section summary, and Style block. Back to [SKILL.md](../SKILL.md).

**Contents:** Top-Level Component Wrapper · MapDetails · Available Sub-Sections — Summary · Style

---

## Top-Level Component Wrapper

```json
{
  "id": "<uuid>",
  "key": "OfflineMap",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "1035",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.16.0",
    "Basics": {
      "Name": "",
      "TrackLoadTime": false,
      "LoadTime": ""
    },
    "MapDetails": { ... },
    "Points": [ ... ],
    "Circles": [ ... ],
    "Lines": [ ... ],
    "Heatmap": { ... },
    "HeatmapGrid": { ... },
    "AnimatedCircles": { ... },
    "ConcentricCircles": { ... },
    "Layers": { ... },
    "Bounds": { ... },
    "Annotation": { ... },
    "Icons": [ ... ],
    "NightDayLayer": { ... },
    "TileServer": { ... },
    "ExternalAPI": { ... },
    "Export": { ... },
    "Interactions": { ... },
    "Style": { ... }
  }
}
```

---

## MapDetails

Controls the initial camera position, tile source, and render behaviour.

```json
{
  "Key": "",
  "Latitude": 46.5928,
  "Longitude": 8.3221,
  "Zoom": 1,
  "Theme": "dark",
  "Style": "",
  "Offline": true,
  "UrlStyle": "",
  "LayerSelect": "none",
  "RenderWorldCopies": true,
  "Projection": "mercator"
}
```

> ℹ️ `MapDetails.Theme` sets the map's base style theme (`"dark"` / `"light"`) and is **distinct from** `Style.Theme`, which controls the component's UI chrome (`"Light"` / `"Dark"`). Both are valid, separate fields.

| Field | Notes |
|---|---|
| `Latitude` / `Longitude` | Initial map centre. Accepts literal or ViewState binding. |
| `Zoom` | Initial zoom level (float). |
| `Theme` | Base map style theme — `"dark"` \| `"light"`. Separate from `Style.Theme` (component UI chrome). |
| `Style` | Named built-in style key. Leave `""` to use the default offline style. |
| `Offline` | **Default `true`** — use locally hosted tile server. Set `false` for cloud MapTiler/MapLibre URL. |
| `UrlStyle` | MapTiler/MapLibre style JSON URL. Leave blank when `Offline: true`. |
| `LayerSelect` | Layer selector control. Use `"none"` to hide. |
| `RenderWorldCopies` | Whether to render world copies at low zoom. Default `true`. |
| `Projection` | `"mercator"` (default) or `"globe"`. |

---

## Available Sub-Sections — Summary

| Section | Type | Purpose |
|---|---|---|
| `Points` | array | Point markers from a data source |
| `Circles` | array | Circle markers (radius-scaled) |
| `Lines` | array | Line / route layers |
| `Heatmap` | object | Density heatmap layer |
| `HeatmapGrid` | object | Grid-bucketed heatmap (square / hex) |
| `AnimatedCircles` | object | Pulsing animated circle markers |
| `ConcentricCircles` | object | Multi-ring concentric circles |
| `Layers` | object | GeoJSON / raster / video overlay layers |
| `Bounds` | object | Auto-fit bounds to data extent |
| `Annotation` | object | User-drawn polygon annotations |
| `Icons` | array | Built-in icon registrations |
| `NightDayLayer` | object | Night/day terminator overlay |
| `TileServer` | object | Self-hosted tile server config |
| `ExternalAPI` | object | External tile provider overlay |
| `Export` | object | Programmatic map image export |
| `Interactions` | object | Enable/disable map interaction controls |
| `Style` | object | Theme, feature colours, and 3D extrusion |

---

## Style

Controls map colour theme, feature colours, and optional 3D building extrusion.

```json
{
  "Theme": "Light",
  "advanced": "",
  "colors": {
    "lineColor": "#226688",
    "innerLineColor": "#fff",
    "pink": "#a6a6a6",
    "purple": "#a6a6a6",
    "blue": "#a6a6a6",
    "torquoise": "#a6a6a6",
    "green": "#a6a6a6",
    "yellow": "#a6a6a6",
    "orange": "#a6a6a6",
    "red": "#a6a6a6",
    "white": "#a6a6a6",
    "background": "#171717"
  },
  "extrusion": {
    "extrude": false,
    "source": "composite",
    "sourceLayer": "building",
    "minZoom": 15,
    "fillColor": "#aaa",
    "fillOpacity": 60
  }
}
```

| Field | Notes |
|---|---|
| `Theme` | `"Light"` \| `"Dark"` — overall UI chrome theme (distinct from `MapDetails.Theme`). |
| `advanced` | Raw CSS injected into the component. |
| `colors` | Named feature colour overrides applied to the map style. |
| `extrusion.extrude` | `true` to enable 3D building extrusion layer. |
| `extrusion.minZoom` | Zoom level at which extrusion becomes visible. |


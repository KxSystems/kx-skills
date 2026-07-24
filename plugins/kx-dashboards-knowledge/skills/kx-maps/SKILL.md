---
name: kx-maps
description: "Use this only when the user explicitly wants a KX Dashboards Google Maps GeoMap. For standard offline or custom tile-server maps, use kx-offline-map or kx-quad-map instead."
requires:
  - kx-dashboard-core
---

# KX Map Components — GeoMap (Google Maps)

> ⭐ **OfflineMap (MapLibre/MapTiler) is the DEFAULT map type for KX Dashboards.**
> Unless the user explicitly asks for Google Maps, read the **kx-offline-map** skill instead.

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

## ⚠️ Map-Specific Hazards

- **GeoMap requires a Google Maps API key** set in `MapDetails.MapKey`.
- Map components are schema-heavy — use a working exported dashboard as a base and swap data bindings rather than building from scratch.

---

# GEOMAP — Google Maps

`key: "GeoMap"` · `definitionId: "46"`

## Basics

```json
{
  "ComponentName": "GeoMap",
  "Focus": "",
  "Theme": "Dark",
  "Name": ""
}
```

## MapDetails (key sub-section)

```json
{
  "Type": "roadmap",
  "Zoom": 10,
  "CenterX": 0,
  "CenterY": 0,
  "MapKey": "<google-maps-api-key>",
  "Style": ""
}
```

**`Type`:** `"roadmap"` | `"satellite"` | `"terrain"` | `"hybrid"`

## Available Sub-Sections

| Section | Purpose |
|---|---|
| `Points` | Lat/lng data binding, icon, colour, tooltip |
| `OverLay` | GeoJSON choropleth overlay |
| `Heatmap` | Density heatmap layer |
| `Lines` | Line/route layer |
| `Circles` | Circle markers |
| `Voronoi` | Voronoi diagram layer |
| `Bounds` | Auto-fit bounds to data |

> GeoMap is schema-heavy. Copy a working GeoMap export and adapt the data binding rather than building from scratch.

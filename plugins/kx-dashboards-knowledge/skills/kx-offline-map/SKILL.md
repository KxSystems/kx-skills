---
name: kx-offline-map
description: "Generate KX Dashboards OfflineMap components (MapLibre/MapTiler, definitionId=1035). ⭐ DEFAULT map type — use this whenever the user asks for a map, geographic visualization, points on a map, heatmap, animated circles, GeoJSON overlay, offline map, or tile map in a KX Dashboard, UNLESS the user explicitly requests Google Maps (use kx-maps GeoMap). Covers all sub-sections: Points, Circles, Lines, Heatmap, HeatmapGrid, AnimatedCircles, ConcentricCircles, Layers, Annotation, Bounds, Icons, NightDayLayer, TileServer, ExternalAPI, Export, and Interactions. For WMTS / OpenLayers custom tile-server maps use kx-quad-map instead."
requires:
  - kx-dashboard-core
---

# KX OfflineMap Component — MapLibre / MapTiler

`key: "OfflineMap"` · `definitionId: "1035"`

> ⭐ **This is the DEFAULT map type for KX Dashboards.** Use OfflineMap unless the user explicitly asks for Google Maps (GeoMap).
>
> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the workflow, hazards, and pointers are here; the bulky JSON schema, per-section field blocks, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The full OfflineMap options envelope — top-level wrapper, `MapDetails` camera/tile settings, the sub-section summary table, and the `Style` block (theme, feature colours, 3D extrusion). |
| [reference/map-blocks.md](reference/map-blocks.md) | Field blocks and tables for a specific layer/feature — Points, Circles, Lines, Heatmap, HeatmapGrid, AnimatedCircles, ConcentricCircles, Layers, Bounds, Annotation, Icons, NightDayLayer, TileServer, ExternalAPI, Export, Interactions. |
| [reference/examples.md](reference/examples.md) | A reusable tooltip Handlebars pattern and a minimal working Points-layer component to copy from. |

---

## ⚠️ OfflineMap-Specific Hazards

- **`Offline: true`** is the default. It requires a locally hosted tile server (configured via `TileServer`). Set `false` only when targeting cloud MapTiler/MapLibre URLs.
- **`UrlStyle`** accepts a MapTiler style URL, e.g. `https://api.maptiler.com/maps/streets/style.json?key=<key>`. Leave blank when `Offline: true`.
- Sub-sections like `Points`, `Circles`, and `Lines` are **arrays** — each layer is an object in the array.
- **`possiblePoints` / `possibleCircles` / `possibleLines`** fields are auto-populated column lists — leave as `[""]` when building from scratch.
- OfflineMap is schema-heavy — always start from the full schema below and adapt bindings rather than building from scratch.


---

## Workflow

1. **Start from the full schema.** OfflineMap is schema-heavy — copy the top-level wrapper and `options` envelope from `reference/component-schema.md` rather than building from scratch.
2. **Set `MapDetails`.** Configure the initial camera (`Latitude`, `Longitude`, `Zoom`, `Projection`) and tile mode (`Offline`, `UrlStyle`) — field notes are in `reference/component-schema.md`.
3. **Add the layers you need.** For each requested feature (points, circles, lines, heatmap, animated circles, GeoJSON overlay, etc.) copy its block from `reference/map-blocks.md` and bind `DataSource` plus the lat/lng/ID columns.
4. **Wire icons, bounds, and interactions.** Include the full default `Icons` list, set `Bounds`/`Annotation`/`Interactions` as needed — all in `reference/map-blocks.md`.
5. **Style the map.** Set `Style.Theme` and any feature-colour or extrusion overrides from `reference/component-schema.md` (note `MapDetails.Theme` vs `Style.Theme`).
6. **Validate** against the Hazards above, and copy the tooltip/minimal patterns from `reference/examples.md` when they match the request.

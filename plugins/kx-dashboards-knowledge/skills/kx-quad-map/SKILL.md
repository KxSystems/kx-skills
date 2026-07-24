---
name: kx-quad-map
description: "Generate KX Dashboards QuadMap components (OpenLayers/WMTS, definitionId=1036). Use QuadMap when the user asks for a tile-server map, WMTS map, or OpenLayers map. QuadMap supports Circle/Icon/Line data layers and annotation drawing, but for a standard point/line map without a custom tile server prefer kx-offline-map. For requests involving Google Maps use kx-maps GeoMap; for MapLibre/MapTiler use kx-offline-map. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX QuadMap Component — OpenLayers / WMTS

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

`key: "QuadMap"` · `definitionId: "1036"` · `version: "v2.19.0"`

This skill uses **progressive disclosure**: the component identity, the QuadMap-specific hazards, the workflow, and the output checklist are here; the bulky per-layer JSON schemas, field tables, and the full worked example live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The canonical `options` object, the top-level wrapper, the `Basics` / `WTMS` field tables, the per-layer schemas (Circle / Icon / Line common properties and sub-objects), the `Actions` item shape, and the `Annotation` / `Export` field tables plus the sub-sections summary. |
| [reference/examples.md](reference/examples.md) | A complete copy-ready minimal working example — a Circle-layer QuadMap with OpenStreetMap base layer. |

---

## ⚠️ QuadMap-Specific Hazards

- **`WTMS.URL`** (note spelling — the JSON key is `WTMS`, not `WMTS`) must be set when `Basics.DefaultLayer` is `"Tile Server"`.
- **`Points`** is an **array** of data layer objects, each with its own `DataType` (`"Circle"`, `"Icon"`, or `"Line"`). Do not confuse it with a single object.
- **`possiblePoints`** in each layer is auto-populated by the UI — always emit it as `[]` when building from scratch.
- Tile server changes require a **page reload** to take effect (`DefaultLayer` tooltip: "Requires a page restart to see the new Default layer").
- `Basics.Projection` controls the WMTS tile projection (`"WGS 84"` = EPSG:4326, `"Mercator"` = EPSG:3857). Match this to your tile server's native projection.
- The component uses OpenLayers — it is **not** MapLibre/MapTiler based.

---

## Workflow

1. **Confirm the map source.** Decide `Basics.DefaultLayer` (`"none"` | `"Open Street (Default)"` | `"Tile Server"`) and, if using a tile server, the `TileServer` URL and its projection; set `WTMS.URL` for a WMTS service. Component identity (`key`, `definitionId`, `version`) is in the identity line above.
2. **Set the camera.** Choose `CenterLat` / `CenterLng` / `Zoom`, and `FitToData` if the extent should auto-fit loaded data. See the `Basics` table in `reference/component-schema.md`.
3. **Build the `Points` data layers.** Add one object per layer to the `Points` array. Pick each layer's `DataType` (`"Circle"`, `"Icon"`, or `"Line"`) and wire its `DataSource`, `ID`, `Latitude`, `Longitude`, and the type-specific sub-object. Use the common-properties and per-layer schemas in `reference/component-schema.md`; always emit `possiblePoints: []`.
4. **Wire interactivity (optional).** Add `Actions` items to publish clicked/hovered values to a ViewState, configure `Annotation` for spatial filtering, or `Export` for PNG export. See the `Actions`, `Annotation`, and `Export` sections in `reference/component-schema.md`.
5. **Match the worked example.** Copy the closest shape from `reference/examples.md` and adapt it.
6. **Validate** against the Pre-flight Checklist below.

---

## Pre-flight Checklist

Before returning the JSON, verify:

- [ ] `key` is `"QuadMap"` and `definitionId` is the string `"1036"`
- [ ] `options.Basics.MapGeneration` is `"WMTS"`
- [ ] `WTMS.URL` is set whenever `Basics.DefaultLayer` is `"Tile Server"`
- [ ] `Points` is an **array**; every layer has an explicit `DataType` and its matching sub-object (`Circle` / `Icon` / `Line`)
- [ ] Every layer emits `possiblePoints: []`
- [ ] `Basics.Projection` matches the tile server's native projection
- [ ] Each layer's `DataSource`, `ID`, `Latitude`, and `Longitude` reference real columns from the data source
- [ ] `Export.TriggerExport` is either the viewstate-binding object or `""` — never omitted
- [ ] All `id` fields are unique UUIDs across the entire dashboard

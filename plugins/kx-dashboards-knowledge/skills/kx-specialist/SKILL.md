---
name: kx-specialist
description: "Generate KX Dashboards specialist and visualisation components: EditableList (watchlist, definitionId=668), TreeView (hierarchical tree, definitionId=2002), Trade (Level 2 order book, definitionId=1013), ActionTracker (alert workflow, definitionId=1001), Bitmap (EmbedPy/matplotlib image, definitionId=1999), Graph (force-directed/network graph, definitionId=11110). Triggers: watchlist, editable list, tree, hierarchy, order book, trade book, alert tracker, matplotlib image, network graph, force directed. For PieJS (definitionId=1009) use kx-pie. For Gauge (definitionId=11178) use kx-gauge. For Heatmap (definitionId=5) use kx-heatmap. For PlayBack (definitionId=47) use kx-playback. For Radar (definitionId=1008) use kx-radar. For Breadcrumbs (definitionId=19) use kx-breadcrumbs. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX Specialist & Visualisation Components

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the hazards and the component index are here; the per-component `Basics` schemas, the full Graph schema, kdb+ query examples, and the Visualization-Only table live in `reference/`. Read the reference file when you need a schema to generate from.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schemas.md](reference/component-schemas.md) | The per-component `Basics` schemas (EditableList, TreeView, Trade, ActionTracker, Bitmap), the full Graph component schema, the Bitmap kdb+ query example, and the Visualization-Only reference table. |

---

## ⚠️ Specialist Component Hazards

- **Graph uses `"Basic"` (singular)**, not `"Basics"` — unique inconsistency across the platform.
- **Trade** connects directly to kdb+ via connection name (not a data source binding).
- **Bitmap** query must return `title`, `width`, `height`, `data` columns.
- **Visualization-only components** (Sankey, Sunburst, Contour, ChartJS, ChartVega, ChartIQ, CompareChart) are not supported by `generate.js` — copy a working export and adapt.

---

## Components in This Skill

Full schemas and field notes for each are in [reference/component-schemas.md](reference/component-schemas.md).

| Component | `key` | `definitionId` | Notes |
|---|---|---|---|
| EditableList | `EditableList` | `668` | Watchlist / editable key-value list |
| TreeView | `TreeView` | `2002` | Hierarchical tree; root nodes have `<parent-column>` = `""` or `null` |
| Trade | `Trade` | `1013` | Level 2 order book; direct kdb+ connection, not a data source binding |
| ActionTracker | `ActionTracker` | `1001` | Alert workflow queue; gateway + streaming connections; Datagrid `ColumnsConfiguration` schema |
| Bitmap | `Bitmap` | `1999` | EmbedPy / matplotlib image; query returns `title`, `width`, `height`, `data` |
| Graph | `Graph` | `11110` (older `200`) | Network / force-directed graph; uses `Basic` (singular) |

---

## Moved to dedicated skills

Each of these components has its own skill with the full documentation (all fields, patterns, generate.js config). Read the target skill for any generation.

| Component | Skill | `definitionId` |
|---|---|---|
| PieJS | kx-pie | `1009` |
| Gauge | kx-gauge | `11178` |
| Heatmap | kx-heatmap | `5` |
| PlayBack | kx-playback | `47` |
| Radar | kx-radar | `1008` |
| Breadcrumbs | kx-breadcrumbs | `19` |

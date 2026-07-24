[← Back to SKILL.md](../SKILL.md)

# Specialist Component Schemas

Per-component `Basics` schemas, the full Graph component schema, kdb+ query examples, and the Visualization-Only reference table. See SKILL.md for the hazards and the component index.

---

# EDITABLELIST — Watchlist / Editable Key-Value List

`key: "EditableList"` · `definitionId: "668"`

## Basics

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<listDataSource>" },
  "Dropdown": false,
  "SelectedKey": "<key-column>",
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "<selectedItemViewState>" },
  "Vertical": "Middle",
  "ShowNew": true, "ShowSave": true, "ShowDelete": true,
  "PromptToSave": true, "ConfirmDelete": true,
  "Template": "{{<display-column>}}",
  "isEnabled": true,
  "DefaultEmpty": false
}
```

---

# TREEVIEW — Hierarchical Tree

`key: "TreeView"` · `definitionId: "2002"`

Root nodes have the `<parent-column>` set to `""` or `null`.

## Basics

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<treeDataSource>" },
  "NodeId": "<id-column>",
  "NodeParent": "<parent-column>",
  "NodeText": "<label-column>",
  "NodeIcon": "<icon-column>",
  "NodeOpened": "",
  "Opened":   { "_dashboardsType": "viewstate", "value": "<openedNodesViewState>" },
  "Selected": { "_dashboardsType": "viewstate", "value": "<selectedNodeViewState>" },
  "Checked": [], "CheckParent": false, "CheckOnSelected": false,
  "Template": "",
  "OpenOnSelected": true,
  "ShowSearch": false
}
```

---

# TRADE — Level 2 Order Book

`key: "Trade"` · `definitionId: "1013"`

Connects directly to kdb+ via connection name (not via a data source binding).

## Basics

```json
{
  "Name": "",
  "Connection": "<connection-name>",
  "Theme": "Dark",
  "Symbols":  { "_dashboardsType": "data",      "value": "<symbolListDataSource>" },
  "Panels":   { "_dashboardsType": "viewstate", "value": "<watchlistViewState>" },
  "ColorIncrease": "#baf2dc",
  "ColorDecrease": "#eba4a4",
  "Cells": 6,
  "WeightedAverage": "VWAP",
  "PriceLevel": false
}
```

---

# ACTIONTRACKER — Alert Workflow Queue

`key: "ActionTracker"` · `definitionId: "1001"`

Uses two connections: a gateway connection (fetch) and a streaming connection (live updates).
`ColumnsConfiguration` uses the same 33-field schema as Datagrid (see kx-datagrid).

**`LayoutSplit`:** `"Horizontal"` | `"Vertical"`

## Basics

```json
{
  "DataConnection":          "<gateway-connection-name>",
  "StreamingDataConnection": "<streaming-connection-name>",
  "LayoutSplit":             "Horizontal",
  "DisplayedId": { "_dashboardsType": "viewstate", "value": "<displayedItemViewState>" },
  "AlertId":     { "_dashboardsType": "viewstate", "value": "<alertIdViewState>" },
  "AllowPayloadEditing": true,
  "FollowSelectedValue": true,
  "ShowPagingControl": true,
  "EnableCustomLayoutConfiguration": false,
  "EnableVisualNotifications": false,
  "EnableAudioNotifications": false,
  "PollingIntervalSec": 3,
  "MaxRows": -10000,
  "UseDropdownTransitions": false,
  "CreateAction": false
}
```

---

# BITMAP — EmbedPy / Matplotlib Image

`key: "Bitmap"` · `definitionId: "1999"`

Query must return columns: `title`, `width`, `height`, `data` (raw bytes). `Width` and `Height` ViewStates pass the component's pixel size into the query.

## Basics

```json
{
  "Name": "",
  "Data":   { "_dashboardsType": "data",      "value": "<imageDataSource>" },
  "Width":  { "_dashboardsType": "viewstate", "value": "<widthViewState>" },
  "Height": { "_dashboardsType": "viewstate", "value": "<heightViewState>" },
  "Theme": "Dark"
}
```

## Typical kdb+ Query

```q
{[title;w;h]
  fig: plt.figure[::; (w%100; h%100)];
  ...
  flip `title`width`height`data!(enlist title; enlist w; enlist h; enlist bytes)
}
```

---

# GRAPH — Network / Force-Directed Graph

`key: "Graph"` · `definitionId: "11110"` (older: `"200"`)

⚠️ Uses **`"Basic"`** (singular), not `"Basics"`.

Data sources return node and edge tables. Nodes need at minimum `id`, `label`; edges need `from`, `to`.

## Full Component Schema

```json
{
  "id": "<uuid>", "key": "Graph",
  "containerId": null, "components": [], "widgets": [],
  "definitionId": "11110", "hasOnSettingsChange": true,
  "options": {
    "version": "v2.2.8",
    "Hidden": false,
    "Basic": {
      "Name": "", "Theme": "Dark",
      "Selected":     { "_dashboardsType": "viewstate", "value": "<selectedNodeViewState>" },
      "SelectedEdge": { "_dashboardsType": "viewstate", "value": "<selectedEdgeViewState>" }
    },
    "Data": {
      "Nodes": { "_dashboardsType": "data", "value": "<nodesDataSource>" },
      "Edges": { "_dashboardsType": "data", "value": "<edgesDataSource>" }
    },
    "Layout": {
      "randomSeed": 1111,
      "hierarchical": {
        "enabled": false, "levelSeparation": 150,
        "nodeSpacing": 100, "direction": "UD"
      },
      "clusterScale": 0, "randomLayoutPattern": false
    },
    "Physics": {
      "enabled": false, "maxVelocity": 50, "minVelocity": 0.1,
      "gravitationalConstant": 2000, "centralGravity": 0.3,
      "springLength": 95, "springConstant": 0.04,
      "maxStepsBeforeRendering": 1000, "haltPhysicsAfterRendering": false
    },
    "Interaction": { "dragNodes": true, "dragView": true, "selectConnectedEdges": true },
    "Nodes": {
      "borderWidth": 1, "borderWidthSelected": 2,
      "color": {
        "border": "#999", "background": "#97C2FC",
        "highlight": { "border": "#1795D3", "background": "#FFFF7A" },
        "hover":     { "border": "#2B7CE9", "background": "#D2E5FF" }
      }
    },
    "Edges": {
      "width": 1, "selectionWidth": 2,
      "arrows": {
        "to":   { "enabled": true,  "scaleFactor": 1 },
        "from": { "enabled": false, "scaleFactor": 1 }
      },
      "color": { "color": "#999", "highlight": "#848484", "hover": "#848484" }
    },
    "Tooltips": { "ShowTooltip": false, "Template": "" },
    "Actions": [],
    "Style": { "advanced": "", "cssClasses": "" },
    "Alignment": {},
    "format": {}
  }
}
```

**`Layout.hierarchical.direction`:** `"UD"` | `"LR"` | `"DU"` | `"RL"`
Set `"Physics.enabled": true` for force-directed; `false` for hierarchical/static.

---

# Visualization-Only Reference

These components are **not supported by `generate.js`**. Copy a working exported dashboard and adapt the data binding.

| Component | `key` | `definitionId` | Key `Basics` / top-level fields |
|---|---|---|---|
| Sankey | `Sankey` | `134` | `Data`, `AggregateColumn`, `Focus` |
| Sunburst | `Sunburst` | `1134` | `Data`, `Focus`, `NodeClick`, `Selected`, `Theme` |
| Contour | `Contour` | `135` | `Data`, `Type`, `ShowScale`, `Theme` |
| ChartJS | `ChartJS` | `1007` | `Layers`, `XAxes`, `YAxes`, `Legend`, `Zoom`, `Overlay` |
| ChartVega | `ChartVega` | `100` | `Data`, `Config` (Vega-lite spec), `Renderer` |
| ChartIQ | `ChartIQ` | `79` | `Layers`, `Axes`, `Options` (ChartIQ config object) |
| CompareChart | `CompareChart` | `43` | `Data`, `ChartType`, `Theme`, `NodeLabels`, `NodeValues` |

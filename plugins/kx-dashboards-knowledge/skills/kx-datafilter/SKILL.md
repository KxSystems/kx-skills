---
name: kx-datafilter
description: "Generate KX Dashboards input and filter components: DataFilter (visual filter builder, definitionId=48) and QueryBuilder (visual kdb+ query constructor, definitionId=10254). Use when the user asks for a filter panel, filter builder, AND/OR filter, or query builder for a grid or chart. Critical: DataFilter requires a two-data-source + ViewState bridge — always follow that pattern. For parameter input forms and Dataform (definitionId=27) use the kx-dataform skill instead. Not for a simple single/multi value picker bound to a ViewState (use kx-dropdown or kx-selectioncontrols). Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX DataFilter & QueryBuilder Components

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

## ⚠️ DataFilter-Specific Hazards

- **`kdbString` must be a ViewState reference** — never an empty string. Set it to `{ "_dashboardsType": "viewstate", "value": "<filterStrViewState>" }`.
- **Always use the two-data-source bridge pattern** (raw source for schema + filtered source for results). Components that should respond to the filter bind to the **filtered** source, not the raw one.
- **`queryModel`** must be initialised as `"{\"operator\":\"AND\",\"children\":[]}"` — not `""`.
- **`Items[].propertyName`** must exactly match the kdb+ column name.
- **`definitionId` is `"48"`** (not `"101"` — that is an older value; always use `"48"`).

---

# DATAFILTER

`key: "DataFilter"` · `definitionId: "48"` · `version: "v2.19.0"`

## Integration Pattern — Two-Data-Source Bridge

The DataFilter works via a three-part wiring:

```
DataFilter ──(reads schema from)──▶  rawDataSource      (plain select)
DataFilter ──(writes filter to)───▶  filterStr ViewState
filteredDataSource ──(reads VS)───▶  .dfilt.apply[select from <Table>; s]
Datagrid   ──(reads from)─────────▶  filteredDataSource
```

Any component responding to the filter must bind to `filteredDataSource`, not `rawDataSource`.

## generate.js config

Set `componentType: "datafilter"`.

| Field | Description |
|---|---|
| `dataSource` | Raw data source name (for schema discovery) |
| `filterItems` | Array of `{ column, dataSource?, items?, fieldSummaryThreshold? }` |
| `bindings` | Array of `{ key, viewState }` |
| `useViewStates` | Boolean — use ViewState bindings for filter values |
| `clearIfNotInSource` | Boolean — clear filters when source changes |

## ViewState (string type)

```json
"<filterStrViewState>": {
  "_viewType": true,
  "_type": "string",
  "_default": ""
}
```

## Raw Data Source

```json
"<rawDataSource>": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "select from <Table>",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

## Filtered Data Source

```json
"<filteredDataSource>": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "{[s]\n  .dfilt.apply[select from <Table>;s]\n}",
  "_queryParams": [
    {
      "name": "s", "index": 0, "type": "string",
      "value": "<%<filterStrViewState>%>",
      "IsKdbParam": true, "isViewState": true
    }
  ],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

`.dfilt.apply` is a KX Dashboards server-side function available on any kdb+ process running the KX Dashboards backend.

## DataFilter Component

```json
{
  "id": "<uuid>", "key": "DataFilter",
  "containerId": null, "components": [], "widgets": [],
  "definitionId": "48", "hasOnSettingsChange": true,
  "options": {
    "version": "v2.19.0",
    "Basics": {
      "Name": "<filter panel name>",
      "data": { "_dashboardsType": "data", "value": "<rawDataSource>" },
      "queryModel": "{\"operator\":\"AND\",\"children\":[]}",
      "kdbString": { "_dashboardsType": "viewstate", "value": "<filterStrViewState>" },
      "UseViewStates": false,
      "clearIfNotInSource": false
    },
    "Bindings": [],
    "Items": [
      { "propertyName": "<column1>", "data": "", "items": [], "FieldSummaryThreshold": 5 },
      { "propertyName": "<column2>", "data": "", "items": [], "FieldSummaryThreshold": 5 }
    ],
    "Actions": [],
    "Style": {
      "advanced": "", "cssClasses": "",
      "HistogramBuckets": 50,
      "HistogramColor": "#0071cd"
    },
    "Alignment": {},
    "format": { "SortListBySelected": false }
  }
}
```

**Key fields:**
- `"data"` (lowercase) — raw data source for schema discovery
- `"queryModel"` — initialise as the empty AND tree string above
- `"kdbString"` — ViewState reference (string type), NOT an empty string
- `"clearIfNotInSource": false` — prevents filters being wiped on source change
- `"Items"` — one entry per filterable column; `propertyName` must exactly match the column name

## Datagrid Binding

The Datagrid (or any linked component) binds to the **filtered** source:

```json
"Data": { "_dashboardsType": "data", "value": "<filteredDataSource>" }
```

## Complete Example — Cars Table

```json
// ViewState
"filterStr": { "_viewType": true, "_type": "string", "_default": "" }

// Data sources
"carsData": {
  "_queryString": "select from Cars",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
"carsDataFiltered": {
  "_queryString": "{[s]\n  .dfilt.apply[select from Cars;s]\n}",
  "_queryParams": [
    { "name": "s", "index": 0, "type": "string",
      "value": "<%filterStr%>", "IsKdbParam": true, "isViewState": true }
  ],
  "_autoExecute": true, "_autoExec": true
}

// DataFilter  → data source: carsData       (schema)
// DataFilter  → kdbString:   filterStr      (publishes filter)
// Datagrid    → Data:        carsDataFiltered
```

---

# QUERYBUILDER

`key: "QueryBuilder"` · `definitionId: "10254"`

**`Direction`:** `"Left-Right"` | `"Top-Down"`
**`DialogPlacement`:** `"Pop-up"` | `"Inline"`

```json
"Basics": {
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<resetDataSource>" },
  "Connection": "<connection-name>",
  "Selected": { "_dashboardsType": "viewstate", "value": "<selectedNodeViewState>" },
  "JSON":  { "_dashboardsType": "viewstate", "value": "<queryJsonViewState>" },
  "qIPC": { "_dashboardsType": "viewstate", "value": "<kdbStringViewState>" },
  "Theme": "Dark", "ReadOnly": false,
  "Direction": "Left-Right", "DialogPlacement": "Pop-up",
  "AutoSave": false, "UseViewStates": false, "ForceSelection": false
}
```

---

# DATAFORM

> **Moved.** Full Dataform documentation (generate.js config, Basics, form fields, field types, style) is in the **kx-dataform** skill. Read that skill for any Dataform (`key: "Dataform"`, `definitionId: "27"`) generation.

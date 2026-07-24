---
name: kx-dashboard-core
description: "Use this when building or editing any KX Dashboards JSON dashboard: start here for the dashboard envelope, screens, widget wrapper, ViewState, data sources, actions, notifications, deployment, and the pre-flight checklist. Load it before component skills such as kx-chartgl, kx-datagrid, kx-pivot-grid, or kx-query when you are assembling a full dashboard or wiring its shared infrastructure."
---

# KX Dashboard Core — Shared Infrastructure

> **Always read this skill before any component-specific skill.** Every other `kx-*` skill depends on the definitions here.

---

## ⚠️ Agent Hazards — Read First

1. **`id` / `hash` / filename must be identical.** Generate the UUID once; use it for `id`, `hash`, and `{uuid}.json`.
2. **ViewState names are case-sensitive and path-sensitive.** `Trade Filters/sym` ≠ `trade filters/sym`. Separator is `/`.
3. **`key` drives the entire schema.** Never copy a Datagrid options block under a ChartGL key or vice versa.
4. **`possibleXColumns`, `possibleYColumns`, etc. must list actual query column names.**
5. **Widget IDs must be unique across the entire dashboard**, not just within one screen.
6. **Update `screenDetails` and `screens` together.** Mismatch corrupts navigation.
7. **Connection name must match exactly.** `_connection: "tradefeed"` requires a file whose `name` is also `"tradefeed"`.
8. **`Format: "General"` ignores `Precision`.** Use `"Number"` or `"Formatted Number"` to enforce decimal places.
9. **`advancedCss` is a JSON string.** Escape quotes and newlines.
10. **Navigation actions always fire last** regardless of list order.
11. **Graph uses `"Basic"` (singular), not `"Basics"`.** Unique inconsistency.
12. **DataFilter `kdbString` must be a ViewState reference**, not an empty string.

---

## Workflow

### Step 1 — Gather inputs (AskUserQuestion)

Always ask:
- Component type (see Component Registry below)
- Dashboard name
- kdb+ connection name (e.g. `html5evalcongroup`)
- Query string and column names returned
- Theme: `Dark` or `Light`
- Deploy directly to `~/.kx/dashboards/data/dashboards/`?

### Step 2 — Generate JSON using `generate.js`

```bash
node generate.js --config my.config.json [--out output.json] [--deploy]
```

`componentType` values: `"chartgl"` | `"chart3d"` | `"datagrid"` | `"datatable"` | `"datafilter"` | `"dataform"` | `"breadcrumbs"` | `"gauge"` | `"button"` | `"radar"`.
For other types, build the component object manually using the schema in the relevant `kx-*` skill.

### Step 3 — Save and share

- **Import:** save to outputs folder, provide download link.
- **Deploy:** write to `~/.kx/dashboards/data/dashboards/{id}.json`.

---

## File System Deployment

```
~/.kx/dashboards/
└── data/
    ├── dashboards/
    │   └── {dashboard-id}.json
    └── connections/
        └── {connection-name}.json
```

Dashboard filename **must** be `{id}.json`; `id` and `hash` must equal the filename stem.

> Connection file format and all data source / query patterns → see **kx-query** skill.

---

## UUID Generation

```js
const { randomUUID } = require('crypto');
```

Generate once per entity. Use the **same** UUID for `id`, `hash`, and the filename. Never let them drift.

---

## Top-Level Dashboard Envelope

```json
{
  "id": "<uuid-v4>",
  "name": "<dashboard name>",
  "creationDate": "<ISO timestamp>",
  "lastUpdateDate": "<ISO timestamp>",
  "hash": "<same as id>",
  "thumb": null,
  "screenDetails": [{ "label": "Screen 1", "value": "<screen-uuid>" }],
  "screens": [],
  "popups": [],
  "tags": [],
  "dashboardTheme": "Dark",
  "themeSwitchable": true,
  "saveTimestamp": null,
  "relativeHeight": true,
  "rowCount": 24,
  "rowHeight": 25,
  "colCount": 36,
  "floatable": false,
  "viewState": {},
  "data": {},
  "worksheetPadding": 10,
  "widgetsSpacing": 10,
  "borderColor": "000000",
  "borderBackground": "000000",
  "transparentBackground": true,
  "borderWidth": 0,
  "borderRounding": 0,
  "borderSpacing": 0,
  "borderShadow": false,
  "saveViewerState": "enabled",
  "hostnameAccess": "",
  "hidePdfGlobalVS": false,
  "enableShareDashboard": true,
  "notifications": null,
  "showLoadingIndicators": true,
  "unsavedViewerPrompt": false,
  "advancedCss": "",
  "cssClasses": "",
  "version": "v2.3.0",
  "wasChanged": false,
  "shortcuts": [],
  "action": "replace",
  "viewStateBinding": false
}
```

> Set `"showLoadingIndicators": false` on dashboards with frequent polling to avoid visual flashing.

---

## Screen

```json
{
  "id": "<uuid>",
  "name": "Screen 1",
  "thumb": null,
  "widgets": [],
  "rowCount": 24,
  "rowHeight": 25,
  "colCount": 36,
  "floatable": false,
  "relativeHeight": true,
  "isDefault": true
}
```

`screenDetails[].value` must match `screens[].id`. One screen must have `"isDefault": true`.

---

## Widget Wrapper

Grid: **36 columns × 24 rows**, 0-indexed. Full-width = `colSpan: 36`.

```json
{
  "id": "<uuid>",
  "layout": { "row": 0, "column": 0, "rowSpan": 20, "colSpan": 36 },
  "component": { }
}
```

- **FlexPanel children:** `"row": null, "column": null` — size fields still required.
- **Panel children:** numeric row/column within the panel's own internal grid.

---

## Shared Blocks (referenced by all components)

```json
"Alignment": {
  "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
  "innerPaddingLeft": 0, "innerPaddingRight": 0, "innerPaddingTop": 0, "innerPaddingBottom": 0,
  "titlePaddingLeft": 0, "titlePaddingRight": 0, "titlePaddingTop": 7, "titlePaddingBottom": 7
},
"format": {
  "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
  "tileBorderWidth": 0, "tileBorderRounding": 0,
  "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
  "tileTransparentBackground": true, "tileShadow": false
}
```

---

## Data Sources

Each named entry under `"data": {}` at the dashboard root. Full schemas, subscription types, ViewState-driven params, kdb+ query patterns, and connection file format → see **kx-query** skill.

Quick reference:
- **`_dataType`:** `"query"` | `"analytic"` | `"virtual"` | `"pykx"` | `"builder"`
- **`_subscriptionType`:** `"static"` | `"polling"` | `"streaming"` | `"subscription"`
- Always write both `_autoExecute: true` **and** `_autoExec: true`.
- `_connection` must match the connection file `name` exactly.

---

## ViewState

Supports **flat** (`sym`) and **grouped** (`Trade Filters/sym`) paths. System ViewStates live in `_settings`.

```json
"viewState": {
  ".settings": {},
  "_settings": {
    "dashboardUser":           { "_viewType": true, "_type": "symbol",    "_default": "" },
    "dashboardTimezone":       { "_viewType": true, "_type": "symbol",    "_default": "" },
    "dashboardUrl":            { "_viewType": true, "_type": "string",    "_default": "" },
    "dashboardTitle":          { "_viewType": true, "_type": "symbol",    "_default": "" },
    "dashboardStartTimestamp": { "_viewType": true, "_type": "timestamp", "_default": "NOW", "_rolling": true }
  },
  "mySymbol": { "_viewType": true, "_default": "EUR/USD", "_type": "symbol" },
  "Trade Filters": {
    "sym":  { "_viewType": true, "_type": "symbol", "_default": "AAPL" },
    "days": { "_viewType": true, "_type": "int",    "_default": 20 }
  }
}
```

**All `_type` values:** `"boolean"` | `"date"` | `"datetime"` | `"dict"` | `"float"` | `"int"` | `"list"` | `"long"` | `"month"` | `"second"` | `"string"` | `"symbol"` | `"time"` | `"timestamp"`

**Rolling syntax:** `"NOW"` | `"NOW+x"` | `"NOW-x"` | `"NOW+hh:mm:ss.sss"` | `"NOW-hh:mm:ss.sss"`

---

## Binding Patterns

```json
{ "_dashboardsType": "data",      "value": "MyQuery" }           // data source ref
{ "_dashboardsType": "viewstate", "value": "mySymbol" }           // flat ViewState
{ "_dashboardsType": "viewstate", "value": "Trade Filters/sym" }  // grouped ViewState
```

In query params: `"<%mySymbol%>"` or `"<%Trade Filters/sym%>"`

---

## Actions

> See **kx-actions** for the full reference: action types (`map`, `nav`, `query`, `url`), trigger values, per-component placement rules, and examples.

---

## Notifications

```json
"notifications": {
  "Notifications": {
    "_Version": "4.2.0s2",
    "Enabled": true,
    "InBrowserNotifications": false,
    "Position": "Bottom Right",
    "MaxVisibleCount": 3,
    "FadeOut": 5,
    "Icon": "fa-bell-o",
    "Sound": "beep",
    "SoundVolume": 100,
    "Grouping": false,
    "GroupingInterval": 1,
    "triggers": [
      {
        "source": { "_dashboardsType": "data", "value": "AlertQuery" },
        "template": "{{#each this}}{{pascalcase @key}}: {{this}}\n{{/each}}",
        "sound": "beep",
        "icon": "fa-bell"
      }
    ]
  }
}
```

---

## Component Registry

| Component | `key` | `definitionId` | Category | Skill file |
|---|---|---|---|---|
| ChartGL | `ChartGL` | `669` | Chart | kx-chartgl |
| ChartJS | `ChartJS` | `1007` | Chart | kx-specialist |
| PieJS | `PieJS` | `1009` | Chart | kx-pie |
| Gauge | `Gauge` | `11178` | Chart | kx-gauge |
| Radar | `Radar` | `1008` | Chart | kx-radar |
| Heatmap | `Heatmap` | `5` | Chart | kx-heatmap |
| Contour | `Contour` | `135` | Chart | kx-specialist |
| Sankey | `Sankey` | `134` | Chart | kx-specialist |
| Sunburst | `Sunburst` | `1134` | Chart | kx-specialist |
| CompareChart | `CompareChart` | `43` | Chart | kx-specialist |
| Chart3D | `Chart3D` | `20` | Chart | kx-chart3d |
| ChartVega | `ChartVega` | `100` | Chart | kx-specialist |
| ChartIQ | `ChartIQ` | `79` | Chart | kx-specialist |
| Datagrid | `Datagrid` | `21` | Grid | kx-datagrid |
| Datatable | `Datatable` | `3` | Grid | kx-pivot-grid |
| EditableList | `EditableList` | `668` | Grid | kx-specialist |
| GeoMap | `GeoMap` | `46` | Map | kx-maps |
| OfflineMap | `OfflineMap` | `1035` | Map | kx-offline-map |
| QuadMap | `QuadMap` | `1036` | Map | kx-quad-map |
| Graph | `Graph` | `11110` / `200` | Network | kx-specialist |
| Dataform | `Dataform` | `27` | Input | kx-dataform |
| DataFilter | `DataFilter` | `48` | Input | kx-datafilter |
| QueryBuilder | `QueryBuilder` | `10254` | Input | kx-datafilter |
| PlayBack | `PlayBack` | `47` | Input | kx-playback |
| BasicComponents (Dropdown) | `BasicComponents` | `16` | Input | kx-dropdown |
| BasicComponents (TextInput) | `BasicComponents` | `33` | Input | kx-textinput |
| BasicComponents (Button) | `BasicComponents` | `25` | Input | kx-button |
| BasicComponents (DatePicker) | `BasicComponents` | `15` | Input | kx-datepicker |
| BasicComponents (SelectionControls) | `BasicComponents` | `34` | Input | kx-selectioncontrols |
| BasicComponents (TextToSpeech) | `BasicComponents` | `36` | Input | kx-texttospeech |
| BasicComponents (Text) | `BasicComponents` | `17` | Display | kx-text |
| BasicComponents (NavigationMenu) | `BasicComponents` | `35` | Navigation | kx-basiccomponents-containers |
| Breadcrumbs | `Breadcrumbs` | `19` | Input | kx-breadcrumbs |
| TreeView | `TreeView` | `2002` | Navigation | kx-specialist |
| Trade | `Trade` | `1013` | Specialist | kx-specialist |
| ActionTracker | `ActionTracker` | `1001` | Specialist | kx-specialist |
| Bitmap | `Bitmap` | `1999` | Specialist | kx-specialist |
| FlexPanel | `FlexPanel` | `1011` | Container | kx-basiccomponents-containers |
| Panel | `Panel` | `50` | Container | kx-basiccomponents-containers |
| Tabs | `Tabs` | `26` | Container | kx-tabs |
| Accordion | `Accordion` | `56` | Container | kx-accordion |
| OverlayPanel | `OverlayPanel` | `57` | Container | kx-basiccomponents-containers |
| FormBuilder | `FormBuilder` | `1014` | Input | kx-formbuilder |

---

## Agent Checklist

Before writing any dashboard file:

- [ ] `id` = `hash` = filename stem (all three identical)
- [ ] All screen IDs in `screenDetails` match entries in `screens`
- [ ] One screen has `"isDefault": true`
- [ ] All widget IDs are unique across the entire dashboard
- [ ] All ViewState names and paths are exact (case-sensitive)
- [ ] All `possibleXColumns`, `possibleYColumns`, etc. list actual column names
- [ ] `_connection` matches the connection file `name` field exactly
- [ ] Both `_autoExecute` and `_autoExec` are present in every data source
- [ ] Column `Format` uses `"Number"` (not `"General"`) wherever precision matters
- [ ] Navigation actions placed last in their list
- [ ] `advancedCss` is properly JSON-escaped

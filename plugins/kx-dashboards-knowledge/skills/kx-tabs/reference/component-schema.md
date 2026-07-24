# kx-tabs — Component JSON Schema Reference

> The Tabs component identity, full options envelope, field tables, UUID map, NL→JSON rules, and ViewState-on-switch wiring. Back to [SKILL.md](../SKILL.md).

**Contents:** Component Identity · Schema · Field Reference · UUID Checklist · NL → JSON Mapping Rules · ViewState on Tab Switch

---

## Component Identity

| Field | Value |
|---|---|
| `key` | `"Tabs"` |
| `definitionId` | `"26"` |
| `options.version` | `"v2.14.0"` |
| `hasOnSettingsChange` | `true` |
| `containerId` | `null` (top-level) |

> **No `generate.js` support.** Unlike Button/Datagrid/ChartGL, there is no `makeTabsWidget` in `kx-dashboard-core/generate.js`. Emit the Tabs JSON directly using the schema below.

---

## Schema

```json
{
  "id": "<tabs-uuid>",
  "key": "Tabs",
  "containerId": null,
  "definitionId": "26",
  "hasOnSettingsChange": true,

  // ── STEP 1: lightweight copy of each child component ──────────────────
  "components": [
    {
      "id": "<child-A-uuid>",          // same UUID reused in widgets[0].component.id
      "key": "Datagrid",               // or ChartGL, Panel, Text, etc.
      "containerId": "<tab-1-uuid>",   // ← assigns this child to Tab 1
      "components": [], "widgets": [],
      "definitionId": "21",
      "hasOnSettingsChange": true,
      "options": {
        "version": "v2.20.0",
        "Basics": { "Data": { "_dashboardsType": "data", "value": "MyQuery" } },
        "ColumnsConfiguration": []     // minimal — full config lives in widgets[]
      }
    }
    // repeat for each additional tab child
  ],

  // ── STEP 2: full, positioned definition of each child ─────────────────
  "widgets": [
    {
      "id": "<widget-A-uuid>",         // separate UUID — the wrapper
      "layout": { "row": 0, "column": 0, "rowSpan": 24, "colSpan": 36 },
      "containerId": "<tab-1-uuid>",   // ← wrapper also needs containerId
      "component": {
        "id": "<child-A-uuid>",        // SAME UUID as components[0].id
        "key": "Datagrid",
        "containerId": "<tab-1-uuid>", // ← component also needs containerId
        "components": [], "widgets": [],
        "definitionId": "21",
        "hasOnSettingsChange": true,
        "options": { /* full Datagrid/ChartGL options — see kx-datagrid / kx-chartgl */ }
      }
    }
    // repeat for each additional tab child
  ],

  "options": {
    "version": "v2.14.0",

    // mirrors Items[] with sequential NUMERIC Id (0, 1, 2 …)
    "dropdownPossibleValues": [
      { "Id": 0, "Name": "Tab 1" },
      { "Id": 1, "Name": "Tab 2" }
    ],

    "Basics": { "ComponentName": "tabs", "Name": "" },

    "Selection": {
      "target_tab": 0,             // 0-based integer; 1 = open on second tab by default
      "unloadInactive": false,     // true = destroy/recreate tab contents on switch (avoid unless needed)
      "expandOnPdf": false,        // true = render all tabs in PDF output
      "SetViewStateOnSelect": {
        "ViewState": "",           // optional: { "_dashboardsType": "viewstate", "value": "activeTab" }
        "Value": "<tabName>"       // literal token: <tabName> or <tabIndex>
      }
    },

    "Items": [
      { "Id": "<tab-1-uuid>", "Name": "Tab 1", "Tooltip": "", "HideTab": false, "HideTabPdf": false },
      { "Id": "<tab-2-uuid>", "Name": "Tab 2", "Tooltip": "", "HideTab": false, "HideTabPdf": false }
    ],

    "Style": { "advanced": "", "cssClasses": "" },
    "Actions": [],
    "Alignment": {
      "paddingLeft": 10, "paddingRight": 10, "paddingTop": 10, "paddingBottom": 10,
      "innerPaddingLeft": 0, "innerPaddingRight": 0, "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0, "titlePaddingTop": 7, "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
      "tileBorderWidth": 0, "tileBorderRounding": 0,
      "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true, "tileShadow": false
    }
  }
}
```

---

## Field Reference

### `options.Items[]` — one entry per tab

| Field | Type | Default | Description |
|---|---|---|---|
| `Id` | string (GUID) | — | **Required, unique.** Fresh UUID per tab. Referenced by every child's `containerId`. |
| `Name` | string | `"Tab N"` | Tab label shown on the tab strip. |
| `Tooltip` | string | `""` | Hover tooltip for the tab. |
| `HideTab` | boolean | `false` | `true` hides the tab in the live dashboard (still defined, reachable via ViewState). |
| `HideTabPdf` | boolean | `false` | `true` excludes the tab from PDF export. |

### `options.Selection`

| Field | Type | Default | Description |
|---|---|---|---|
| `target_tab` | number | `0` | **0-based** index of the tab open by default. `0` = first, `1` = second. |
| `unloadInactive` | boolean | `false` | `true` destroys an inactive tab's contents and rebuilds on re-entry (saves memory; resets state). Leave `false` unless asked. |
| `expandOnPdf` | boolean | `false` | `true` renders every tab in PDF output instead of just the active one. |
| `SetViewStateOnSelect.ViewState` | object \| `""` | `""` | Optional ViewState to publish on tab switch — `{ "_dashboardsType": "viewstate", "value": "<vs>" }`. |
| `SetViewStateOnSelect.Value` | string | `"<tabName>"` | Token written to the ViewState: `<tabName>` (the tab's `Name`) or `<tabIndex>` (its 0-based index). |

### `options.dropdownPossibleValues[]`

Mirrors `Items[]` for the property-editor dropdown. **Numeric** sequential `Id` starting at `0`; `Name` matches the corresponding `Items[].Name`. Always keep its length and order in sync with `Items[]`.

### `options.Basics`

| Field | Type | Value | Description |
|---|---|---|---|
| `ComponentName` | string | `"tabs"` | **Required** — must always be `"tabs"`. |
| `Name` | string | `""` | Optional tile title shown above the tab strip. |

`Style`, `Actions`, `Alignment`, and `format` follow the shared component blocks (see kx-dashboard-core). Keep them present and complete.
---

## UUID Checklist (2-tab layout)

| UUID | Used in |
|---|---|
| `<tabs-uuid>` | Tabs component `id` |
| `<tab-1-uuid>` | `Items[0].Id`, `components[0].containerId`, `widgets[0].containerId`, `widgets[0].component.containerId` |
| `<tab-2-uuid>` | `Items[1].Id`, `components[1].containerId`, `widgets[1].containerId`, `widgets[1].component.containerId` |
| `<child-A-uuid>` | `components[0].id` = `widgets[0].component.id` (same UUID) |
| `<child-B-uuid>` | `components[1].id` = `widgets[1].component.id` (same UUID) |
| `<widget-A-uuid>` | `widgets[0].id` (wrapper) |
| `<widget-B-uuid>` | `widgets[1].id` (wrapper) |

**Total: 7 UUIDs for a 2-tab layout with one child each.** Add 1 per extra tab (tab `Id`), and 2 per extra child (child id + wrapper id).

---

## NL → JSON Mapping Rules

| Natural Language | Property | Notes |
|---|---|---|
| "tabs named A, B, C" / "tabs for X and Y" | `Items[].Name` | One `Items[]` entry per name; mirror into `dropdownPossibleValues`. |
| "N tabs" | `Items[]` length | Generate N entries with fresh GUIDs; default names `Tab 1…N`. |
| "open on the second tab" / "default to <name>" | `Selection.target_tab` | 0-based integer (second tab → `1`). |
| "put a grid/chart in tab X" | child with `containerId` = that tab's `Id` | Add to **both** `components[]` and `widgets[]`. |
| "tooltip on tab X" | `Items[n].Tooltip` | Plain string. |
| "hide tab X" / "hidden tab" | `Items[n].HideTab: true` | Hidden from the tab strip; still reachable via ViewState. |
| "exclude tab X from PDF" | `Items[n].HideTabPdf: true` | — |
| "show all tabs in PDF" | `Selection.expandOnPdf: true` | — |
| "reload tab when switching" / "don't keep inactive tabs in memory" | `Selection.unloadInactive: true` | Resets the tab's state on each switch. |
| "publish active tab to a ViewState" / "react when tab changes" | `Selection.SetViewStateOnSelect` | See ViewState section below. |
| "title the tabs panel …" | `Basics.Name` | Tile title. |

---

## ViewState on Tab Switch

To let other components (or parameterised queries) react when the user switches tabs:

```json
// dashboard viewState (see kx-dashboard-core)
"activeTab": { "_viewType": true, "_type": "symbol", "_default": "Tab 1" }

// Tabs options.Selection
"SetViewStateOnSelect": {
  "ViewState": { "_dashboardsType": "viewstate", "value": "activeTab" },
  "Value": "<tabName>"          // or "<tabIndex>" to publish the 0-based index
}
```

Queries parameterised with `<%activeTab%>` re-execute automatically on switch.

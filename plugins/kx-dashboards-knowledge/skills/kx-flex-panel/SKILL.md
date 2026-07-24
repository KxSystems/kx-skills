---
name: kx-flex-panel
description: "Use this when a KX Dashboards layout needs a fixed header, footer, or sidebar beside a flexible main content area. Use it for pinned-plus-fill layouts; use kx-basiccomponents-containers for general panels and drawers and kx-tabs for tabbed switching."
requires:
  - kx-dashboard-core
---

# FlexPanel — Fixed Region + Flexible Content

`key: "FlexPanel"` · `definitionId: "1011"`

> Also read **kx-dashboard-core** for envelope, screen/widget wrapper, data sources, and ViewState.

---

## When to Use

Use FlexPanel when the user asks for a **pinned/fixed** header, footer, or sidebar. For all other layouts use **Panel** (`definitionId: "50"`).

---

## ⚠️ Hazards

1. **Fixed region is always `widgets[0]`, main content is always `widgets[1]`** — this applies to every orientation without exception.
2. **`horizontalbottom` is counter-intuitive** — the footer is `widgets[0]` even though it renders at the *bottom* of the screen. The `layout` value controls screen position, not array order.
3. **Exactly 2 children** — a third widget will not render.
4. **`"row": null, "column": null`** on every child layout — but `rowSpan`/`colSpan` are still required.
5. **`minSize` is pixels**, not grid units. Typical: `60`–`120` header, `40`–`60` footer, `200`–`280` sidebar.

---

## Ordering Rule

```
widgets[0] → fixed region   Text, Dropdown, Button, SelectionControls,
                            NavigationMenu, DatePicker, Breadcrumbs,
                            PlayBack, DataFilter, TreeView

widgets[1] → main content   Datagrid, ChartGL, Datatable, PieJS,
                            Heatmap, Panel, Tabs, nested FlexPanel
```

The `layout` option only sets *where* the fixed region appears on screen:

| `layout` | Fixed region renders at |
|---|---|
| `"horizontaltop"` | Top (header) |
| `"horizontalbottom"` | Bottom (footer) — widgets[0] is still first in array |
| `"verticalleft"` | Left sidebar |
| `"verticalright"` | Right sidebar |

---

## Schema

```json
{
  "id": "<flexpanel-uuid>",
  "key": "FlexPanel",
  "containerId": null,
  "components": [],
  "definitionId": "1011",
  "hasOnSettingsChange": true,
  "options": {
    "version": "4.7.7",
    "Basics": {
      "Name": "",
      "layout": "horizontaltop",  // horizontaltop | horizontalbottom | verticalleft | verticalright
      "minSize": 80,               // pixel height (horizontal) or width (vertical) of fixed region
      "maxSize": 0                 // 0 = no cap; fixed region stays at minSize
    },
    "Style": { "advanced": "" }
  },
  "widgets": [
    {
      // ── widgets[0]: FIXED REGION (header / footer / sidebar) ──────────
      "id": "<fixed-widget-uuid>",
      "layout": { "row": null, "column": null, "rowSpan": 3, "colSpan": 36 },
      "component": {
        // Text, Dropdown, Button, SelectionControls, NavigationMenu, DatePicker …
        // See kx-text, kx-dropdown, kx-selectioncontrols, etc.
      }
    },
    {
      // ── widgets[1]: MAIN CONTENT (fills remaining space) ──────────────
      "id": "<main-widget-uuid>",
      "layout": { "row": null, "column": null, "rowSpan": 21, "colSpan": 36 },
      "component": {
        // Datagrid, ChartGL, Panel, Tabs, nested FlexPanel …
        // See kx-datagrid, kx-chartgl, kx-tabs, etc.
      }
    }
  ]
}
```

---

## Footer example (`horizontalbottom`)

The footer is `widgets[0]` even though it appears at the bottom. The Datagrid fills the space above.

```
widgets array          Screen rendering
────────────           ─────────────────────────────────────
[0] footer        →    ┌───────────────────────────────────┐
                       │  Datagrid / ChartGL / Panel       │  ← widgets[1]
[1] main content  →    ├───────────────────────────────────┤
                       │  Text / PlayBack / Button         │  ← widgets[0] pinned here
                       └───────────────────────────────────┘
```

For a footer showing a scalar stat (e.g. total row count), use a **Text** component bound to a dedicated scalar query — never Dropdown. See kx-text for the `{{this.0.total}}` template pattern.

---

## Nested FlexPanels (header + sidebar)

Put the fixed header in the outer `widgets[0]` and a second FlexPanel in the outer `widgets[1]`. The inner FlexPanel handles the sidebar + content split.

```
┌───────────────────────────────┐
│         Fixed header          │  ← outer widgets[0]  (horizontaltop)
├──────────┬────────────────────┤
│  Fixed   │                    │
│ sidebar  │  Main content      │  ← outer widgets[1] = inner FlexPanel (verticalleft)
└──────────┴────────────────────┘
```

```json
// outer FlexPanel
"widgets": [
  { "layout": { "row": null, "column": null, "rowSpan": 3,  "colSpan": 36 },
    "component": { /* header: Text, Dropdown, etc. */ } },
  { "layout": { "row": null, "column": null, "rowSpan": 21, "colSpan": 36 },
    "component": {
      "key": "FlexPanel", "definitionId": "1011",
      "options": { "version": "4.7.7",
                   "Basics": { "layout": "verticalleft", "minSize": 250, "maxSize": 0 },
                   "Style": { "advanced": "" } },
      // inner FlexPanel
      "widgets": [
        { "layout": { "row": null, "column": null, "rowSpan": 21, "colSpan": 8  },
          "component": { /* sidebar: Dropdown, DataFilter, NavigationMenu, etc. */ } },
        { "layout": { "row": null, "column": null, "rowSpan": 21, "colSpan": 28 },
          "component": { /* main content: Datagrid, ChartGL, Panel, etc. */ } }
      ]
    }
  }
]
```

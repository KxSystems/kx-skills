---
name: kx-basiccomponents-containers
description: "Use this for KX Dashboards layout containers and navigation primitives such as panels, navigation menus, and overlay drawers. Use it for structural layout needs; use kx-tabs for tabbed switching, kx-accordion for collapsible sections, and kx-flex-panel for fixed-plus-flex layouts."
requires:
  - kx-dashboard-core
---

# KX BasicComponents & Container Components

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

> **Dropdown** is documented in the **kx-dropdown** skill — read that skill for all Dropdown (definitionId=16) generation.

---

## ⚠️ Container-Specific Hazards

- **FlexPanel children** use `"row": null, "column": null` in their layout — but `rowSpan` and `colSpan` are still required. Full FlexPanel documentation is in the **kx-flex-panel** skill.
- **Panel children** use numeric `row`/`column` within the panel's own internal grid (not the screen grid).
- **Tabs children** live in the screen's `widgets` array — not inside the Tabs component. They attach via `"containerId": "<tabItemId>"`. Full Tabs documentation is in the **kx-tabs** skill.
- **Accordion children** go inside the accordion's own `widgets` array (not the screen's `widgets`), using `"sectionId": "<SectionId>"` on each widget entry — not `containerId`. Full Accordion documentation is in the **kx-accordion** skill.
- **OverlayPanel** uses `LeftPanel` and `RightPanel` — both must reference valid component IDs.

---

# BASICCOMPONENTS — Dropdown

> **Moved.** Full Dropdown documentation (all fields, examples, patterns) is in the **kx-dropdown** skill. Read that skill for any Dropdown (`definitionId: "16"`) generation.

---

# BASICCOMPONENTS — Text Label

> **Moved.** Full Text documentation (HtmlText, Handlebars templates, scalar/KPI display, formatting) is in the **kx-text** skill. Read that skill for any Text (`key: "BasicComponents"`, `definitionId: "17"`) generation.

---

# BASICCOMPONENTS — NavigationMenu

`key: "BasicComponents"` · `definitionId: "35"` · Sub-type: `ComponentName: "NavigationMenu"`

## Basics

```json
{
  "ComponentName": "NavigationMenu",
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<navDataSource>" },
  "FontSize": 13,
  "Node": { "Parent": "parent", "Node": "node", "URL": "url", "ID": "id" },
  "Actions": []
}
```

Data source must return columns: `parent`, `node`, `url`, `id`.

---

# FLEXPANEL — Flow Layout

> **Moved.** Full FlexPanel documentation (layout modes, min/max size, child widget wrapper) is in the **kx-flex-panel** skill. Read that skill for any FlexPanel (`key: "FlexPanel"`, `definitionId: "1011"`) generation.

---

# PANEL — Grid Layout Container

`key: "Panel"` · `definitionId: "50"`

Children in `component.widgets` with numeric `row`/`column` (within the panel's own grid, not the screen grid).

## Basics

```json
{
  "ComponentName": "panel",
  "Name": "",
  "RelativeHeight": true,
  "Advanced": false,
  "UserLayout": false,
  "Floatable": false,
  "ColCount": 36,
  "RowHeight": 25,
  "RowCount": 24,
  "ExpandWidgets": "None"
}
```

---

# TABS — Tab Strip

> **Moved.** Full Tabs documentation (all fields, Items[], Selection, SetViewStateOnSelect, child widget attachment, examples) is in the **kx-tabs** skill. Read that skill for any Tabs (`key: "Tabs"`, `definitionId: "26"`) generation.

---

# ACCORDION — Collapsible Sections

> **Moved.** Full Accordion documentation (all fields, section properties, Flex vs. Weight rules, examples, output contract) is in the **kx-accordion** skill. Read that skill for any Accordion (`key: "Accordion"`, `definitionId: "56"`) generation.

---

# OVERLAYPANEL — Sliding Drawer

`key: "OverlayPanel"` · `definitionId: "57"`

## Basics

```json
{
  "Name": "",
  "LeftPanel": {
    "Position": "Bottom",
    "WidthType": "Percentage",
    "Height": 0,
    "Width": 0,
    "ComponentId": "<main-component-id>"
  },
  "RightPanel": {
    "Position": "Bottom",
    "WidthType": "Percentage",
    "Height": 100,
    "Width": 40,
    "ComponentId": "<overlay-component-id>"
  }
}
```

**`Position`:** `"Left"` | `"Right"` | `"Top"` | `"Bottom"`
**`WidthType`:** `"Percentage"` | `"Fixed"`

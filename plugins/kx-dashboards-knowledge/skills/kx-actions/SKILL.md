---
name: kx-actions
description: "Use this alongside a component skill when adding KX Dashboards interactions such as clicks, hovers, row selection, navigation, or data-source re-execution. It defines how actions are attached and triggered, not the base component itself."
---

# KX Dashboards — Actions

> Not a standalone component skill — read it alongside the component skill you are generating. That skill defines the component; this defines the `Actions` you attach to it.

Actions are objects placed in a component's `Actions` array that run when a user interacts with the component (click, double-click, hover, etc.). Each action has a `_Type` that determines what happens and a `Trigger` that determines when.

---

## Action Types

### `map` — Publish a column value to a ViewState

```json
{
  "_Type": "map",
  "Trigger": "Click",
  "TriggerColumn": "*",
  "Current": "sym",
  "Target": { "_dashboardsType": "viewstate", "value": "selectedSym" }
}
```

| Field | Description |
|---|---|
| `Current` | Column name whose value is published. Use `""` for TextInput (publishes the typed text). |
| `Target.value` | ViewState key to write to. |
| `TriggerColumn` | *(Datagrid only)* Column name that must be clicked, or `"*"` for any column. |

---

### `nav` — Navigate to a screen or dashboard

```json
{
  "_Type": "nav",
  "Trigger": "Click",
  "TriggerColumn": "*",
  "SelectDashboardScreen": {
    "dashboard": "<this>",
    "screen": "Detail Screen",
    "_dashboardsType": "navigation"
  }
}
```

| Field | Description |
|---|---|
| `SelectDashboardScreen.dashboard` | `"<this>"` for the current dashboard, or the target dashboard UUID. |
| `SelectDashboardScreen.screen` | Exact screen name string. |

> ⚠️ **Navigation actions always fire last** in a list, regardless of their position in the array.

---

### `query` — Re-execute a data source

```json
{
  "_Type": "query",
  "Trigger": "Click",
  "TriggerColumn": "*",
  "DataSource": { "_dashboardsType": "data", "value": "refreshData" }
}
```

`DataSource.value` is the data source name defined in the widget's `dataHandler` array.

---

### `url` — Open an external URL *(PieJS only)*

```json
{
  "_Type": "url",
  "Trigger": "Click",
  "Current": "<url-column>",
  "Url": "https://example.com"
}
```

---

## Trigger Values

| Trigger | Availability |
|---|---|
| `"Click"` | All components |
| `"Double Click"` | Datagrid, ChartGL |
| `"Hover"` | ChartGL, PieJS |
| `"Mouse In"` | Datagrid, ChartGL |
| `"Mouse Out"` | Datagrid, ChartGL |
| `"Right Click"` | ChartGL |

---

## Placement by Component

Where to put the `Actions` array depends on the component:

| Component | Placement | Notes |
|---|---|---|
| **ChartGL** | `Layers[n].Actions` | One array per layer; also declare column names in `possibleActionsColumns` |
| **Datagrid** | `Selection.Actions` | Include `TriggerColumn` (`"*"` or specific column name) |
| **Dropdown** | `options.Actions` (root, **not** inside `Basics`) | Only `"Click"` trigger is supported |
| **PieJS** | `Basics.Actions` | Supports `"url"` type; triggers: `"Click"` or `"Hover"` |
| **Heatmap** | `Basics.Actions` | — |
| **Radar** | `Basics.Actions` | — |
| **DataFilter** | `options.Actions` | — |
| **DatePicker** | `Basics.Actions` | Fires when the user selects a date |
| **Tabs** | `options.Actions` | — |
| **TextInput** | top-level `Actions` | Fires on **Enter keypress** and **focusout** |
| **Button** | top-level `Actions` | Must have at least one entry — empty `Actions: []` renders a non-functional button |

---

## Component-Specific Constraints

### Dropdown
- Only `"Click"` trigger is supported; other triggers are silently ignored.
- The primary column is always published via `SelectedValue` + `DataSourceMapping.Value`. Use `Actions` for **additional** columns only.
- Never use `SelectedObjectRouting` — it was removed in v4.3.1.

### Datagrid
- `TriggerColumn` is required. Use `"*"` to fire on any column click, or a specific column name.
- Supported triggers: `"Click"` | `"Double Click"` | `"Mouse In"` | `"Mouse Out"`.

### ChartGL
- Declare all columns referenced in `Actions` in the layer's `possibleActionsColumns` array. Include special tokens `"None"`, `"<thisX>"`, `"<thisY>"`, `"<thisName>"` as needed.

### TextInput
- Trigger `"Click"` is still the correct `_Type` value even though the action fires on Enter/focusout, not on a literal mouse click.

### Text component
- The Text component (definitionId=17) is display-only — it has **no `Actions` array**.

---

## Full Examples

### Datagrid row click — publish sym and navigate

```json
"Selection": {
  "Mode": "Single Row",
  "SelectedValue": "selectedSym",
  "Actions": [
    {
      "_Type": "map",
      "Trigger": "Click",
      "TriggerColumn": "*",
      "Current": "sym",
      "Target": { "_dashboardsType": "viewstate", "value": "selectedSym" }
    },
    {
      "_Type": "nav",
      "Trigger": "Click",
      "TriggerColumn": "*",
      "SelectDashboardScreen": {
        "dashboard": "<this>",
        "screen": "Trade Detail",
        "_dashboardsType": "navigation"
      }
    }
  ]
}
```

### Dropdown — publish extra column on selection

```json
"Actions": [
  {
    "_Type": "map",
    "Trigger": "Click",
    "Current": "exchange",
    "Target": { "_dashboardsType": "viewstate", "value": "selectedExchange" }
  }
]
```

### TextInput — trigger query re-execution on submit

```json
"Actions": [
  {
    "_Type": "query",
    "Trigger": "Click",
    "DataSource": { "_dashboardsType": "data", "value": "tradeQuery" }
  }
]
```

### ChartGL layer — click publishes sym

```json
{
  "possibleActionsColumns": ["None", "<thisX>", "<thisY>", "<thisName>", "sym"],
  "Actions": [
    {
      "_Type": "map",
      "Trigger": "Click",
      "TriggerColumn": "*",
      "Current": "sym",
      "Target": { "_dashboardsType": "viewstate", "value": "selectedSym" }
    }
  ]
}
```

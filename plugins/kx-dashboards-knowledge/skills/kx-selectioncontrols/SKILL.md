---
name: kx-selectioncontrols
description: "Use this when the user wants simple KX Dashboards radio buttons or checkboxes for a single or multiple selection choice. Use kx-dropdown for searchable or dependent selection lists and kx-datafilter for multi-condition filter-builder panels."
requires:
  - kx-dashboard-core
---

# KX SelectionControls Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

## ⚠️ Hazards — Read First

1. **`SelectedValue` must be a ViewState binding** — `{ "_dashboardsType": "viewstate", "value": "<vsName>" }`. A bare string will not publish the selection.
2. **`MultiSelect: false` = radio buttons (single value); `MultiSelect: true` = checkboxes (multiple values)** — declare the ViewState as `_type: "symbol"` for radio, `_type: "list"` for checkboxes.
3. **`ItemActionEvent` must be `"None"` when `UseDataSource: true`** — setting it to `"Always"` with a data source causes actions to fire on every data update, not just user interaction.
4. **`UseDataSource: true` requires `Data` and `DataSourceMapping`** — both `Value` and `Text` columns must be specified in `DataSourceMapping`. When `false`, use the static `Items` array instead.
5. **`DoubleClick` is only relevant when `MultiSelect: true`** — it is hidden in the properties panel for single-select mode.
6. **`definitionId` is `"34"`** — not `"33"` (TextInput) or `"16"` (Dropdown).

---

# SELECTIONCONTROLS

`key: "BasicComponents"` · `definitionId: "34"` · `ComponentName: "SelectionControls"` · `version: "v2.9.0"`

Radio buttons (single select) or checkboxes (multi-select). Items can be static or driven from a data source.

## Basics

```json
{
  "ComponentName": "SelectionControls",
  "Name": "",
  "Data": "",
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "<viewStateName>" },
  "DataSourceMapping": { "Value": "<value-col>", "Text": "<display-col>" },
  "Items": [
    { "Value": "optionA", "Text": "Option A" },
    { "Value": "optionB", "Text": "Option B" }
  ],
  "Theme": "Dark",
  "Label": "select:",
  "LabelWidth": 75,
  "MultiSelect": false,
  "DoubleClick": false,
  "UseDataSource": false,
  "AcceptEmptyValues": false,
  "ForceSelectedValue": false,
  "ItemActionEvent": "None",
  "ItemsLayout": "Horizontal",
  "horizontal": "Center",
  "vertical": "Middle"
}
```

| Field | Values / Notes |
|---|---|
| `SelectedValue` | **Required.** ViewState binding — receives selected value(s). Use `_type: "symbol"` for radio, `_type: "list"` for checkboxes. |
| `MultiSelect` | `false` = radio buttons (single value, default); `true` = checkboxes (multiple values). |
| `UseDataSource` | `true` = populate items from `Data` + `DataSourceMapping`; `false` = use static `Items` array. |
| `ItemActionEvent` | `"None"` (default) — only `SelectedValue` updates. `"Always"` — fires `Actions` on every selection. `"Index"` / `"Value"` — fires when index or value changes. Keep `"None"` when `UseDataSource: true`. |
| `ForceSelectedValue` | `true` — auto-select first item on load or when current selection is no longer in the list. |
| `AcceptEmptyValues` | `true` — allows an empty/null selection. |
| `ItemsLayout` | `"Horizontal"` (default) \| `"Vertical"` |
| `DoubleClick` | `true` — require double-click to select (only meaningful when `MultiSelect: true`). |
| `Label` | Text shown before the items. |
| `LabelWidth` | Width of the label in pixels. |
| `Theme` | `"Dark"` (default) \| `"Light"` — visual theme for the control. |
| `horizontal` | Horizontal alignment of the items within the tile: `"Left"` \| `"Center"` (default) \| `"Right"`. |
| `vertical` | Vertical alignment of the items within the tile: `"Top"` \| `"Middle"` (default) \| `"Bottom"`. |

## ViewState declarations

### Radio buttons (single value)
```json
"selectedTheme": { "_viewType": true, "_type": "symbol", "_default": "Dark" }
```

### Checkboxes (multi-value list)
```json
"selectedFilters": { "_viewType": true, "_type": "list", "_default": [] }
```

## Style

```json
"Style": {
  "advanced": "",
  "labelTemplate": ""
}
```

`labelTemplate` is a Handlebars template applied to each item's display label. Reference item columns via `{{col}}`.

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "34",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.9.0",
    "dropdownPossibleValues": [],
    "Basics": {
      "ComponentName": "SelectionControls",
      "Name": "",
      "Data": "",
      "SelectedValue": { "_dashboardsType": "viewstate", "value": "chartTheme" },
      "DataSourceMapping": { "Value": "", "Text": "" },
      "Items": [
        { "Value": "Dark",  "Text": "Dark" },
        { "Value": "Light", "Text": "Light" }
      ],
      "Theme": "Dark",
      "Label": "Theme:",
      "LabelWidth": 75,
      "MultiSelect": false,
      "DoubleClick": false,
      "UseDataSource": false,
      "AcceptEmptyValues": false,
      "ForceSelectedValue": false,
      "ItemActionEvent": "None",
      "ItemsLayout": "Horizontal",
      "horizontal": "Center",
      "vertical": "Middle"
    },
    "Actions": [],
    "Style": { "advanced": "", "labelTemplate": "" },
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
  }
}
```

---

## Common Patterns

### Static radio buttons — theme toggle

```json
// ViewState
"dashTheme": { "_viewType": true, "_type": "symbol", "_default": "Dark" }

// Basics
{
  "ComponentName": "SelectionControls",
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "dashTheme" },
  "Items": [
    { "Value": "Dark",  "Text": "Dark" },
    { "Value": "Light", "Text": "Light" }
  ],
  "MultiSelect": false,
  "ItemsLayout": "Horizontal",
  "ForceSelectedValue": true
}
```

### Checkboxes from a data source

```json
// ViewState
"selectedSyms": { "_viewType": true, "_type": "list", "_default": [] }

// Data source returns a table with sym column
"symList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "select distinct sym from trade",
  "_autoExecute": true, "_autoExec": true
}

// Basics
{
  "ComponentName": "SelectionControls",
  "UseDataSource": true,
  "Data": { "_dashboardsType": "data", "value": "symList" },
  "DataSourceMapping": { "Value": "sym", "Text": "sym" },
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedSyms" },
  "MultiSelect": true,
  "ItemActionEvent": "None",
  "Items": []
}
```

### Action — re-execute a query on selection change

```json
"Actions": [
  {
    "_Type": "query",
    "Trigger": "Click",
    "DataSource": { "_dashboardsType": "data", "value": "tradeData" }
  }
]
```

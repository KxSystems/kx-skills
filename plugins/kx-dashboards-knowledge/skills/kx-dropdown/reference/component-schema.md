# kx-dropdown — Component Schema & Field Reference

> The raw KX Dashboards Dropdown component structure, Basics field reference, and ViewState patterns. Back to [SKILL.md](../SKILL.md).

**Contents:** Full Options Schema · Basics Field Reference · ViewState Patterns

---

# DROPDOWN

`key: "BasicComponents"` · `definitionId: "16"` · `ComponentName: "Dropdown"` · `version: "v2.18.0"`

## Full Options Schema

```json
{
  "version": "v2.18.0",
  "dropdownPossibleValues": ["<col1>", "<col2>"],
  "dropdownPossibleValuesWithEmpty": ["", "<col1>", "<col2>"],
  "Basics": {
    "ComponentName": "Dropdown",
    "Name": "",
    "Data": { "_dashboardsType": "data", "value": "<dataSource>" },
    "SelectedValue": { "_dashboardsType": "viewstate", "value": "<viewState>" },
    "DataSourceMapping": { "Value": "<value-col>", "Text": "<display-col>" },
    "GroupMapping": { "Group": false, "GroupBy": "" },
    "Items": [],
    "Width": 250,
    "Theme": "Dark",
    "Label": "",
    "LabelWidth": 75,
    "MultiSelect": false,
    "SelectAllByDefault": false,
    "ShowSearch": false,
    "AdvancedSearch": false,
    "AcceptEmptyValues": false,
    "ForceSelectedValue": false,
    "FieldSummaryThreshold": 5,
    "TooltipSummaryThreshold": 10,
    "SelectAllValue": "",
    "horizontal": "Center",
    "vertical": "Middle",
    "tooltip": "",
    "SortListBySelected": false,
    "FilterData": "",
    "Custom": { "Icon": "", "IconColor": "" }
  },
  "Actions": [],
  "Style": { "advanced": "" },
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
```

## Basics Field Reference

| Field | Type | Values / Notes |
|---|---|---|
| `ComponentName` | string | Always `"Dropdown"` — do not change |
| `Name` | string | Display name / tile title |
| `Data` | data binding or `""` | Data source providing list items. Use `""` when using static `Items` only. |
| `SelectedValue` | viewstate binding | ViewState that receives the selected value. For multi-select, declare as `_type: "list"`. |
| `DataSourceMapping.Value` | string | kdb+ column published to `SelectedValue` (the stored value) |
| `DataSourceMapping.Text` | string | kdb+ column shown to the user in the list (may equal `Value`) |
| `GroupMapping.Group` | boolean | `true` = group items by the `GroupBy` column |
| `GroupMapping.GroupBy` | string | kdb+ column name used to group items |
| `Items` | array | Static items: `[{ "Value": "x", "Text": "X Label" }]`. Use when `Data` is `""`. |
| `Width` | number | Dropdown input width in pixels (default: `250`) |
| `Theme` | string | `"Dark"` \| `"Light"` |
| `Label` | string | Label text shown to the left of the dropdown |
| `LabelWidth` | number | Label width in pixels (default: `75`) |
| `MultiSelect` | boolean | `true` = allow multiple selections; `SelectedValue` receives a list |
| `SelectAllByDefault` | boolean | Only active when `MultiSelect: true`. Pre-selects all items on load. |
| `ShowSearch` | boolean | Adds a search box inside the dropdown list |
| `AdvancedSearch` | boolean | Enables regex / advanced filtering (requires `ShowSearch: true`) |
| `AcceptEmptyValues` | boolean | `true` = include empty/null entries in the list |
| `ForceSelectedValue` | boolean | `true` = always keep a value selected; auto-selects the first item when nothing is chosen |
| `FieldSummaryThreshold` | number | Max distinct values shown before a count summary is displayed (default: `5`) |
| `TooltipSummaryThreshold` | number | Max items shown in tooltip before truncation (default: `10`) |
| `SelectAllValue` | string | Value sent to `SelectedValue` when all items are selected in multi-select mode |
| `SortListBySelected` | boolean | Move currently selected items to the top of the list |
| `FilterData` | string | Plain ViewState **name** (not a binding) — items are filtered client-side to rows matching this ViewState's value |
| `horizontal` | string | `"Left"` \| `"Center"` \| `"Right"` |
| `vertical` | string | `"Top"` \| `"Middle"` \| `"Bottom"` |
| `tooltip` | string | Tooltip text shown on hover over the component |
| `Custom.Icon` | string | kdb+ column name whose value supplies a Font Awesome icon class per item |
| `Custom.IconColor` | string | kdb+ column name whose value supplies the icon colour per item |

---

## ViewState Patterns

### Single-select → symbol type
```json
"selectedSym": { "_viewType": true, "_type": "symbol", "_default": "" }
```

### Single-select → string type
```json
"selectedTable": { "_viewType": true, "_type": "string", "_default": "" }
```

### Multi-select → list type
```json
"selectedSyms": { "_viewType": true, "_type": "list", "_default": [] }
```

---

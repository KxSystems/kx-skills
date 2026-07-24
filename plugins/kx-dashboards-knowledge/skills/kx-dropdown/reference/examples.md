# kx-dropdown — Worked Examples

> Eight few-shot NLQ → JSON examples covering single/multi-select, static items, grouped, cascading, and column-routing dropdowns. Back to [SKILL.md](../SKILL.md).

**Contents:** Symbol selector · Multi-select · Static items · Value≠Text · Multi-column publish · Grouped · Cascading filter · Period selector

---

## Few-Shot Examples

### 1. Symbol selector from Trade table

Prompt: Create a symbol selector dropdown from the `sym` column of the `Trade` table, connection `html5evalcongroup`, published to ViewState `selectedSym`.

```json
// ViewState
"selectedSym": { "_viewType": true, "_type": "symbol", "_default": "" }

// Data source
"symList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "html5evalcongroup",
  "_queryString": "select distinct sym from Trade",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null, "components": [], "widgets": [],
  "definitionId": "16",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.18.0",
    "dropdownPossibleValues": ["sym"],
    "dropdownPossibleValuesWithEmpty": ["", "sym"],
    "Basics": {
      "ComponentName": "Dropdown",
      "Name": "Symbol",
      "Data": { "_dashboardsType": "data", "value": "symList" },
      "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedSym" },
      "DataSourceMapping": { "Value": "sym", "Text": "sym" },
      "GroupMapping": { "Group": false, "GroupBy": "" },
      "Items": [],
      "Width": 250, "Theme": "Dark",
      "Label": "Symbol:", "LabelWidth": 75,
      "MultiSelect": false, "SelectAllByDefault": false,
      "ShowSearch": false, "AdvancedSearch": false,
      "AcceptEmptyValues": false, "ForceSelectedValue": false,
      "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
      "SelectAllValue": "",
      "horizontal": "Center", "vertical": "Middle", "tooltip": "",
      "SortListBySelected": false, "FilterData": "",
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
}
```

---

### 2. Multi-select sector filter with search and sort-by-selected

Prompt: Multi-select dropdown for sectors from `SectorTable.sector`, connection `html5evalcongroup`, published to `selectedSectors`. Enable search. Pre-select all by default. Move selected items to top.

```json
// ViewState
"selectedSectors": { "_viewType": true, "_type": "list", "_default": [] }

// Data source
"sectorList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "html5evalcongroup",
  "_queryString": "select distinct sector from SectorTable",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "Sector",
  "Data": { "_dashboardsType": "data", "value": "sectorList" },
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedSectors" },
  "DataSourceMapping": { "Value": "sector", "Text": "sector" },
  "GroupMapping": { "Group": false, "GroupBy": "" },
  "Items": [],
  "Width": 250, "Theme": "Dark",
  "Label": "Sector:", "LabelWidth": 75,
  "MultiSelect": true, "SelectAllByDefault": true,
  "ShowSearch": true, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": false,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": true, "FilterData": "",
  "Custom": { "Icon": "", "IconColor": "" }
}
```

---

### 3. Static items dropdown (no data source)

Prompt: Dropdown with static options "Dark" and "Light" for theme selection, published to `dashboardTheme`. Always keep a value selected.

```json
// ViewState
"dashboardTheme": { "_viewType": true, "_type": "symbol", "_default": "Dark" }
```

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "",
  "Data": "",
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "dashboardTheme" },
  "DataSourceMapping": { "Value": "", "Text": "" },
  "GroupMapping": { "Group": false, "GroupBy": "" },
  "Items": [
    { "Value": "Dark",  "Text": "Dark" },
    { "Value": "Light", "Text": "Light" }
  ],
  "Width": 150, "Theme": "Dark",
  "Label": "Theme:", "LabelWidth": 60,
  "MultiSelect": false, "SelectAllByDefault": false,
  "ShowSearch": false, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": true,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": false, "FilterData": "",
  "Custom": { "Icon": "", "IconColor": "" }
}
```

---

### 4. Display name differs from stored value

Prompt: Exchange dropdown from `ExchangeRef` (columns: `exchCode`, `exchName`), connection `html5evalcongroup`. Show full name to the user but publish the code to `selectedExchange`.

```json
// ViewState
"selectedExchange": { "_viewType": true, "_type": "symbol", "_default": "" }

// Data source
"exchangeList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "html5evalcongroup",
  "_queryString": "select exchCode, exchName from ExchangeRef",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "Exchange",
  "Data": { "_dashboardsType": "data", "value": "exchangeList" },
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedExchange" },
  "DataSourceMapping": { "Value": "exchCode", "Text": "exchName" },
  "GroupMapping": { "Group": false, "GroupBy": "" },
  "Items": [],
  "Width": 250, "Theme": "Dark",
  "Label": "Exchange:", "LabelWidth": 80,
  "MultiSelect": false, "SelectAllByDefault": false,
  "ShowSearch": true, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": false,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": false, "FilterData": "",
  "Custom": { "Icon": "", "IconColor": "" }
}
```

> `Value: "exchCode"` = stored/published value · `Text: "exchName"` = visible label in list

---

### 5. Publish multiple columns on selection (sym + exchange)

Prompt: Instrument dropdown from `InstrumentRef` (columns: `sym`, `exchange`, `name`), connection `html5evalcongroup`. Show `name` to the user. On selection publish `sym` to `selectedSym` and `exchange` to `selectedExchange`.

```json
// ViewStates
"selectedSym":      { "_viewType": true, "_type": "symbol", "_default": "" }
"selectedExchange": { "_viewType": true, "_type": "symbol", "_default": "" }

// Data source
"instrumentList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "html5evalcongroup",
  "_queryString": "select sym, exchange, name from InstrumentRef",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "Instrument",
  "Data": { "_dashboardsType": "data", "value": "instrumentList" },
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedSym" },
  "DataSourceMapping": { "Value": "sym", "Text": "name" },
  "GroupMapping": { "Group": false, "GroupBy": "" },
  "Items": [],
  "Width": 300, "Theme": "Dark",
  "Label": "Instrument:", "LabelWidth": 90,
  "MultiSelect": false, "SelectAllByDefault": false,
  "ShowSearch": true, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": false,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": false, "FilterData": "",
  "Custom": { "Icon": "", "IconColor": "" }
},
"Actions": [
  {
    "_Type": "map",
    "Trigger": "Click",
    "Current": "exchange",
    "Target": { "_dashboardsType": "viewstate", "value": "selectedExchange" }
  }
]
```

> `sym` is published via `SelectedValue` + `DataSourceMapping.Value`. Each additional column needs its own `Actions` entry.

---

### 6. Grouped dropdown (symbols grouped by exchange)

Prompt: Symbol dropdown from `InstrumentRef` (columns: `sym`, `exchange`), grouped by `exchange`, published to `selectedSym`.

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "Symbol",
  "Data": { "_dashboardsType": "data", "value": "instrumentList" },
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedSym" },
  "DataSourceMapping": { "Value": "sym", "Text": "sym" },
  "GroupMapping": { "Group": true, "GroupBy": "exchange" },
  "Items": [],
  "Width": 250, "Theme": "Dark",
  "Label": "Symbol:", "LabelWidth": 75,
  "MultiSelect": false, "SelectAllByDefault": false,
  "ShowSearch": true, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": false,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": false, "FilterData": "",
  "Custom": { "Icon": "", "IconColor": "" }
}
```

---

### 7. Client-side cascading dropdown filtered by another ViewState

Prompt: Symbol dropdown from `InstrumentRef` (columns: `sym`, `exchange`), items filtered client-side by `selectedExchange` ViewState.

> Use `FilterData` for simple client-side filtering. For server-side filtering, use a parameterised data source (see Data Source Patterns above).

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "Symbol",
  "Data": { "_dashboardsType": "data", "value": "instrumentList" },
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "selectedSym" },
  "DataSourceMapping": { "Value": "sym", "Text": "sym" },
  "GroupMapping": { "Group": false, "GroupBy": "" },
  "Items": [],
  "Width": 250, "Theme": "Dark",
  "Label": "Symbol:", "LabelWidth": 75,
  "MultiSelect": false, "SelectAllByDefault": false,
  "ShowSearch": false, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": false,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": false, "FilterData": "selectedExchange",
  "Custom": { "Icon": "", "IconColor": "" }
}
```

> `FilterData: "selectedExchange"` filters the dropdown's items to rows where any column value matches the current value of ViewState `selectedExchange`. This is a client-side string match — no extra data source needed.

---

### 8. Period selector with ForceSelectedValue

Prompt: Static dropdown for time period (Today / This Week / This Month), always keep a value selected, defaulting to `Today`.

```json
// ViewState
"dateRange": { "_viewType": true, "_type": "symbol", "_default": "Today" }
```

```json
"Basics": {
  "ComponentName": "Dropdown",
  "Name": "",
  "Data": "",
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "dateRange" },
  "DataSourceMapping": { "Value": "", "Text": "" },
  "GroupMapping": { "Group": false, "GroupBy": "" },
  "Items": [
    { "Value": "Today", "Text": "Today" },
    { "Value": "Week",  "Text": "This Week" },
    { "Value": "Month", "Text": "This Month" }
  ],
  "Width": 180, "Theme": "Dark",
  "Label": "Period:", "LabelWidth": 55,
  "MultiSelect": false, "SelectAllByDefault": false,
  "ShowSearch": false, "AdvancedSearch": false,
  "AcceptEmptyValues": false, "ForceSelectedValue": true,
  "FieldSummaryThreshold": 5, "TooltipSummaryThreshold": 10,
  "SelectAllValue": "",
  "horizontal": "Center", "vertical": "Middle", "tooltip": "",
  "SortListBySelected": false, "FilterData": "",
  "Custom": { "Icon": "", "IconColor": "" }
}
```

---

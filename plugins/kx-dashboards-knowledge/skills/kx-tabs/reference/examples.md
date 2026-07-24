# kx-tabs — Worked Examples

> Five NLQ → JSON worked examples covering empty tabs, per-tab children, default tab, ViewState-on-switch, and hidden/PDF-excluded tabs. Back to [SKILL.md](../SKILL.md).

**Contents:** Empty two-tab container · Two tabs with a Datagrid each · Open on second tab · Publish active tab to ViewState · Hidden tab + PDF-excluded tab

---

## Worked Examples

### Example 1 — Empty two-tab container

**NLQ:** "Add a tabs component with tabs 'Overview' and 'Details'"

Two tabs, no children yet (blank panels). `components[]` and `widgets[]` stay empty because no child was requested.

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "key": "Tabs",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "26",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.14.0",
    "dropdownPossibleValues": [
      { "Id": 0, "Name": "Overview" },
      { "Id": 1, "Name": "Details" }
    ],
    "Basics": { "ComponentName": "tabs", "Name": "" },
    "Selection": {
      "target_tab": 0,
      "unloadInactive": false,
      "expandOnPdf": false,
      "SetViewStateOnSelect": { "ViewState": "", "Value": "<tabName>" }
    },
    "Items": [
      { "Id": "aaaaaaa1-0000-0000-0000-000000000001", "Name": "Overview", "Tooltip": "", "HideTab": false, "HideTabPdf": false },
      { "Id": "aaaaaaa2-0000-0000-0000-000000000002", "Name": "Details",  "Tooltip": "", "HideTab": false, "HideTabPdf": false }
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

### Example 2 — Two tabs, a Datagrid in each

**NLQ:** "Tabs with 'Trades' showing the tradeGrid data and 'Orders' showing the orderGrid data"

Each tab gets one Datagrid child. Note each child appears in **both** `components[]` and `widgets[]`, and `containerId` matches the tab GUID in three places.

```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "key": "Tabs",
  "containerId": null,
  "definitionId": "26",
  "hasOnSettingsChange": true,
  "components": [
    {
      "id": "c0000001-0000-0000-0000-000000000001",
      "key": "Datagrid",
      "containerId": "tab00001-0000-0000-0000-000000000001",
      "components": [], "widgets": [],
      "definitionId": "21",
      "hasOnSettingsChange": true,
      "options": {
        "version": "v2.20.0",
        "Basics": { "Data": { "_dashboardsType": "data", "value": "tradeQuery" } },
        "ColumnsConfiguration": []
      }
    },
    {
      "id": "c0000002-0000-0000-0000-000000000002",
      "key": "Datagrid",
      "containerId": "tab00002-0000-0000-0000-000000000002",
      "components": [], "widgets": [],
      "definitionId": "21",
      "hasOnSettingsChange": true,
      "options": {
        "version": "v2.20.0",
        "Basics": { "Data": { "_dashboardsType": "data", "value": "orderQuery" } },
        "ColumnsConfiguration": []
      }
    }
  ],
  "widgets": [
    {
      "id": "w0000001-0000-0000-0000-000000000001",
      "layout": { "row": 0, "column": 0, "rowSpan": 24, "colSpan": 36 },
      "containerId": "tab00001-0000-0000-0000-000000000001",
      "component": {
        "id": "c0000001-0000-0000-0000-000000000001",
        "key": "Datagrid",
        "containerId": "tab00001-0000-0000-0000-000000000001",
        "components": [], "widgets": [],
        "definitionId": "21",
        "hasOnSettingsChange": true,
        "options": { "version": "v2.20.0", "Basics": { "Data": { "_dashboardsType": "data", "value": "tradeQuery" } }, "ColumnsConfiguration": [] }
      }
    },
    {
      "id": "w0000002-0000-0000-0000-000000000002",
      "layout": { "row": 0, "column": 0, "rowSpan": 24, "colSpan": 36 },
      "containerId": "tab00002-0000-0000-0000-000000000002",
      "component": {
        "id": "c0000002-0000-0000-0000-000000000002",
        "key": "Datagrid",
        "containerId": "tab00002-0000-0000-0000-000000000002",
        "components": [], "widgets": [],
        "definitionId": "21",
        "hasOnSettingsChange": true,
        "options": { "version": "v2.20.0", "Basics": { "Data": { "_dashboardsType": "data", "value": "orderQuery" } }, "ColumnsConfiguration": [] }
      }
    }
  ],
  "options": {
    "version": "v2.14.0",
    "dropdownPossibleValues": [
      { "Id": 0, "Name": "Trades" },
      { "Id": 1, "Name": "Orders" }
    ],
    "Basics": { "ComponentName": "tabs", "Name": "" },
    "Selection": {
      "target_tab": 0,
      "unloadInactive": false,
      "expandOnPdf": false,
      "SetViewStateOnSelect": { "ViewState": "", "Value": "<tabName>" }
    },
    "Items": [
      { "Id": "tab00001-0000-0000-0000-000000000001", "Name": "Trades", "Tooltip": "", "HideTab": false, "HideTabPdf": false },
      { "Id": "tab00002-0000-0000-0000-000000000002", "Name": "Orders", "Tooltip": "", "HideTab": false, "HideTabPdf": false }
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

### Example 3 — Open on the second tab by default

**NLQ:** "Three tabs (Summary, Charts, Raw) that open on the Charts tab"

Only the relevant `options` differs from Example 1 — `target_tab: 1` (0-based → second tab), three `Items[]` / `dropdownPossibleValues`.

```json
{
  "dropdownPossibleValues": [
    { "Id": 0, "Name": "Summary" },
    { "Id": 1, "Name": "Charts" },
    { "Id": 2, "Name": "Raw" }
  ],
  "Basics": { "ComponentName": "tabs", "Name": "" },
  "Selection": {
    "target_tab": 1,
    "unloadInactive": false,
    "expandOnPdf": false,
    "SetViewStateOnSelect": { "ViewState": "", "Value": "<tabName>" }
  },
  "Items": [
    { "Id": "<tab-1-uuid>", "Name": "Summary", "Tooltip": "", "HideTab": false, "HideTabPdf": false },
    { "Id": "<tab-2-uuid>", "Name": "Charts",  "Tooltip": "", "HideTab": false, "HideTabPdf": false },
    { "Id": "<tab-3-uuid>", "Name": "Raw",     "Tooltip": "", "HideTab": false, "HideTabPdf": false }
  ]
}
```

---

### Example 4 — Publish the active tab to a ViewState on switch

**NLQ:** "Tabs 'Daily' and 'Monthly' that set an 'activeTab' viewstate so my query re-runs when I switch"

```json
{
  "dropdownPossibleValues": [
    { "Id": 0, "Name": "Daily" },
    { "Id": 1, "Name": "Monthly" }
  ],
  "Basics": { "ComponentName": "tabs", "Name": "" },
  "Selection": {
    "target_tab": 0,
    "unloadInactive": false,
    "expandOnPdf": false,
    "SetViewStateOnSelect": {
      "ViewState": { "_dashboardsType": "viewstate", "value": "activeTab" },
      "Value": "<tabName>"
    }
  },
  "Items": [
    { "Id": "<tab-1-uuid>", "Name": "Daily",   "Tooltip": "", "HideTab": false, "HideTabPdf": false },
    { "Id": "<tab-2-uuid>", "Name": "Monthly", "Tooltip": "", "HideTab": false, "HideTabPdf": false }
  ]
}
```

Pair with a dashboard ViewState `activeTab` and parameterise the query with `<%activeTab%>` (see kx-dashboard-core).

---

### Example 5 — Hidden tab + tab excluded from PDF

**NLQ:** "Tabs 'Public', 'Debug' (hidden), and 'Internal' (don't print in PDF)"

```json
{
  "dropdownPossibleValues": [
    { "Id": 0, "Name": "Public" },
    { "Id": 1, "Name": "Debug" },
    { "Id": 2, "Name": "Internal" }
  ],
  "Basics": { "ComponentName": "tabs", "Name": "" },
  "Selection": {
    "target_tab": 0,
    "unloadInactive": false,
    "expandOnPdf": false,
    "SetViewStateOnSelect": { "ViewState": "", "Value": "<tabName>" }
  },
  "Items": [
    { "Id": "<tab-1-uuid>", "Name": "Public",   "Tooltip": "", "HideTab": false, "HideTabPdf": false },
    { "Id": "<tab-2-uuid>", "Name": "Debug",    "Tooltip": "", "HideTab": true,  "HideTabPdf": false },
    { "Id": "<tab-3-uuid>", "Name": "Internal", "Tooltip": "", "HideTab": false, "HideTabPdf": true }
  ]
}
```

# kx-button — Worked Examples

> Six few-shot NLQ → JSON worked examples for the Button component. Back to [SKILL.md](../SKILL.md).

**Contents:** Minimal · Styled w/ icon · Query on click · Navigate · Fixed-width disabled · Multiple actions

---

## Worked Examples

### Example 1 — Minimal button

**NLQ:** "Add a Submit button"

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "25",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.9.0",
    "Basics": {
      "ComponentName": "Button",
      "Name": "",
      "Label": "Submit",
      "FontSize": 11,
      "Icon": "",
      "tooltip": "",
      "horizontal": "Center",
      "vertical": "Middle",
      "fixedWidth": false,
      "width": 100,
      "isEnabled": true
    },
    "Style": { "background": "", "color": "", "border": "", "advanced": "", "cssClasses": "" },
    "Actions": [],
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

### Example 2 — Styled button with icon and tooltip

**NLQ:** "Add a blue Refresh button with a refresh icon, tooltip 'Reload data', font size 16"

```json
{
  "Basics": {
    "Name": "",
    "Label": "Refresh",
    "FontSize": 16,
    "Icon": "fa fa-refresh",
    "tooltip": "Reload data",
    "horizontal": "Center",
    "vertical": "Middle",
    "fixedWidth": false,
    "width": 100,
    "isEnabled": true
  },
  "Style": {
    "background": "#0061FF",
    "color": "#ffffff",
    "border": "",
    "advanced": "",
    "cssClasses": ""
  },
  "Actions": []
}
```

---

### Example 3 — Button that re-executes a query on click

**NLQ:** "Add a Run button that re-executes the 'tradeQuery' data source when clicked"

```json
{
  "Basics": {
    "Name": "",
    "Label": "Run",
    "FontSize": 14,
    "Icon": "fa fa-play",
    "tooltip": "Execute query",
    "horizontal": "Center",
    "vertical": "Middle",
    "fixedWidth": false,
    "width": 100,
    "isEnabled": true
  },
  "Style": { "background": "", "color": "", "border": "", "advanced": "", "cssClasses": "" },
  "Actions": [
    {
      "_Type": "query",
      "Trigger": "Click",
      "DataSource": { "_dashboardsType": "data", "value": "tradeQuery" }
    }
  ]
}
```

---

### Example 4 — Button that navigates to another screen

**NLQ:** "Add a 'Go to Details' button that navigates to the Detail Screen"

```json
{
  "Basics": {
    "Name": "",
    "Label": "Go to Details",
    "FontSize": 14,
    "Icon": "",
    "tooltip": "",
    "horizontal": "Center",
    "vertical": "Middle",
    "fixedWidth": false,
    "width": 100,
    "isEnabled": true
  },
  "Style": { "background": "", "color": "", "border": "", "advanced": "", "cssClasses": "" },
  "Actions": [
    {
      "_Type": "nav",
      "Trigger": "Click",
      "SelectDashboardScreen": {
        "dashboard": "<this>",
        "screen": "Detail Screen",
        "_dashboardsType": "navigation"
      }
    }
  ]
}
```

---

### Example 5 — Fixed-width disabled button with border colour

**NLQ:** "Add a 200px wide disabled Delete button with a red border and trash icon"

```json
{
  "Basics": {
    "Name": "",
    "Label": "Delete",
    "FontSize": 14,
    "Icon": "fa fa-trash",
    "tooltip": "",
    "horizontal": "Center",
    "vertical": "Middle",
    "fixedWidth": true,
    "width": 200,
    "isEnabled": false
  },
  "Style": {
    "background": "",
    "color": "",
    "border": "#F23A66",
    "advanced": "",
    "cssClasses": ""
  },
  "Actions": []
}
```

---

### Example 6 — Button with multiple actions (query + navigation)

**NLQ:** "Add a 'Save and Go' button that re-executes 'saveQuery' then navigates to the Summary screen"

Actions fire in list order, except nav always fires last.

```json
{
  "Basics": {
    "Name": "",
    "Label": "Save and Go",
    "FontSize": 14,
    "Icon": "fa fa-save",
    "tooltip": "",
    "horizontal": "Center",
    "vertical": "Middle",
    "fixedWidth": false,
    "width": 100,
    "isEnabled": true
  },
  "Style": { "background": "", "color": "", "border": "", "advanced": "", "cssClasses": "" },
  "Actions": [
    {
      "_Type": "query",
      "Trigger": "Click",
      "DataSource": { "_dashboardsType": "data", "value": "saveQuery" }
    },
    {
      "_Type": "nav",
      "Trigger": "Click",
      "SelectDashboardScreen": {
        "dashboard": "<this>",
        "screen": "Summary",
        "_dashboardsType": "navigation"
      }
    }
  ]
}
```

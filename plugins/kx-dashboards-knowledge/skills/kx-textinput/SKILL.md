---
name: kx-textinput
description: "Use this when the user wants a KX Dashboards free-text input box: search boxes, filter inputs, symbol entry, or multiline text entry. Use kx-button for clickable triggers, kx-datepicker for calendar selection, and kx-selectioncontrols for radio buttons or checkboxes."
requires:
  - kx-dashboard-core
---

# KX TextInput

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

`key: "BasicComponents"` · `definitionId: "33"` · `ComponentName: "TextInput"` · `version: "v2.9.0"`

A single-line (or multiline) text entry box. The typed value is published to a ViewState via `Basics.Text` and/or via `Actions` on Enter/focusout.

> **Other `BasicComponents` input controls have their own dedicated skills — use those, not this one:**
> - **kx-button** — clickable action trigger (`definitionId: "25"`)
> - **kx-datepicker** — calendar date/time selector (`definitionId: "15"`)
> - **kx-selectioncontrols** — radio buttons / checkboxes (`definitionId: "34"`)

---

## ⚠️ Hazards — Read First

1. **`Basics.Text` accepts a ViewState binding** — to publish user-typed text to a ViewState use `{ "_dashboardsType": "viewstate", "value": "<vsName>" }`, not a plain string.
2. **Actions fire on Enter keypress AND focusout** — use them to trigger data source re-execution or ViewState maps after the user types.
3. **`Type: "multiline"` switches the input to a `<textarea>`** — the `fixedHeight` / `height` fields control its size.

---

## Basics

```json
{
  "ComponentName": "TextInput",
  "Name": "",
  "Theme": "Dark",
  "Text": { "_dashboardsType": "viewstate", "value": "<viewStateName>" },
  "Type": "text",
  "FontSize": 16,
  "horizontal": "Center",
  "vertical": "Middle",
  "fixedWidth": false,
  "width": 100,
  "fixedHeight": false,
  "height": 100
}
```

| Field | Values / Notes |
|---|---|
| `Text` | ViewState binding (to publish typed value) **or** plain string (to set a fixed initial value). Prefer the ViewState binding for interactive inputs. |
| `Type` | `"text"` (single line, default) \| `"search"` (single line with clear ×) \| `"multiline"` (textarea) |
| `fixedWidth` | `true` — use `width` (px); `false` — fills tile width |
| `fixedHeight` | `true` — use `height` (px); `false` — fills tile height (relevant for `"multiline"`) |
| `FontSize` | Integer, default `16` |
| `horizontal` | `"Left"` \| `"Center"` \| `"Right"` |
| `vertical` | `"Top"` \| `"Middle"` \| `"Bottom"` |
| `Theme` | `"Dark"` \| `"Light"` |

## Actions

> See **kx-actions** for full action type reference. TextInput-specific: actions fire on **Enter keypress** and **focusout**, placed in the top-level `Actions` array. The `Trigger` value stays `"Click"` even though the action fires on Enter/focusout, not on a literal mouse click — `"Click"` is the only supported Trigger for TextInput. Use `"Current": ""` for `map` actions (publishes the typed text).

## ViewState

For a text input that filters a query, declare a `string` ViewState:

```json
"searchSym": { "_viewType": true, "_type": "string", "_default": "" }
```

Then bind both `Basics.Text` and (optionally) an action target to `"searchSym"`.

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "33",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.9.0",
    "Basics": {
      "ComponentName": "TextInput",
      "Name": "",
      "Theme": "Dark",
      "Text": { "_dashboardsType": "viewstate", "value": "searchSym" },
      "Type": "text",
      "FontSize": 16,
      "horizontal": "Center",
      "vertical": "Middle",
      "fixedWidth": false,
      "width": 100,
      "fixedHeight": false,
      "height": 100
    },
    "Actions": [],
    "Style": { "advanced": "", "cssClasses": "" },
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

## Common Patterns

### Search box that filters a kdb+ query

```json
// ViewState
"searchText": { "_viewType": true, "_type": "string", "_default": "" }

// Data source (re-runs when ViewState changes)
"filteredTrades": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "tradefeed",
  "_queryString": "{[s] select from trade where sym like s}",
  "_queryParams": [
    { "name": "s", "type": "string", "value": "<%searchText%>", "IsKdbParam": true, "isViewState": true }
  ],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}

// TextInput Basics.Text bound to ViewState
"Text": { "_dashboardsType": "viewstate", "value": "searchText" }
```

### Multiline textarea with fixed height

```json
"Basics": {
  "ComponentName": "TextInput",
  "Type": "multiline",
  "fixedHeight": true,
  "height": 120,
  "Text": { "_dashboardsType": "viewstate", "value": "noteText" }
}
```

### TextInput + Action to re-execute a query on Enter

```json
"Basics": {
  "ComponentName": "TextInput",
  "Type": "search",
  "Text": { "_dashboardsType": "viewstate", "value": "symFilter" }
},
"Actions": [
  {
    "_Type": "query",
    "Trigger": "Click",
    "DataSource": { "_dashboardsType": "data", "value": "tradeData" }
  }
]
```

`"Trigger": "Click"` is correct here — the action still fires on Enter/focusout (TextInput has no literal click trigger). For a `map` action that publishes the typed text to a ViewState, add `"Current": ""` alongside a `"Target"` viewstate binding.

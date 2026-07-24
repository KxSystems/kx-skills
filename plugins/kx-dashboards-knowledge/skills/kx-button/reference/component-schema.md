# kx-button — Component Schema

> The full Button component JSON envelope and per-property config keys. Back to [SKILL.md](../SKILL.md).

**Contents:** Full Component Schema · Config Keys

---

## Full Component Schema

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
      "Label": "click",
      "FontSize": 11,
      "Icon": "",
      "tooltip": "",
      "horizontal": "Center",
      "vertical": "Middle",
      "fixedWidth": false,
      "width": 100,
      "isEnabled": true
    },
    "Style": {
      "background": "",
      "color": "",
      "border": "",
      "advanced": "",
      "cssClasses": ""
    },
    "Actions": [],
    "Alignment": {
      "paddingLeft": 0,
      "paddingRight": 0,
      "paddingTop": 0,
      "paddingBottom": 0,
      "innerPaddingLeft": 0,
      "innerPaddingRight": 0,
      "innerPaddingTop": 0,
      "innerPaddingBottom": 0,
      "titlePaddingLeft": 0,
      "titlePaddingRight": 0,
      "titlePaddingTop": 7,
      "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16,
      "titleHorizontal": "Center",
      "titleShadow": false,
      "tileBorderWidth": 0,
      "tileBorderRounding": 0,
      "tileBorderColor": "#000000",
      "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true,
      "tileShadow": false
    }
  }
}
```

**`Basics.horizontal`:** `"Left"` | `"Center"` | `"Right"`  
**`Basics.vertical`:** `"Top"` | `"Middle"` | `"Bottom"`

---

## Config Keys

| Property | Type | Default | Description |
|---|---|---|---|
| `Basics.ComponentName` | string | `"Button"` | **Required.** Identifies the sub-component — must always be `"Button"` |
| `Basics.Label` | string | `"click"` | Button text shown to the user |
| `Basics.FontSize` | number | `11` | Font size in px |
| `Basics.Icon` | string | `""` | Full icon class — `"fa fa-play"` or `"mi mi-refresh"` (see Icon rules below) |
| `Basics.tooltip` | string | `""` | Hover tooltip text |
| `Basics.horizontal` | string | `"Center"` | Horizontal text/icon alignment: `"Left"` \| `"Center"` \| `"Right"` |
| `Basics.vertical` | string | `"Middle"` | Vertical alignment within the widget cell: `"Top"` \| `"Middle"` \| `"Bottom"` |
| `Basics.fixedWidth` | boolean | `false` | When `true`, constrains the button to `Basics.width` px |
| `Basics.width` | number | `100` | Fixed width in px — only applied when `fixedWidth: true` |
| `Basics.isEnabled` | boolean | `true` | `false` disables click handling and applies disabled styling |
| `Style.background` | string | `""` | Hex — auto-computes a 3-stop gradient; `""` = default theme |
| `Style.color` | string | `""` | Hex applied to label text and icon |
| `Style.border` | string | `""` | Hex applied to button border colour |
| `Style.advanced` | string | `""` | Raw CSS injected into the component |
| `Style.cssClasses` | string | `""` | Extra CSS class names added to the button root |
| `Actions` | array | `[]` | Click actions: `map`, `query`, `nav` (see kx-dashboard-core) |


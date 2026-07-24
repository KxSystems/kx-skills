# kx-button — generate.js Config

> Quick Start and config keys for `generate.js` with `componentType: "button"`. Back to [SKILL.md](../SKILL.md).

**Contents:** generate.js Quick Start · Minimal config · makeButtonWidget config keys

---

## generate.js — Quick Start

`generate.js` (in `kx-dashboard-core/`) supports `componentType: "button"`.

```bash
node generate.js --config button.config.json [--out dashboard.json] [--deploy]
```

### Minimal config

```json
{
  "name":          "My Button Dashboard",
  "componentType": "button",
  "theme":         "Dark",
  "basics": {
    "label":     "Submit",
    "fontSize":  14,
    "isEnabled": true
  },
  "chartLayout": { "row": 10, "column": 13, "rowSpan": 3, "colSpan": 9 }
}
```

### All config keys for `makeButtonWidget`

| Key | Type | Default | Description |
|---|---|---|---|
| `componentType` | string | `"chartgl"` | Set to `"button"` |
| `basics.label` | string | `"click"` | Button label text |
| `basics.fontSize` | number | `11` | Font size in px |
| `basics.icon` | string | `""` | Full icon class — `"fa fa-play"` / `"mi mi-refresh"` |
| `basics.tooltip` | string | `""` | Hover tooltip |
| `basics.horizontal` | string | `"Center"` | `"Left"` \| `"Center"` \| `"Right"` |
| `basics.vertical` | string | `"Middle"` | `"Top"` \| `"Middle"` \| `"Bottom"` |
| `basics.fixedWidth` | boolean | `false` | Enable fixed px width |
| `basics.width` | number | `100` | Width in px — only used when `fixedWidth: true` |
| `basics.isEnabled` | boolean | `true` | `false` disables the button |
| `style.background` | string | `""` | Hex — auto-computes gradient; `""` = theme default |
| `style.color` | string | `""` | Hex for label text and icon |
| `style.border` | string | `""` | Hex for button border |
| `style.advanced` | string | `""` | Raw CSS |
| `style.cssClasses` | string | `""` | Extra CSS class names |
| `actions` | array | `[]` | Click actions (map / query / nav) |
| `chartLayout` | object | `{row:0,column:0,rowSpan:3,colSpan:9}` | Widget grid placement |


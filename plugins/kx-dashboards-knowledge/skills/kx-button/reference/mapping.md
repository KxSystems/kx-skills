# kx-button — NL → JSON Mapping

> Natural-language to property mapping, named-colour hexes, and icon-prefix rules. Back to [SKILL.md](../SKILL.md).

**Contents:** NL → JSON Mapping Rules · Named colours → hex · Icon prefix rules

---

## NL → JSON Mapping Rules

| Natural Language | Property | Notes |
|---|---|---|
| button label / button text | `Basics.Label` | String on the button face |
| font size / text size | `Basics.FontSize` | Integer px |
| icon / FA icon / material icon | `Basics.Icon` | Must use full prefix — see Icon rules |
| tooltip / hover text | `Basics.tooltip` | Plain string |
| left-align / center / right-align | `Basics.horizontal` | `"Left"` \| `"Center"` \| `"Right"` |
| top / middle / bottom | `Basics.vertical` | `"Top"` \| `"Middle"` \| `"Bottom"` |
| fixed width / set width to Npx | `Basics.fixedWidth: true` + `Basics.width: N` | Width in px |
| disabled / greyed out / inactive | `Basics.isEnabled: false` | Disables click and visual state |
| background colour | `Style.background` | Hex string — gradient is auto-computed |
| text colour / label colour | `Style.color` | Also applies to icon |
| border colour | `Style.border` | Hex string |
| click → publish ViewState | Actions map | `{ "_Type": "map", "Trigger": "Click", "Current": "<col>", "Target": { "_dashboardsType": "viewstate", "value": "<vs>" } }` |
| click → refresh / re-run query | Actions query | `{ "_Type": "query", "Trigger": "Click", "DataSource": { "_dashboardsType": "data", "value": "<ds>" } }` |
| click → go to screen / navigate | Actions nav | `{ "_Type": "nav", "Trigger": "Click", "SelectDashboardScreen": { "dashboard": "<this>", "screen": "<screen name>", "_dashboardsType": "navigation" } }` |

### Named colours → hex

`blue→#0061FF` · `red/pink→#F23A66` · `teal→#009BAB` · `purple→#7647CC` · `yellow→#FFC300` · `grey→#9FA3A6` · `dark blue→#003A99` · `dark red→#A90B31` · `dark teal→#005D67` · `dark purple→#452481`

### Icon prefix rules

| Requested | `Basics.Icon` value |
|---|---|
| play (FontAwesome) | `"fa fa-play"` |
| refresh / reload (FA) | `"fa fa-refresh"` |
| search (FA) | `"fa fa-search"` |
| download (FA) | `"fa fa-download"` |
| trash / delete (FA) | `"fa fa-trash"` |
| save (FA) | `"fa fa-save"` |
| plus / add (FA) | `"fa fa-plus"` |
| play (Material) | `"mi mi-play_arrow"` |
| refresh (Material) | `"mi mi-refresh"` |
| search (Material) | `"mi mi-search"` |

Always use `"fa fa-"` for FontAwesome, `"mi mi-"` for Material. Never emit just `"fa-play"` or `"mi-refresh"` — the component silently ignores icons without the double-prefix.

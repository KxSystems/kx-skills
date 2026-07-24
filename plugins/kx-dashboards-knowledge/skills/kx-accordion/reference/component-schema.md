# kx-accordion — Component JSON Schema Reference

> The canonical Accordion options object, full field tables, the complete component object, and section-generation rules. Back to [SKILL.md](../SKILL.md).

**Contents:** Canonical Options Structure · Full Basics Field Reference · Full Section Field Reference · Flex vs Weight · Complete Accordion Component Object · Rules for Generating Sections

---

## Canonical Options Structure

This is the exact `options` object defined in the component source:

```json
{
  "version": "4.7.7",
  "Basics": {
    "ComponentName": "accordion",
    "Name": "",
    "Direction": "Vertical",
    "ScaleOnResize": false,
    "Sections": [
      {
        "Title": "Section",
        "TitleAlign": "Left",
        "Expanded": true,
        "Weight": 1,
        "Resizeable": false,
        "HideTitle": false,
        "Flex": false
      }
    ]
  },
  "Style": {
    "Theme": "Dark",
    "advanced": ""
  }
}
```

---

## Full `Basics` Field Reference

| Field | Type | Default | Source |
|---|---|---|---|
| `ComponentName` | string | `"accordion"` | Always `"accordion"`. Hidden in UI. |
| `Name` | string | `""` | Tile title. |
| `Direction` | string | `"Vertical"` | `"Vertical"` or `"Horizontal"` |
| `ScaleOnResize` | boolean | `false` | Set `true` only if children are ChartGL. |
| `Sections` | array | — | One entry per section. See below. |

## Full Section Field Reference

From schema `Sections.items.properties` in componentDefinition.ts:

| Field | Type | Default | Notes |
|---|---|---|---|
| `SectionId` | string | *auto* | **Must be explicit.** Format: `"section_"` + unique integer. E.g. `"section_1001"`. |
| `Title` | string | `"Section"` | Header bar text. |
| `TitleAlign` | string | `"Left"` | `"Left"` · `"Center"` · `"Right"` |
| `Expanded` | boolean | `true` | `true` = open on load. |
| `Flex` | boolean | `false` | `true` = auto-size to content, uses `MinSize`/`MaxSize`. `false` = uses `Weight`/`Resizeable`. |
| `Weight` | number | `1` | Relative size ratio. Only when `Flex: false`. |
| `Resizeable` | boolean | `false` | User-draggable divider. Only when `Flex: false`. |
| `HideTitle` | boolean | `false` | Hides header bar; section cannot be collapsed. |
| `MinSize` | number | `0` | Min size in px. Only when `Flex: true`. |
| `MaxSize` | number | `250` | Max size in px. Only when `Flex: true`. |

### Flex vs Weight — mutually exclusive (enforced by `_transform` in schema)

| `Flex` | Include | Omit |
|---|---|---|
| `false` | `Weight`, `Resizeable` | `MinSize`, `MaxSize` |
| `true` | `MinSize`, `MaxSize` | `Weight`, `Resizeable` |

---

## Complete Accordion Component Object

This object goes inside the `component` field of a screen widget wrapper.

```json
{
  "id": "<accordion-uuid>",
  "key": "Accordion",
  "options": {
    "version": "4.7.7",
    "Basics": {
      "ComponentName": "accordion",
      "Name": "",
      "Direction": "Vertical",
      "ScaleOnResize": false,
      "Sections": [
        {
          "SectionId": "section_1001",
          "Title": "Section A",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 1,
          "Resizeable": false,
          "HideTitle": false
        },
        {
          "SectionId": "section_1002",
          "Title": "Section B",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 1,
          "Resizeable": false,
          "HideTitle": false
        }
      ]
    },
    "Style": {
      "Theme": "Dark",
      "advanced": "",
      "cssClasses": ""
    },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
      "innerPaddingLeft": 0, "innerPaddingRight": 0,
      "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0,
      "titlePaddingTop": 7, "titlePaddingBottom": 7
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
  },
  "containerId": null,
  "components": [],
  "widgets": [
    {
      "id": "<child-widget-uuid-1>",
      "layout": { "row": null, "column": null, "rowSpan": 12, "colSpan": 36 },
      "component": {
        "id": "<child-component-uuid-1>",
        "key": "Datagrid",
        "options": { "version": "v2.5.1", "Basics": { ... } },
        "containerId": null,
        "components": [],
        "widgets": [],
        "definitionId": "21",
        "hasOnSettingsChange": true
      },
      "sectionId": "section_1001"
    },
    {
      "id": "<child-widget-uuid-2>",
      "layout": { "row": null, "column": null, "rowSpan": 12, "colSpan": 36 },
      "component": {
        "id": "<child-component-uuid-2>",
        "key": "ChartGL",
        "options": { "version": "4.7.7", "Basics": { ... } },
        "containerId": null,
        "components": [],
        "widgets": [],
        "definitionId": "669",
        "hasOnSettingsChange": true
      },
      "sectionId": "section_1002"
    }
  ],
  "definitionId": "56",
  "hasOnSettingsChange": true
}
```

**Where `widgets[]` lives:**
```
Screen.widgets[]
  └── { id, layout, component: {        ← screen widget wrapper
          key: "Accordion",
          options: { Basics.Sections: [...] },
          widgets: [                     ← accordion's OWN section children — here
            { id, layout, component, sectionId: "section_1001" },
            { id, layout, component, sectionId: "section_1002" }
          ]
        }}
```

`widgets[]` is a field **on the accordion component object**, alongside `options`. It is NOT inside `options`, and NOT at the screen wrapper level.

---

## Rules for Generating Sections

1. **N sections = N widget entries.** Every `Basics.Sections` entry needs exactly one entry in `widgets[]`.

2. **`SectionId` on each section must be set explicitly.** Never omit it. Format: `"section_"` followed by a short unique integer (e.g. `"section_1001"`). If you omit `SectionId`, the runtime generates `"section_1"`, `"section_2"` etc. — these will not match any `sectionId` on widget entries.

3. **`sectionId` on widget entries is lowercase** (`sectionId`, not `SectionId`). It must exactly match the section's `SectionId` value.

4. **`sectionId` goes after `component`** in each widget entry object.

5. **Child `component` must be a complete component object** with `id`, `key`, `options`, `containerId`, `components`, `widgets`, `definitionId`, `hasOnSettingsChange`.

6. **`definitionId` on the accordion is `"56"` (string, not number).**

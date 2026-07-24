# kx-accordion — Worked Examples

> Three complete copy-ready Accordion configurations. Back to [SKILL.md](../SKILL.md).

**Contents:** Two-section vertical accordion · Horizontal accordion (three resizable columns) · Flex section (auto-height toolbar) + weighted content area

---

## Example: Two-section vertical accordion

```json
{
  "id": "acc-00000001-0000-0000-0000-000000000001",
  "key": "Accordion",
  "options": {
    "version": "4.7.7",
    "Basics": {
      "ComponentName": "accordion",
      "Name": "My Accordion",
      "Direction": "Vertical",
      "ScaleOnResize": false,
      "Sections": [
        {
          "SectionId": "section_1001",
          "Title": "Filters",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 1,
          "Resizeable": true,
          "HideTitle": false
        },
        {
          "SectionId": "section_1002",
          "Title": "Results",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 3,
          "Resizeable": false,
          "HideTitle": false
        }
      ]
    },
    "Style": { "Theme": "Dark", "advanced": "", "cssClasses": "" },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
      "innerPaddingLeft": 0, "innerPaddingRight": 0,
      "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0,
      "titlePaddingTop": 7, "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
      "tileBorderWidth": 0, "tileBorderRounding": 0,
      "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true, "tileShadow": false
    }
  },
  "containerId": null,
  "components": [],
  "widgets": [
    {
      "id": "wgt-00000002-0000-0000-0000-000000000002",
      "layout": { "row": null, "column": null, "rowSpan": 8, "colSpan": 36 },
      "component": {
        "id": "cmp-00000003-0000-0000-0000-000000000003",
        "key": "DataFilter",
        "options": {
          "version": "4.7.7",
          "Basics": {
            "ComponentName": "datafilter",
            "Name": "",
            "Data": { "_dashboardsType": "data", "value": "myQuery" },
            "Fields": []
          },
          "Style": { "Theme": "Dark", "advanced": "", "cssClasses": "" },
          "Alignment": {
            "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
            "innerPaddingLeft": 0, "innerPaddingRight": 0,
            "innerPaddingTop": 0, "innerPaddingBottom": 0,
            "titlePaddingLeft": 0, "titlePaddingRight": 0,
            "titlePaddingTop": 7, "titlePaddingBottom": 7
          },
          "format": {
            "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
            "tileBorderWidth": 0, "tileBorderRounding": 0,
            "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
            "tileTransparentBackground": true, "tileShadow": false
          }
        },
        "containerId": null,
        "components": [],
        "widgets": [],
        "definitionId": "48",
        "hasOnSettingsChange": true
      },
      "sectionId": "section_1001"
    },
    {
      "id": "wgt-00000004-0000-0000-0000-000000000004",
      "layout": { "row": null, "column": null, "rowSpan": 16, "colSpan": 36 },
      "component": {
        "id": "cmp-00000005-0000-0000-0000-000000000005",
        "key": "Datagrid",
        "options": {
          "version": "v2.5.1",
          "Basics": {
            "ComponentName": "datagrid",
            "Name": "",
            "Data": { "_dashboardsType": "data", "value": "myQuery" },
            "Columns": []
          },
          "Style": { "Theme": "Dark", "advanced": "", "cssClasses": "" },
          "Alignment": {
            "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
            "innerPaddingLeft": 0, "innerPaddingRight": 0,
            "innerPaddingTop": 0, "innerPaddingBottom": 0,
            "titlePaddingLeft": 0, "titlePaddingRight": 0,
            "titlePaddingTop": 7, "titlePaddingBottom": 7
          },
          "format": {
            "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
            "tileBorderWidth": 0, "tileBorderRounding": 0,
            "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
            "tileTransparentBackground": true, "tileShadow": false
          }
        },
        "containerId": null,
        "components": [],
        "widgets": [],
        "definitionId": "21",
        "hasOnSettingsChange": true
      },
      "sectionId": "section_1002"
    }
  ],
  "definitionId": "56",
  "hasOnSettingsChange": true
}
```

---

## Example: Horizontal accordion (three resizable columns)

```json
{
  "id": "acc-00000010-0000-0000-0000-000000000010",
  "key": "Accordion",
  "options": {
    "version": "4.7.7",
    "Basics": {
      "ComponentName": "accordion",
      "Name": "",
      "Direction": "Horizontal",
      "ScaleOnResize": false,
      "Sections": [
        {
          "SectionId": "section_2001",
          "Title": "Navigation",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 495,
          "Resizeable": true,
          "HideTitle": false
        },
        {
          "SectionId": "section_2002",
          "Title": "Main",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 1026,
          "Resizeable": true,
          "HideTitle": false
        },
        {
          "SectionId": "section_2003",
          "Title": "Detail",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 500,
          "Resizeable": false,
          "HideTitle": false
        }
      ]
    },
    "Style": { "Theme": "Dark", "advanced": "", "cssClasses": "" },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
      "innerPaddingLeft": 0, "innerPaddingRight": 0,
      "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0,
      "titlePaddingTop": 7, "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
      "tileBorderWidth": 0, "tileBorderRounding": 0,
      "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true, "tileShadow": false
    }
  },
  "containerId": null,
  "components": [],
  "widgets": [
    {
      "id": "wgt-00000011-0000-0000-0000-000000000011",
      "layout": { "row": null, "column": null, "rowSpan": 24, "colSpan": 36 },
      "component": { "id": "cmp-nav", "key": "Panel", "options": { ... }, "containerId": null, "components": [], "widgets": [], "definitionId": "50", "hasOnSettingsChange": true },
      "sectionId": "section_2001"
    },
    {
      "id": "wgt-00000012-0000-0000-0000-000000000012",
      "layout": { "row": null, "column": null, "rowSpan": 24, "colSpan": 36 },
      "component": { "id": "cmp-main", "key": "Panel", "options": { ... }, "containerId": null, "components": [], "widgets": [], "definitionId": "50", "hasOnSettingsChange": true },
      "sectionId": "section_2002"
    },
    {
      "id": "wgt-00000013-0000-0000-0000-000000000013",
      "layout": { "row": null, "column": null, "rowSpan": 24, "colSpan": 36 },
      "component": { "id": "cmp-detail", "key": "Panel", "options": { ... }, "containerId": null, "components": [], "widgets": [], "definitionId": "50", "hasOnSettingsChange": true },
      "sectionId": "section_2003"
    }
  ],
  "definitionId": "56",
  "hasOnSettingsChange": true
}
```

---

## Example: Flex section (auto-height toolbar) + weighted content area

```json
{
  "id": "acc-00000020-0000-0000-0000-000000000020",
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
          "SectionId": "section_3001",
          "Title": "Toolbar",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": true,
          "MinSize": 0,
          "MaxSize": 80,
          "HideTitle": true
        },
        {
          "SectionId": "section_3002",
          "Title": "Data",
          "TitleAlign": "Left",
          "Expanded": true,
          "Flex": false,
          "Weight": 1,
          "Resizeable": false,
          "HideTitle": false
        }
      ]
    },
    "Style": { "Theme": "Dark", "advanced": "", "cssClasses": "" },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
      "innerPaddingLeft": 0, "innerPaddingRight": 0,
      "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0,
      "titlePaddingTop": 7, "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
      "tileBorderWidth": 0, "tileBorderRounding": 0,
      "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true, "tileShadow": false
    }
  },
  "containerId": null,
  "components": [],
  "widgets": [
    {
      "id": "wgt-00000021-0000-0000-0000-000000000021",
      "layout": { "row": null, "column": null, "rowSpan": 3, "colSpan": 36 },
      "component": { "id": "cmp-toolbar", "key": "DataFilter", "options": { ... }, "containerId": null, "components": [], "widgets": [], "definitionId": "48", "hasOnSettingsChange": true },
      "sectionId": "section_3001"
    },
    {
      "id": "wgt-00000022-0000-0000-0000-000000000022",
      "layout": { "row": null, "column": null, "rowSpan": 20, "colSpan": 36 },
      "component": { "id": "cmp-data", "key": "Datagrid", "options": { ... }, "containerId": null, "components": [], "widgets": [], "definitionId": "21", "hasOnSettingsChange": true },
      "sectionId": "section_3002"
    }
  ],
  "definitionId": "56",
  "hasOnSettingsChange": true
}
```
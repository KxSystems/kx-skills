---
name: kx-accordion
description: "Use this when the user wants collapsible or expandable sections in a KX Dashboards layout. Use it for section-based content organization; use kx-tabs for tabbed switching and kx-flex-panel for non-collapsible flexible layout containers."
requires:
  - kx-dashboard-core
---

# KX Accordion Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, actions.

`key: "Accordion"` · `definitionId: "56"` · `version: "4.7.7"`

This skill uses **progressive disclosure**: the component identity, the SectionId hazard, the workflow, and the output checklist are here; the bulky JSON schema, field tables, and worked examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The canonical `options` object, full `Basics` and `Sections` field tables, the `Flex` vs `Weight` rule, the complete accordion component object (with child `widgets[]`), and the section-generation rules. |
| [reference/examples.md](reference/examples.md) | Copy-ready worked examples — two-section vertical, three-column horizontal, and Flex-toolbar + weighted content accordions. |

---

## Component Identity (from componentDefinition.ts)

| Field | Value |
|---|---|
| `key` | `"Accordion"` |
| `definitionId` | `"56"` |
| `version` | `"4.7.7"` |
| `hasOnSettingsChange` | `true` |


---

## ⚠️ CRITICAL: The SectionId Trap

The `componentDefinition.ts` default section template does **NOT** include `SectionId`:

```json
// ❌ This is what componentDefinition.ts shows — DO NOT copy this for chat output
{
  "Title": "Section",
  "TitleAlign": "Left",
  "Expanded": true,
  "Weight": 1,
  "Resizeable": false,
  "HideTitle": false,
  "Flex": false
}
```

**Generating sections without `SectionId` will produce EMPTY sections.**

Here is why. At runtime (`app.ts > onSettingsChange`):

```javascript
sectionId = section["SectionId"];
if (!sectionId) {
    // SectionId was absent → auto-generate a UNPREDICTABLE value
    sectionId = _.uniqueId("section_");   // "section_1", "section_7", "section_23" …
}
sectionOptions["sectionId"] = sectionId; // stored on the section view-model
```

Then `SectionDropView.addWidget` assigns each widget to its section by matching:

```javascript
widgetModel.get("sectionId") === this.section.viewModel.get("sectionId")
```

Because `_.uniqueId` uses a global counter, the auto-generated IDs are unpredictable. Any `sectionId` value on a widget entry will fail to match → **the widget never appears in the section**.

### The fix: always add `SectionId` explicitly

```json
// ✅ Always use this form in chat output — SectionId is REQUIRED
{
  "SectionId": "section_1001",
  "Title": "Section",
  "TitleAlign": "Left",
  "Expanded": true,
  "Weight": 1,
  "Resizeable": false,
  "HideTitle": false,
  "Flex": false
}
```

And every widget entry that belongs to this section must carry the **same value** as a lowercase `sectionId` field:

```json
{
  "id": "...",
  "layout": { ... },
  "component": { ... },
  "sectionId": "section_1001"   ← must exactly match section's SectionId
}
```

**Summary rule**: Every section → explicit `SectionId`. Every widget entry → matching lowercase `sectionId`.

---

## Workflow

1. **Confirm the layout.** Decide `Direction` (`"Vertical"` or `"Horizontal"`), how many sections, and which are `Flex` (auto-size) vs `Weight` (ratio). Component identity (`key`, `definitionId`, `version`) is in the table above.
2. **Assign explicit `SectionId`s.** Give every section a `"section_<int>"` id (see the SectionId Trap above) — never rely on the auto-generated value.
3. **Build the accordion `options`.** Use the Canonical Options Structure and the `Basics`/`Sections` field tables in `reference/component-schema.md`, respecting the Flex-vs-Weight rule.
4. **Add one `widgets[]` entry per section.** Each entry is a full child `component` object plus a lowercase `sectionId` matching its section's `SectionId`. See the complete component object and Rules for Generating Sections in `reference/component-schema.md`.
5. **Match a worked example.** Copy the closest shape from `reference/examples.md` (vertical, horizontal, or Flex-toolbar) and adapt it.
6. **Validate** against the Pre-flight Checklist below.

---

## Pre-flight Checklist

Before returning the JSON, verify:

- [ ] Every `Basics.Sections` entry has an explicit `SectionId` (e.g. `"section_1001"`)
- [ ] The accordion's `widgets[]` has the **same number of entries** as `Basics.Sections`
- [ ] Each widget entry's `"sectionId"` (lowercase) exactly matches its section's `"SectionId"` (capital SI)
- [ ] `"sectionId"` appears **after** `"component"` in each widget entry
- [ ] `widgets[]` is a sibling of `options` on the accordion component object — not inside `options`
- [ ] Every child `component` object is complete: `id`, `key`, `options`, `containerId`, `components`, `widgets`, `definitionId`, `hasOnSettingsChange`
- [ ] `definitionId` on the accordion is the string `"56"`
- [ ] All `id` fields are unique UUIDs across the entire dashboard
- [ ] `Flex: false` sections have `Weight` + `Resizeable`; `Flex: true` sections have `MinSize` + `MaxSize`


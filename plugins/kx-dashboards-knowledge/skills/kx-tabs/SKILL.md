---
name: kx-tabs
description: "Use this when the user wants a KX Dashboards tabbed interface that switches between grouped content sections. Use it for tabbed navigation or content organization; use kx-accordion for collapsible sections and kx-basiccomponents-containers for general panels and drawers."
requires:
  - kx-dashboard-core
---

# KX Tabs

`key: "Tabs"` · `definitionId: "26"` · `version: "v2.14.0"`

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, and the pre-flight checklist.

The Tabs component is a **container**: it does not render data itself, it groups other components (Datagrid, ChartGL, Panel, Text, …) into named, switchable tabs. Each child is assigned to a tab by `containerId`.

This skill uses **progressive disclosure**: the hazards, workflow, and validation rules are here; the bulky JSON schema, field tables, worked examples, and regression tests live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The component identity, full options envelope (`components[]`, `widgets[]`, `Items[]`, `Selection`, `dropdownPossibleValues`, `Basics`, `Style`, `Alignment`, `format`), field tables, the UUID checklist, NL→JSON mapping rules, and ViewState-on-switch wiring. |
| [reference/examples.md](reference/examples.md) | Five worked NLQ → JSON examples (empty tabs, a child per tab, default tab, ViewState-on-switch, hidden/PDF-excluded tabs) to copy from. |
| [reference/nlq-tests.md](reference/nlq-tests.md) | Maintainer NLQ regression queries to retest on every MR that changes this skill. |

---

## When to Use This Skill

- User asks for tabs, a tabbed interface, tabbed navigation/content/layout/view, a tab control, tab panel, tabbed sections, or tabbed pages
- User wants to group several existing components (grids, charts, panels, text) into switchable tabs
- User wants a dashboard area that opens on a specific tab, hides a tab, excludes a tab from PDF, or publishes the active tab to a ViewState

---

## ⚠️ Tabs Hazards

1. **`components[]` and `widgets[]` must BOTH be populated.** Empty arrays = blank tabs. Every child appears in **both** arrays, each with `containerId` set to the target tab's `Items[n].Id`.
2. **`components[]` = lightweight copy** (minimal options — just enough to register the child). **`widgets[]` = full definition** (complete options + grid `layout`, used for rendering).
3. **`containerId` must be set in three places per child:** the `components[]` entry, the `widgets[]` wrapper, and `widgets[].component`. All three carry the **same** tab `Items[].Id`.
4. **The same child UUID is reused** in `components[n].id` and `widgets[n].component.id`. The `widgets[n].id` (the wrapper) is a **separate** UUID.
5. **`target_tab` is a 0-based integer** (`0` = first tab). Not a string, not the tab name. `1` opens on the second tab by default.
6. **`Items[].Id` must be a unique GUID per tab.** Generate fresh UUIDs — never reuse, never leave empty.
7. **`dropdownPossibleValues` mirrors `Items[]`** but uses sequential **numeric** `Id` starting at `0` (`0, 1, 2 …`), not the GUIDs.
8. **The Tabs component's own `containerId` is `null`** (unless the Tabs itself is nested inside another container).
9. **An empty tab is valid** — a tab with no assigned child renders as a blank panel. Only add children for tabs the user asked to fill.

---

## Workflow

1. **Clarify the tabs.** Get the tab names (or count) and which child component belongs in each tab. An empty tab is valid, so only fill the tabs the user asked for.
2. **Generate UUIDs.** Create a fresh GUID per tab (`Items[].Id`), plus a child id + wrapper id per child. See the UUID checklist in `reference/component-schema.md`.
3. **Build the Tabs envelope** — `key: "Tabs"`, `definitionId: "26"`, `version: "v2.14.0"`, `containerId: null`, `Items[]` and a length/order-matched `dropdownPossibleValues` (numeric ids). Full schema in `reference/component-schema.md`.
4. **Add each child to BOTH arrays** — a lightweight entry in `components[]` and a full, positioned definition in `widgets[]`, with `containerId` = the target tab's `Items[].Id` in all three places (see Hazards #1–#3).
5. **Set `Selection`** — `target_tab` (0-based integer), and optionally `unloadInactive`, `expandOnPdf`, and `SetViewStateOnSelect` for ViewState-on-switch (see `reference/component-schema.md`).
6. **Copy a pattern** from `reference/examples.md` when one matches the request.
7. **Validate** against the Hazards above and the Validation Checklist below before returning JSON.

---

## Validation Checklist

Before returning any Tabs JSON:

- [ ] `key` is `"Tabs"` and `definitionId` is the string `"26"`
- [ ] `options.version` is `"v2.14.0"`
- [ ] `Basics.ComponentName` is `"tabs"`
- [ ] Tabs component `containerId` is `null` (unless nested in another container)
- [ ] Every `Items[]` entry has a unique, freshly-generated GUID `Id`
- [ ] `dropdownPossibleValues` has the same count/order as `Items[]`, with **numeric** `Id` (`0,1,2…`) and matching `Name`s
- [ ] `Selection.target_tab` is a **0-based integer** within range (`0 … Items.length-1`)
- [ ] For every child requested: it exists in **both** `components[]` and `widgets[]`
- [ ] Each child's `containerId` appears in **three** places (`components[]` entry, `widgets[]` wrapper, `widgets[].component`) and equals an existing `Items[].Id`
- [ ] `components[n].id` equals `widgets[n].component.id` (same UUID); `widgets[n].id` is a different UUID
- [ ] Each `widgets[]` wrapper has a `layout` block (`row`, `column`, `rowSpan`, `colSpan`)
- [ ] Tabs with no requested child leave `components[]`/`widgets[]` empty for that tab (blank panel is valid)
- [ ] `Style`, `Actions`, `Alignment`, and `format` blocks are present and complete
- [ ] All `id` fields are unique UUIDs across the entire dashboard
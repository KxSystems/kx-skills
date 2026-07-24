---
name: kx-button
description: "Use this when the user wants a KX Dashboards button or clickable action trigger: labels, icons, tooltips, alignment, fixed width, disabled state, colours, and click actions. Use it for buttons and action triggers; use kx-textinput for free-text entry, kx-dropdown for selection lists, or kx-selectioncontrols for radio/checkbox choices."
requires:
  - kx-dashboard-core
---

# KX Button

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, deployment, and the pre-flight checklist.

`key: "BasicComponents"` · `definitionId: "25"` · `version: "v2.9.0"`

This skill uses **progressive disclosure**: the workflow, hazards, and output rules are here; the bulky JSON schema, config tables, worked examples, and test queries live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/generate-config.md](reference/generate-config.md) | `generate.js` `componentType: "button"` config — Quick Start, minimal config, and the `makeButtonWidget` config-key table. |
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full options envelope (`Basics`, `Style`, `Actions`, `Alignment`, `format`) plus the per-property Config Keys table. |
| [reference/mapping.md](reference/mapping.md) | Turning a natural-language request into properties — NL→JSON rules, named-colour hexes, and the icon-prefix rules. |
| [reference/examples.md](reference/examples.md) | Six worked NLQ → JSON examples (minimal, styled, query, nav, fixed-width disabled, multi-action). |
| [reference/nlq-tests.md](reference/nlq-tests.md) | Maintainer NLQ regression queries to retest on every MR that changes this skill. |

---

## ⚠️ Button Hazards

1. **`key` is always `"BasicComponents"`**, not `"Button"`. `definitionId: "25"` differentiates it from Dropdown (`16`), DatePicker (`15`), TextInput (`33`), and SelectionControls (`34`).
2. **`Style.background` triggers a 3-stop gradient** — passing `"#0061FF"` causes the component to auto-compute darker gradient shades. Omit it (`""`) to use the default theme button appearance.
3. **`Basics.Icon` requires the full class prefix.** FontAwesome: `"fa fa-play"`. Material: `"mi mi-refresh"`. Passing just `"fa-play"` or `"refresh"` silently drops the icon — no error is shown.
4. **`Basics.fixedWidth: true` requires a numeric `Basics.width`.** Without `width`, the button falls back to 100% of its container. `width` is in pixels.
5. **`Basics.isEnabled: false` disables the button visually and functionally.** Map this to a ViewState binding if you need runtime toggle.
6. **`Actions` fires on button click** and must be a top-level array inside `options`, **not** inside `Basics`.
7. **Navigation actions always fire last** regardless of their position in the `Actions` list (see kx-dashboard-core).


---

## Workflow

1. **Clarify intent.** Establish the label, any icon, colours, alignment, width, enabled state, and what should happen on click. If the click behaviour is ambiguous, ask one focused question before generating.
2. **Build the envelope.** Start from the full component JSON (`key: "BasicComponents"`, `definitionId: "25"`, `version: "v2.9.0"`) in `reference/component-schema.md`.
3. **Set `Basics`.** Map label, font size, alignment, fixed width, and enabled state using the Config Keys table and NL→JSON rules in `reference/mapping.md`.
4. **Resolve icon and colours.** Use the icon-prefix rules (always `"fa fa-"` / `"mi mi-"`) and named-colour hexes in `reference/mapping.md`.
5. **Wire `Actions`.** Add `map` / `query` / `nav` click actions per `reference/mapping.md`; keep any navigation action last.
6. **Or use generate.js** with `componentType: "button"` and the config keys in `reference/generate-config.md`.
7. **Validate** against the Hazards above and the Validation Checklist below. Copy from `reference/examples.md` when a pattern matches.

---

## Validation Checklist

Before returning any Button JSON:

- [ ] `key` is `"BasicComponents"` and `definitionId` is `"25"`
- [ ] `options.version` is `"v2.9.0"`
- [ ] `Basics.ComponentName` is `"Button"` — **never omit this, the component will not render without it**
- [ ] `Basics.Label` is a non-empty string
- [ ] `Basics.horizontal` is `"Left"`, `"Center"`, or `"Right"`
- [ ] `Basics.vertical` is `"Top"`, `"Middle"`, or `"Bottom"`
- [ ] `Basics.Icon` uses the full double-prefix form (`"fa fa-..."` / `"mi mi-..."`) or `""`
- [ ] `Basics.fixedWidth: true` is always paired with a numeric `Basics.width`
- [ ] `Style.background`, `Style.color`, `Style.border` are hex strings or `""` (never `null`)
- [ ] `Actions` is an array (never omitted or `null`)
- [ ] Navigation actions are the last entries in the `Actions` array
- [ ] `Alignment` and `format` blocks are present and complete
- [ ] `id` = `hash` = filename stem (enforced by `generateDashboard`)

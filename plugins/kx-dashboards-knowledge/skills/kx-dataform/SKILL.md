---
name: kx-dataform
description: "Use this when the user wants a KX Dashboards parameter-input form that writes values into ViewStates and re-executes a data source on submit: simple input panels, forms with dropdowns, date pickers, sliders, or password fields. Use kx-formbuilder for free-form record entry and kx-datafilter for filter/query-builder UIs instead."
requires:
  - kx-dashboard-core
---

# KX Dataform Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the workflow, hazards, and output rules are here; the bulky JSON schema, config tables, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/generate-config.md](reference/generate-config.md) | `generate.js` `componentType: "dataform"` config keys — `formFields`, `basics`, `style` tables. |
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full options envelope, `Basics`, form-field (`ViewStates`) entry + `PathEnc` rule, the six field types, `Style`, grouped-ViewState setup. |
| [reference/data-source-patterns.md](reference/data-source-patterns.md) | Wiring the submit data source — kdb+ query (Pattern A) vs virtual (Pattern B), inline param syntax, kdb+ type codes. |
| [reference/examples.md](reference/examples.md) | A full worked example plus 8 few-shot NLQ → JSON examples. |
| [reference/nlq-tests.md](reference/nlq-tests.md) | Maintainer NLQ regression queries to retest on every MR that changes this skill. |

---

## When to Use This Skill

- User asks to create a parameter form or submit form for a KX Dashboard
- User wants to let dashboard users set kdb+ query parameters interactively (sym, date range, threshold, etc.)
- User wants form fields to publish values into grouped ViewStates (e.g. `"Form 1/sym"`) and re-execute a data source on submit
- User wants to combine a Dataform with a Datagrid to show the result of the submitted parameters

---

## ⚠️ Dataform-Specific Hazards

1. **`PathEnc` must be URL-encoded.** The ViewState path `"Dataform 1/sym"` becomes `"Dataform%201%2Fsym"`. Always URL-encode: space → `%20`, slash → `%2F`. Never use the raw path.
2. **ViewStates must be grouped under the form name.** Use `"FormName/fieldName"` paths (e.g. `"Dataform 1/sym"`). Flat ViewState names (e.g. just `"sym"`) will NOT bind to form fields correctly.
3. **`version` must be `"v2.4.0"`** — not `"c2.4.0"`. The exported dashboard JSON uses `"v2.4.0"`.
4. **Virtual data source `_virtualParams` values are raw paths** (not encoded): `"Dataform 1/sym"`, not `"Dataform%201%2Fsym"`.
5. **`Data` in Basics must be a data binding object** (`{ "_dashboardsType": "data", "value": "<name>" }`), never an empty string if a submit source exists.
6. **`isDataform: true`** must be set in options alongside `version` — omitting it disables form-mode behaviour.
7. **Dropdown `DataSourceMapping.Value` and `.Text`** must be actual column names from the dropdown data source; leaving them empty renders a blank list.
8. **Number field `Increment`** must be a positive number — `0` is invalid and disables the spinner.
9. **Never invent unknown `_Type` values** for `FieldType`. Valid types: `"Default"`, `"Dropdown"`, `"Number"`, `"Datepicker"`, `"Slider"`, `"Password"`.

---

## Workflow

1. **Clarify inputs.** You need the connection name and the field list with types. If the request is ambiguous, ask one focused question before generating (see Output Contract).
2. **Declare grouped ViewStates** under the form name — `"FormName/field"` paths (see `reference/component-schema.md` → ViewState Setup).
3. **Wire the submit data source** — kdb+ query (live) or virtual (client-side display). See `reference/data-source-patterns.md`.
4. **Build the component** — envelope + `Basics` + one `ViewStates` entry per field (URL-encode every `PathEnc`!) + `Style`. Field-type shapes and the `PathEnc` rule are in `reference/component-schema.md`.
5. **Or use generate.js** with `componentType: "dataform"` and the config keys in `reference/generate-config.md`.
6. **Validate** against the Hazards above and the Output Contract below. Copy from `reference/examples.md` when a pattern matches.

---

## Output Contract

- Return JSON objects only. No commentary inside JSON output.
- Full Dataform config → one component object shaped as in `reference/component-schema.md` (includes `Basics`, `Style`, `Alignment`, `format`, `version`, `isDataform`).
- `ViewStates` array only → return `Basics.ViewStates` array.
- Always include `Basics.Data` in a full config; use `"<YOUR_DATA_SOURCE>"` as placeholder if the source is not provided.
- `PathEnc` must always be URL-encoded — never the raw path.
- `version` must be `"v2.4.0"` (not `"c2.4.0"`).
- `isDataform: true` must always be present in `options`.
- If user request is ambiguous (e.g. no connection name, no field types), ask one focused clarification question before generating JSON.

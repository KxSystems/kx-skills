---
name: kx-formbuilder
description: "Use this when the user wants a KX Dashboards data-entry form that collects user values for submission or editing, including dynamic forms, validators, and form-state output to ViewStates. Use kx-dataform for parameter-input forms that re-run data sources on submit rather than general data entry."
requires:
  - kx-dashboard-core
---

# KX FormBuilder Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the workflow, hazards, and output rules are here; the bulky JSON schema, field/validator/style tables, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full options envelope, `Basics`, `Elements` field object, all kdb `Field Types` (incl. `list` dropdown and `group`), `Validators`, `Style`, `Actions`, and `StateOutput`. |
| [reference/examples.md](reference/examples.md) | A full worked Trade Entry Form plus 5 few-shot NLQ → JSON examples. |
| [reference/nlq-tests.md](reference/nlq-tests.md) | Maintainer NLQ regression queries to retest on every MR that changes this skill. |

---

## When to Use This Skill

- User wants a form widget that collects values from dashboard users
- User wants to bind form field values to ViewStates and re-execute queries on submit
- User wants a dynamic form whose schema is driven by a live kdb+ query (`FormDefinition`)
- User wants to trigger actions (map, navigate, re-execute query) on Submit, Cancel, or Change events
- User wants to write form values back to a ViewState via `StateOutput`


## ⚠️ FormBuilder-Specific Hazards

1. **Element `id` must be unique across all Elements including nested groups.** Duplicate ids silently overwrite each other in the output values object.
2. **`type._Type` is the kdb type string** — `symbol`, `int`, `float`, `date`, `list`, `group`, etc. Never set `type` to a plain string; it must always be an object with `_Type`.
3. **`list` is the dropdown type, not a kdb list.** To present a dropdown to the user, set `type._Type` to `"list"`. The output value type is recorded as `"symbol"`.
4. **`password` only applies to `symbol` fields.** Setting `password: true` on any other type has no effect.
5. **`group` fields carry their child fields in a nested `Elements` array**, not under `type`. The group's own `type._Type` is `"group"` with an optional `layout` sub-property.
6. **Actions `Trigger` values are `"Submit"`, `"Cancel"`, `"Change"`** — not `"Click"`. Using `"Click"` will silently do nothing.
7. **`StateOutput` Trigger fires a map action that writes the entire form's current values** to the target ViewState. `Current` is auto-populated; only set `Target`.
8. **`FormDefinition` binding overrides `Elements`.** When `Basics.FormDefinition` is bound to a ViewState, the properties panel hides the Elements editor and the form schema comes entirely from kdb.
9. **`FormValues` is a two-way binding.** It can pre-populate fields on load (if the ViewState has values) and receives the latest form values after every change.
10. **`ignoreOnChange` excludes a field from the `Change` trigger output** but not from `Submit` or `Cancel`. Use it for UI-only controls that shouldn't re-trigger queries on every keystroke.


## Workflow

1. **Clarify inputs.** You need the field list with kdb types, the submit data source (and connection), and where values should go. If the request is ambiguous, ask one focused question before generating (see Output Contract).
2. **Choose the schema source.** Author fixed fields in `Elements`, or bind `Basics.FormDefinition` to a ViewState for a kdb-driven schema (then `Elements` must be `[]`). See `reference/component-schema.md` → Basics.
3. **Build each Element** — one object per field with a unique `id` and a `type._Type` object (`symbol`, `int`, `float`, `date`, `list`, `group`, …). Field-type shapes, dropdown (`list`) and nested `group` rules are in `reference/component-schema.md` → Field Types.
4. **Add validators** (`required`, `email`, `url`, `range`, `regexp`) per field as needed — see `reference/component-schema.md` → Validators.
5. **Wire triggers.** Add `Actions` (`_Type: query`/`nav`/`map`, Trigger `Submit`/`Cancel`/`Change`) to re-execute a data source, and/or `StateOutput` to write the full form values to a ViewState. See `reference/component-schema.md` → Actions & StateOutput.
6. **Set `Style`** — `Layout`, `HideSubmit`/`HideCancel`, `LabelWidths`, `MaxFormWidth`, alignment.
7. **Validate** against the Hazards above and the Output Contract below. Copy from `reference/examples.md` when a pattern matches.

---

## Output Contract

- Return JSON only. No commentary inside JSON output.
- `key` must be `"FormBuilder"` and `definitionId` must be `"1014"`.
- `version` must be `"4.7.7"`.
- Every Element must have a unique `id`.
- `type` must always be an object with `_Type` — never a plain string.
- `password: true` is only valid on `symbol` type fields.
- `group` Elements must have an `Elements` array; non-group Elements must not.
- When `Basics.FormDefinition` is bound to a ViewState, set `Elements` to `[]`.
- `Actions` and `StateOutput` `Trigger` values must be `"Submit"`, `"Cancel"`, or `"Change"`.
- If the prompt is ambiguous (e.g. no connection name, unclear field types), ask one focused clarification question before generating JSON.

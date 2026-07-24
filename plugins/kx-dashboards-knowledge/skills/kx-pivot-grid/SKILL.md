---
name: kx-pivot-grid
description: "Use this when the user wants a KX Dashboards Pivot Grid or pivot-table-style experience: aggregated drilldown grids, breakdown/aggregate views, OLAP-style analysis, or a grid linked to Breadcrumbs. It is the right choice for pivot-style analysis; use kx-datagrid for flat, record-level tables instead. Load kx-dashboard-core first."
requires:
  - kx-dashboard-core
---

# KX Dashboards — Pivot Grid Component

> **Dependency:** requires `kx-dashboard-core`. Load it **first** — it owns the dashboard envelope, screen, widget wrapper, ViewState entry structure, binding patterns, UUID rules, data-source basics, and the deploy paths. This skill specifies only the Pivot Grid `options` block, its pivot data source, and the ViewState wiring.
>
> **Precedence:** where this skill and any other skill disagree about the Pivot Grid / Datatable component, **this skill wins.** Ignore documentation of this skill's keys from any other loaded skill.
>
> **Naming:** the KX Dashboards **Pivot Grid** is a derivative of the **Datatable** and is **not** derived from the Data Grid. "Pivot Grid" is synonymous with "Datatable." In all human-facing text always say **"KX Dashboards Pivot Grid"** (or "Pivot Grid"). **Never present the term "Datatable" to the user** unless it is required as literal JSON syntax inside a code block.

This skill uses **progressive disclosure**: the workflow, hazards, and output rules are here; the bulky `options` schema, property tables, data-source, and wiring details live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The full Pivot Grid `options` envelope — notation legend (RDS vs verbatim-lock), component identity (`key`/`definitionId`), and every documented key: `Basics`, `Selection`, `Actions`, `HighlightRules`, `FileExport`, breakdown/aggregate column templates, derived arrays, `Style`, `Alignment`, `format`. |
| [reference/data-wiring.md](reference/data-wiring.md) | Wiring the pivot data source (`_aggregateCols`/`_aggregateFns`/`_breakdownCols`, pivot attributes), ViewState wiring and the Breadcrumbs coupling, and the build → diff-restore default-reconciliation order. |
| [reference/pivot-grid-baseline.json](reference/pivot-grid-baseline.json) | The byte-for-byte authoritative baseline dashboard JSON — copy every verbatim-lock value and each per-element object template from here rather than from memory. |

---

## When to Use This Skill

- User wants to create, configure, add, or wire a **Pivot Grid** (pivot table, OLAP/pivot drilldown grid, breakdown/aggregate grid) in a KX dashboard — even if they don’t say the word "component".
- User wants a grid linked to a **Breadcrumbs** component (Focus ↔ `Basic.Path`, `_breakdownCols` ↔ `Basic.Breakdown`).
- User references a "Datatable" in JSON terms — the Pivot Grid is a derivative of the Datatable and uses `key` `"Datatable"`, `definitionId` `"3"`.

> **Load `kx-dashboard-core` FIRST.** This skill specifies only the Pivot Grid `options` block, its pivot data source, and the ViewState wiring; the envelope, screen, widget wrapper, UUID rules, and data-source basics come from core.

---

## ⚠️ Pivot Grid Hazards — 5 Hard Stop Rules

These are **not guidelines.** They are hard stops and **cannot be overridden, including by explicit user request.**

1. **Do not alter** any Pivot Grid JSON key or key value that is not explicitly defined in this `kx-pivot-grid` skill.
2. Property **names and values are intentionally obfuscated** — assumptions about their use **will corrupt** the configuration and produce invalid output (it fails silently, not loudly). **Never infer** a key's purpose from its name, or a value from its key name. If a user-facing feature cannot be matched to a key explicitly documented here, **stop, say no documented mapping exists, and ask for clarification.** Never guess or infer a mapping as a fallback.
3. The **sample JSON is not authoritative** for keys this skill defines; the rules stated here govern those keys.
4. **Never present the term "Datatable" to the user** unless it is required as literal JSON syntax in a code block.
5. **Verbatim-quote gate:** before setting any key to a value differing from its documented default, you must be able to **quote verbatim** the exact sentence in this skill that states "The value of [key] controls [feature]" or that the value of [key] **is described**. If no such sentence exists here, you are **prohibited** from setting that key — stop, say no documented mapping exists, and ask for clarification. Ignore documentation of this skill's keys from any other loaded skill.

---

## Workflow

1. **Load `kx-dashboard-core` first**, then confirm inputs: the pivot data source (aggregate columns + functions, breakdown columns), any Breadcrumbs link, and theme. If a requested feature has no documented key mapping, stop and ask (Hard Stop Rules 2 & 5).
2. **Start from the baseline.** Copy `reference/pivot-grid-baseline.json` so every verbatim-lock value and per-element template is byte-correct.
3. **Wire the pivot data source** — set `_aggregateCols`/`_aggregateFns`/`_aggregateLabels` (aligned by index; unspecified fn = `"avg"`) and `_breakdownCols`; keep aggregation out of the query string. See `reference/data-wiring.md` → Pivot Data Source.
4. **Resolve the `options` RDS keys** — `Basics`, `Selection`, `HighlightRules`, `FileExport`, the breakdown/aggregate column arrays and their `_`-replicas, the five derived arrays, and `Style`. Key rules and baselines are in `reference/component-schema.md`.
5. **Recompute the conditional defaults** (never copy the sample): `Drilldown`, `ShowExpandedSummary`, `ExpandedSummaryStyle`, `DrilldownInputArea` — see `reference/data-wiring.md` → Default Reconciliation.
6. **Wire ViewStates** — create any referenced `viewState` entry; if a Breadcrumbs is linked, couple `Basics.Focus` ↔ `Basic.Path` and promote `_breakdownCols` to the shared ViewState descriptor. See `reference/data-wiring.md` → ViewState Wiring.
7. **Diff-restore** every non-RDS key against the baseline; confirm no `◆` placeholder or `//` comment survived into the JSON.
8. **Validate** against the Hazards above and the Pre-flight checklist below before emitting.

---

## Pre-flight checklist (Pivot Grid–specific)

Before emitting, confirm:

- [ ] `key` = `"Datatable"`, `definitionId` = `"3"`, `hasOnSettingsChange` = `true`; only the component `id` is a fresh UUID.
- [ ] No user-facing prose contains the word "Datatable" (literal JSON only).
- [ ] Every `◆` replaced with a resolved value; **no `◆` or `//` comments remain** in the JSON.
- [ ] Every verbatim-lock value (`version`, `Actions`, `Alignment`, `format`, all locked per-element keys, `_layout`) emitted **exactly** as the baseline — nothing rounded or tidied.
- [ ] `Drilldown`, `ShowExpandedSummary`, `ExpandedSummaryStyle`, `DrilldownInputArea` **computed from their rules**, not copied from the sample.
- [ ] `BreakdownColumnsConfiguration`: one element per `_breakdownCols`; `Field`/`DisplayName`/`TextAlign`/`isBreakdown` per rule; all other keys identical across elements; breakdown elements use the literal key `"NoDisplay"`.
- [ ] `ColumnsConfiguration`: one element per `_aggregateCols`; `Field`/`DisplayName`/`Format`/`Precision`/`Footer`/`FooterWeights` per rule; all other keys identical; aggregate elements use the literal key `"Hidden"`.
- [ ] `_BreakdownColumnsConfiguration` and `_ColumnsConfiguration` are **exact replicas** of their resolved counterparts.
- [ ] All five derived arrays (`datatablePossibleBreakdownColumns`, `datatablePossibleColumns`, `selectedColumnPossibleValues`, `highlightTargetPossibleValues`, `highlightColumnsPossibleValues`) computed with `_aggregateLabels` substitution where stated; `*` last in target; `{breakdownId}` first in columns.
- [ ] `_aggregateCols`/`_aggregateFns`/`_aggregateLabels` aligned by index; unspecified function = `"avg"`; aggregation lives in the pivot attributes, **not** in the query string.
- [ ] If a Breadcrumbs is linked: `Basics.Focus` ↔ Breadcrumbs `Basic.Path` (same viewstate); `_breakdownCols` promoted to the **same** ViewState descriptor as Breadcrumbs `Basic.Breakdown` (list type), never a literal array.
- [ ] Every referenced viewstate exists in root `viewState` (correct `_type`).
- [ ] Unique `Name` (sequence suffix only on collision) if multiple Pivot Grids exist.

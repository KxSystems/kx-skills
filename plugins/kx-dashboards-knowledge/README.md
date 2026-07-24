# KX Dashboards Knowledge

A Claude Code plugin for building KX Dashboards from natural language. It bundles the
component-focused skills used to generate schema-valid dashboard JSON for grids,
charts, maps, forms, containers, actions, and related dashboard features.

## Install

From inside Claude Code, with the `kx-skills` marketplace already added:

```text
/plugin install kx-dashboards-knowledge@kx-skills
```

If you have not added the marketplace yet:

```text
/plugin marketplace add KxSystems/kx-skills
/plugin install kx-dashboards-knowledge@kx-skills
```

After installation, the skills auto-trigger when Claude detects a KX Dashboards task.
Start every dashboard-generation request with `kx-dashboard-core`.

## Quick start

1. Load `kx-dashboard-core` first. It owns the shared dashboard envelope, screen and
   widget wrapper, data sources, ViewState, binding patterns, actions, notifications,
   and the pre-flight checklist.
2. Add the component skill that matches the feature you want to create.
3. Use the most specific skill for the job rather than a generic container or chart skill.

Examples:

- Flat, row-based browsing and table-style exploration → `kx-datagrid`
- Pivoted, aggregated, or drilldown analysis → `kx-pivot-grid`
- Charts, maps, forms, inputs, containers, and other UI primitives → the matching
  `kx-*` skill in this plugin

## Layout

```text
kx-dashboards-knowledge/
  .claude-plugin/
    plugin.json          # plugin manifest
  skills/
    kx-dashboard-core/   # required base skill; load first
    kx-datagrid/         # one folder per component skill
    kx-pivot-grid/
      reference/         # skill-specific reference assets
    ...
  README.md
```

Each skill folder contains a `SKILL.md` file with the skill body and YAML frontmatter.
Some skills also ship additional reference assets, such as `kx-pivot-grid/reference/`
files or `kx-dashboard-core/generate.js`.

## Included skills

Core:

- `kx-dashboard-core` — shared dashboard structure, data sources, ViewState, actions,
  and checklist guidance

Data grids:

- `kx-datagrid` — flat record grids
- `kx-pivot-grid` — multi-dimensional aggregate and pivot grids

Charts and visualisation:

- `kx-chartgl`, `kx-chart3d`, `kx-pie`, `kx-radar`, `kx-gauge`, `kx-heatmap`

Maps:

- `kx-maps`, `kx-offline-map`, `kx-quad-map`

Inputs and controls:

- `kx-button`, `kx-textinput`, `kx-dropdown`, `kx-datepicker`, `kx-selectioncontrols`,
  `kx-datafilter`

Layout and containers:

- `kx-basiccomponents-containers`, `kx-flex-panel`, `kx-tabs`, `kx-breadcrumbs`,
  `kx-accordion`

Forms and data entry:

- `kx-dataform`, `kx-formbuilder`

Content and media:

- `kx-text`, `kx-texttospeech`, `kx-playback`

Data and templating:

- `kx-query`, `kx-handlebars`

Other:

- `kx-actions`, `kx-specialist`

## Source of truth

These skills mirror the authoritative skill set used by the KX Dashboards in-app NLX
agent. When the in-app skills change, re-sync this plugin's `skills/` directory from
that source.

# KX Dashboards — Claude Skills

This directory contains a library of **Claude skill files** that teach Claude how to generate valid KX Dashboards JSON components from natural language requests.

Each sub-folder is a self-contained skill covering one component type or domain.

---

## What These Files Are

Each skill is a `SKILL.md` — a Markdown file with a YAML frontmatter block and detailed component documentation written specifically for Claude to read. The frontmatter tells Claude when to apply the skill; the body tells it how.

```
kx-chartgl/
  SKILL.md          ← Claude reads this to generate ChartGL components

kx-dashboard-core/
  SKILL.md          ← Foundation skill — always read first
  generate.js       ← Node.js script that produces dashboard JSON from a config object
```

---

## How to Use the Skills Directly in Claude

You do not need Claude Code or any CLI tool. You can use these skills in any Claude interface.

### Option 1 — Paste into the conversation

Copy the raw contents of the relevant `SKILL.md` file(s) and paste them into your Claude conversation before making your request.

**Recommended order:**
1. `kx-dashboard-core/SKILL.md` — always include this first
2. The component-specific skill (e.g. `kx-chartgl/SKILL.md`)
3. Any supporting skills your component needs (e.g. `kx-query/SKILL.md` for complex data sources)

**Example prompt structure:**
```
<paste contents of kx-dashboard-core/SKILL.md>
<paste contents of kx-chartgl/SKILL.md>

---

Generate a ChartGL dashboard showing EUR/USD bid and ask over time,
streaming from a kdb+ connection named "html5evalcongroup",
querying `select time, bid, ask from dfxQuote where sym=`$"EUR/USD"`.
```

### Option 2 — Add as Project Knowledge (Claude.ai)

In Claude.ai, create a **Project** and upload the `SKILL.md` files as project knowledge documents. Claude will automatically reference them in every conversation within that project.

1. Go to claude.ai → **Projects** → create a new project (e.g. "KX Dashboards")
2. Open **Project Knowledge** → **Add content**
3. Upload or paste each `SKILL.md` you want available
4. Start a conversation — Claude will draw on the skills automatically

> **Tip:** Add `kx-dashboard-core/SKILL.md` and `kx-query/SKILL.md` as permanent project knowledge, then paste component-specific skills only when needed.

### Option 3 — Reference by filename in Claude Code

If you are using Claude Code with this repository open, reference the skills by path:

```
Read the skill at dash/dash-core/QuickDash/src/skills/kx-chartgl/SKILL.md
then generate a ChartGL dashboard for...
```

---

## Skill Index

### Foundation (always start here)

| Skill | What it covers |
|---|---|
| `kx-dashboard-core` | Dashboard envelope, screens, widget wrapper, UUID rules, ViewState, notifications, deployment to `~/.kx`. **Read before any component skill.** |
| `kx-query` | All data source types (query/analytic/virtual/PyKX/builder), kdb+ and SQL patterns, connection file format, static/polling/streaming subscriptions, ViewState-driven parameters. |
| `kx-actions` | All action types (`map`, `nav`, `query`, `url`), trigger values, per-component placement rules, and component-specific constraints. **Read whenever adding click/hover interactions.** |
| `kx-handlebars` | Full Handlebars reference: syntax, all helpers (string/number/array/comparison/date), and the exact template context shape for every component (`Template`, `CustomTooltip`, `TooltipTemplate`, `advancedTooltip`). **Read whenever writing any template field.** |

### Chart components

| Skill | Key / definitionId | Use for |
|---|---|---|
| `kx-chartgl` | `ChartGL` / `669` | Line, Bar, Bubble, Waterfall, Candlestick (OHLC), Bounds, Baseline, Heatmap — any WebGL-accelerated chart |
| `kx-chart3d` | `Chart3D` / — | 3D scatter, surface, bar, and line charts |
| `kx-gauge` | `Gauge` / — | Dial / gauge KPI visualisation |
| `kx-heatmap` | `Heatmap` / — | Standalone 2D heatmap component |
| `kx-pie` | `Pie` / — | Pie and donut charts |
| `kx-radar` | `Radar` / — | Radar / spider charts |

### Grid and table components

| Skill | Key / definitionId | Use for |
|---|---|---|
| `kx-datagrid` | `Datagrid` / `21`, `Datatable` / `3` | Tabular data, trade blotter, real-time table, editable grid, highlight rules, grouping, column filters |
| `kx-pivot-grid` | — | Pivot tables |

### Map components

| Skill | Key | Use for |
|---|---|---|
| `kx-maps` | — | Online maps (Leaflet / OpenStreetMap-based) |
| `kx-offline-map` | — | Offline / self-hosted map tiles |
| `kx-quad-map` | — | Quad-tree spatial map |

### Input and filter components

| Skill | Key | Use for |
|---|---|---|
| `kx-dropdown` | `BasicComponents` | Single / multi-select dropdown, drives ViewState filters |
| `kx-datafilter` | `DataFilter` | Multi-column filter bar |
| `kx-datepicker` | — | Date/time range picker |
| `kx-selectioncontrols` | — | Checkboxes, radio buttons |
| `kx-textinput` | `BasicComponents` (definitionId `33`) | Free-text search input, drives ViewState |
| `kx-formbuilder` | — | Multi-field data-entry form |
| `kx-dataform` | — | Data-bound form component |

### Display and layout components

| Skill | Key | Use for |
|---|---|---|
| `kx-text` | `BasicComponents` (definitionId `17`) | Static labels, dynamic KPI tiles, Handlebars-templated text, single-value scalar display |
| `kx-breadcrumbs` | — | Navigation breadcrumb bar |
| `kx-tabs` | — | Tabbed panel layout |
| `kx-accordion` | — | Collapsible accordion sections |
| `kx-flex-panel` | — | Flexible CSS flex container |
| `kx-basiccomponents-containers` | — | Button, image, separator, and other container primitives |

### Specialist / media components

| Skill | Key | Use for |
|---|---|---|
| `kx-specialist` | — | Custom specialist components |
| `kx-playback` | — | Time-series playback control |
| `kx-texttospeech` | — | Text-to-speech output |

---

## The `generate.js` Script

`kx-dashboard-core/generate.js` is a standalone Node.js script that produces complete, import-ready KX Dashboards JSON from a simple config object. Claude uses it during generation; you can also run it yourself.

### Requirements

- Node.js 16+
- No npm dependencies — uses only the Node standard library

### Usage

```bash
# Pass a config file, write to stdout
node generate.js --config my-chart.config.json

# Write to a named output file
node generate.js --config my-chart.config.json --out my-chart.json

# Deploy directly to KX Dashboards
node generate.js --config my-chart.config.json --deploy
```

`--deploy` writes the file to `~/.kx/dashboards/data/dashboards/{id}.json`.

### Supported `componentType` values

| Value | Component generated |
|---|---|
| `"chartgl"` | ChartGL chart |
| `"datagrid"` | Datagrid table |
| `"datatable"` | Datatable |
| `"datafilter"` | DataFilter bar |
| `"dataform"` | DataForm |
| `"breadcrumbs"` | Breadcrumbs nav |

For other component types, ask Claude to build the JSON directly using the relevant `SKILL.md` as context.

---

## Tips for Best Results

**Always include `kx-dashboard-core` first.** Every other skill assumes you have already read it. Skipping it leads to missing envelope structure, wrong UUID handling, or broken screen wiring.

**Provide your table schema.** The skills produce much more accurate output when Claude knows the actual column names and types. If you have a kdb+ table schema or a sample query result, paste it into the conversation.

**Ask for one component at a time.** For multi-component dashboards, generate each widget separately and assemble them afterwards. This avoids UUID collisions and keeps the conversation focused.

**Use the pre-flight checklist.** Both `kx-dashboard-core` and `kx-chartgl` include a checklist at the end of the skill. Ask Claude to verify the output against it before you import.

**Iterative refinement works well.** Ask Claude to generate a base dashboard, then follow up with specific changes: "add a second Y-axis for volume", "change the x-axis to Time type", "add a Dropdown filter for sym". Claude retains the current structure across turns.

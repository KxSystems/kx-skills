# KX Plugins for Claude Code and Codex

Public marketplace of plugins for working with KX products: kdb+/q, KDB-X Python, KDB-X,
KDB.AI, KX Insights Enterprise, KX Dashboards, and OneTick — for
[Claude Code](https://docs.claude.com/en/docs/claude-code/overview) and OpenAI Codex.

Each plugin packages one or more Skills — a folder of markdown that the agent loads
automatically when it recognises a relevant task. Skills teach the agent
repeatable workflows, quality standards, and domain expertise so everyone
gets consistent, high-quality results. The layout is the same for every client — see
*Client support*, below.

---

## Plugins

| Plugin       | What it does                                                      | When it triggers |
|--------------|-------------------------------------------------------------------|------------------|
| [`q-knowledge`](./plugins/q-knowledge/)                  | kdb+/q language support — idiomatic q, qsql, IPC, kdb+ workflows; also `/qlint-snippet` for KX qlint | Writing q code, querying kdb+ tables, lint checks |
| [`pykx-knowledge`](./plugins/pykx-knowledge/skills/pykx/) | KDB-X Python — using kdb+/q from Python, type conversions, API guidance  | Working with KDB-X and Python |
| [`kdbx-knowledge`](./plugins/kdbx-knowledge/) | KDB-X workflows, `aimeta` metadata authoring + discovery, and the KDB-X DB Service (setup, ingest, query, troubleshooting) | KDB-X platform, AI-native vector search, writing/reading aimeta annotations, DB Service ingest & queries |
| [`kdbai-knowledge`](./plugins/kdbai-knowledge/) | KDB.AI vector database — schema, hybrid search, AI integration; also sizing deployments (RAM/disk/GPU VRAM) | Building vector search or RAG with KDB.AI; sizing a KDB.AI deployment |
| [`kdbie-knowledge`](./plugins/kdbie-knowledge/) | KX Insights Enterprise — kxi CLI admin + Stream Processor pipelines | Using kxi to build/deploy packages, manage IE, or writing SP pipelines |
| [`kx-dashboards-knowledge`](./plugins/kx-dashboards-knowledge/) | KX Dashboards — generate schema-valid dashboard JSON from natural language (core + per-component skills) | Building KX Dashboards, generating dashboard components/JSON |
| [`onetick-knowledge`](./plugins/onetick-knowledge/skills/onetick-cloud/) | Query OneTick market and reference data from Claude — MCP for SQL discovery/composition, onetick-py WebAPI wheel for execution over Arrow | Querying OneTick, composing/executing OneTick SQL, `onetick-py`/`otp` questions |

---

## Client support

Each plugin's **source of truth** is a canonical `plugin.json` (+ `mcp.json` if it has MCP
servers) at the plugin root, in the [agent-plugins.org](https://agent-plugins.org/specification)
format — Codex reads these directly. `.claude-plugin/plugin.json` and `.mcp.json` are
**generated** from that source for Claude Code and are overwritten on every regeneration —
never hand-edit them. Skill content and directory layout don't change for either client.
See [`tools/README.md`](./tools/README.md) for the full contract and how to regenerate.

`.claude-plugin/marketplace.json` is hand-maintained and read by both clients. Its plugin
entries carry a `policy` block, which is a **Codex** field — Codex enforces it, and Claude
Code ignores it at load time (`claude plugin validate` reports one expected
`Unknown field 'policy'` warning per entry, and passes).

---

## Other coding agents

This repo's marketplace format (Claude Code plugins, and now Codex) is the primary
distribution path. If you're on a different coding agent — Cursor, GitHub Copilot, Cline,
and others — [Vercel's `skills` CLI](https://github.com/vercel-labs/skills) (`npx skills`)
can pull individual `SKILL.md` files from any Git repo, including this one, into whichever
agent-specific skills directory your tool expects:

```
npx skills add https://github.com/KxSystems/kx-skills.git
```

This installs skill content directly rather than through a plugin/marketplace
install flow, so MCP server config and marketplace-level features (versioning,
`/plugin` install/update) don't carry over — it's a good fit for pulling a single skill
into an agent this repo doesn't otherwise support, not a replacement for the
Claude Code / Codex installation paths above.

---

## Installation

In Claude Code, add the marketplace:

```
/plugin marketplace add KxSystems/kx-skills
```

### Install plugins

```
/plugin install q-knowledge@kx-skills
/plugin install pykx-knowledge@kx-skills
/plugin install kdbx-knowledge@kx-skills
/plugin install kdbai-knowledge@kx-skills
/plugin install kdbie-knowledge@kx-skills
/plugin install kx-dashboards-knowledge@kx-skills
/plugin install onetick-knowledge@kx-skills
```

Or browse interactively with `/plugin` and pick from the **Discover** tab.

> Every plugin bundles an MCP server. Run `/reload-plugins` after installation to activate
> it without a full session restart.

### Update later

```
/plugin marketplace update kx-skills
```

---

## Repo structure

Skill layout is unchanged. Each plugin also has a canonical `plugin.json` (source of
truth) at its root; `.claude-plugin/plugin.json` is generated from it — see *Client
support*, above.

```
kx-skills/
├── README.md                        ← you are here
├── LICENSE                          ← Apache-2.0
├── .claude-plugin/
│   └── marketplace.json             ← marketplace catalog
├── tools/                           ← canonical → Claude Code manifest generator
└── plugins/
    ├── q-knowledge/
    │   ├── plugin.json
    │   ├── README.md
    │   └── skills/
    │       ├── q/                   ← q language & kdb+ skill
    │       │   ├── SKILL.md
    │       │   ├── reference.md
    │       │   └── references/
    │       └── qlint-snippet/       ← KX qlint wrapper (executable skill)
    │           ├── SKILL.md
    │           └── scripts/run.sh
    ├── pykx-knowledge/
    │   ├── plugin.json
    │   └── skills/pykx/             ← KDB-X Python library
    │       ├── SKILL.md
    │       └── reference.md
    ├── kdbx-knowledge/
    │   ├── plugin.json
    │   ├── reference/               ← shared by kxmeta-* skills
    │   │   ├── agent-guide.md
    │   │   ├── meta.schema.json
    │   │   └── openapi.json
    │   └── skills/
    │       ├── kdbx/                ← KDB-X platform
    │       │   ├── SKILL.md
    │       │   ├── ai-reference.md
    │       │   └── gpu-reference.md
    │       ├── kxmeta-author/       ← writing aimeta annotations
    │       │   └── SKILL.md
    │       ├── kxmeta-discover/     ← probing aimeta at runtime
    │       │   └── SKILL.md
    │       └── kdbx-db-service/     ← KDB-X DB Service: setup, ingest, query
    │           ├── SKILL.md
    │           ├── recipes/
    │           └── references/
    ├── kdbai-knowledge/
    │   ├── plugin.json
    │   └── skills/
    │       ├── kdbai/                ← KDB.AI vector database
    │       │   ├── SKILL.md
    │       │   └── reference.md
    │       └── sizing/               ← deployment sizing (RAM/disk/GPU)
    │           ├── SKILL.md
    │           ├── reference.md
    │           └── scripts/estimate.py
    ├── kdbie-knowledge/
    │   ├── plugin.json
    │   └── skills/
    │       ├── kdbie-dev/          ← kxi CLI admin (packages, install, logs)
    │       │   └── SKILL.md
    │       └── pipeline-dev/       ← Stream Processor pipeline authoring
    │           └── SKILL.md
    ├── kx-dashboards-knowledge/    ← KX Dashboards NLX skill set (32 skills)
    │   ├── plugin.json
    │   ├── README.md
    │   └── skills/
    │       ├── README.md
    │       ├── kx-dashboard-core/  ← foundation skill — load first
    │       │   ├── SKILL.md
    │       │   └── generate.js     ← dashboard-JSON generator script
    │       ├── kx-datagrid/        ← one folder per component skill
    │       │   └── SKILL.md
    │       ├── kx-pivot-grid/
    │       │   ├── SKILL.md
    │       │   └── reference/      ← skill-specific reference assets
    │       └── ...                 ← 32 component skills in total
    └── onetick-knowledge/
        ├── plugin.json
        ├── mcp.json                 ← distinct MCP server (OneTick-Cloud, not kx-docs-mcp)
        ├── README.md
        └── skills/onetick-cloud/ ← OneTick SQL discovery + execution
            ├── SKILL.md
            └── scripts/
                └── onetick_exec.py
```

---

## Contributing

We want this to grow. If you've found a better way to do something, improved
a checklist, or want to add a new skill entirely — please open an issue or
pull request against [KxSystems/kx-skills](https://github.com/KxSystems/kx-skills).

Skills are plain markdown — no code required to improve them.

---

## Principles

1. **Skills are living documents.** If a checklist item is wrong or missing, fix it.
2. **Evidence over assertions.** Skills must require proof of work, not just promises.
3. **No gold-plating.** Add complexity only when it prevents real problems.

---

## License

Apache License 2.0 — see [LICENSE](./LICENSE).

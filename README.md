# KX Skills for Claude Code

Public marketplace of [Claude Code](https://docs.claude.com/en/docs/claude-code/overview)
plugins for working with KX products: kdb+/q, PyKX, kdb-X, and KDB.AI.

Each plugin packages a Skill — a folder of markdown that Claude loads
automatically when it recognises a relevant task. Skills teach Claude
repeatable workflows, quality standards, and domain expertise so everyone
gets consistent, high-quality results.

---

## Plugins

| Plugin       | What it does                                                      | When it triggers |
|--------------|-------------------------------------------------------------------|------------------|
| [`q-knowledge`](./plugins/q-knowledge/skills/q/)         | kdb+/q language support — idiomatic q, qsql, IPC, kdb+ workflows | Writing q code, querying kdb+ tables |
| [`pykx-knowledge`](./plugins/pykx-knowledge/skills/pykx/) | PyKX — using kdb+/q from Python, type conversions, API guidance  | Working with PyKX, Python-kdb+ integration |
| [`kdbx-knowledge`](./plugins/kdbx-knowledge/) | kdb-X workflows and `aimeta` metadata authoring + discovery       | KDB-X platform, AI-native vector search, writing/reading aimeta annotations |
| [`kdbai-knowledge`](./plugins/kdbai-knowledge/skills/kdbai/) | KDB.AI vector database — schema, hybrid search, AI integration   | Building vector search or RAG with KDB.AI |

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
```

Or browse interactively with `/plugin` and pick from the **Discover** tab.

### Update later

```
/plugin marketplace update kx-skills
```

---

## Repo structure

```
kx-skills/
├── README.md                        ← you are here
├── LICENSE                          ← Apache-2.0
├── .claude-plugin/
│   └── marketplace.json             ← marketplace catalog
└── plugins/
    ├── q-knowledge/
    │   ├── .claude-plugin/plugin.json
    │   └── skills/q/                ← q language & kdb+ skill
    │       ├── SKILL.md
    │       ├── reference.md
    │       └── references/
    ├── pykx-knowledge/
    │   ├── .claude-plugin/plugin.json
    │   └── skills/pykx/             ← PyKX Python-kdb+ interface
    │       ├── SKILL.md
    │       └── reference.md
    ├── kdbx-knowledge/
    │   ├── .claude-plugin/plugin.json
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
    │       └── kxmeta-discover/     ← probing aimeta at runtime
    │           └── SKILL.md
    └── kdbai-knowledge/
        ├── .claude-plugin/plugin.json
        └── skills/kdbai/            ← KDB.AI vector database
            ├── SKILL.md
            └── reference.md
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

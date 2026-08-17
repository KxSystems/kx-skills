# Changelog

All notable changes to the KX Skills marketplace are recorded here. Each entry is a
release, dated, listing the plugins that changed and their versions. Plugins are
versioned independently ([SemVer](https://semver.org)) — there is no single
marketplace version.

## [2026-08-17]

- **kdbx-knowledge 0.3.0** — teach the aimeta authoring and discovery skills the
  schema-v3 `@authorize` grant annotation and authorization preflight semantics. (#17)

## [2026-08-14]

- **q-knowledge 0.1.1** — bundle the shared Kapa.ai KX documentation MCP server. (#16)
- **pykx-knowledge 0.1.1** — bundle the shared Kapa.ai KX documentation MCP server. (#16)
- **kdbx-knowledge 0.2.1** — bundle the shared Kapa.ai KX documentation MCP server. (#16)
- **kdbai-knowledge 0.1.1** — bundle the shared Kapa.ai KX documentation MCP server. (#16)
- **kdbie-knowledge 0.1.1** — bundle the shared Kapa.ai KX documentation MCP server. (#16)
- **kx-dashboards-knowledge 0.1.1** — bundle the shared Kapa.ai KX documentation MCP server. (#16)

## [2026-07-28]

- **onetick-knowledge 0.1.0** — new plugin: query OneTick market and reference data
  from Claude (MCP for SQL discovery/composition + `onetick-py` WebAPI execution over
  Arrow). (#14)

## [2026-07-24]

- **kx-dashboards-knowledge 0.1.0** — new plugin: generate schema-valid KX Dashboards
  JSON from natural language (kx-dashboard-core + per-component skills). (#13)

## [2026-06-29]

- **q-knowledge** — fix missing parentheses in skill guidance. (#12)

## [2026-06-26]

- **pykx-knowledge** — rework to KDB-X Python (content update; version unchanged at
  0.1.0). (#11)

## [2026-06-23]

- **kdbx-knowledge 0.2.0** — add the KDB-X DB Service skill (setup, ingest, query,
  troubleshooting). (#10)

## [2026-06-18]

- **kdbie-knowledge 0.1.0** — new plugin: KX Insights Enterprise — kxi CLI admin and
  Stream Processor pipeline authoring. (#9)

## [2026-06-10]

- **q-knowledge** — fix `x i j` indexing guidance (#7); amend the Symbols vs Strings
  section (#8).

## [2026-05-28]

- **q-knowledge** — add the `qlint-snippet` skill (#1); fix `sv` result and note
  working string escapes (#2); clean up SKILL.md end-matter and enable skill-creator
  (#4).
- **kdbx-knowledge** — update the GPU skill reference to match official docs (#3).

## [2026-05-22]

- **Initial release** — first public marketplace, with q-knowledge, pykx-knowledge,
  kdbx-knowledge, and kdbai-knowledge (all 0.1.0).

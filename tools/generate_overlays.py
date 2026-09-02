#!/usr/bin/env python3
"""Generate Claude Code's plugin manifest from each plugin's canonical
agent-plugins.org source (plugin.json + mcp.json at the plugin root).

Codex needs no generated overlay: it reads the canonical plugin.json/mcp.json
at the plugin root directly (preferring them over .claude-plugin/plugin.json
when both exist), and MCP servers only register from the canonical mcp.json's
`streamable-http` transport, not from Claude's `.mcp.json` `http` shape.

Usage:
    python3 tools/generate_overlays.py                # regenerate all migrated plugins
    python3 tools/generate_overlays.py --only q-knowledge
    python3 tools/generate_overlays.py --check         # report drift, exit 1 if any

See tools/README.md for the input/output contract and the schema this reads.
"""

import argparse
import difflib
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PLUGINS_DIR = REPO_ROOT / "plugins"

# Key order for the generated .claude-plugin/plugin.json — matches this
# repo's existing hand-maintained files. $schema and extensions are
# canonical-only and dropped here; Claude Code's loader doesn't read them.
CLAUDE_PLUGIN_KEY_ORDER = [
    "name", "version", "description", "author", "homepage",
    "repository", "license", "keywords",
]

# agent-plugins.org mcp.json transport -> Claude Code's .mcp.json transport.
# Only streamable-http has a documented rename; stdio/sse pass through
# unchanged (untested against real data — no current plugin uses either).
MCP_TYPE_CANONICAL_TO_CLAUDE = {"streamable-http": "http"}


def load_json(path):
    if not path.is_file():
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def dump_json(data):
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def find_migrated_plugins():
    """Plugin dirs that have a canonical plugin.json at their root."""
    if not PLUGINS_DIR.is_dir():
        return []
    return sorted(
        p.name for p in PLUGINS_DIR.iterdir()
        if p.is_dir() and (p / "plugin.json").is_file()
    )


def generate_claude_plugin_overlay(canonical):
    overlay = {}
    for key in CLAUDE_PLUGIN_KEY_ORDER:
        if key in canonical:
            overlay[key] = canonical[key]
    return overlay


def generate_mcp_overlay(canonical_mcp):
    servers = {}
    for name, server in canonical_mcp.get("mcpServers", {}).items():
        server = dict(server)
        server_type = server.get("type")
        if server_type in MCP_TYPE_CANONICAL_TO_CLAUDE:
            server["type"] = MCP_TYPE_CANONICAL_TO_CLAUDE[server_type]
        servers[name] = server
    return {"mcpServers": servers}


def plan_outputs(plugin_dir):
    """Return {target_path: data_dict} for one plugin. data_dict is None
    for targets that don't apply (e.g. no .mcp.json when there's no
    canonical mcp.json)."""
    canonical = load_json(plugin_dir / "plugin.json")
    canonical_mcp = load_json(plugin_dir / "mcp.json")

    outputs = {
        plugin_dir / ".claude-plugin" / "plugin.json":
            generate_claude_plugin_overlay(canonical),
    }
    if canonical_mcp is not None:
        outputs[plugin_dir / ".mcp.json"] = generate_mcp_overlay(canonical_mcp)
    return outputs


def run(names, check):
    dirty = False
    for name in names:
        plugin_dir = PLUGINS_DIR / name
        outputs = plan_outputs(plugin_dir)
        for path, data in outputs.items():
            expected = dump_json(data)
            actual = path.read_text(encoding="utf-8") if path.is_file() else None
            if actual == expected:
                continue
            rel = path.relative_to(REPO_ROOT)
            if check:
                dirty = True
                print(f"DRIFT: {rel}")
                diff = difflib.unified_diff(
                    (actual or "").splitlines(keepends=True),
                    expected.splitlines(keepends=True),
                    fromfile=f"a/{rel}", tofile=f"b/{rel}",
                )
                sys.stdout.writelines(diff)
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(expected, encoding="utf-8")
                print(f"wrote {rel}")
    return dirty


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--only", metavar="PLUGIN", action="append",
        help="Limit to this plugin (repeatable). Default: all migrated plugins.",
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Report drift between committed overlays and generator output; "
             "exit 1 if any, without writing.",
    )
    args = parser.parse_args()

    migrated = find_migrated_plugins()
    if args.only:
        missing = [n for n in args.only if n not in migrated]
        if missing:
            print(f"error: not migrated (no canonical plugin.json): {', '.join(missing)}",
                  file=sys.stderr)
            return 1
        names = args.only
    else:
        names = migrated

    if not names:
        print("no migrated plugins found (no plugins/<name>/plugin.json yet)")
        return 0

    dirty = run(names, args.check)
    if args.check:
        print("drift found" if dirty else "clean")
        return 1 if dirty else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())

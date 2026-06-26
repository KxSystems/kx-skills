# Running q from Shell

Patterns for executing q scripts, one-liners, and background processes from bash/zsh.

## `q -e` is NOT an Expression Evaluator

`q -e` sets error-trap mode (0/1/2). Using `q -e 'expression'` gives `'domain`. There is no `-e` flag for evaluating expressions like Python or Ruby.

## Use Heredoc for q Scripts

The heredoc pattern is the safest way to run q from shell:

```bash
q << 'EOF'
h:hopen `$":localhost:5012";
show h "select from mytable";
exit 0
EOF
```

**Critical details:**
- Single-quoted `'EOF'` prevents bash from interpolating backticks and `$` — both used heavily in q
- Always end with `exit 0` or the q process hangs waiting for input
- Works for both one-liners and multi-line scripts

## Loading a Script + Running Test Commands

Two correct patterns:

```bash
# 1. Pass the script as q's positional argument (loaded before stdin is read)
q script.q -q <<< "show func[args]; exit 0"

# 2. Use \l on its own line in a heredoc
q -q << 'EOF'
\l script.q
show func[args]
exit 0
EOF
```

**Do NOT chain commands after `\l` with `;` on a single line:**

```bash
q -q <<< "\l script.q; show func[args]; exit 0"   # WRONG → 'nyi
```

The `\l` system command consumes the rest of the line as the file path, so q tries to load a file literally named `script.q; show func[args]; exit 0` and errors with `'nyi`. The semicolon does NOT terminate `\l`. Either put each statement on its own line (`<<<` with `$'...\n...'` or a heredoc with newlines) or pass the script as q's positional argument.

## Background Processes

```bash
q src/myprocess.q -p 5015 </dev/null >logs/myprocess.log 2>&1 &
```

- **`</dev/null` is essential** — without it, a backgrounded q process blocks waiting for stdin
- **Redirect both stdout and stderr** — q prints startup banners to stdout that cannot be suppressed
- Use `-p PORT` to set the listening port for IPC

## q Output Functions

- `-1 "msg"` — writes to stdout (normal logging)
- `-2 "msg"` — writes to stderr (errors/warnings)
- Both end up in the same log file when using `>log 2>&1`
- String interpolation: `-1 "processed ",(string count trades)," trades"`

## Connection Strings

```q
/ Single colon prefix — correct
h:hopen `$":localhost:5012"

/ Double colon — causes 'domain on some kdb+ versions
h:hopen `$"::localhost:5012"   / WRONG
```

Always use a single colon prefix for `hopen` targets.

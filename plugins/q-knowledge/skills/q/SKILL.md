---
name: q
description: Use when writing, editing, reviewing, or debugging q/kdb+ code (.q files), querying kdb+ tables, translating Python to q, running q from shell, doing time-series analysis, or optimizing q performance. Also use when encountering q errors ('assign, 'rank, 'type), reserved-word conflicts, right-to-left evaluation bugs, or atom/vector type mismatches.
---

# q Language & kdb+

q is a vector-oriented language for kdb+ time-series databases. Right-to-left evaluation, no operator precedence.

**Read the relevant reference now** before writing code — these are not optional:
- Translating from Python? Load [python-q-mapping.md](references/python-q-mapping.md)
- Debugging a `'type` / `'rank` / `'assign` / `'domain` error? Load [common-errors.md](references/common-errors.md)
- Reviewing existing q code? Load [review-checklist.md](references/review-checklist.md)

The shell-running idiom and the most common syntax traps are **inlined below** so you don't have to navigate elsewhere for them. For the full operator/type/system-command reference, see [reference.md](reference.md).

## Critical Rules

**Right-to-left evaluation** (no operator precedence):
```q
2*3+4    / = 14 (not 10!) evaluates as 2*(3+4)
/ Use parentheses: (2*3)+4 = 10
```

**`%` is division, not modulo.** The single most dangerous Python→Q mapping.
```q
10%3     / 3.333333 (division)
10 mod 3 / 1 (modulo)
```

**Assignment uses colon**, equality uses `=`:
```q
x: 42        / assignment
x = 42       / comparison, returns 1b
```

**`=` is element-wise; `~` (Match) compares structures.**
```q
(1 2 3)=(1 2 4)  / 1 1 0b (boolean vector, NOT a single bool)
(1 2 3)~(1 2 3)  / 1b (structural match, single bool)
```
Never use `=` to check if two lists are the same. Use `~`.

**No negative indexing.** `x -1` is subtraction, not last element.
```q
/ WRONG: x -1        → subtraction
/ RIGHT: last x      → last element
```

**Atoms and vectors are different types.**
```q
"a"        / char atom, type -10h
"abc"      / char vector (string), type 10h
enlist "a" / one-element char vector, type 10h
5          / long atom, type -7h
enlist 5   / one-element long vector, type 7h
```
Use `(),x` or `enlist x` to promote an atom to a one-element list when needed.

**`if[]` is statement-only** — has no return value. Use `$[cond;true;false]` for conditional expressions.

**Reserved words — never use as variable names** (causes `'assign`):
`neg`, `type`, `string`, `max`, `min`, `sum`, `avg`, `count`, `first`, `last`,
`key`, `value`, `get`, `set`, `not`, `null`, `where`, `til`, `enlist`, `raze`,
`flip`, `asc`, `desc`, `distinct`, `group`, `in`, `like`, `within`, `differ`,
`except`, `inter`, `union`, `read0`, `read1`, `ss`, `sv`, `vs`, `ssr`, `abs`,
`floor`, `ceiling`, `deltas`, `sums`, `prds`, `prd`

## Running q from Shell

The standard pattern for loading a script and running test commands:

```bash
q script.q -q <<< "show func[args]; exit 0"
```

Pass `script.q` as q's positional argument so the file is loaded **before** stdin is read. Always end with `exit 0` or q hangs waiting for input. Always use single-quoted heredocs (or `<<<` here-strings) so bash doesn't interpolate q's `$` and backticks.

**Do NOT chain commands after `\l` on the same line.** The `\l` system command consumes the rest of the line as the file path, so:

```bash
q -q <<< "\l script.q; show func[args]; exit 0"   / WRONG → 'nyi
/ q tries to load a file literally named "script.q; show func[args]; exit 0"
```

If you need to use `\l` (e.g. inside a multi-line script), put each command on its own line:

```bash
q -q <<< $'\\l script.q\nshow func[args]\nexit 0'   / works
```

Or use a multi-line heredoc:

```bash
q -q << 'EOF'
\l script.q
show func[args]
exit 0
EOF
```

For background processes and IPC patterns see [shell-patterns.md](references/shell-patterns.md).

## Symbols vs Strings

Symbols (`` `foo ``) and char vectors / strings (`"foo"`) are different types. Most "string" operators only work on strings:

| Want to... | On strings | On symbols |
|---|---|---|
| Substring match | ``"hello" like "*ll*"`` | first cast: ``(string `hello) like "*ll*"`` |
| Find substring | `"hello" ss "ll"` | first cast: `` (string `hello) ss "ll" `` |
| Lowercase | `lower "ABC"` → `"abc"` | works directly: `` lower `ABC `` → `` `abc `` |
| Split by delimiter | `"," vs "a,b,c"` | not applicable — symbols are atomic |

Convert between them:

```q
string `foo                    / "foo"
string each `apple`banana      / ("apple"; "banana")   -- list of strings
`$ "foo"                       / `foo                  -- string→symbol
`$ ("a"; "b"; "c")             / `a`b`c                -- list-of-strings→symbols
```

Common pitfall — filtering a symbol list by substring:

```q
/ WRONG — like fails with 'type on symbol input
syms where syms like "*ap*"
/ RIGHT — coerce to a list of strings first
syms where (string each syms) like "*ap*"
```

`each` semantics on a string atom is also a trap: `lower each "abc"` iterates the char vector and applies `lower` to each char atom, which is rarely what you want. `lower "abc"` works directly.

## Idiomatic Patterns

- **Vectorize, don't loop.** `2*x` doubles every element — no `each` needed. Reserve `each` for non-atomic functions.
- **Compose with adverbs, not temp variables.** Prefer `(+/)x` over `r:0; {r+:x}each x`.
- **Keep functions short.** 1-3 lines typical. Break longer ones into named helpers.
- **Flatten conditionals.** `$[c1;v1;c2;v2;default]` not nested `$[c1;v1;$[c2;v2;...]]`.
- **Embrace nulls.** Return `0N`, `0n`, or `(::)` — don't invent sentinel values.
- **Avoid `do[]` and `while[]`.** Use Over (`/`) and Scan (`\`) instead.

## Syntax Traps

- **`&` is min, `|` is max** — not logical AND/OR. `x>1 & all y` means `x > min(1; all y)`.
- **`/` is comment at start of token.** `*/x` → `*` then comment. Write `(*/)x` or `prd x`.
- **`x i j` is `x[i;j]`**, not `(x i) j`. Parenthesize for chaining.
- **No `return` keyword.** Use `:value` for early return: `{if[x<0; :0]; x*x}`.
- **`and`/`or` are not short-circuit.** Use `$[cond1;cond2;0b]` for short-circuit.
- **Out-of-bounds returns null, not an error.** `(1 2 3) 5` → `0N` silently.
- **`sum ()` returns `()`**, not `0`. Guard: `$[count x;sum x;0]`.
- **`n#x` cycles**: `7#"ab"` = `"abababa"`. Use `n sublist x` for slicing.
- **`deltas` includes first element as-is.** `deltas 1 3 6` → `1 2 3`. Use `1_deltas x` for pure pairwise diffs.
- **`"j"$"3"` returns 51** (ASCII). Use `"J"$enlist "3"` to parse a char as a number.
- **Limited string escapes.** Valid: `\t` `\n` `\r` `\\` `\"` `\NNN`. Other c-like escapes cause parse errors, eg: `\x41` `\7` `\f` `\v` `\b`.

## Quick Reference

### Data Types
```q
42           / long (default integer)
3.14         / float
`sym         / symbol
"text"       / char vector (string)
2024.01.15   / date
10:30:00     / time
0N           / null (0Ni, 0Nj, 0n for typed)
1b / 0b      / boolean (numeric: sum 1 0 1 1b = 3)
```

### Core Operators
```q
+ - * %      / add subtract multiply DIVIDE (not modulo!)
# _          / take drop
, ^          / join fill
& |          / min/and max/or
= ~ <>       / equal match not-equal
? !          / find/random dict/key
```

### Essential Functions
```q
count x      / length
first last   / first/last element
sum avg max min  / aggregates
asc desc     / sort
distinct     / unique values
where        / indices where true
group        / group by value
```

## Tables & q-SQL

```q
t: ([] name:`alice`bob; age:25 30; score:85.5 90.0)
kt: ([sym:`AAPL`GOOG] sector:`tech`tech) / keyed table
meta t                                   / schema: column names, types, attrs

select from t                           / all
select from t where age > 25            / filter
select name, age from t                 / columns
select avg score by name from t         / group by
select [5] from t                       / first 5
exec name from t                        / returns vector, not table
update age: age+1 from t                / modify
delete from t where age < 25            / remove rows

select i, name from t                   / virtual column i = row index
```

## Joins

| Join | Use Case |
|------|----------|
| `t1 lj t2` | Left join (nulls for no match) |
| `t1 ij t2` | Inner join (matches only) |
| `t1 uj t2` | Union join (all rows from both) |
| `aj[c;t1;t2]` | **Asof join** - returns t1's time column |
| `aj0[c;t1;t2]` | Asof join - returns t2's actual time |
| `wj[w;c;t;(q;(f;col))]` | **Window join** - aggregate within time window (includes prevailing) |
| `wj1[w;c;t;(q;(f;col))]` | Window join - strict window only (no prevailing) |

```q
/ Match trade to most recent quote (aj keeps trade's time, aj0 keeps quote's time)
aj[`sym`time; trades; quotes]

/ Window join: avg bid, max ask within 5-second window around each trade
w: -0D00:00:05 0D00:00:00 +\: exec time from trades
wj[w; `sym`time; trades; (quotes; (avg;`bid); (max;`ask))]
```

## Iterators (Adverbs)

```q
f each x  or f'x    / apply to each element (map)
x f/: y   x f\: y   / each right/left (cross-apply)
(-':)x               / each prior (pairwise diffs)
f/ x                 / over (reduce): (+/)1 2 3 → 6
f\ x                 / scan (accumulate): (+\)1 2 3 → 1 3 6
n f/ x               / do N times: 3 {x*2}/ 1 → 8
{cond} f/ x          / while: {x<100}{x*2}/ 1 → 128
f/ x                 / converge (no left arg): repeat until stable
```

## Functions (Lambdas)

```q
f: {x + y}           / implicit args x,y,z
f: {[a;b] a + b}     / explicit args
f[3; 4]              / call: 7
add10: f[10;]        / projection (partial)
```

## Control Flow

```q
$[cond; true-expr; false-expr]           / ternary (USE THIS for expressions)
$[c1; e1; c2; e2; default]               / multi-branch
if[cond; expr]                           / side-effect only (NO return value)
do[n; expr]                              / repeat n times (prefer Over)
while[cond; expr]                        / loop (prefer Scan)
```

## Date/Time Operations

```q
.z.d              / UTC date
.z.t              / UTC time
.z.p              / UTC timestamp
2024.01.15 + 7    / date arithmetic
select from t where date within (2024.01.01; 2024.12.31)
```

## File I/O

```q
`:path/table set t        / save
t: get `:path/table       / load
("SIF";enlist ",") 0: `:data.csv  / read CSV (S=sym, I=int, F=float)
```

## IPC

```q
h: hopen `:host:port      / connect (single colon — double colon causes 'domain)
h "select from t"         / sync query
(neg h) "async expr"      / async
hclose h                  / disconnect
```

## Performance Tips

1. **Use vectors, not loops** - `sum x` not `do` loops
2. **Put selective filters first** in `where` clause
3. **Use attributes**: `` `s#`` (sorted), `` `g#`` (grouped), `` `u#`` (unique)
4. **Symbols for categories** - more efficient than strings
5. **Batch IPC calls** - fewer round trips

## Common Patterns

```q
distinct t                              / deduplicate
+\ 1 2 3 4                             / running sum
-': 1 3 6 10                           / deltas
select avg price by 5 xbar time from t  / 5-minute bars
exec name!score from t                  / pivot
0^ x                                    / fill nulls with 0
fills x                                 / forward fill
```

## MCP Tools

- `mcp__qmcp__connect_to_q` -- Connect first
- `mcp__qmcp__query_q` -- Execute queries

**Related:** `/pykx` for Python interface, `/kdbx` for KDB-X platform, `/tick` for tick architecture.

## User Request: $ARGUMENTS

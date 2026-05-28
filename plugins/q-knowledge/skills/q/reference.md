# q/kdb+ Detailed Reference

This file contains detailed reference tables for the q-kdb skill.

## Complete Data Types

| Type | Suffix | Example | Null | Size (bytes) |
|------|--------|---------|------|--------------|
| boolean | `b` | `1b`, `01101b` | | 1 |
| byte | `x` | `0x2a` | | 1 |
| short | `h` | `42h` | `0Nh` | 2 |
| int | `i` | `42i` | `0Ni` | 4 |
| long | `j` | `42j`, `42` | `0Nj` | 8 |
| real | `e` | `3.14e` | `0Ne` | 4 |
| float | `f` | `3.14`, `3.14f` | `0n` | 8 |
| char | `c` | `"a"` | `" "` | 1 |
| symbol | `s` | `` `sym `` | `` ` `` | ptr |
| timestamp | `p` | `2024.01.15D10:30:00.000000000` | `0Np` | 8 |
| month | `m` | `2024.01m` | `0Nm` | 4 |
| date | `d` | `2024.01.15` | `0Nd` | 4 |
| datetime | `z` | `2024.01.15T10:30:00` | `0Nz` | 8 |
| timespan | `n` | `0D10:30:00.000000000` | `0Nn` | 8 |
| minute | `u` | `10:30` | `0Nu` | 4 |
| second | `v` | `10:30:00` | `0Nv` | 4 |
| time | `t` | `10:30:00.000` | `0Nt` | 4 |
| guid | `g` | `"G"$"..." ` | `0Ng` | 16 |

## All Operators

| Op | Name | Unary (`:`) | Example |
|----|------|-------------|---------|
| `+` | Add | Flip | `2+3` → `5` |
| `-` | Subtract | Negate | `5-3` → `2` |
| `*` | Multiply | First | `2*3` → `6` |
| `%` | Divide | Reciprocal | `6%2` → `3f` |
| `&` | Min/And | Where | `3&5` → `3` |
| `|` | Max/Or | Reverse | `3|5` → `5` |
| `=` | Equal | Group | `3=3` → `1b` |
| `<>` | Not Equal | | `3<>4` → `1b` |
| `~` | Match | Not | `1 2~1 2` → `1b` |
| `<` | Less | iasc | `3<5` → `1b` |
| `>` | Greater | idesc | `5>3` → `1b` |
| `#` | Take | Count | `3#1 2 3 4` → `1 2 3` |
| `_` | Drop | Floor | `2_1 2 3 4` → `3 4` |
| `,` | Join | Enlist | `1 2,3 4` → `1 2 3 4` |
| `^` | Fill | Null | `0^0N 1 2` → `0 1 2` |
| `!` | Key/Enum | Key | `` `a`b!1 2`` → dict; `key 3` → `0 1 2` |
| `?` | Find/Random/Exec | Distinct | `1 2 3?2` → `1` |
| `$` | Cast/Cond | String | `` `int$3.14`` → `3i` |
| `@` | Apply-at | Type | `f@x` = `f[x]` |
| `.` | Apply/Index | Value | `f . (x;y)` = `f[x;y]` |

## All Iterators (Adverbs)

| Iterator | Name | Description | Example |
|----------|------|-------------|---------|
| `'` | Each | Apply to each element | `count'(1 2;3 4 5)` → `2 3` |
| `/` | Over | Reduce (fold) | `+/1 2 3 4` → `10` |
| `\` | Scan | Accumulate | `+\1 2 3 4` → `1 3 6 10` |
| `/:` | Each Right | Apply with each right | `1 2+/:10 20` → `(11 12;21 22)` |
| `\:` | Each Left | Apply with each left | `1 2+\:10 20` → `(11 21;12 22)` |
| `':` | Each Prior | Apply to consecutive pairs | `-':1 3 6 10` → `1 2 3 4` |

## Join Types

| Join | Syntax | Description |
|------|--------|-------------|
| `lj` | `t1 lj t2` | Left join - keep all t1 rows, nulls for no match |
| `ij` | `t1 ij t2` | Inner join - only matching rows |
| `uj` | `t1 uj t2` | Union join - all rows from both |
| `pj` | `t1 pj t2` | Plus join - add matching numeric columns |
| `ej` | `ej[c;t1;t2]` | Equi-join on columns c |
| `aj` | `aj[c;t1;t2]` | Asof join - returns t1's time column in result |
| `aj0` | `aj0[c;t1;t2]` | Asof join - returns t2's actual time in result |
| `wj` | `wj[w;c;t;(q;(f0;c0);...)]` | Window join - prevailing value + in-window values |
| `wj1` | `wj1[w;c;t;(q;(f0;c0);...)]` | Window join - only values strictly within window |

## Attributes

| Attribute | Name | Apply | Use Case |
|-----------|------|-------|----------|
| `` `s# `` | Sorted | `` `s#asc x`` | Binary search, sorted data |
| `` `u# `` | Unique | `` `u#distinct x`` | Hash lookup, unique values |
| `` `p# `` | Parted | `` `p#x`` | Grouped on disk |
| `` `g# `` | Grouped | `` `g#x`` | In-memory grouping |

## System Commands

| Command | Description |
|---------|-------------|
| `\l file.q` | Load script/directory |
| `\d .ns` | Set namespace (`\d` shows current) |
| `\p 5000` | Set listening port |
| `\t expr` | Time expression (ms) |
| `\ts[:n] expr` | Time + space (repeat n times) |
| `\a [ns]` | List tables |
| `\v [ns]` | List variables |
| `\f [ns]` | List functions |
| `\b [ns]` | List views/dependencies |
| `\B [ns]` | List pending views |
| `\c 25 80` | Console max rows/cols |
| `\C 36 2000` | HTTP display max rows/cols |
| `\cd path` | Change working directory |
| `\e [0\|1\|2]` | Error trap mode (0=off, 1=suspend, 2=dump) |
| `\g [0\|1]` | Garbage collection mode (0=deferred, 1=immediate) |
| `\o [n]` | UTC offset in hours |
| `\P [n]` | Float display precision (0=max, default 7) |
| `\r src dst` | Rename file |
| `\s [N]` | Secondary threads |
| `\S [n]` | Random seed |
| `\T [n]` | Client execution timeout (seconds) |
| `\u` | Reload user password file |
| `\w [0\|1\|n]` | Memory stats / workspace limit |
| `\W [n]` | Start-of-week offset (0=Saturday) |
| `\x .z.p*` | Expunge callback definitions |
| `\z [0\|1]` | Date parse format (0=mm/dd, 1=dd/mm) |
| `\1 file` | Redirect stdout |
| `\2 file` | Redirect stderr |
| `\\` | Exit q |
| `\` | Toggle q/k mode or clear suspension |

## Table Utilities

| Function | Description | Example |
|----------|-------------|---------|
| `meta t` | Schema (cols, types, attrs) | `meta trades` |
| `cols t` | Column names | `cols trades` → `` `sym`time`price `` |
| `type x` | Type number | `type 42` → `-7h` (neg=atom, pos=list) |
| `tables[]` | List tables | `tables[]` → `` `t1`t2 `` |
| `([k] v)` | Keyed table | `([sym:`AAPL] price:150)` |
| `xkey` | Set key cols | `` `sym xkey t`` |
| `0! t` | Unkey table | `0! kt` → unkeyed |

## .Q Namespace Utilities

| Function | Description | Example |
|----------|-------------|---------|
| `.Q.dpft[d;p;f;t]` | Save sorted partitioned table | `.Q.dpft[`:hdb;2024.01.15;`sym;`trade]` |
| `.Q.dpfts[d;p;f;t;s]` | Save with named symtable | |
| `.Q.dpt[d;p;t]` | Save unsorted partitioned table | |
| `.Q.dpts[d;p;t;s]` | Save unsorted with symtable | |
| `.Q.en[dir;t]` | Enumerate varchar columns | `.Q.en[`:hdb;t]` |
| `.Q.ens[dir;t;name]` | Enumerate against named domain | |
| `.Q.gc[]` | Garbage collect | |
| `.Q.w[]` | Memory stats | |
| `.Q.ind[t;i]` | Index into partitioned table | |
| `.Q.f[n;x]` | Format float to n decimals | `.Q.f[2;3.14159]` → `"3.14"` |
| `.Q.fmt[w;n;x]` | Format with width | `.Q.fmt[10;2;3.14]` |
| `.Q.s x` | Show structure | `.Q.s t` |
| `.Q.bt[]` | Backtrace | |
| `.Q.opt .z.x` | Parse command line args | |
| `.Q.trp[f;x;g]` | Trap with backtrace: g gets (error;bt) | `@` trap gives only error string |
| `.Q.addmonths[x;y]` | Add months to date | `.Q.addmonths[2024.01.15;3]` |
| `.Q.fs[f;file]` | Stream file in chunks | |
| `.Q.fsn[f;file;n]` | Stream file, n bytes per chunk | |
| `.Q.hg x` | HTTP GET | `.Q.hg ":http://example.com"` |
| `.Q.hp[x;y;z]` | HTTP POST | `.Q.hp[url;type;body]` |
| `.Q.bv[]` | Build views | |

## .z Namespace (System)

| Variable | Description |
|----------|-------------|
| `.z.d` | UTC date |
| `.z.t` | UTC time |
| `.z.p` | UTC timestamp |
| `.z.n` | UTC timespan |
| `.z.z` | UTC datetime |
| `.z.D` | Local date |
| `.z.T` | Local time |
| `.z.P` | Local timestamp |
| `.z.N` | Local timespan |
| `.z.Z` | Local datetime |
| `.z.h` | Hostname |
| `.z.u` | User ID |
| `.z.w` | Connection handle |
| `.z.a` | IP address |
| `.z.x` | Command line args |

## Aggregation Functions

| Function | Description |
|----------|-------------|
| `sum` | Sum |
| `prd` | Product |
| `avg` | Arithmetic mean |
| `med` | Median |
| `min` | Minimum |
| `max` | Maximum |
| `first` | First element |
| `last` | Last element |
| `count` | Count |
| `var` | Variance |
| `dev` | Standard deviation |
| `svar` | Sample variance |
| `sdev` | Sample std dev |
| `cov` | Covariance |
| `cor` | Correlation |
| `wavg` | Weighted average |
| `wsum` | Weighted sum |

## String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `lower` | Lowercase | `lower "ABC"` → `"abc"` |
| `upper` | Uppercase | `upper "abc"` → `"ABC"` |
| `trim` | Remove whitespace | `trim "  ab  "` → `"ab"` |
| `ltrim` | Left trim | |
| `rtrim` | Right trim | |
| `ss` | String search | `ss["abcabc";"bc"]` → `1 4` |
| `ssr` | Search & replace | `ssr["abc";"b";"X"]` → `"aXc"` |
| `like` | Pattern match | `"abc" like "a*"` → `1b` |
| `sv` | String from vector | `"/" sv ("ab";"cd")` → `"ab/cd"` |
| `vs` | Vector from string | `"/" vs "a/b/c"` → `(,"a";,"b";,"c")` |

## 0: File Text Type Characters

| Code | Type | Code | Type |
|------|------|------|------|
| `B` | boolean | `P` | timestamp |
| `G` | guid | `M` | month |
| `X` | byte | `D` | date |
| `H` | short | `Z` | datetime |
| `I` | int | `N` | timespan |
| `J` | long | `U` | minute |
| `E` | real | `V` | second |
| `F` | float | `T` | time |
| `C` | char | ` ` | skip column |
| `S` | symbol | `*` | as-is (literal/nested) |

```q
("DSFIJ"; enlist ",") 0: `:data.csv   / header row (enlist delimiter)
("DSFIJ"; ",") 0: `:data.csv          / no header (plain delimiter)
```

## Trap and Amend (@. operators)

```q
/ Trap: try f[x], on error apply e
@[f; x; e]                             / e is error handler or default value
.[g; (x;y); e]                         / trap with multi-arg function

/ Amend At: modify items at indices
@[list; indices; func]                 / apply func at indices
@[list; indices; :; values]            / replace at indices
.[dict; enlist key; :; val]             / amend at depth

/ Examples
@[`t; `price; *; 1.1]                 / multiply price column by 1.1
@[10 20 30; 1; +; 5]                  / 10 25 30
.[parse; enlist ")"; {`error}]         / trap parse error
```

## Temporal Extraction with $

```q
`year$2024.03.16     / 2024i
`mm$2024.03.16       / 3i (month number)
`dd$2024.03.16       / 16i (day)
`hh$12:30:45         / 12i (hour)
`uu$12:30:45         / 30i (minute)
`ss$12:30:45         / 45i (second)
```

## Sources

- [code.kx.com/q/ref](https://code.kx.com/q/ref/) - Official reference
- [Q for Mortals](https://code.kx.com/q4m3/) - Comprehensive book
- [kdb+ and q documentation](https://code.kx.com/q/)

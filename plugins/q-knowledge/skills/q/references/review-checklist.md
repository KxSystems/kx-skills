# Q Code Review Checklist

When reviewing q code, scan `.q` files for these issues in priority order.

## Critical — Likely Bugs

- **Reserved word usage**: Variables or parameters named `type`, `string`, `key`, `value`, `count`, `sum`, `avg`, `min`, `max`, `first`, `last`, `group`, `where`, `not`, `null`, `in`, `abs`, `floor`, `ceiling`, `neg`, `deltas`, `sums`, `sv`, `vs`, `var`, `med`, `cols`, `get`, `set`, `til`, `enlist`, `raze`, `flip`, `asc`, `desc`, `distinct`, `like`, `within`, `differ`, `except`, `inter`, `union`, `prds`, `prd`
- **`%` used as modulo** instead of `mod`
- **`=` used for structural comparison** where `~` is needed
- **Right-to-left precedence bugs**: Expressions that assume left-to-right evaluation or operator precedence (e.g., `a*b+c` meaning `a*(b+c)`)
- **`if[]` used in expressions** where `$[cond;true;false]` is needed

## Warning — Antipatterns

- **Unnecessary `each`** on atomic operations (e.g., `{x*2} each list` instead of `2*list`)
- **`do[]` or `while[]` loops** instead of Over/Scan
- **Nested `$[c1;v1;$[c2;v2;...]]`** instead of flat `$[c1;v1;c2;v2;dflt]`
- **Sentinel values** instead of nulls (`-1` or `""` for missing data)
- **`x -1`** for last element (subtraction) instead of `last x`
- **Double colon** in connection strings (`"::"` instead of `":"`)

## Style — Suggestions

- Functions longer than 5 lines that could be broken up
- Global state mutations that could be avoided
- Overly complex expressions that could use named intermediates

## Report Format

For each finding:
- File path and line number
- The problematic code
- Why it's an issue (reference the specific rule)
- The suggested fix

Group by severity (Critical / Warning / Style). If no issues found, say so.

# kx-query — Reserved Word Validation

> Run this check before accepting any kdb+ query string to catch the 'assign error class at source. Back to [SKILL.md](../SKILL.md).

**Contents:** Reserved word list · What to check · Validation algorithm · Error message format · Do not reject

---

## Reserved Word Validation

**Run this check before accepting or executing any kdb+ query string.** This catches the `'assign` error class at the source rather than at runtime.

### Reserved word list

```
neg      type     string   max      min      sum      avg      count
first    last     key      value    get      set      not      null
where    til      enlist   raze     flip     asc      desc     distinct
group    in       like     within   differ   except   inter    union
read0    read1    ss       sv       vs       ssr      abs      floor
ceiling  deltas   sums     prds     prd
```

### What to check

Scan every assignment in the query — any token that appears as the **left-hand side of `:` or `::` outside of a dictionary or table literal**. This includes:

| Pattern | Example | Offending token |
|---|---|---|
| Global assignment | `sum: 5` | `sum` |
| Local assignment | `{count: x+1; count}` | `count` |
| Compound assignment | `avg+: 1` | `avg` |
| Function parameter name | `{[type;val] type+val}` | `type` |

### Validation algorithm

1. Tokenise the query string (split on whitespace, semicolons, and brackets).
2. For each token immediately followed by `:` or `::`, extract the bare word (strip any namespace prefix such as `.ns.`).
3. Check the bare word against the reserved word list (case-sensitive — kdb+ is case-sensitive).
4. If **any** match is found, **reject the query immediately** and return the error below.

### Error message format

```
Error: '<word>' is a kdb+ reserved word and cannot be used as a variable or parameter name.
Rename '<word>' to something else (e.g. '<word>_' or 'my<Word>') and re-submit.
```

Example — query `{[sum;n] sum til n}` must be rejected with:

```
Error: 'sum' is a kdb+ reserved word and cannot be used as a variable or parameter name.
Rename 'sum' to something else (e.g. 'sum_' or 'mySum') and re-submit.
```

### Do not reject

- Reserved words used **as functions or operators** (right-hand side of expressions): `x: sum y` is valid — `sum` is called, not assigned.
- Reserved words inside **string literals** or **symbol literals**: `` `sum `` or `"sum"` are fine.
- Reserved words inside **comments** (text after `/`).


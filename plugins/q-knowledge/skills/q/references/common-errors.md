# Common q Errors and Solutions

Quick reference for the most frequently encountered q errors.

| Error | Cause | Fix |
|-------|-------|-----|
| `'assign` | Used a reserved word as variable name | Rename the variable — see Reserved Words in SKILL.md |
| `'match` | Reserved word used as function parameter | Rename the parameter (e.g., `var` → `val`, `type` → `typ`) |
| `'rank` | Wrong number of arguments to a function | Check function arity matches call site |
| `'type` | Atom/vector mismatch or wrong data type | Check with `type x`; use `enlist` to promote atoms to vectors |
| `'length` | Vectors of different lengths in an operation | Ensure operands have matching lengths, or use `each` |
| `'domain` | Value out of valid range (e.g., double-colon in connection string) | Check input ranges; use single colon for `hopen` targets |
| `'timesym` | Table missing `time`/`sym` as first two columns | kdb+tick requires `time` and `sym` as first two columns |
| `'nyi` | Feature not yet implemented | Find an alternative approach |
| `'cast` | Invalid type cast (e.g., `"J"$"abc"`) | Check source data format; handle nulls from failed casts |
| `'os` | OS-level error (file not found, permission denied) | Check file paths and permissions |

## Debugging Tips

- **`type x`** — Check the type of any value. Negative = atom, positive = vector.
- **`meta table`** — Show column names, types, and attributes of a table.
- **`count x`** — Returns 1 for atoms (misleading). Use `type x` to distinguish atoms from one-element vectors.
- **`0N!x`** — Debug print: outputs `x` to stdout and returns `x` (can be inserted anywhere in an expression).
- **`\e 1`** — Enable error trapping: on error, suspends into debugger instead of exiting.

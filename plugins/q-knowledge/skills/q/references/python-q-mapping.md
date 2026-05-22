# Python→Q Quick Reference

| Python | Q | Notes |
|--------|---|-------|
| `range(n)` | `til n` | |
| `len(x)` | `count x` | |
| `x[::-1]` | `reverse x` | |
| `sorted(x)` | `asc x` | `desc x` for descending |
| `set(x)` | `distinct x` | |
| `x.count(v)` | `sum x=v` | |
| `x.index(v)` | `x?v` | returns `count x` if not found |
| `sum(x)` | `sum x` | |
| `max(x)` | `max x` | |
| `abs(x)` | `abs x` | |
| `x % n == 0` | `0=x mod n` | `%` is division in Q! |
| `str(n)` | `string n` | returns char vector |
| `int(s)` | `"J"$s` | uppercase J for string parse |
| `float(s)` | `"F"$s` | uppercase F for string parse |
| `chr(n)` | `"c"$n` | |
| `ord(c)` | `"i"$c` | |
| `x[-1]` | `last x` | |
| `x[0]` | `first x` | |
| `"sep".join(L)` | `"sep" sv L` | |
| `s.split("sep")` | `"sep" vs s` | |
| `s.replace(a,b)` | `ssr[s;a;b]` | |
| `x if c else y` | `$[c;x;y]` | |
| `if/elif/else` | `$[c1;v1;c2;v2;dflt]` | flat chained conditional |
| `[f(i) for i in x]` | `f each x` | or just `f x` if f is atomic |
| `filter(p, x)` | `x where p x` | |
| `for` / `while` loop | `n f/ x` or `{cond}f/ x` | see Iteration in SKILL.md |
| `reduce(f, x)` | `f/ x` | Over: `(+/)1 2 3` = 6 |
| `accumulate(f, x)` | `f\ x` | Scan: `(+\)1 2 3` = 1 3 6 |
| `digits of n` | `10 vs n` | base conversion |
| `n from digits` | `10 sv d` | reverse base conversion |
| `zip(a, b)` | `flip(a;b)` | |
| `math.floor` | `floor x` | |
| `math.ceil` | `ceiling x` | |
| `None` | `(::)` | generic null; `0N` for null long, `0n` for null float |

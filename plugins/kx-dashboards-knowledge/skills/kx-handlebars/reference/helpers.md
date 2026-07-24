[← Back to SKILL.md](../SKILL.md)

# Handlebars Helper Catalog

The full set of built-in helpers available in KX Dashboards Handlebars templates, grouped by category.

---

## String

| Helper | Usage | Example |
|---|---|---|
| `lowercase` | Lowercase a string | `{{lowercase sym}}` |
| `uppercase` | Uppercase a string | `{{uppercase side}}` |
| `capitalize` | Capitalise first letter | `{{capitalize name}}` |
| `capitalizeAll` | Capitalise every word | `{{capitalizeAll label}}` |
| `pascalcase` | PascalCase | `{{pascalcase field}}` |
| `camelcase` | camelCase | `{{camelcase field}}` |
| `snakecase` | snake_case | `{{snakecase field}}` |
| `dashcase` | dash-case | `{{dashcase field}}` |
| `titleize` | Title Case | `{{titleize sentence}}` |
| `trim` | Trim whitespace | `{{trim text}}` |
| `replace` | Replace in string | `{{replace str "old" "new"}}` |
| `split` | Split to array | `{{split str ","}}` |
| `startsWith` | Boolean prefix check | `{{#if (startsWith val "BUY")}}` |
| `contains` | Boolean substring check | `{{#if (contains val "error")}}` |
| `encodeURIComponent` | URL-encode a value | `{{encodeURIComponent sym}}` |
| `encodeURI` | URL-encode a full URI | `{{encodeURI url}}` |

## Number

| Helper | Usage | Example |
|---|---|---|
| `toFixed` | Fixed decimal places | `{{toFixed price 2}}` |
| `addCommas` | Thousand-separator commas | `{{addCommas volume}}` |
| `round` | Round to nearest integer | `{{round value}}` |
| `ceil` | Round up | `{{ceil value}}` |
| `floor` | Round down | `{{floor value}}` |
| `add` | Add | `{{add a b}}` |
| `subtract` | Subtract | `{{subtract a b}}` |
| `multiply` | Multiply | `{{multiply qty price}}` |
| `divide` | Divide | `{{divide value 1000}}` |
| `sum` | Sum an array | `{{sum arr}}` |
| `avg` | Average an array | `{{avg arr}}` |
| `smartNumber` | Auto-abbreviate large numbers | `{{smartNumber volume}}` |
| `toAbbr` | Abbreviate (K/M/B) | `{{toAbbr value 1}}` |
| `toInt` | Parse integer | `{{toInt strNum}}` |
| `toFloat` | Parse float | `{{toFloat strNum}}` |

> Helpers can be chained/nested: `{{addCommas (toFixed price 2)}}` — always wrap the inner call in parentheses.

## Comparison / Logic

| Helper | Usage |
|---|---|
| `eq` | `{{#if (eq a b)}}` — equality |
| `ne` (unlessEq) | `{{#unless (eq a b)}}` — inequality |
| `gt` | `{{#if (gt value 100)}}` |
| `gte` | `{{#if (gte value 0)}}` |
| `lt` | `{{#if (lt value 0)}}` |
| `lte` | `{{#if (lte value 100)}}` |
| `and` | `{{#if (and a b)}}` |
| `or` | `{{#if (or a b)}}` |
| `is` | Alias for `eq` |
| `isnt` | Alias for inequality |
| `neither` | Both falsy |
| `typeOf` | `{{#if (eq (typeOf val) "number")}}` |
| `isNull` | `{{#if (isNull val)}}` — empty string counts as null |

## Array

| Helper | Usage |
|---|---|
| `join` | `{{join arr ", "}}` — join array to string |
| `first` | `{{first arr}}` — first element |
| `last` | `{{last arr}}` — last element |
| `filter` | `{{#filter arr "active"}}` — filter array |
| `sort` | `{{#each (sort arr)}}` — sort array |
| `sortBy` | `{{#each (sortBy arr "price")}}` — sort by field |
| `reverse` | Reverse an array |
| `eachIndex` | Like `#each` but exposes `{{item}}` and `{{index}}` |
| `each_with_sort` | `{{#each_with_sort arr "col" "desc"}}` |

## Date / Time

| Helper | Usage | Notes |
|---|---|---|
| `moment` | `{{moment ts "HH:mm:ss"}}` | Formats a kdb+ timestamp using moment.js format string |
| `UTCtoTimeZone` | `{{UTCtoTimeZone ts "HH:mm:ss"}}` | Converts UTC kdb+ temporal to local time |
| `toISOString` | `{{toISOString ts}}` | kdb+ temporal → ISO 8601 string |
| `formatTimestamps` | `{{formatTimestamps text "YYYY-MM-DD"}}` | Replaces embedded timestamp strings in a text block |

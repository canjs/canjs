
@function can-set-legacy.props.sort sort
@parent can-set-legacy.props

@description Defines the sortable property and behavior.

@signature `set.props.sort(prop, [sortFunc])`

Defines the sortable property and behavior.

```js
var algebra = new set.Algebra(set.props.sort("sortBy"));
algebra.index(
  {sortBy: "name desc"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 1

algebra.index(
  {sortBy: "name"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 0
```

  @param  {String} prop The sortable property.
  @param  {function(sortPropValue, item1, item2)} [sortFunc] The
  sortable behavior. The default behavior assumes the sort property value
  looks like `PROPERTY DIRECTION` (ex: `name desc`).
  @return {can-set-legacy.compares} Returns a compares that can be used to create
  a `set.Algebra`.

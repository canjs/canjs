
@function can-set-legacy.props.id id
@parent can-set-legacy.props

@description Defines the identify property.

@signature `set.props.id(prop)`

Defines the property name on items that uniquely
identifies them. This is the default sorted property if no
[can-set-legacy.props.sort] is provided.

```js
var algebra = new set.Algebra(set.props.id("_id"));
algebra.index(
  {sortBy: "name desc"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 1

algebra.index(
  {sortBy: "name"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 0
```

  @param  {String} prop The property name that defines the unique property id.
  @return {can-set-legacy.compares} Returns a compares that can be used to create
  a `set.Algebra`.

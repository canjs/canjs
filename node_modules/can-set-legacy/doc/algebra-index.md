
@function can-set-legacy.Algebra.prototype.index index
@parent can-set-legacy.Algebra.prototype

@signature `algebra.index(set, items, item)`

Returns where `item` should be inserted into `items` which is represented by `set`.

```js
algebra = new set.Algebra(
  set.props.sort("orderBy")
);
algebra.index(
  {orderBy: "age"},
  [{id: 1, age: 3},{id: 2, age: 5},{id: 3, age: 8},{id: 4, age: 10}],
  {id: 6, age: 3}
)  //-> 2
```

The default sort property is what is specified by
[can-set-legacy.props.id]. This means if that if the sort property
is not specified, it will assume the set is sorted by the specified
id property.

  @param  {can-set-legacy/Set} set The `set` that describes `items`.
  @param  {Array<Object>} items An array of data objects.
  @param  {Object} item The data object to be inserted.
  @return {Number} The position to insert `item`.

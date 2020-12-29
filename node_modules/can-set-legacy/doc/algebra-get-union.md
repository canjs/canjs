
@function can-set-legacy.Algebra.prototype.getUnion getUnion
@parent can-set-legacy.Algebra.prototype

@signature `algebra.getUnion(a, b, aItems, bItems)`

Unifies items from set A and setB into a single array of items.

```js
algebra = new set.Algebra(
  set.props.rangeInclusive("start","end")
);
algebra.getUnion(
  {start: 1,end: 2},
  {start: 2,end: 4},
  [{id: 1},{id: 2}],
  [{id: 2},{id: 3},{id: 4}]);
  //-> [{id: 1},{id: 2},{id: 3},{id: 4}]
```

  @param  {can-set-legacy/Set} a A set.
  @param  {can-set-legacy/Set} b A set.
  @param  {Array<Object>} aItems Set `a`'s items.
  @param  {Array<Object>} bItems Set `b`'s items.
  @return {Array<Object>} Returns items in both set `a` and set `b`.

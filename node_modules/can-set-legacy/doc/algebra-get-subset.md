
@function can-set-legacy.Algebra.prototype.getSubset getSubset
@parent can-set-legacy.Algebra.prototype

@signature `algebra.getSubset(a, b, bData)`

Gets `a` set's items given a super set `b` and its items.

```js
algebra.getSubset(
  {type: "dog"},
  {},
  [{id: 1, type:"cat"},
   {id: 2, type: "dog"},
   {id: 3, type: "dog"},
   {id: 4, type: "zebra"}]
) //-> [{id: 2, type: "dog"},{id: 3, type: "dog"}]
```

  @param  {can-set-legacy/Set} a The set whose data will be returned.
  @param  {can-set-legacy/Set} b A superset of set `a`.
  @param  {Array<Object>} bData The data in set `b`.
  @return {Array<Object>} The data in set `a`.

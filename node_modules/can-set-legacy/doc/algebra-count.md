
@function can-set-legacy.Algebra.prototype.count count
@parent can-set-legacy.Algebra.prototype

@signature `algebra.count(set)`

Returns the number of items that might be loaded by the `set`. This makes use of set.Algebra's
By default, this returns Infinity.

```js
var algebra =  new set.Algebra({
  set.props.rangeInclusive("start", "end")
});
algebra.count({start: 10, end: 19}) //-> 10
algebra.count({}) //-> Infinity
```

  @param  {can-set-legacy/Set} set A set.
  @return {Number} The number of items in the set if known, `Infinity`
  if unknown.

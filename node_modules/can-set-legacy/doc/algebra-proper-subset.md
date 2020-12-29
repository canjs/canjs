
@function can-set-legacy.Algebra.prototype.properSubset properSubset
@parent can-set-legacy.Algebra.prototype

@signature `algebra.properSubset(a, b)`

Returns true if _A_ is a strict subset of _B_ (_A_ ⊂ _B_).

```js
algebra.properSubset({type: "critical"}, {}) //-> true
algebra.properSubset({}, {}) //-> false
```

  @param  {can-set-legacy/Set} a A set.
  @param  {can-set-legacy/Set} b A set.
  @return {Boolean} `true` if `a` is a subset of `b` and not equal to `b`.

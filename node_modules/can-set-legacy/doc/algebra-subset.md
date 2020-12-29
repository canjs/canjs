
@function can-set-legacy.Algebra.prototype.subset subset
@parent can-set-legacy.Algebra.prototype

@signature `algebra.subset(a, b)`

Returns true if _A_ is a subset of _B_ or _A_ is equal to _B_ (_A_ ⊆ _B_).

```js
algebra.subset({type: "critical"}, {}) //-> true
algebra.subset({}, {}) //-> true
```

@param  {can-set-legacy/Set} a A set.
@param  {can-set-legacy/Set} b A set.
@return {Boolean} `true` if `a` is a subset of `b`.

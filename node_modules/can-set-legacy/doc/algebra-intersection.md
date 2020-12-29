
@function can-set-legacy.Algebra.prototype.intersection intersection
@parent can-set-legacy.Algebra.prototype

@signature `algebra.intersection(a, b)`

Returns a set that represents the intersection of sets _A_ and _B_ (_A_ ∩ _B_).

```js
algebra.intersection(
  {completed: true, due: "tomorrow"},
  {completed: true, type: "critical"},
) //-> {completed: true, due: "tomorrow", type: "critical"}
```

  @param  {can-set-legacy/Set} a A set.
  @param  {can-set-legacy/Set} b A set.
  @return {can-set-legacy/Set|Boolean} If an object is returned, it
  represents the intersection of sets _A_ and _B_ (_A_ ∩ _B_).
  - If [can-query-logic.EMPTY] is returned, that means there is no difference or the sets are not comparable.
  - If [can-query-logic.UNDEFINABLE] is returned, that means that _B_ is a subset of _A_, but no set object
    can be returned that represents that set.
  - If [can-query-logic.UNKNOWABLE] is returned, that means a result is unable to be determined.

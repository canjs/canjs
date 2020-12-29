
@function can-set-legacy.Algebra.prototype.difference difference
@parent can-set-legacy.Algebra.prototype

@signature `algebra.difference(a, b)`

Returns a set that represents the difference of sets _A_ and _B_ (_A_ \ _B_), or
returns if a difference exists.

```js
algebra1 = new set.Algebra(set.props.boolean("completed"));
algebra2 = new set.Algebra();

// A has all of B
algebra1.difference( {} , {completed: true} ) //-> {completed: false}

// A has all of B, but we can't figure out how to create a set object
algebra2.difference( {} , {completed: true} ) //-> true

// A is totally inside B
algebra2.difference( {completed: true}, {} )  //-> false
```

  @param  {can-set-legacy/Set} a A set.
  @param  {can-set-legacy/Set} b A set.
  @return {can-set-legacy/Set|Boolean} If an object is returned, it is difference of sets _A_ and _B_ (_A_ \ _B_).
  - If [can-query-logic.EMPTY] is returned, that means there is no difference or the sets are not comparable.
  - If [can-query-logic.UNDEFINABLE] is returned, that means that _B_ is a subset of _A_, but no set object
    can be returned that represents that set.
  - If [can-query-logic.UNKNOWABLE] is returned, that means a result is unable to be determined.

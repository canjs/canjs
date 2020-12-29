@typedef {function} can-set-legacy.prop Prop
@parent can-set-legacy.types


@signature `prop(aValue, bValue, a, b, prop, algebra)`

A prop function returns algebra values for two values for a given property.

  @param {*} aValue The value of A's property in a set difference A and B (A ∖ B).
  @param {*} bValue The value of A's property in a set difference A and B (A ∖ B).
  @param {*} a The A set in a set difference A and B (A ∖ B).
  @param {*} b The B set in a set difference A and B (A ∖ B).
  @return {Object|Boolean} A prop function should either return a Boolean which indicates if `aValue` and `bValue` are
  equal or an `AlgebraResult` object that details information about the union, intersection, and difference of `aValue` and `bValue`.

  An `AlgebraResult` object has the following values:

  - `union` - A value the represents the union of A and B.
  - `intersection` - A value that represents the intersection of A and B.
  - `difference` - A value that represents all items in A that are not in B.
  - `count` - The count of the items in A.

  For example, if you had a `colors` property and A is `["Red","Blue"]` and B is `["Green","Yellow","Blue"]`, the
  AlgebraResult object might look like:

  ```js
  {
	union: [ "Red", "Blue", "Green", "Yellow" ],
	intersection: [ "Blue" ],
	difference: [ "Red" ],
	count: 2000
}
```

  The count is `2000` because there might be 2000 items represented by colors "Red" and "Blue".  Often
  the real number can not be known.


@function can-set-legacy.Algebra.prototype.equal equal
@parent can-set-legacy.Algebra.prototype

@signature `algebra.equal(a, b)`

  Returns true if the two sets the exact same.

  ```js
  algebra.equal({type: "critical"}, {type: "critical"}) //-> true
  ```

@param  {can-set-legacy/Set} a A set.
@param  {can-set-legacy/Set} b A set.
@return {Boolean} True if the two sets are equal.

@function can-simple-map.prototype.set set
@parent can-simple-map.prototype

@description Set properties on a SimpleMap.

@signature `map.set(key, value)`

Assigns _value_ to a property on this `SimpleMap` called _key_.

@param {String} key The property to set
@param {*} value The value to assign to _key_.
@return {can.SimpleMap} this SimpleMap, for chaining

@signature `map.set(obj)`

Assigns each value in _obj_ to a property on this `SimpleMap` named after the
corresponding key in _obj_, effectively merging _obj_ into the SimpleMap.

@param {Object} obj a collection of key-value pairs to set.
If any properties already exist on the `SimpleMap`, they will be overwritten.

@return {can.SimpleMap} this SimpleMap, for chaining

@body

@typedef {function(ValueLike)} can-symbol/symbols/getValueDependencies can.getValueDependencies
@parent can-symbol/symbols/observe
@description A symbol placed on a constructor to reference a function that returns the other events that will trigger a value change event on the object.

@signature `@@can.getValueDependencies()`

The `@@@@can.getValueDependencies` symbol points to a function that returns an object containing all values that affect the
value of this Value-like object.
If the dependencies include properties on a Map-like object, they are placed in a [can-util/js/cid-map/cid-map CIDMap] 
keyed on `keyDependencies` in the return object. If the dependencies include the values of Value-like objects, they are 
placed in a [can-util/js/cid-set/cid-set CIDSet] keyed on `valueDependencies`.
Return `undefined` if the value is not computed, or an empty object if a key is computed without external dependencies.

```
var someOtherObj;
// This is a clear but not very useful implementation of a computed value.
// We recommend can-observation for new development of computed values.
var val = function() { 
	return canReflect.getKeyValue(someOtherObj, "bar");
};
val.reads: [{ object: someOtherObj, key: "bar" }]

val[canSymbol.for("can.getValueDependencies")] = function(key) {
  var ret;
  if(this.reads) {
  	ret = {};
  	this.reads.forEach(function(read) {
  		if(read.key) {
  			ret.keyDependencies = ret.keyDependencies || new CIDMap();
  			if(!ret.keyDependencies.has(read.object)) {
  				ret.keyDependencies.add(read.object, []);
  			}
  			ret.keyDependencies.get(read.object).push(read.key);
  		} else {
  			ret.valueDependencies = ret.valueDependencies || new CIDMap();
  			ret.valueDependencies.add(read.object);
  		}
  	});
  }
  return ret;
};
```

@this {ValueLike} obj an object with its own value having possible dependencies on other values
@return {Object} an object with an optional CIDMap of key dependencies and an optional CIDSet of value dependencies

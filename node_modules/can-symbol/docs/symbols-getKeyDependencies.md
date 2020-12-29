@typedef {function(String)} can-symbol/symbols/getKeyDependencies can.getKeyDependencies
@parent can-symbol/symbols/observe
@description A symbol placed on a constructor to reference a function that returns the other events that will trigger an event for the key on the object.

@signature `@@can.getKeyDependencies(key)`

The `@@@@can.getKeyDependencies` symbol points to a function that returns an object containing all values that affect the
value of a computed property of this Map-like object, keyed on `key`.  
If the dependencies include properties on a Map-like object, they are placed in a [can-util/js/cid-map/cid-map CIDMap] 
keyed on `keyDependencies` in the return object. If the dependencies include the values of Value-like objects, they are 
placed in a [can-util/js/cid-set/cid-set CIDSet] keyed on `valueDependencies`.
Return `undefined` if the value is not computed, or an empty object if a key is computed without external dependencies.

```
var someOtherObj;
// This is a clear but not very useful implementation of a computed key value.
//  Map-likes in CanJS are backed by can-computes and can-observations, and we recommend can-observation for new development.
var obj = {
	_computedAttrs: {
		foo: [{ 
			handler: function() { return canReflect.getKeyValue(someOtherObj, "bar") },
			reads: [{ object: someOtherObj, key: "bar" }]
		}]
	}
};

obj[canSymbol.for("can.getKeyDependencies")] = function(key) {
  var ret;
  if(this._computedAttrs[key]) {
  	ret = {};
  	this._computedAttrs[key].reads.forEach(function(read) {
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

@this {Object} obj a Map-like object
@param {String} key a property key on `this`
@return {Object} an object of key dependencies in a CIDMap and value dependencies in a CIDSet

@typedef {function(String)} can-symbol/symbols/keyHasDependencies can.keyHasDependencies
@parent can-symbol/symbols/observe
@description Check if there are any other objects that affect the value of a named property.

@signature `@@can.keyHasDependencies(key)`

The `@@@@can.keyHasDependencies` symbol points to a function that returns `true` if there are any other events or property 
changes that will change the value of the property on the context object with key `key`; `false` otherwise.  
By convention, if an object implementation distinguishes between unbound objects or values, and those 
which are bound without external dependencies (as is the case with [can-map]), `@@@@can.keyHasDependencies` may return 
`undefined` for unbound objects instead of `false`.

```
var someOtherObj;
var obj = {
	__bindEvents: {
		foo: [{ 
			handler: function() {},
			reads: [{ object: someOtherObj, key: "bar" }]
		}]
	}
};

obj[canSymbol.for("can.keyHasDependencies")] = function(key) {
	return this.__bindEvents[key] && 
		this.__bindEvents[key].filter(function(binding) {
			return binding.reads && binding.reads.length > 0;
		}).length > 0;
};
```

@this {MapLike} any map-like object with named properties
@param {String} key the key to check for dependent bindings
@return {Boolean} true if there are any other objects that this keyed propertey depends on


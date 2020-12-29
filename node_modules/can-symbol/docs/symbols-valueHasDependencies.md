@typedef {function()} can-symbol/symbols/valueHasDependencies can.valueHasDependencies
@parent can-symbol/symbols/observe
@description Define a function that checks if there are any other observable objects that affect the value of the object.

@signature `@@can.valueHasDependencies()`

The `@@@@can.valueHasDependencies` symbol points to a function that returns `true` if there are any other events or property
changes that will trigger an event for the value on the context object; 
`false` otherwise.  By convention, if an object implementation distinguishes between unbound objects or values, and those 
which are bound without external dependencies (as is the case with [can-compute]), `@@@@can.valueHasDependencies` may return 
`undefined` for unbound objects instead of `false`.

```
var someOtherObj;
var internalValue;
function computed(value) {
	if(arguments.length >= 1) {
		internalValue = value;
		obj.__bindEvents.forEach(function(handler) {
			handler.call(this, value);
		});
	} else {
		return internalValue;
	}
}
obj.__bindEvents = [{ 
	handler: function() {},
	reads: [{ object: someOtherObj }]
}];

obj[canSymbol.for("can.valueHasDependencies")] = function() {
	return this.__bindEvents && 
		this.__bindEvents.filter(function(binding) {
			return binding.reads && binding.reads.length > 0;
		}).length > 0;
};
```

@this {*} any value-like object
@return {Boolean} true if there are any other objects or properties that the object's value depends on

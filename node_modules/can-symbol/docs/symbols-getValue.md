@typedef {function()} can-symbol/symbols/getValue can.getValue
@parent can-symbol/symbols/get-set
@description  Defines a function that returns the object's current value when called.

@signature `@@can.getValue()`

The `@@@@can.getValue` symbol points to a function that returns the context object's value. Value may mean different
things in different contexts; e.g. a `can-compute`'s value is the value stored internally to the compute, while an observable object's value may be a non-observable, serialized representation of its properties.

```
var internalValue = undefined
export var foo = function(val) {
	if(val) {
		internalValue = val;
	} else {
		return internalValue;
	}
};

// Get the internal value as the representative value
foo[canSymbol.for('can.getValue')] = function() { 
	return internalValue;
}

```

@this {*} anything that can be resolved to a value
@return {*} any value

@typedef {function()} can-symbol/symbols/setValue can.setValue
@parent can-symbol/symbols/get-set
@description Define a function that sets the object's value.  

@signature `@@can.setValue( value )`

The `@@@@can.setValue` symbol points to a function that sets the current value on the context object. "Value" may mean different
things in different contexts; e.g. setting a [can-compute]'s value updates the value stored internally to the compute, while setting an observable object's value will update all of the same-keyed properties of the object argument.

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
foo[canSymbol.for('can.setValue')] = function(value) {
	internalValue = value;
}

```

@this {*} anything that can be resolved to a value
@param {*} value any appropriate value to set on the object

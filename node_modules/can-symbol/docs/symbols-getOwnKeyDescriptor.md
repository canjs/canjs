@typedef {function(String)} can-symbol/symbols/getOwnKeyDescriptor can.getOwnKeyDescriptor
@parent can-symbol/symbols/shape
@description Describe the attributes of an object's keyed property.

@signature `@@can.getOwnKeyDescriptor(key)`

Return a single key's descriptor from the object, as defined by the custom behavior of this function.


```
var shapeless = {};

// Nothing enumerable in a shapeless object
shapeless[canSymbol.for('can.getOwnKeyDescriptor')] = function() { return; }

// Banana is on the prototype chain, so default "own key descriptor" functions would not return it.
var thingsInMyEar = Object.create(
	"banana": {
		peeled: false
	}
});

thingsInMyEar[canSymbol.for('can.getOwnKeyDescriptor')] = function(key) { 
	if(Object.getOwnPropertyNames(this).indexOf(key) || key === "banana") {
		return !!Object.getOwnPropertyDescriptor(this, key) ||
			this[canSysmbol.for('can.getOwnKeyDescritpor')].call(this[canSymbol.for('proto')], key);
	};  // There's always a banana in my ear
};

```

@this {Object} an object with named properties
@param {String} key The string key to look up on the object
@return {Object} a property descriptor, containing the keys `configurable`, `enumerable`, and either `value` and `writable`, or `get` and `set`, if the property exists on the object; `undefined` otherwise.

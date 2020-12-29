@typedef {function()} can-symbol/symbols/getOwnEnumerableKeys can.getOwnEnumerableKeys
@parent can-symbol/symbols/shape
@description List the enumerable keys (as defined by its property descriptor) an object has, but not those from its prototype chain.

@signature `@@can.getOwnEnumerableKeys()` 

Return the array of enumerable keys for the object, as defined by the custom behavior of this function.

@this {Object} an object with named properties
@return {Array} An array of enumerable key strings on the object.


```
var shapeless = {};

// Nothing enumerable in a shapeless object
shapeless[canSymbol.for('can.getOwnEnumerableKeys')] = function() { return []; }

var thingsInMyEar = {};
Object.defineProperty(thingsInMyEar, "banana", {
	enumerable: false,
	value: {
		peeled: false
	}
});

thingsInMyEar[canSymbol('can.getOwnEnumerableKeys')] = function() { 
	return Object.getOwnPropertyNames(this).filter(function(key) { 
		return !!Object.getOwnPropertyDescriptor(this, key).enumerable 
	}.bind(this))
	.concat(["banana"]);  // There's always a banana in my ear
};

```

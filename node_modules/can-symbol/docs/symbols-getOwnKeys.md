@typedef {function()} can-symbol/symbols/getOwnKeys can.getOwnKeys
@parent can-symbol/symbols/shape
@description List which keys an object has of its own (not other objects on the prototype chain).

@signature `@@can.getOwnKeys()`

Return all string keys on an object, including those whose corresponding properties are defined not to be enumerable.

```
var shapeless = {};

// Nothing enumerable in a shapeless object
shapeless[canSymbol.for('can.getOwnKeys')] = function() { return []; }

var thingsInMyEar = {};
Object.setPrototypeOf(thingsInMyEar, {
	"banana": {
		peeled: false
	}
});

thingsInMyEar[canSymbol('can.getOwnEnumerableKeys')] = function() { 
	return Object.getOwnPropertyNames(this)
		.concat(["banana"]);  // There's always a banana in my ear
};

```

@this {Object} an object with named properties
@return {Array} an array of Strings representing the object's string keys.


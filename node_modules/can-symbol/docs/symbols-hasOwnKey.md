@typedef {function(String)} can-symbol/symbols/hasOwnKey can.hasOwnKey
@parent can-symbol/symbols/shape
@description Define a function to determine key membership of an object

@signature `@@can.hasOwnKey(key)`

The `@@@@can.hasOwnKey` symbol points to a function on an object that, given a String key, determines whether the key is a member of the object's own key set (not that of the prototype chain).

```
var shapeless = {};

// Nothing enumerable in a shapeless object
shapeless[canSymbol.for('can.hasOwnKey')] = function() { return false; }

var thingsInMyEar = {};
Object.setPrototypeOf(thingsInMyEar, {
	"banana": {
		peeled: false
	}
});

thingsInMyEar[canSymbol('can.hasOwnKey')] = function(key) { 
	return key === "banana" || Object.getOwnPropertyNames(this).indexOf(key) > -1
	// There's always a banana in my ear
};

```

@this {Object} any object with key properties
@param {String} key the string key for which to test membership in the object
@return {Boolean} true if there is a property on the object with a matching key, false otherwise.


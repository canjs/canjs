@typedef {function(String)} can-symbol/symbols/hasKey can.hasKey
@parent can-symbol/symbols/shape
@description Define a function to determine key membership of an object or an object on its prototype chain

@signature `@@can.hasKey(key)`

The `@@@@can.hasKey` symbol points to a function on an object that, given a String key, determines whether the key is a member of the object's key set or the key set of an object on its prototype chain.

```
var obj = {
	secrets: [ "garden", "santa", "service" ]
};

obj[canSymbol('can.hasKey')] = function(key) {
	return key in this || key in this.secrets;
};

```

@this {Object} any object with key properties
@param {String} key the string key for which to test membership in the object
@return {Boolean} true if there is a property on the object or on an object in the objects prototype chain with a matching key, false otherwise.


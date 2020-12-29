@typedef {function(String)} can-symbol/symbols/deleteKeyValue can.deleteKeyValue
@parent can-symbol/symbols/get-set
@description Defines a function that deletes one of an object's named properties.

@signature `@@can.deleteKeyValue( key )`

The `can.deleteKeyValue` symbol points to a Map-like object's property removal function, which removes the object's property with the supplied key. This is only applicable to objects where keyed properties are relevant (like maps).

```
var map = {
	removeKey: function (key) {
		delete this[key];
	}
}

map[canSymbol.for('can.deleteKeyValue')] = map.removeKey;
```

@this {Object} an object with named properties
@param {String} key the key to remove from the object


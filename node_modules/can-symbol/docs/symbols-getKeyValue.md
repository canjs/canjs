@typedef {function(String)} can-symbol/symbols/getKeyValue can.getKeyValue
@parent can-symbol/symbols/get-set
@description Defines a function to access and return the value of one of the object's named properties.  

@signature `@@can.getKeyValue( key )`

The `can.getKeyValue` symbol points to a Map-like object's property accessor function, which returns the value of the object's property with the supplied key.   This is only applicable to objects where keyed properties are relevant (like maps).

@this {Object} an object with named properties
@param {String} key the key to look up on the object
@return {*} the value of the key


```
var map = {
	get: function (key) {
		Observation.add(this, key);
		return this[key];
	}
}

map[canSymbol.for('can.getKeyValue')] = map.get;
```

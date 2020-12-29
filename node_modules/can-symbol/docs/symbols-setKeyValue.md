@typedef {function(String, *)} can-symbol/symbols/setKeyValue can.setKeyValue
@parent can-symbol/symbols/get-set
@description Defines a function that sets the value of one of an object's named properties.

@signature `@@can.setKeyValue( key, value )`

The `@@@@can.setKeyValue` symbol points to a Map-like object's property mutator function, which updates the value of the 
object's property with the supplied key. This is only applicable to objects where keyed properties are relevant (like maps).

```
var map = {
	set: function (key, value) {
		Observation.add(this, key);
		this[key] = value;
	}
}

map[canSymbol.for('can.setKeyValue')] = map.set;
```

@this {Object} an object with named properties
@param {String} key the key to set on the object
@param {*} key the property value to set on the object


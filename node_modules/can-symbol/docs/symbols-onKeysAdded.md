@typedef {function(function(Array))} can-symbol/symbols/onKeysAdded can.onKeysAdded
@parent can-symbol/symbols/observe
@description Define a function used to listen to when the object's key set has new additions.

@signature `@@can.onKeysAdded( handler(newValue) )`

The `@@@@can.onKeysAdded` symbol points to a function that registers 
 `handler` to be called back when the keys on the object
 change via new properties added.

```
var obj = {
	handlers: {},
	setKeyValue: function(key, value){
		var newKey = this[canSymbol.for("hasOwnKey")](key);
		this[key] = value;
		var self = this;
		if(newKey) {
			obj.handlers.__keysAdded.forEach(function(handler){
				handler.call(self, [key]);
			});
		}
	}
};

obj[canSymbol.for("can.onKeysAdded")] = function(handler){
	if(!obj.handlers.__keysAdded) {
		obj.handlers.__keysAdded = [];
	}
	obj.handlers.__keysAdded.push(handler);
}
```

@this {Object} any Map-like object with named properties
@param {function(this:*, Array)} handler(newValue) The handler must be called back with `this` as the instance of the observable, and passed the added keys as an Array.

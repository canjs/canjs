@typedef {function(function(Array))} can-symbol/symbols/onKeys can.onKeys
@parent can-symbol/symbols/observe
@description Define a function used to listen to when the object's key set changes.

@signature `@@can.onKeys( handler(newValue) )`

The `@@@@can.onKeys` symbol points to a function that registers 
 `handler` to be called back when the keys on the object
 change via new properties or deletions.

```
var obj = {
	handlers: {},
	setKeyValue: function(key, value){
		var newKey = this[canSymbol.for("hasOwnKey")](key);
		this[key] = value;
		var self = this;
		if(newKey) {
			obj.handlers.__keys.forEach(function(handler){
				handler.call(self, this[canSymbol.for("getOwnKeys")]());
			});
		}
	}
};

obj[canSymbol.for("can.onKeys")] = function(handler){
	if(!obj.handlers.__keys) {
		obj.handlers.__keys = [];
	}
	obj.handlers.__keys.push(handler);
}
```

@this {Object} any Map-like object with named properties
@param {function(this:*, Array)} handler(newValue) The handler must be called back with `this` as the instance of the observable, and passed the current key set as an Array.

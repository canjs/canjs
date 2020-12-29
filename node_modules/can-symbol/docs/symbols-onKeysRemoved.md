@typedef {function(function(Array))} can-symbol/symbols/onKeysRemoved can.onKeysRemoved
@parent can-symbol/symbols/observe
@description Define a function used to listen to when the object's key set has keys removed through deletion.

@signature `@@can.onKeysRemoved( handler(newValue) )`

The `@@@@can.onKeysRemoved` symbol points to a function that registers 
 `handler` to be called back when the keys on the object
 change via properties deleted.

```
var obj = {
	handlers: {},
	removeKeyValue: function(key){
		var result = delete this[key];
		var keyStillExists = this[canSymbol.for("hasOwnKey")](key);
		var self = this;
		if(result && !keyStillExists) {
			obj.handlers.__keysRemoved.forEach(function(handler){
				handler.call(self, [key]);
			});
		}
	}
};

obj[canSymbol.for("can.onKeysRemoved")] = function(handler){
	if(!obj.handlers.__keysRemoved) {
		obj.handlers.__keysRemoved = [];
	}
	obj.handlers.__keysRemoved.push(handler);
}
```

@this {Object} any Map-like object with named properties
@param {function(this:*, Array)} handler(newValue) The handler must be called back with `this` as the instance of the observable, and passed the removed keys as an Array.

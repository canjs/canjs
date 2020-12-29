@typedef {function(String, function(*))} can-symbol/symbols/onKeyValue can.onKeyValue
@parent can-symbol/symbols/observe
@description Defines how observable values can be listened to on a type.

@signature `@@can.onKeyValue( key, handler(newValue) )`

The `@@@@can.onKeyValue` symbol points to a function that registers 
 `handler` to be called back with the new value of `key` when `key`
 changes.  

 ```
var obj = {
	handlers: {},
	setKeyValue: function(key, value){
		this[key] = value;
		var self = this;
		obj.handlers[key].forEach(function(handler){
			handler.call(self, value);
		});
	}
};

obj[canSymbol.for("can.onKeyValue")] = function(key, handler){
	if(!obj.handlers[key]) {
		obj.handlers[key] = [];
	}
	obj.handlers[key].push(handler);
}
```

@this {Object} any Map-like object with named properties
@param {String} key the string key to bind on changes to.
@param {function(this:*, *)} handler(newValue) The handler must be called back with `this` as the instance of the observable. 

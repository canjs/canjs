@typedef {function(String, function(*))} can-symbol/symbols/offKeyValue can.offKeyValue
@parent can-symbol/symbols/observe
@description Defines how observable values can be listened to on a type.


@signature `@@can.offKeyValue( key, handler(newValue) )`

the `@@@@can.offKeyValue` symbol is placed on a Map-like object to point to a function used to stop listening to changes on the `key` property with the `handler` function.


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

obj[canSymbol.for("can.offKeyValue")] = function(key, handler){
	if(!obj.handlers[key]) {
		obj.handlers[key] = [];
	}
	obj.handlers[key].splice(obj.handlers[key].indexOf(handler), 1);
}
```

@this {Object} any Map-like object with named properties
@param {String} key the string key to stop binding on changes to.
@param {function(this:*, *)} handler(newValue) The handler that was previously bound with [can-symbol/symbols/onKeyValue `@@can.onKeyValue`]

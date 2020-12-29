@typedef {function(function(*))} can-symbol/symbols/offValue can.offValue
@parent can-symbol/symbols/observe
@description Defines how observables can stop listening to the object's value changing.

@signature `@@can.offValue( handler(newValue) )`

The `@@@@can.offValue` symbol points to a function that unregisters 
 `handler` from being called when the object's value
 changes.  

```
var obj = function(value) {
	if(arguments.length >= 1) {
		obj.currentValue = value;
		obj.handlers.forEach(function(handler){
			handler.call(obj, value);
		});
	} else {
		return obj.currentValue;
	}
};

obj[canSymbol.for("can.offValue")] = function(handler){
	if(!obj.handlers) {
		obj.handlers = [];
	}
	obj.handlers.splice(obj.handlers.indexOf(handler), 1);
}
```

@this {*} any object with a mutable value
@param {function(this:*, *)} handler(newValue) The handler was previously added with [can-symbol/symbols/onValue `@@can.onValue`]. 

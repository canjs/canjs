@typedef {function(function(*))} can-symbol/symbols/onValue can.onValue
@parent can-symbol/symbols/observe
@description Defines how observables can listen to the object's value changing.

@signature `@@can.onValue( handler(newValue) )`

The `@@@@can.onValue` symbol points to a function that registers 
 `handler` to be called back with the new value of the object when it
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

obj[canSymbol.for("can.onValue")] = function(handler){
	if(!obj.handlers) {
		obj.handlers = [];
	}
	obj.handlers.push(handler);
}
```

@this {*} any object with a mutable value
@param {function(this:*, *)} handler(newValue) The handler must be called back with `this` as the instance of the observable. 

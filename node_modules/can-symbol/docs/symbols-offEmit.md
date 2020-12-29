@typedef {function(function(*))} can-symbol/symbols/offEmit can.offEmit
@parent can-symbol/symbols/observe
@description Defines how observables can stop listening to the object's value being emitted.

@signature `@@can.offEmit( handler(newValue) )`

The `@@@@can.offEmit` symbol points to a function that unregisters 
 `handler` from being called when the object's value
 is emitted.  

```js
const obj = function(value) {
	if(arguments.length >= 1) {
		obj.currentValue = value;
		obj.handlers.forEach(function(handler){
			handler.call(obj, value);
		});
	} else {
		return obj.currentValue;
	}
};

obj[canSymbol.for("can.offEmit")] = function(handler){
	if(!obj.handlers) {
		obj.handlers = [];
	}
	obj.handlers.splice(obj.handlers.indexOf(handler), 1);
}
```

@this {*} any object with a mutable value
@param {function(this:*, *)} handler(newValue) The handler was previously added with [can-symbol/symbols/onEmit `@@can.onEmit`]. 

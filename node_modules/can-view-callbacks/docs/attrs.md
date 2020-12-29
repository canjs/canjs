@function can-view-callbacks.attrs attrs
@description Add a Map of attr callbacks
@parent can-view-callbacks/methods

@signature `callbacks.attrs(map)`

Register a set of attribute callbacks.

```js
import callbacks from 'can-view-callbacks';


const attrs = new Map();
attrs.add(/foo/, function(el, attrData) {
	...
});

callbacks.attrs(attrs);
```

This will loop over the set of bindings and register them all with [can-view-callbacks.attr].

@param {Map|Object} map A key/value pair where the keys are strings or regular expressions and the values are callback functions.

@body

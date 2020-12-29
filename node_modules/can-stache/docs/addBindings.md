@function can-stache.addBindings addBindings
@description Add a set of view binding callbacks.
@parent can-stache.static

@signature `stache.addBindings(bindings)`

Register a set of view bindings.

```js
const bindings = new Map();
bindings.add(/foo/, function(el, attrData) {
	...
});

stache.addBindings(bindings);
```

This will loop over the set of bindings and register them all with [can-view-callbacks].

@param {Map|Object} bindings A key/value pair where the keys are strings or regular expressions and the values are callback functions.

@body

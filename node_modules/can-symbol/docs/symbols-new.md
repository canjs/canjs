@property {function(...)} can-symbol/symbols/new can.new
@parent can-symbol/symbols/call
@description Create a new instance of a constructor function or prototype object.

@signature `@@can.new(...args)`

The `@@@@can.new` symbol points to a function that constructs and returns a new instance object.  It is left to the
implementation to create the object, set the prototype chain, and handle any arguments passed to the constructor.

```
function constructor() {}
constructor.prototype = { foo: "bar" };

// ES6 rest and spread params used below to be concise.
constructor[canSymbol.for("can.new")] = function(...args) {
	return new this(...args);
};

var prototype = { baz: "quux" };
prototype[canSymbol.for("can.new")] = function(props) {
	return Object.create(this, props);
};
```

@this {*} A callable constructor or a prototype object.
@param {*} args pass any number of parameters of any type
@return {Object} A new instance of the type.

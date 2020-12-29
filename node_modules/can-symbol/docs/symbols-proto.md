@typedef {Object} can-symbol/symbols/proto can.proto
@parent can-symbol/symbols/shape
@description Defines the "proto" (first element in the prototype chain) of an object


@signature `@@can.proto`

The `@@@@can.proto` symbol is placed on an object to reference its prototype.  Since the non-standard `__proto__` is deprecated, this can serve as a prototype chain reference without invoking `Object.getPrototypeOf()` every time.

```
function Foo() {}
Foo.prototype = {
	bar: "baz"
};

var obj = new Foo();
obj[canSymbol.for("can.proto")] = Foo.prototype;

```

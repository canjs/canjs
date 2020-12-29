@page can-symbol
@parent can-polyfills
@collection can-infrastructure
@package ./package.json
@group can-symbol/methods 0 Methods
@group can-symbol/symbols/type 1 Type Symbols
@group can-symbol/symbols/get-set 2 Get/Set Symbols
@group can-symbol/symbols/shape 3 Shape Symbols
@group can-symbol/symbols/call 4 Call Symbols
@group can-symbol/symbols/observe 5 Observe Symbols
@group can-symbol/types 6 Types
@description Symbols used to detail how CanJS may operate on different objects

CanJS has a consistent internal interface for objects to interact with each other, and this is also important for interop
with external libraries.  CanJS uses symbols to identify object types, property access methods, and for event
handling.

`can-symbol` also has a polyfill function that will fake symbols on unsupported platforms.

@signature `canSymbol(String)`

Create or reuse symbols based on an optional string description

@body

```
	var MyIDSymbol = CanSymbol("my_ID");

	// ES5
	var obj = {};
	obj[MyIDSymbol] = 1;

	// ES6 and above
	const obj = {
		[myIDSymbol]: 1
	};
```

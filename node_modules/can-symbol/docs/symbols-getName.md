@typedef {Boolean} can-symbol/symbols/getName can.getName
@parent can-symbol/symbols/shape

@description Returns a human-readable name of an object

@signature `@@can.getName()`

The `@@@@can.getName` symbol points to a function that returns human-readable name of the object. Depending on the context this name could be decorated with extra information, like the `cid` of a given instance. 


```js
const foo = function() {};

foo[ canSymbol.for( "can.getName" ) ] = function() {
	return "MyFooFunction";
};

obj[ canSymbol.for( "can.getName" ) ](); //-> "MyFooFunction"
```

@return {String} The name of the object/function

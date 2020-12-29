@typedef {Boolean} can-symbol/symbols/size can.size
@parent can-symbol/symbols/shape

@description Return the number of items in the collection.

@signature `@@can.size()`

The `@@@@can.size` symbol points to a function that returns the number of
items in the collection.

```js
const obj = {
	[ canSymbol.for( "can.size" ) ]: function() {
		return Object.keys( this ).length;
	}
};

obj.foo = true;
obj.bar = true;
obj[ canSymbol.for( "can.size" ) ](); //-> 2
```

@return {Number} The number of items in the collection.

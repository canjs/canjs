@module {Object} can-reflect
@parent can-typed-data
@collection can-infrastructure
@group can-reflect/call 3 Call reflections
@group can-reflect/get-set 2 Get/Set reflections
@group can-reflect/observe 5 Observable reflections
@group can-reflect/shape 4 Shape reflections
@group can-reflect/type 1 Type reflections
@package ./package.json

@description Perform operations and read information on unknown data types.

@type {Object} The `can-reflect` package exports an object with
methods used to perform operations and read information on unknown data
types. For example, `setKeyValue` sets the `name` property on some type of map:

```js
import canReflect from "can-reflect";

const map = CREATE_MAP_SOMEHOW();

canReflect.setKeyValue( map, "name", "my map" );
```

Any object can interact with the reflect APIs by having the right
[can-symbol] symbols.  The following creates an object that informs how
[can-reflect.getKeyValue] and [can-reflect.setKeyValue] behave:

```js
import canSymbol from "can-symbol";

const obj = {
	_data: new Map()
};
obj[ canSymbol.for( "can.getKeyValue" ) ] = function( key ) {
	return this._data.get( key );
};
obj[ canSymbol.for( "can.setKeyValue" ) ] = function( key, value ) {
	return this._data.set( key, value );
};
```

`can-reflect` organizes its methods into the following groups:

- __Type Reflections__ - Determine if an object matches a familiar type to CanJS.
- __Get/Set Reflections__ - Read and write to objects.
- __Call Reflections__ - Call functions and function-like objects.
- __Shape Reflections__ - Perform operations based on multiple values within an object.
- __Observable Reflections__ - Listen to changes in observable objects.

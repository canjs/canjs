@typedef {Boolean} can-symbol/symbols/getIdentity can.getIdentity
@parent can-symbol/symbols/shape
@hide

@description Returns a name/label that identifies the object

@signature `@@can.getIdentity()`

The `@@@@can.getIdentity` symbol points to a function/value that labels the
identity of the object. Ideally this should be a unique identifier, like the
primary key (id) in a database table. The `@@@@can.getName` symbol behavior
uses the value of `@@can.getIdentity` (if set) to decorate its output.

E.g:

```js
const obj = {};
import canReflect from "can-reflect";

// without setting `can.getIdentity`
canReflect.getName( obj ); // -> Object<>

foo[ canSymbol.for( "can.getIdentity" ) ] = function() {
	return "15";
};

obj[ canSymbol.for( "can.getIdentity" ) ](); //-> "15"
canReflect.getName( obj ); // -> Object<15>
```

@return {String} The name/label that identifies the object 

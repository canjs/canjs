@property {function} can-kefir/can.setKeyValue can.setKeyValue
@parent can-kefir/symbols

@description Used by [can-reflect.settKeyValue can-reflect.setKeyValue] to set the
stream's last emitted `value` or `error`.  This symbol is only added to
[can-kefir/emitterProperty] objects.

@signature `emitterProperty[@@can.setKeyValue](key, value)`

[can-reflect.setKeyValue can-reflect.setKeyValue] will use this function
to emit a `value` or `error` on the emitterProperty.


```js
import Kefir from "can-kefir";

const age = Kefir.emitterProperty();

age.onValue( function( value ) {
	console.log( value );
} );

canReflect.setKeyValue( age, "value", 30 ); // logs 30
```

@param {String} name Either `value` to emit value or `error` to
emit errors.

@param {*} value Any value to emit.

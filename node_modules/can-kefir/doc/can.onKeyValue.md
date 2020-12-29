@property {function} can-kefir/can.onKeyValue can.onKeyValue
@parent can-kefir/symbols

@description Used by [can-reflect/observe.onKeyValue can-reflect.onKeyValue] to listen to
when the underlying stream emits either a `value` or `error` with a new value.

@signature `stream[@@can.onKeyValue](key, handler)`

[can-reflect/observe.onKeyValue can-reflect.onKeyValue] will use this function
to listen to when emitted `value`s or `error`s change.

Notice how the following only logs 3 numbers even though 4 numbers are emitted:

```js
import Kefir from "can-kefir";

const count = Kefir.sequentially( 1000, [ 1, 2, 2, 3 ] );

canReflect.onKeyValue( stream, "value", function( newVal ) {
	console.log( "new value", newVal );
} ); // logs 1, 2, 3
```


@param {String} key Either `value` for values emitted by the stream or `error` or
error values emitted by the stream.

@param {function(*)} handler(value) A function handler that will be called when the emitted value changes with the emitted value.

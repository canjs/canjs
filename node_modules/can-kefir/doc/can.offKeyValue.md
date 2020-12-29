@property {function} can-kefir/can.offKeyValue can.offKeyValue
@parent can-kefir/symbols

@description Used by [can-reflect/observe.offKeyValue can-reflect.offKeyValue] to stop listening to
when the underlying stream emits either a `value` or `error` with a new value.

@signature `stream[@@can.offKeyValue](key, handler)`

[can-reflect/observe.offKeyValue can-reflect.offKeyValue] will use this function
to stop listening to when emitted `value`s or `error`s change.

```js
import Kefir from "can-kefir";

const count = Kefir.sequentially( 1000, [ 1, 2, 2, 3 ] );

function handler( newVal ) {
	console.log( "new value", newVal ); // logs 1, 2
	if ( newVal > 2 ) {
		canReflect.offKeyValue( stream, "value", handler );
	}
}

canReflect.onKeyValue( stream, "value", handler );
```


@param {String} key Either `value` for values emitted by the stream or `error` or
error values emitted by the stream.

@param {function(*)} handler(value) The same handler passed to `onKeyValue`.

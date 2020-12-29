@property {function} can-kefir/can.getKeyValue can.getKeyValue
@parent can-kefir/symbols

@description Used by [can-reflect.getKeyValue can-reflect.getKeyValue] to read the
stream's last emitted `value` or `error` and make those properties observable
by [can-observation].

@signature `stream[@@can.getKeyValue](key)`

[can-reflect.getKeyValue can-reflect.getKeyValue] will use this function
to read the last emitted `value` or `error` by this stream.  

Note, `streams` only have a value if [can-reflect/observe.onKeyValue] is used to listen to changes.  Use
Kefir `properties` if you want to always be able to read a value.


The following creates a stream that immediately emits a value.  When `onKeyValue`
is used to listen to changes, it will immediately log 1.  However,
that value is preserved so `getKeyValue` can still be used:


```js
import Kefir from "can-kefir";

const stream = Kefir.stream( function( emit ) {
	emit.value( 1 );
} );

canReflect.onKeyValue( stream, "value", function( newVal ) {
	console.log( "new value", newVal );
} ); // logs 1

canReflect.getKeyValue( stream, "value" ); //-> 1
```

@param {String} name Either `value` for values emitted by the stream or `error` for
error values emitted by the stream.

@return {*} The value at that key.  The value will be stable for streams that
have already been bound by `onKeyValue` or Kefir properties.

@property {function} can-kefir/emitterProperty emitterProperty
@parent can-kefir/methods

@description Create a Kefir property that has its emitter methods
directly on it.  This is a useful writable stream.


@description `.emitterProperty()`

@type {function}

Emitter property creates a Kefir [property](https://rpominov.github.io/kefir/#about-observables),
but then adds `emitter.value` and `emitter.error` methods that calls the
property's [emitter object](https://rpominov.github.io/kefir/#emitter-object).

The end result is a single object that has methods of a stream, property and
an attached emitter-like object.  

```js
import Kefir from "can-kefir";

const age = Kefir.emitterProperty();

age.onValue( function( age ) {
	console.log( age );
} );

age.emitter.value( 20 ); //-> logs 20

age.emitter.value( 30 ); //-> logs 30
```

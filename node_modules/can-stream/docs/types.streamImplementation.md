@typedef {Object} can-stream.types.streamImplementation StreamImplementation
@parent can-stream.types

@description Export an object with a minimal implementation of `toStream` and `toCompute` methods specific to a streaming library like [Kefir](https://rpominov.github.io/kefir/)

@type {Object}
  An object with `toStream` and `toCompute` methods.

```js
const streamImplementation = {
	toStream: function( compute ) {
		return MAKE_THE_STREAM_FROM_A_COMPUTE( compute );
	},
	toCompute: function( makeStream, context ) {
		const setStream = makeStream(); // make a settable stream that is set when compute is set
		const stream = makeStream.call( context, setStream );

		const compute = makeCompute(); // make compute to have value from stream and set to setStream

		return compute;
	}
};

import canStream from "can-stream";

const streamInterface = canStream( streamImplementation );

const map = new DefineMap( { name: "John" } );
streamInterface( map, ".name" ); //-> an instance of the stream library.

export default streamInterface;
```

	@option {can-stream/type/implementation.toStream} toStream

  @option {can-stream/type/implementation.toCompute} toCompute

@body

## Use

See [can-stream-kefir] for example implementation.

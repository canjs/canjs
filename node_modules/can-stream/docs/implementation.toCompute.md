@function can-stream/type/implementation.toCompute toCompute
@parent can-stream.types.streamImplementation

@description Creates a [can-compute.computed] from a stream generator function.

@signature `toCompute( makeStream(setStream), [context] )`

This returns a [can-compute.computed] that when [can-compute.computed.on bound]
takes on the value of the stream returned by `makeStream`.  `makeStream`
is called with:

 - its `this` as the `context`, and
 - `setStream` which is a stream of values set on the returned compute (ex: `compute(5)`).

This is used to create computes from streams.

```js
const count = Kefir.sequentially( 1000, [ 1, 2 ] );

const myCompute = canStream.toCompute( function( setStream ) {
	return setStream.merge( count );
} );

// listen to the compute for it to have a value
myCompute.on( "change", function() {} );

myCompute( "A" );

// immediate value
myCompute(); //-> "A"

// 1000ms later
myCompute(); //-> 1

// 1000ms later
myCompute(); //-> 2
```

  @param {function(Stream):Stream} makeStream(setStream) A stream generator
  function.  This function takes the stream of set values, and typically other streams
  and manipulates them into the final returned output stream.  The output stream's
  values are used as the value of the returned [can-compute.computed].

  The `setStream` is the stream of values set on the returned compute. In the following example, `setStream` will emit the values `1` and then `2`.

  ```js
const returnedCompute = canStream.toCompute( function( setStream ) {
	return setStream;
} );
returnedCompute( 1 );
returnedCompute( 2 );
```

  @param {Object} [context] An optional context which will be the `this` of `makeStream`.

  @return {can-compute.computed} A compute that when read will return the value of
  the stream returned by `setStream`.  When the compute is written to, it will
  update `setStream`.

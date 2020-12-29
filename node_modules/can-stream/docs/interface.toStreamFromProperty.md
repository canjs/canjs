@function can-stream/type/interface.toStreamFromProperty toStreamFromProperty
@parent can-stream.types.streamInterface

@description Creates a stream on a {Observable} object that gets updated whenever the property value on the observable changes.

@signature `canStream.toStreamFromProperty( obs, propName )`

  Creates a stream based on property value change on observable

  ```js
const map = {
	foo: "bar"
};
const stream = canStreaming.toStreamFromProperty( map, "foo" );

stream.onValue( function( value ) {
	console.log( value ); // -> foobar
} );

map.foo = "foobar";
```
  @param {Observable} An observable object
  @param {String} property name

  @return {Stream} A stream.

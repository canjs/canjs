@function can-stream-kefir.toStream toStream
@parent can-stream-kefir.fns


@description Provides a shorthand for creating a stream from observable objects, properties and
events.

@signature `canStream.toStream( compute )`

  Creates a stream from a [can-compute] compute. This stream gets updated whenever the compute value changes.

  ```js
import compute from "can-compute";
import canStream from "can-stream-kefir";

const c1 = compute( 0 );

const resultCompute = canStream.toStream( c1 );

resultCompute.onValue( function( val ) {
	console.log( val );
} );

c1( 1 );
```

  @param {can-compute} compute A compute whose value will be the stream values.

  @return {Stream} A [Kefir](https://rpominov.github.io/kefir/) stream.

@signature  `canStream.toStream( obs, "eventName" )`

  Creates an event stream with the event objects dispatched on `obs` for `eventName`.
  This is a shorthand for [can-stream-kefir.toStreamFromEvent].

  ```js
import DefineList from "can-define/list/list";
import canStream from "can-stream-kefir";

const hobbies = new DefineList( [ "js", "kayaking" ] );

const changeCount = canStream.toStream( hobbies, "length" ).scan( function( prev ) {
	return prev + 1;
}, 0 );
changeCount.onValue( function( event ) {
	console.log( event );
} );

hobbies.push( "bball" );

//-> console.logs {type: "add", args: [2,["bball"]]}
hobbies.shift();

//-> console.logs {type: "remove", args: [0,["js"]]}
```

  @param {Observable} obs An observable object like a [can-define/map/map].
  Promises can work too.
  @param {String} eventName An observable event name.

  @return {String} A [Kefir](https://rpominov.github.io/kefir/) stream make up of the event objects dispatched on `obs`.


@signature `canStream.toStream( obs, ".propName" )`

  Creates a stream from an observable property value. This is a shorthand for [can-stream-kefir.toStreamFromProperty].

  ```js
import canStream from "can-stream-kefir";
import DefineMap from "can-define/map/map";

const person = new DefineMap( {
	first: "Justin",
	last: "Meyer"
} );

const first = canStream.toStream( person, ".first" ), last = canStream.toStream( person, ".last" );

const fullName = Kefir.combine( first, last, function( first, last ) {
	return first + last;
} );

fullName.onValue( function( newVal ) {
	console.log( newVal );
} );

map.first = "Payal";

//-> console.logs "Payal Meyer"
```

  Create a stream based on a event on an observable property.

  @param {Observable} obs An observable object like a [can-define/map/map].
    Promises can work too.
  @param {String} propName A property name.  Multiple property names can be provided like `".foo.bar.car"`

  @return {String} A [Kefir](https://rpominov.github.io/kefir/) stream of values at the specified `propName`.

@signature `canStream.toStream( obs, ".propName eventName" )`

  Creates a stream from an observable property value. This is a shorthand for the second signature of [can-stream-kefir.toStreamFromEvent].

  ```js
import canStream from "can-stream-kefir";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const me = new DefineMap( {
	todos: [ "mow lawn" ]
} );

const addStream = canStream.toStream( me, ".todos add" );

addStream.onValue( function( event ) {
	console.log( event );
} );

map.todos.push( "do dishes" );

//-> console.logs {type: "add", args: [1,["do dishes"]]}
```

  Create a stream based on a event on an observable property.

  @param {Observable} obs An observable object like a [can-define/map/map].
    Promises can work too.

  @param {String} propName A property name.  Multiple property names can be provided like `".foo.bar.car"`
  @param {String} eventName An observable event name.
  @return {String} A [Kefir](https://rpominov.github.io/kefir/) stream of the `eventName` event objects dispatched on the objects specified by `propName`.

@function can-define-stream.tostreamfromevent toStreamFromEvent
@parent can-define-stream.fns


@description Create a stream based on an event

@signature `DefineMap.toStreamFromEvent( eventName )`

Creates a stream from an event that gets updated whenever the event is triggered.

```js
import DefineList from "can-define/list/list";
import canStream from "can-stream-kefir";
import canDefineStream from "can-define-stream";

const PeopleList = DefineList.extend( {} );

canDefineStream( canStream )( PeopleList );

const people = new PeopleList( [
	{ first: "Justin", last: "Meyer" },
	{ first: "Paula", last: "Strozak" }
] );

const stream = people.toStreamFromEvent( "length" ); // using eventName

stream.onValue( function( val ) {
	val; //-> 2, 3
} );

people.push( {
	first: "Obaid",
	last: "Ahmed"
} ); //-> stream.onValue -> 3
```

@param {String} event An event name

@return {Stream} A [can-stream] stream.

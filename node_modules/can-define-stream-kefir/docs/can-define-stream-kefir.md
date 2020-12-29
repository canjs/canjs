@module {Object} can-define-stream-kefir can-define-stream-kefir
@parent can-observables
@collection can-ecosystem
@group can-define-stream-kefir.types types
@group can-define-stream-kefir.fns DefineMap methods
@package ../package.json

@description Export a function that takes a [can-define/map/map] or [can-define/list/list] constructor and uses [can-stream-kefir] to create streamable properties.

@signature `canDefineStreamKefir(DefineMap)`

The `can-define-stream-kefir` module exports a function that will take a [can-define-stream-kefir.types.DefineMap DefineMap] or [can-define-stream-kefir.types.DefineList DefineList] constructor and add the following methods using the [can-stream-kefir] stream implementation:

- .toStream(observable, propAndOrEvent[,event])
- .toStreamFromProperty(property)
- .toStreamFromEvent(property)
- .toCompute([can-stream.types.makeStream makeStream(setStream)], context):compute

```js
import canDefineStreamKefir from "can-define-stream-kefir";
import DefineMap from "can-define/map/map";

const Person = DefineMap.extend( {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	},
	fullNameChangeCount: {
		stream: function() {
			return this.toStream( ".fullName" ).scan( function( last ) {
				return last + 1;
			}, 0 );
		}
	}
} );

canDefineStreamKefir( Person );

const me = new Person( { name: "Justin", last: "Meyer" } );

me.on( "fullNameChangeCount", function( ev, newVal ) {
	console.log( newVal );
} );

me.fullNameChangeCount; //-> 0

me.first = "Obaid"; //-> console.logs 1
me.last = "Ahmed"; //-> console.logs 2

```

@body

## Usage

For example:

__Update map property based on stream value__

```js
import DefineMap from "can-define/map/map";
import canDefineStreamKefir from "can-define-stream-kefir";

const Person = DefineMap.extend( {
	name: "string",
	lastValidName: {
		stream: function() {
			return this.toStream( ".name" ).filter( function( name ) { // Using prop name
				return name.indexOf( " " ) >= 0;
			} );
		}
	}
} );

canDefineStreamKefir( Person );

const me = new Person( { name: "James" } );

me.on( "lastValidName", function( lastValid ) {} );

me.name = "JamesAtherton"; //lastValidName -> undefined
me.name = "James Atherton"; //lastValidName -> James Atherton

```

__Stream on DefineList__

```js
import DefineList from "can-define/list/list";
import canDefineStreamKefir from "can-define-stream-kefir";

const PeopleList = DefineList.extend( {} );

canDefineStreamKefir( PeopleList );

const people = new PeopleList( [
	{ first: "Justin", last: "Meyer" },
	{ first: "Paula", last: "Strozak" }
] );

const stream = people.toStream( "length" ); // Using event name

stream.onValue( function( val ) {
	val; //-> 2, 3
} );

people.push( {
	first: "Obaid",
	last: "Ahmed"
} ); //-> stream.onValue -> 3
```

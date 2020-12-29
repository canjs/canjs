@function can-define-stream.tostreamfromproperty toStreamFromProperty
@parent can-define-stream.fns

@description Create a stream based on a property

@signature `DefineMap.toStreamFromProperty( property )`

Creates a stream from a property that gets updated whenever the property value changes.

```js
import DefineMap from "can-define/map/map";
import canStream from "can-stream-kefir";
import canDefineStream from "can-define-stream";

const Person = DefineMap.extend( {
	name: "string",
	lastValidName: {
		stream: function() {
			return this.toStreamFromProperty( ".name" ).filter( function( name ) { // using propName
				return name.indexOf( " " ) >= 0;
			} );
		}
	}
} );

canDefineStream( canStream )( Person );

const me = new Person( { name: "James" } );

me.on( "lastValidName", function( lastValid ) {} );

me.name = "JamesAtherton"; //lastValidName -> undefined
me.name = "James Atherton"; //lastValidName -> James Atherton
```

@param {String} property A property name prepended by a dot. '.prop'

@return {Stream} A [can-stream] stream.

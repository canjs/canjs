@function can-define-stream.toStream toStream
@parent can-define-stream.fns

@description Provide a shorthand for creating a stream on properties and/or events.

@signature `DefineMap.toStream( propAndOrEvent[,event] )`

Creates a stream that gets updated whenever the property value changes or event is triggered.

```js
import DefineMap from "can-define/map/map";
import canStream from "can-stream-kefir";
import canDefineStream from "can-define-stream";

const Person = DefineMap.extend( {
	name: "string",
	lastValidName: {
		stream: function() {
			return this.toStream( ".name" ).filter( function( name ) { // using propName
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

@param {String} prop A property name prepended by a dot '.prop'

@param {String} event An event name 'event'

@param {String} propAndEvent A property name prepended by a dot follow by an event name seperated by a space '.prop event'

@return {Stream} A [can-stream] stream.

@function can-stream/type/interface.toStreamFromEvent toStreamFromEvent
@parent can-stream.types.streamInterface

@description Creates a stream on a {Observable} object that gets updated whenever the event occurs on the observable object.

@signature `canStream.toStreamFromEvent( obs, eventName )`

  Creates a stream based on event on observable

  ```js
import canStreamKefir from "can-stream-kefir";
import canStream from "can-stream";
const canStreaming = canStream( canStreamKefir );

import compute from "can-compute";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const MyMap = DefineMap.extend( {
	tasks: {
		Type: DefineList.List,
		value: []
	}
} );
const map = new MyMap();

const stream = canStreaming.toStreamFromEvent( map, "tasks" );

stream.onValue( function( ev ) {
	console.log( "map.tasks has been updated" );
} );

map.fooList.push( "New task" );
```

  @param {Observable} An observable object
  @param {String} property name

  @return {Stream} A stream.


@signature `canStream.toStreamFromEvent( obs, propName, eventName )`

  Creates a stream based on event trigger on observable property

  ```js
import canStreamKefir from "can-stream-kefir";
import canStream from "can-stream";
const canStreaming = canStream( canStreamKefir );
import compute from "can-compute";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const MyMap = DefineMap.extend( {
	tasks: {
		Type: DefineList.List,
		value: []
	}
} );
const map = new MyMap();

const stream = canStreaming.toStreamFromEvent( map, "tasks", "length" );

stream.onValue( function( ev ) {
	console.log( "map.tasks has been updated" );
} );

map.fooList.push( "New task" );
```

  @param {Observable} An observable object
  @param {String} observable property name
  @param {String} observable event name

  @return {Stream} A stream.

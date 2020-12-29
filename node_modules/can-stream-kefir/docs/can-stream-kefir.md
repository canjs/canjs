@module {Object} can-stream-kefir can-stream-kefir
@parent can-observables
@collection can-ecosystem
@group can-stream-kefir.fns 2 Methods
@package ../package.json

@description Convert observable values into streams. [Kefir](https://rpominov.github.io/kefir/) is used to provide the stream functionality.

@type {Object}

  The `can-stream-kefir` module exports methods useful for converting observable values like [can-compute]s
  or [can-define/map/map] properties into streams.

  ```js
import canStream from "can-stream-kefir";
import DefineMap from "can-define/map/map";

const me = new DefineMap( { name: "Justin" } );

const nameStream = canStream.toStream( me, ".name" );


nameStream.onValue( function( name ) {

	// name -> "Obaid";
} );

me.name = "Obaid";
```

@body

## Usage

The [can-stream-kefir.toStream] method takes a compute and returns a [Kefir](https://rpominov.github.io/kefir/) stream instance.

```
var canStream = require("can-stream-kefir");

canStream.toStream(compute)                    //-> stream
```

For example:

__Converting a compute to a stream__

```js
import canCompute from "can-compute";
import canStream from "can-stream-kefir";

const compute = canCompute( 0 );
const stream = canStream.toStream( compute );

stream.onValue( function( newVal ) {
	console.log( newVal );
} );

compute( 1 );

//-> console.logs 1
```

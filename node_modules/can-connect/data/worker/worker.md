@module can-connect/data/worker/worker
@parent can-connect.behaviors
@group can-connect/data/worker/worker.identifiers options
@group can-connect/data/worker/worker.data data methods

Connects a connection to another connection in a worker thread.

@signature `dataWorker( baseConnection )`

If a [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
is provided, overwrites the "data interface methods" to package the arguments and send them as
part of a `postMessage` to the Worker.


If a `Worker` is not provided, it is assumed "data-worker" is being added
within a worker thread.  It listens to messages sent to the Worker, calls the specified "data interface method"
and sends a message back with the result.

Any data methods called on the `window` connection will wait until the `worker` connection
has established a handshake.

@body

## Use

The best way to use `data/worker` is to create a connection module that works when loaded in
either the `window` or in a [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).
This pattern tends to work even if workers are not supported.

The following creates a connection that does the work of [can-connect/cache-requests/cache-requests],
[can-connect/data/url/url], and [can-connect/data/memory-cache/memory-cache] in a worker thread.  

@demo demos/can-connect/data-worker.html

The `todo_connection` module can be found [here](https://github.com/canjs/can-connect/blob/master/src/data/worker/demo/todo_connection.js)
and looks like the following:


```js
import connect from "can-connect";
import fixture from "can-fixture";

// If we are in the main thread, see if we can load this same
// connection in a worker thread.
let worker;
if ( typeof document !== "undefined" ) {
	worker = new Worker( System.stealURL + "?main=can-connect/data/worker/demo/todo_connection" );
}


// create cache connection
const cache = connect( [
	require( "can-connect/data/memory-cache/" )
], {
	name: "todos"
} );

// Create the main connection with everything you need.  If there is a worker,
// all data interface methods will be sent to the worker.
const todosConnection = connect( [
	require( "can-connect/data/url/url" ),
	require( "can-connect/cache-requests/cache-requests" ),
	require( "can-connect/data/worker/worker" ),
	require( "can-connect/constructor/constructor" ),
	require( "can-connect/constructor/store/store" )
], {
	url: "/todos",
	cacheConnection: cache,
	worker: worker,
	name: "todos"
} );


fixture.delay = 1000;
fixture( {
	"GET /todos": function( request ) {
		return { data: [
			{ id: 1, name: "wash dishes" },
			{ id: 2, name: "mow lawn" },
			{ id: 3, name: "do laundry" }
		] };
	}
} );

export default todosConnection;
```



The things to notice:

1. A `Worker` should be passed as the [can-connect/data/worker/worker.worker] option
that loads a connection with the same name as the connection in the `window`.  In thise case, the same
connection module is loaded so everything works.

2. A single `Worker` could load multiple connection modules and perform other behaviors.  

### Split Connection Logic

THe previous example used a single module that was loaded by both the window and the worker.
This doesn't have to be the case.  Two different modules could be used.  For example, `todo-window.js` and
`todo-worker.js`.  Each might look like:

```js
// todo-window.js
const workerURL = System.stealURL + "?main=app/models/todo-worker";

const todoConnection = connect( [
	require( "can-connect/data/worker/worker" ),
	require( "can-connect/constructor/constructor" ),
	require( "can-connect/constructor/store/store" )
], {
	worker: new Worker( workerURL ),
	name: "todos"
} );
```

```js
// todo-worker.js
const cache = connect( [
	require( "can-connect/data/memory-cache/memory-cache" )
], {
	name: "todos-cache"
} );

const todoConnection = connect( [
	require( "can-connect/data/url/url" ),
	require( "can-connect/cache-requests/cache-requests" ),
	require( "can-connect/data/worker/worker" )
], {
	url: "/todos",
	cacheConnection: cache,
	name: "todos"
} );
```

However, the problem with the two-module approach is that it will not work
if Workers are not supported by your browser.

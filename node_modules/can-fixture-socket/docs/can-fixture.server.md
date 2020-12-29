@constructor can-fixture-socket.Server Server
@parent can-fixture-socket.properties
@group can-fixture-socket.Server.prototype prototype

Intercept socket.io messages and simulates socket.io server responses.

@signature `new Server( io )`

When server is instantiated with socket.io `io` object it intercepts a socket.io connection and allows to mock socket.io server behaviour. On instantiation we:
  - empty `io.managers` object which is a cache of socket.io `io.Manager` instances;
  - override `io.Manager.prototype` to work with current instance of the mocked server.

```js
import io from "socket.io-client";
import fixtureSocket from "can-fixture-socket";
const mockServer = new fixtureSocket.Server( io );
```

@param {Object} io Imported `socket.io-client` object.

@body

## Use

1. Instantiate a server to intercept socket.io connection:
```js
import io from "socket.io-client";
import fixtureSocket from "can-fixture-socket";
const mockServer = new fixtureSocket.Server( io );
```

2. Mock socket.io server behaviour:
```js
mockServer.on( "connection", function() {
	mockServer.emit( "notifications", [ { text: "A new notification" } ] );
} );

mockServer.on( "some event", function( data, ackCb ) {
	console.log( "Client send some ", data );
	ackCb( "thanks" );
} );
```

3. Test your client app:
```js
const socket = io( "http://localhost:8080/ws" );
socket.emit( "some event", "some data", function( data ) {
	assert.equal( data, "thanks", "Server acknowledged our event" );
} );
```

## Examples

### CRUD service with fixture store

Lets see how we can test a possible implementation of a CRUD service that utilizes socket.io ACK callbacks. We will use fixture store to emulate our CRUD storage and link it to our mocked server.

```js
import fixture from "can-fixture";

// First, lets create fixture store:
const fixtureStore = fixture.store( [
	{ id: 1, title: "One", rank: "good" },
	{ id: 2, title: "Two", rank: "average" },
	{ id: 3, title: "Three", rank: "good" }
], new canSet.Algebra( {} ) );

// And instantiate a mocked server:
import io from "socket.io-client";

import fixtureSocket from "can-fixture-socket";
const mockServer = new fixtureSocket.Server( io );
```

Fixture store is designed to work with XHR requests, thus its methods take two arguments: `request` and `response`. See [can-fixture.Store.prototype.getListData] for more details. Our mocked server can listen to socket events and its event listener expects data and an optional ACK callback. To convert a request handler to an event listener we can use [can-fixture-socket.requestHandlerToListener]:

Now we can create socket event listeners for our CRUD operations:
```js
const toListener = fixtureSocket.requestHandlerToListener;
mockServer.on( "messages find",   toListener( fixtureStore.getListData ) );
mockServer.on( "messages get",    toListener( fixtureStore.getData     ) );
mockServer.on( "messages remove", toListener( fixtureStore.destroyData ) );
mockServer.on( "messages create", toListener( fixtureStore.createData  ) );
mockServer.on( "messages update", toListener( fixtureStore.updateData  ) );
```

There is also a helper [can-fixture-socket.storeToListeners] to create all listeners at once:
```
var listeners = fixtureSocket.storeToListeners(messagesStore);
mockServer.on({
	"messages find": listeners.getListData,
	"messages get": listeners.getData,
	"messages remove": listeners.destroyData,
	"messages create": listeners.createData,
	"messages update": listeners.updateData
});
```

Now lets implement a CRUD model on our client. We define that all our ACK callbacks take an error as the first argument, and data as the second one.
```js
const socket = io( "localhost" );

socket.emit( "messages find", { rank: "good" }, function( err, response ) {
	if ( err ) {
		console.log( "Error: ", err );
		return;
	}
	console.log( `We found ${response.count} good items`, response.data );
	assert.equal( response.count, 3 );
} );
```

Now lets test the rest of the methods:
```js
socket.emit( "messages get", { id: 1 }, function( err, data ) {
	s;
	assert.deepEqual( data, { id: 1, title: "One" }, "received the item" );
} );
socket.emit( "messages update", { id: 2, title: "TwoPlus" }, function( err, data ) {
	assert.deepEqual( data, { id: 2, title: "TwoPlus" }, "received the updated item" );
} );
socket.emit( "messages get", { id: 999 }, function( err, data ) {
	assert.deepEqual( err,
		{ error: 404, message: "no data" },
		"received 404 when looking for a non-existent item id"
	);
} );
```

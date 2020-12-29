@module {Object} can-fixture-socket
@parent can-data-modeling
@collection can-ecosystem
@package ./package.json
@group can-fixture-socket.properties properties
@group can-fixture-socket.types types

@description Simulate socket.io services.



@type {Object}

`can-fixture-socket` intercepts socket.io messages and simulates socket.io server responses.

The `can-fixture-socket` module exports an object with:

- [can-fixture-socket.Server], a constructor function which instance intercepts the socket.io connection;
- [can-fixture-socket.requestHandlerToListener], a helper to convert XHR request handler into [can-fixture-socket.socket-event-listener];
- [can-fixture-socket.storeToListeners], a helper to convert all [can-fixture/StoreType] request handlers into [can-fixture-socket.socket-event-listener].

With three simple steps you can test your real-time application that uses socket.io:

 1. create a mock server that intercepts socket.io;
 2. mock server behavior;
 3. test your application.

```js
import fixtureSocket from "can-fixture-socket";

// Import socket-io client:
import io from "socket.io-client";

// Create a mock server that intercepts socket.io:
const mockServer = new fixtureSocket.Server( io );

// Mock server behavior
mockServer.on( "connection", function() {
	mockServer.emit( "notifications", { test: "OK" } );
} );

// Client. Create socket.io connection:
const socket = io( "http://localhost:8080/api" );

// Test your application:
socket.on( "connect", function() {
	assert.ok( true, "socket connected" );
} );

socket.on( "notifications", function( data ) {
	assert.deepEqual( data, { test: "OK" }, "received notifications message" );
} );
```

@body

## Use basics

Lets say we wanted to test a simple app that connects to `socket.io`, and
once connected, creates a message, and logs when the message is created.

That app could look like the following:

```js
const socket = io();
socket.on( "connect", function() {
	socket.emit( "messages create", { text: "A new message" } );
} );
socket.on( "message created", function( data ) {

	// data.text === "A new message"
	console.log( "Server sent out a new message we just created", data );
} );
```

To test this, we'll first use [can-fixture-socket.Server can-fixture-socket.Server] to intercept the socket connection:

```js
import io from "socket.io-client";
import fixtureSocket from "can-fixture-socket";
const mockServer = new fixtureSocket.Server( io );
```

Now we can mock the socket server by creating socket event listeners and emitting socket events:

```js
mockServer.on( "messages create", function( data ) {
	console.log( "New message received", data );
	mockServer.emit( "message created", data );
} );
```

To see this in action:

@demo demos/can-fixture-socket/basic-app.html


### Acknowledgement callbacks

We also can use socket.io [acknowledgement callbacks](http://socket.io/docs/#sending-and-getting-data-(acknowledgements)):
```js
mockServer.on( "users create", function( user, ackCb ) {
	console.log( "Simulating saving a new user to DB and return the new user id", user );

	ackCB( {
		id: Math.random()
	} );
} );
```

Client code:

```js
const socket = io();
socket.on( "connect", function() {
	socket.emit( "users create", { name: "Ilya", likes: "skiing" }, function( data ) {

		// data is what server calls the acknowledgement callback
		// with (e.g. data.id is the new user id).
		console.log( data.id );
	} );
} );
```

## Use with can-fixture.Store

With can-fixture [can-fixture.store] we can create a store of items and emulate a fully working CRUD service. Optionally, we can use [can-set.Algebra] to power our store filtering, pagination, and sorting abilities.

```js
// Import can-fixture that provides `store` method for creating a store:
import fixture from "can-fixture";

import canSet from "can-set";

// Create a fixture store:
const messagesStore = fixture.store( [
	{ id: 1, title: "One" },
	{ id: 2, title: "Two" },
	{ id: 3, title: "Three" }
], new canSet.Algebra( {} ) );
```

We can mock the socket.io connection with the rich behavior of _fixture stores_ using the [can-fixture-socket.requestHandlerToListener] helper.  `requestHandlerToListener`
converts a _fixture store request handler_ to a _socket.io event listener_.

```js
import fixtureSocket from "can-fixture-socket";
import io from "socket.io-client";
const mockServer = new fixtureSocket.Server( io );

mockServer.on( "messages get", fixtureSocket.requestHandlerToListener( messagesStore.getData ) );
```

Or we can use [can-fixture-socket.storeToListeners] helper to convert all CRUD _fixture store request handlers_ into _socket.io event listeners_:

```js
const listeners = fixtureSocket.storeToListeners( messagesStore );
mockServer.on( {
	"messages remove": listeners.destroyData,
	"messages create": listeners.createData,
	"messages update": listeners.updateData
} );
```

## Use with FeathersJS

[Feathers](http://feathersjs.com/) is a minimalist, service-oriented, real-time web framework for modern applications. It is a NodeJS framework built on top of Express. It allows you to build REST-ful services and works with three [providers](https://docs.feathersjs.com/providers/): standard HTTP communication, WebSockets and Primus.

The mocked server exposes [can-fixture-socket.Server.prototype.onFeathers] method to simulate [FeathersJS](http://feathersjs.com/) CRUD services.

For example, given the following FeathersJS client app:

```js
const socket = io( "http://api.my-feathers-server.com" );
const app = feathers()
	.configure( hooks() )
	.configure( feathersSocketio( socket ) );

// Create FeathersJS CRUD service for "messages" resource:
const messagesService = app.service( "messages" );
```

We can simulate it with a [can-fixture.store] as follows:

```js
const messagesStore = fixture.store( [
	{ id: 1, title: "One" },
	{ id: 2, title: "Two" },
	{ id: 3, title: "Three" }
], new canSet.Algebra( {} ) );

mockServer.onFeathersService( "messages", fixtureStore );
```

Now you can test your FeathersJS app:

```js
messagesService.find( {} ).then( function( data ) {
	assert.equal( data.total, 3, "find should receive 3 items" );
} );
messagesService.get( 1 ).then( function( data ) {
	assert.deepEqual( data, { id: 1, title: "One" }, "get should receive an item" );
} );
messagesService.create( { title: "Four" } ).then( function( data ) {
	assert.equal( data.title, "Four", "create should add an new item" );
} );
```

@function can-fixture-socket.Server.prototype.onFeathersService onFeathersService
@parent can-fixture-socket.Server.prototype

Subscribes to mocked server socket events to work as FeathersJS CRUD service.

@signature `server.onFeathersService(name, fixtureStore, [options])`

Subscribes to mocked server socket events according to FeathersJS protocol. Uses fixture store [can-fixture.Store] as a resource storage.

```
var fixtureStore = fixture.store([
  {id: 1, title: 'One'},
  {id: 2, title: 'Two'},
  {id: 3, title: 'Three'}
], new canSet.Algebra({}));

server.onFeathersService("messages", fixtureStore})
```

@param {String} name The name of Feathers service.
@param {can-fixture/StoreType} fixtureStore A fixture store. See [can-fixture.store] for more details.
@param {Object} [options] Options, e.g. property name for id.

@body

## Use

Instantiate fixture store by calling [can-fixture.store] and provide FeathersJS service name:
```js
const fixtureStore = fixture.store( [
	{ _id: 1, title: "One" },
	{ _id: 2, title: "Two" },
	{ _id: 3, title: "Three" }
], new canSet.Algebra( canSet.props.id( "_id" ) ) );

mockServer.onFeathersService( "messages", fixtureStore, { id: "_id" } );
```

This will emulate FeathersJS server CRUD service.

Now from Feathers client app you can do:
```js
// Import dependencies:
import io from "socket.io-client";

import feathers from "feathers/client";
import feathersSocketio from "feathers-socketio/client";
import hooks from "feathers-hooks";

// Configure Feathers client app:
const socket = io( "http://api.my-feathers-server.com" );
const app = feathers()
	.configure( hooks() )
	.configure( feathersSocketio( socket ) );

// Create client Feathers service:
const messagesService = app.service( "messages" );

// Test:
messagesService.get( 1 ).then( function( data ) {
	assert.deepEqual( data, { id: 1, title: "One" }, "get should receive an item" );
} );
```

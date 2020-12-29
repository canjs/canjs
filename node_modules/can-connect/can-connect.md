@module {function} can-connect
@parent can-data-modeling
@collection can-infrastructure
@group can-connect.behaviors 1 behaviors
@group can-connect.modules 2 modules
@group can-connect.types 3 data types
@group can-connect.deprecated 4 deprecated
@outline 2
@package ./package.json

@description `can-connect` provides persisted data middleware. Assemble powerful model layers from fully modularized behaviors (i.e. plugins).


@signature `connect(behaviors, options)`

Iterate through passed behaviors and assemble them into a connection.

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/";
import connectConstructor from "can-connect/constructor/";
const todosConnection = connect( [ dataUrl, connectConstructor ], {
	url: "/api/todos"
} );
```

  @param {Array<can-connect/Behavior>} behaviors
  An array of behaviors that will be used to compose the final connection.

  @param {Object} options
  An object of configuration parameters for the behaviors in the connection.


@body

## Purpose

`can-connect` provides a wide variety of functionality useful for building
_data models_. _Data models_ are used to organize how an application
connects with persisted data. _Data models_ can greatly simplify higher order
functionality like components. Most commonly, `can-connect` is used to
create _data models_ that make it easy to create, retrieve, update, and
delete (CRUD) data by making HTTP requests to a backend server's service layer.

Unfortunately, there is a wide variety of service layer APIs. While REST, JSONAPI,
GRAPHQL and other specifications attempt to create a uniform service layer, a
one-size-all approach would leave many CanJS users having to build their own data layer from scratch.

Thus, `can-connect`'s primary design goal is flexibility and re-usability,
__not ease of use__. Some assembly is required! For easier, pre-assembled, _data models_,
checkout:

- [can-rest-model] - Connect a data type to a restful service layer.
- [can-realtime-rest-model] - Same as [can-rest-model], but adds automatic list management.
- [can-super-model] - Same as [can-realtime-rest-model], but adds fall-through localStorage caching.

`can-connect` includes behaviors used to assemble _data models_. It includes the
following behaviors that:

__Load data:__

 - [can-connect/data/url/url data/url] —
    Persist data to RESTful or other types of HTTP services.

 - [can-connect/data/parse/parse data/parse] —
    Convert response data into a format needed for other extensions.

__Convert data into special types:__

 - [can-connect/constructor/constructor constructor/] —
    Create instances of a provided constructor function or list type.

 - [can-connect/constructor/store/store constructor/store] —
    Prevent multiple instances of a given id or multiple lists of a given set from being created.

__Keep lists updated with the most current data:__

 - [can-connect/real-time/real-time real-time] —
    Lists updated when instances are created or deleted.

__Implement caching strategies:__

 - [can-connect/fall-through-cache/fall-through-cache fall-through-cache] —
    Use [can-connect/base/base.cacheConnection cache] data if possible when creating instances,
    then update the instance with server data upon completion of a background request.

 - [can-connect/cache-requests/cache-requests cache-requests] —
    Cache response data and use it for future requests.

 - [can-connect/data/combine-requests/combine-requests data/combine-requests] —
    Combine overlapping or redundant requests.

__Provide caching storage (as a [can-connect/base/base.cacheConnection cacheConnection]):__

 - [can-connect/data/localstorage-cache/localstorage-cache data/localstorage-cache] —
    LocalStorage caching connection.

 - [can-connect/data/memory-cache/memory-cache data/memory-cache] —
    In-memory caching connection.

__Glue certain behaviors together:__

 - [can-connect/data/callbacks/callbacks data/callbacks] —
    Add callback hooks are passed the results of the DataInterface methods (CRUD operations).

 - [can-connect/data/callbacks-cache/callbacks-cache data/callbacks-cache] —
    Handle [can-connect/data/callbacks/callbacks data/callbacks] and update the [can-connect/base/base.cacheConnection cache]
    when CRUD operations complete.

__Provide convenient integration with CanJS:__

 - [can-connect/can/map/map can/map] —
    Create [can-define/map/map] or [can-define/list/list] instances from responses. Adds connection-aware
    methods to configured types.

 - [can-connect/can/ref/ref can/ref] - Handle references to other instances in the raw data responses.  

 - [can-connect/can/merge/merge can/merge] - Minimize updates to deeply nested instance data when new data is
    returned from the server.

 - [can-connect/can/constructor-hydrate/constructor-hydrate can/constructor-hydrate] - Always check the
    instanceStore when creating new instances of the connection Map type.



## Overview

The `can-connect` module exports a `connect` function that is used to assemble different behaviors (plugins)
and some configuration options into a `connection`.  For example, the following uses `connect` and the
[can-connect/constructor/constructor constructor/constructor] and [can-connect/data/url/url data/url] behaviors
to create a `todoConnection` connection:

```js
import connect from "can-connect";
import constructor from "can-connect/constructor/";
import dataUrl from "can-connect/data/url/";

const todoConnection = connect(
	[ constructor, dataUrl ],
	{ url: "/services/todos" }
);
```

A typical connection provides the ability to create, read, update, or delete (CRUD) data hosted by some data
source. Those operations are usually performed via the connection [can-connect/InstanceInterface InstanceInterface]
methods:

 - [can-connect/connection.get]
 - [can-connect/connection.getList]
 - [can-connect/connection.save]
 - [can-connect/connection.destroy]

For example, to get all todos from "GET /services/todos", we could write the following:

```js
todoConnection.getList( {} ).then( function( todos ) { /* ... */ } );
```

__Behaviors__, like [can-connect/constructor/constructor constructor/constructor] and [can-connect/data/url/url data/url]
implement, extend, or require some set of [interfaces](#Interfaces).  For example, [can-connect/data/url/url data/url]
implements the [can-connect/DataInterface DataInterface] methods, and [can-connect/constructor/constructor constructor/constructor] implements
the [can-connect/InstanceInterface InstanceInterface] methods.

The `connect` method arranges these behaviors in the right order to create a connection. For instance, the
[can-connect/cache-requests/cache-requests cache-requests] behavior must be applied after the [can-connect/data/url/url data/url]
connection.  This is because [can-connect/cache-requests/cache-requests cache-requests], overwrites [can-connect/data/url/url data/url]’s
[can-connect/connection.getListData connection.getListData] method to first check the cache for the data.  Only if the
data is not found, does it call [can-connect/data/url/url data/urls]’s [can-connect/connection.getListData].

This behavior arranging makes it so even if we write:

```js
import dataUrl from "can-connect/data/url/";
import cacheRequests from "can-connect/cache-requests/";
connect( [ cacheRequests, dataUrl ] );
```

or

```
connect([dataUrl, cacheRequests])
```

... the connection will be built in the right order!

A __connection__ is just an object with each specified behavior on its prototype chain and the passed options object
at the end of the prototype chain.


### Basic Use

When starting out with `can-connect`, it’s advisable to start out with the most basic behaviors:
[can-connect/data/url/url data/url] and [can-connect/constructor/constructor constructor/constructor].
[can-connect/data/url/url data/url] adds an implementation of the [can-connect/DataInterface DataInterface] that connects to a RESTful data source.
[can-connect/constructor/constructor constructor/constructor] adds an implementation of the [can-connect/InstanceInterface InstanceInterface]
that can create, read, update and delete typed data via the lower-level [can-connect/DataInterface DataInterface].

By "typed" data we mean data that is more than just plain JavaScript objects.  For example, we want might to create
`Todo` objects that implement an `isComplete` method:

```js
import assign from "can-assign";

const Todo = function( props ) {
	assign( this, props );
};

Todo.prototype.isComplete = function() {
	return this.status === "complete";
};
```

And, we might want a special `TodoList` type with implementations of `completed` and `active` methods:

```js
const TodoList = function( todos ) {
	[].push.apply( this, todos );
};
TodoList.prototype = Object.create( Array.prototype );

TodoList.prototype.completed = function() {
	return this.filter( function( todo ) {
		return todo.status === "complete";
	} );
};

TodoList.prototype.active = function() {
	return this.filter( function( todo ) {
		return todo.status !== "complete";
	} );
};
```

We can create a connection that connects a RESTful "/api/todos" endpoint to `Todo` instances and `TodoList` lists like:

```js
import connect from "can-connect";

const todoConnection = connect( [
	require( "can-connect/constructor/constructor" ),
	require( "can-connect/data/url/url" )
], {
	url: "/todos",
	list: function( listData, set ) {
		return new TodoList( listData.data );
	},
	instance: function( props ) {
		return new Todo( props );
	}
} );
```

and then use that connection to get a `TodoList` of `Todo`s and render some markup:

```js
const render = function( todos ) {
	return "<ul>" + todos.map( function( todo ) {
		return "<li>" + todo.name +
        "<input type='checkbox' " +
        ( todo.isComplete() ? "checked" : "" ) + "/></li>";
	} ).join( "" ) + "</ul>";
};

todoConnection.getList( {} ).then( function( todos ) {
	const todosEl = document.getElementById( "todos-list" );
	todosEl.innerHTML = "<h2>Active</h2>" +
    render( todos.active() ) +
    "<h2>Complete</h2>" +
    render( todos.completed() );
} );
```

The following demo shows the result:

@demo demos/can-connect/basics.html

This connection also lets you create, update, and destroy a Todo instance. First create a todo instance:

```js
const todo = new Todo( {
	name: "take out trash"
} );
```

Then, use the connection's `save` to create and update the todo, and `destroy` to delete it:


```js
// POSTs to /api/todos with JSON request body {name:"take out trash"}
// server returns {id: 5}
todoConnection.save( todo ).then( function( todo ) {
	todo.id; //-> 5
	todo.name = "take out garbage";

	// PUTs to /api/todos/5 with JSON request body {name:"take out garbage"}
	// server returns {id: 5, name:"take out garbage"}
	todoConnection.save( todo ).then( function( todo ) {

		// DELETEs to /api/todos/5
		// server returns {}
		todoConnection.destroy( todo ).then( function( todo ) {

		} );
	} );
} );
```

### Behavior Configuration

Whenever `connect` creates a connection, it always adds the [can-connect/base/base base] behavior.
This behavior is where the configuration options passed to `connect` are stored and it also defines
several configurable options that are used by most other behaviors.  For example, if your backend
uses a property named `_id` to uniquely identify todos, you can specify this with
[can-connect/base/base.queryLogic] like:

```js
import constructor from "can-connect/constructor/";
import dataUrl from "can-connect/data/url/";
import QueryLogic from "can-query-logic";

var queryLogic = new QueryLogic({identity: ["_id"]});

const todoConnection = connect(
	[ constructor, dataUrl ],
	{
		url: "/api/todos",
		queryLogic: queryLogic
	}
);
```

Behaviors list their configurable options in their own documentation pages.  

### Behavior Overwriting

If the configuration options available for a behavior are not enough, it's possible to overwrite any
behavior with your own behavior.

For example, [can-connect/constructor/constructor constructor/constructor]’s
[can-connect/constructor/constructor.updatedInstance updatedInstance] method sets the instance’s
properties to match the result of [can-connect/connection.updateData updateData]. But if the
`PUT /api/todos/5 {name:"take out garbage"}` request returns `{}`, the following example would
result in a todo with only an `id` property:

```js
const todo = new Todo( { id: 5, name: "take out garbage" } );

// PUTs to /api/todos/5 with JSON request body {name:"take out garbage"}
// server returns {}
todoConnection.save( todo ).then( function( todo ) {
	todo.id; //-> 5
	todo.name; //-> undefined
} );
```

The following overwrites [can-connect/constructor/constructor constructor/constructor]’s
implementation of `updateData`:

```js
import constructor from "can-connect/constructor/";
import dataUrl from "can-connect/data/url/";
const mergeDataBehavior = {
	updateData: function( instance, data ) {
		Object.assign( instance, data );
	}
};

const todoConnection = connect( [
	constructor,
	dataUrl,
	mergeDataBehavior
], {
	url: "/api/todos"
} );
```

You can add your own behavior that can overwrite any underlying behaviors by adding it to the end
of the behaviors list.


### CanJS use

If you are using CanJS, you can either:

- use the [can-connect/can/map/map can/map] behavior which provides many connection methods and
  settings to integrate closely with [can-define/map/map can-define/map] and
  [can-define/list/list can-define/list] types.

- use the [can-connect/can/super-map/super-map can/super-map] helper to create a connection that
  bundles [can-connect/can/map/map can/map] and many of the other behaviors.

Using [can-connect/can/map/map can/map] to create a connection looks like:

```js
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import constructorStore from "can-connect/constructor/store/store";
import canMap from "can-connect/can/map/map";

const Todo = DefineMap.extend( { /* ... */ } );
Todo.List = DefineList.extend( {
	"#": Todo
} );

const todoConnection = connect(
	[ dataUrl, constructor, constructorStore, canMap ],
	{
		Map: Todo,
		url: "/todos"
	}
);
```

Using [can-connect/can/super-map/super-map] to create a connection looks like:

```js
import DefineMap from "can-define/map/";
import DefineList from "can-define/list/";
import superMap from "can-connect/can/super-map/";

const Todo = DefineMap.extend( { /* ... */ } );
Todo.List = DefineList.extend( {
	"#": Todo
} );

const todoConnection = superMap( {
	Map: Todo,
	url: "/todos"
} );
```

<!--- todo: move this explanation of constructor/store somewhere better --->

Both the above connections contain the [can-connect/constructor/store/store constructor/store] behavior.
This means when you create a binding to a `Todo` or `Todo.List` instance, they will automatically
call [can-connect/constructor/store/store.addInstanceReference constructor/store.addInstanceReference]
or [can-connect/constructor/store/store.addListReference constructor/store.addListReference].
[can-connect/constructor/store/store constructor/store] then retains the instance for the life
of the binding and ensures only single shared instance of a particular piece of data exists. This
prevents a common programming problem where multiple copies of an instance are held by parts of
an application that loaded the same data.

### Other use

Integrating `can-connect` with another framework is typically pretty easy.  In general, the pattern involves creating
a behavior that integrates with your framework’s observable instances. The [can-connect/can/map/map can/map] behavior
can serve as a good guide. You’ll typically want to implement the following methods in your behavior:

`.instance` - Creates the appropriate observable object type.
`.list` - Creates the appropriate observable array type.
`.serializeInstance` - Return a plain object out of the observable object type.
`.serializeList` - Return a plain array out of the observable array type.  

`.createdInstance` - Update an instance with data returned from `createData`.
`.updatedInstance` - Update an instance with data returned from `updateData`.
`.destroyedInstance` -  Update an instance with data returned from `destroyData`.
`.updatedList` - Update a list with raw data.

And, in most frameworks you know when a particular observable is being used, typically
observed, and when it can be discarded.  In those places, you should call:

- [can-connect/constructor/store/store.addInstanceReference] — when an instance is being used.
- [can-connect/constructor/store/store.deleteInstanceReference] — when an instance is no longer being used.
- [can-connect/constructor/store/store.addListReference] — when a list is being used.
- [can-connect/constructor/store/store.deleteListReference] — when a list is no longer being used.


## Interfaces

The following is a list of the primary interface methods and properties implemented or consumed by the core behaviors.

### Identifiers

`.id( props | instance ) -> String` - Returns a unique identifier for the instance or raw data.  
`.queryLogic -> QueryLogic - A [can-query-logic] instance that defines the unique property and query behavior.
`.listQuery(list) -> set` - Returns the set a list represents.  
`.listQueryProp -> Symbol=can.listQuery` - The property on a List that contains its set.  

Implemented by the [can-connect/base/base base] behavior.

### Instance Interface

The following methods operate on instances and lists.

#### CRUD Methods

`.getList(set) -> Promise<List>` - Retrieve a list of instances.  
`.getData(set) -> Promise<Instance>` - Retrieve a single instance.   
`.save(instance) -> Promise<Instance>` - Create or update an instance.  
`.destroy(instance) -> Promise<Instance>` - Destroy an instance.  

Implemented by [can-connect/constructor/constructor constructor/constructor] behavior.

Overwritten by [can-connect/constructor/store/store constructor/store] and [can-connect/can/map/map can/map] behaviors.

#### Instance Callbacks

`.createdInstance(instance, props)` - Called whenever an instance is created.  
`.updatedInstance(instance, props)` - Called whenever an instance is updated.  
`.destroyedInstance(instance, props)` - Called whenever an instance is destroyed.  
`.updatedList(list, updatedListData, set)` - Called whenever a list has been updated.  

Implemented by [can-connect/constructor/constructor constructor/constructor] behavior.

Overwritten by [can-connect/real-time/real-time real-time] and
[can-connect/constructor/callbacks-once/callbacks-once constructor/callbacks-once] behaviors.

#### Hydrators and Serializers

`.instance(props) -> Instance` - Create an instance given raw data.  
`.list({data: Array<Instance>}) -> List` - Create a list given an array of instances.  
`.hydrateInstance(props) -> Instance` - Provide an instance given raw data.  
`.hydrateList({ListData}, set) -> List` - Provide a list given raw data.  
`.hydratedInstance(instance)` - Called whenever an instance is created in memory.  
`.hydratedList(list, set)` - Called whenever a list is created in memory.  
`.serializeInstance(instance) -> Object` - Return the serialized form of an instance.  
`.serializeList(list) -> Array<Object>` - Return the serialized form of a list and its instances.  

Implemented by [can-connect/constructor/constructor constructor/constructor] behavior.

Overwritten by [can-connect/constructor/store/store] and [can-connect/fall-through-cache/fall-through-cache] behaviors.

#### Store Interface

`.addInstanceReference(instance)` - Add a reference to an instance so that multiple copies can be avoided.  
`.deleteInstanceReference(instance)` - Remove a reference to an instance, freeing memory when an instance is no longer bound to.
`.addListReference(list)` - Add a reference to a list so that multiple copies can be avoided.  
`.deleteListReference(list)` - Remove a reference to an list, freeing memory when a list is no longer bound to.

Implemented by the [can-connect/constructor/store/store constructor/store] behavior.

### Data Interface

The raw-data connection methods.  

#### CRUD Methods

`.getListData(set) -> Promise<ListData>` - Retrieve list data.  
`.updateListData(listData[, set]) -> Promise<ListData>` - Update a list’s data.
`.getSets() -> Promise<Array<Set>>` - Return the sets available to the connection, typically those stored in a [can-connect/base/base.cacheConnection cache connection].  
`.getData(params) -> Promise<Object>` - Retrieve data for a particular item.  
`.createData(props, cid) -> Promise<props>` - Create a data store record given the serialized form of the data. A
  client ID is passed of the instance that is being created.  
`.updateData(props) -> Promise<props>` - Update a data store record given the serialized form of the data.  
`.destroyData(props) -> Promise<props>` - Delete a data store record given the serialized form of the data.  
`.clear() -> Promise` - Clear all data in the connection. Typically used to remove all data from a [connection.cacheConnection cache connection].

Implemented by [can-connect/data/url/url data/url],
[can-connect/data/localstorage-cache/localstorage-cache data/localstorage-cache] and
[can-connect/data/memory-cache/memory-cache data/memory-cache] behaviors.

Overwritten by [can-connect/cache-requests/cache-requests cache-requests],
[can-connect/data/combine-requests/combine-requests combine-requests] and
[can-connect/fall-through-cache/fall-through-cache fall-through-cache] behaviors.

Consumed by [can-connect/constructor/constructor constructor/constructor] behavior.  

#### Data Callbacks

`.gotListData(listData, set) -> ListaData` - Called whenever a list of data records are retrieved.  
`.gotData( props, params) -> props` - Called whenever an individual data record is retrieved.  
`.createdData( props, params, cid) -> props` - Called whenever an individual data record data is created.  
`.updatedData( props, params) -> props` - Called whenever an individual data record is updated.  
`.destroyedData( props, params) -> props` - Called whenever an individual data record is deleted.    

Implemented by the [can-connect/data/callbacks/callbacks data/callbacks] behavior.

Overwritten by [can-connect/data/callbacks-cache/callbacks-cache data/callbacks-cache] and
[can-connect/real-time/real-time real-time] behaviors.

#### Response Parsers

`.parseListData(*) -> ListData` - Given the response of getListData, return required object format.  
`.parseInstanceData(*) -> props` - Given the response of getData, createData, updateData, and destroyData,
return the required object format.

Implemented by the [can-connect/data/parse/parse data/parse] behavior.

#### Real-time Methods

`createInstance( props ) -> Promise<instance>` - Inform the connection a new data record has been created.  
`updateInstance( props ) -> Promise<instance>` - Inform the connection a data record has been updated.  
`destroyInstance( props ) -> Promise<instance>` - Inform the connection a data record has been destroyed.  

Implemented by the [can-connect/real-time/real-time real-time] behavior.

## Creating Behaviors

To create your own behavior, call `connect.behavior` with the name of your behavior and a function that returns an
object that defines the hooks you want to overwrite or provide:

```js
connect.behavior( "my-behavior", function( baseConnection ) {
	return {

		// Hooks here
	};
} );
```

For example, creating a basic localStorage behavior might look like:

```js
connect.behavior( "localstorage", function( baseConnection ) {
	return {
		getData: function( params ) {
			const id = this.id( params );
			return new Promise( function( resolve ) {
				const data = localStorage.getItem( baseConnection.name + "/" + id );
				resolve( JSON.parse( data ) );
			} );
		},
		createData: function( props ) {
			const id = localStorage.getItem( baseConnection.name + "-ID" ) || "0";
			const nextId = JSON.parse( id ) + 1;

			localStorage.setItem( baseConnection.name + "-ID", nextId );
			return new Promise( ( resolve ) => {
				props[ this.queryLogic.identityKeys()[0] ] = nextId;
				localStorage.setItem( baseConnection.name + "/" + nextId, props );
				resolve( props );
			} );
		},
		updateData: function() { /* ... */ },
		destroyData: function() { /* ... */ }
	};
} );
```

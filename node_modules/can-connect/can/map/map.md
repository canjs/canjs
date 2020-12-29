@module {connect.Behavior} can-connect/can/map/map can/map
@group can-connect/can/map/map.options 0 behavior options
@group can-connect/can/map/map.map-static 1 map static methods
@group can-connect/can/map/map.map 2 map instance methods
@group can-connect/can/map/map.hydrators 3 hydrators
@group can-connect/can/map/map.serializers 4 serializers
@group can-connect/can/map/map.instance-callbacks 6 instance callbacks
@group can-connect/can/map/map.static 7 behavior static methods
@parent can-connect.behaviors

Integrate a `can-connect` connection with a [can-define/map/map DefineMap] type.  


@signature `canMap( baseConnection )`

Extends the functionality of the [can-connect/constructor/constructor constructor] behavior so it integrates tightly
with [can-define/map/map DefineMap] and [can-define/list/list DefineList] types:
- adds methods to [can-connect/can/map/map.get read], [can-connect/can/map/map.prototype.destroy destroy],
[can-connect/can/map/map.prototype.save create and update] instances (via the connection) to the
[can-connect/can/map/map._Map] type
- adds observable values to instances indicating if they are being [can-connect/can/map/map.prototype.isSaving saved],
[can-connect/can/map/map.prototype.isDestroying deleted] or have
[can-connect/can/map/map.prototype.isNew not yet been saved]
- updates instances with the data from the response bodies of create, update and delete requests
- triggers events on the [can-connect/can/map/map._Map] type and instances when instances are created, destroyed or updated

@param {{}} baseConnection `can-connect` connection object that is having the `can/map` behavior added on to it. Expects
the [can-connect/constructor/constructor] behavior to already be added to this base connection. If the `connect` helper
is used to build the connection, the behaviors will automatically be ordered as required.

@return {{}} a `can-connect` connection containing the methods provided by `can/map`.


@body

## Use

The `can/map` behavior links a connection to a [can-define/map/map DefineMap] and [can-define/list/list DefineList] type.
The connection will create those types of instances from the data it receives. It also adds convenient methods and
observable values to the [can-connect/can/map/map._Map] that offer connection functionality (e.g
[can-connect/can/map/map.prototype.save `instance.save`]) and the status of the instance (e.g
[can-connect/can/map/map.prototype.isSaving `instance.isSaving`]).

To use the `can/map` behavior, first create a Map and List constructor function:

```js
var Todo = DefineMap.extend({
  allowComplete: function(ownerId) {
    return this.ownerId === ownerId;
  }
});

var TodoList = DefineList.extend({
  "#": Todo,
  incomplete: function(){
    return this.filter({complete: false});
  }
});
```

Next, pass the Map and List constructor functions to `connect` as options. The following creates connects the `Todo`
and `TodoList` types to a RESTful data service via the connection:

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import canMap from "can-connect/can/map/map";

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
	Map: Todo,
	List: TodoList,
	url: "/services/todos"
} );
```

The connection itself can be used to create, read, update & delete `Todo` and `TodoList`s:

```js
todoConnection.getList( {} ).then( function( todos ) {
	const incomplete = todos.incomplete();
	incomplete[ 0 ].allowComplete( 5 ); //-> true
} );
```

... or instead of how it's done above, because `can/map` adds methods to the [can-connect/can/map/map._Map] type, you
can use `Todo` to retrieve `Todo` and `TodoList`s:

```js
Todo.getList( {} ).then( function( todos ) { /* ... */ } );
Todo.get( {} ).then( function( todo ) { /* ... */ } );
```

You can also create, update, and [can-connect/can/map/map.prototype.destroy] `Todo` instances. Notice that
[can-connect/can/map/map.prototype.save] is used to create and update:

```js
// create an instance
new Todo( { name: "dishes" } ).save().then( function( todo ) {
	todo.set( {
		name: "Do the dishes"
	} )
		.save() // update an instance
		.then( function( todo ) {
			todo.destroy(); // destroy an instance
		} );
} );
```

There's also methods that let you know if an instance is in the process of being
[can-connect/can/map/map.prototype.isSaving saved] or [can-connect/can/map/map.prototype.isDestroying destroyed]:

```js
const savePromise = new Todo( { name: "dishes" } ).save();
todo.isSaving(); //-> true

savePromise.then( function() {
	todo.isSaving(); //-> false

	const destroyPromise = todo.destroy();
	todo.isDestroying(); //-> true

	destroyPromise.then( function() {
		todo.isDestroying(); //-> false
	} );
} );
```

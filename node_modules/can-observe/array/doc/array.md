@property {function} can-observe.Array Array
@parent can-observe/properties
@templateRender true

@description Create observable Array instances or types.

@signature `new observe.Array([items])`

Create an instance of an observable array.

```js
import observe from "can-observe";

const hobbies = new observe.Array( [ "JS", "Reading" ] );
```

@signature `class extends observe.Array {...}`

Extend and create your own `Array` type:

```js
import observe from "can-observe";

class TodoList extends observe.Array {
	get active() {
		return this.filter( function( todo ) {
			return todo.complete === false;
		} );
	}
}
```

Getter properties like `active` above are computed. Meaning that if they are bound
subsequent reads are not re-evaluated.



@body

## Mixed in methods and properties

Instances of `observe.Array` have all methods and properties from
[can-event-queue/map/map]:

{{#each (getChildren [can-event-queue/map/map])}}
- [{{name}}] - {{description}}{{/each}}

Example:

```js
class MyArray extends observe.Array {

}

const arrayInstance = new MyArray( [] );

canReflect.onPatches( arrayInstance, function( patches ) { /* ... */ } );
```


## Mixed-in type methods and properties

Extended `observe.Array` constructor functions have all methods and properties from
[can-event-queue/type/type]:

{{#each (getChildren [can-event-queue/type/type])}}
- [{{name}}] - {{description}}{{/each}}

Example:

```js
class MyArray extends observe.Array {

}

canReflect.onInstancePatches( MyArray, function( instance, patches ) { /* ... */ } );
```

## Use Cases

`observe.Array` is used to make observable arrays commonly used by the __model__ layer.


## Models

Use `observe.Array` to create observable arrays for use
with [can-connect]. The following creates a simple `TodoList` type:

```js
import observe from "can-observe";
import baseMap from "can-connect/can/base-map/base-map";

class Todo extends observe.Object { /* ... */ }

class TodoList extends observe.Array {
	get active() {
		return this.filter( function( todo ) {
			return todo.complete === false;
		} );
	}
	get complete() {
		return this.filter( function( todo ) {
			return todo.complete === true;
		} );
	}
	get allComplete() {
		return this.length === this.complete.length;
	}
	get saving() {
		return this.filter( function( todo ) {
			return todo.isSaving();
		} );
	}
	updateCompleteTo( value ) {
		this.forEach( function( todo ) {
			todo.complete = value;
			todo.save();
		} );
	}
	destroyComplete() {
		this.complete.forEach( function( todo ) {
			todo.destroy();
		} );
	}
}

baseMap( {
	url: "/api/todos",
	Map: Todo
} );
```

Note that `active`, `complete`, `allComplete`, and `saving` are made into [can-observation]-backed
properties.  Once bound, they will only update their value once one of their dependencies has updated.

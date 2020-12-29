@module {function} can-connect/can/super-map/super-map
@parent can-connect.deprecated

Create connection with many of the best behaviors in can-connect and hook it up to
a [can-define/map/map].

@deprecated {5.0} Use [can-super-model] instead.

@signature `superMap(options)`

  Creates a connection with the following behaviors: [can-connect/constructor/constructor],
  [can-connect/can/map/map],
  [can-connect/constructor/store/store],
  [can-connect/data/callbacks/callbacks],
  [can-connect/data/callbacks-cache/callbacks-cache],
  [can-connect/data/combine-requests/combine-requests],
  [can-connect/data/parse/parse],
  [can-connect/data/url/url],
  [can-connect/real-time/real-time],
  [can-connect/fall-through-cache/fall-through-cache],
  [can-connect/constructor/callbacks-once/callbacks-once].

  And creates a [can-connect/data/localstorage-cache/localstorage-cache] to use as a [can-connect/base/base.cacheConnection].

@body

## Use

The `can-connect/can/super-map` module exports a helper function that creates a connection
with the "advanced" behaviors in can-connect and hooks it up to a [can-define/map/map]
and [can-define/list/list].

If you are using CanJS, this is an easy way to create a connection that can be useful and
fast in most circumstances.

To use it, first define a Map and List constructor function:

```js
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const Todo = DefineMap.extend( {
    _id: {identity: true, type: "number"},
    /* ... */
} );
const TodoList = DefineList.extend( {
	"#": Todo
} );
```

Next, call `superMap` with all of the options needed by the behaviors that `superMap` adds:

```js
var todoConnection = superMap({
  Map: Todo,
  List: TodoList,
  url: "/services/todos",
  name: "todo"
});
```

[can-connect/can/map/map] adds CRUD methods to the `Map` option, you can use those to create,
read, update and destroy todos:

```js
Todo.getList({}).then(function(todos){ ... });
Todo.get({}).then(function(todo){ ... });

new Todo({name: "dishes"}).save().then(function(todo){
  todo.set({
      name: "Do the dishes"
    })
    .save()
    .then(function(todo){
      todo.destroy();
    });
});
```

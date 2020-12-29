@module {function} can-connect/can/base-map/base-map
@parent can-connect.deprecated

Create connection with many of the best behaviors in can-connect and hook it up to
a [can-define/map/map].


@deprecated {5.0} Use [can-realtime-rest-model] instead.

@signature `baseMap(options)`

  Creates a connection with the following behaviors: [can-connect/constructor/constructor],
  [can-connect/can/map/map],
  [can-connect/constructor/store/store],
  [can-connect/data/callbacks/callbacks],
  [can-connect/data/callbacks-cache/callbacks-cache],
  [can-connect/data/parse/parse],
  [can-connect/data/url/url],
  [can-connect/real-time/real-time],
  [can-connect/constructor/callbacks-once/callbacks-once].

@body

## Use

The `can-connect/can/base-map` module exports a helper function that creates a connection
with the "standard" behaviors in can-connect and hooks it up to a
[can-define/map/map] and [can-define/list/list].

If you are using CanJS, this is an easy way to create a connection that can be useful and
fast in most circumstances.

To use it, first define a Map and List constructor function:

```js
const Todo = DefineMap.extend( { /* ... */ } );
const TodoList = DefineList.extend( {
	"#": Todo

	// ...
} );
```

Next, call `baseMap` with all of the options needed by the behaviors that `baseMap` adds:

```
var todoConnection = baseMap({
  Map: Todo,
  List: TodoList,
  url: "/services/todos",
  name: "todo"
});
```

As, [can-connect/can/map/map] adds CRUD methods to the `Map` option, you can use those to create,
read, update and destroy todos:

```
Todo.getList({}).then(function(todos){ ... });
Todo.get({}).then(function(todo){ ... });

new Todo({name: "dishes"}).save().then(function(todo){
  todo.attr({
      name: "Do the dishes"
    })
    .save()
    .then(function(todo){
      todo.destroy();
    });
});
```

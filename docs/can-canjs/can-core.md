@page can-core Core
@parent api 10
@templateRender <% %>
@description The best, most hardened and generally useful libraries in CanJS.  

@body

## Use

CanJS’s core libraries are the best, most hardened and generally useful modules.  
Each module is part of an independent package, so you
should install the ones you use directly:

```
npm install can-component can-compute can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
```


Let’s explore each module a bit more.

## can-compute

[can-compute]s represent an observable value.  A compute can contain its
own value and notify listeners of changes like:

```js
var compute = require("can-compute");

var name = compute("Justin");

// read the value
name() //-> "Justin"

name.on("change", function(ev, newVal, oldVal){
	newVal //-> "Matthew"
	oldVal //-> "Justin"
});

name("Matthew");
```

More commonly, a compute derives its value from other observables.  The following
`info` compute derives its value from a `person` map, `hobbies` list, and `age`
compute:

```js
var DefineMap = require("can-define/map/map"),
	DefineList = require("can-define/list/list"),
	compute = require("can-compute");

var person = new DefineMap({first: "Justin", last: "Meyer"}),
	hobbies = new DefineList(["js","bball"]),
	age = compute(33);

var info = compute(function(){
	return person.first +" "+ person.last+ " is "+age()+
		"and like "+hobbies.join(", ")+".";
});

info() //-> "Justin Meyer is 33 and likes js, bball."

info.on("change", function(ev, newVal){
	newVal //-> "Justin Meyer is 33 and likes js."
});

hobbies.pop();
```


## can-define

[can-define/map/map] and [can-define/list/list] allow you to create observable
maps and lists with well-defined properties.  You can
[can-define.types.propDefinition define a property’s type initial value, enumerability, getter-setters and much more].
For example, you can define the behavior of a `Todo` type and a `TodoList` type as follows:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");

var Todo = DefineMap.extend({           // A todo has a:
  name: "string",                       // .name that’s a string
  complete: {                           // .complete that’s
	type: "boolean",                    //        a boolean
	value: false                        //        initialized to false
  },                                    
  dueDate: "date",                      // .dueDate that’s a date
  get isPastDue(){                      // .pastDue that returns if the
	return new Date() > this.dueDate;   //        dueDate is before now
  },
  toggleComplete: function(){           // .toggleComplete method that
    this.complete = !this.complete;     //        changes .complete
  }
});

var TodoList = DefineList.extend({      // A list of todos:     
  "#": Todo,                            // has numeric properties
                                        //         as todos

  get completeCount(){                  // has .completeCount that
    return this.filter("complete")      //         returns # of
	           .length;                 //         complete todos
  }
});
```

This allows you to create a Todo, read its properties, and
call back its methods like:

```js
var dishes = new Todo({
	name: "do dishes",
	// due yesterday
	dueDate: new Date() - 1000 * 60 * 60 * 24
});
dishes.name      //-> "do dishes"
dishes.isPastDue //-> true
dishes.complete  //-> false
dishes.toggleComplete()  
dishes.complete  //-> true
```

And it allows you to create a `TodoList`, access its items and properties
like:

```js
var todos = new TodoList( dishes, {name: "mow lawn", dueDate: new Date()});
todos.length         //-> 2
todos[0].complete    //-> true
todos.completeCount //-> 1
```

These observables provide the foundation
for data connection (models), view-models and even routing in your application.

## can-set

[can-set] models a service layer’s behavior as a [can-set.Algebra set.Algebra]. Once modeled, other libraries such as [can-connect] or [can-fixture] can
add a host of functionality like: real-time behavior, performance optimizations, and
simulated service layers.

A `todosAlgebra` set algebra for a `GET /api/todos` service might look like:

```js
var set = require("can-set");
var todosAlgebra = new set.Algebra(
    // specify the unique identifier property on data
    set.prop.id("_id"),  
    // specify that completed can be true, false or undefined
    set.prop.boolean("complete"),
    // specify the property that controls sorting
    set.prop.sort("orderBy")
)
```

This assumes that the service:

 - Returns data where the unique property name is `_id`:
   ```js
   GET /api/todos
   -> [{_id: 1, name: "mow lawn", complete: true},
       {_id: 2, name: "do dishes", complete: false}, ...]
   ```
 - Can filter by a `complete` property:
   ```js
   GET /api/todos?complete=false
   -> [{_id: 2, name: "do dishes", complete: false}, ...]
   ```
 - Sorts by an `orderBy` property:
   ```js
   GET /api/todos?orderBy=name
   -> [{_id: 2, name: "do dishes", complete: false},
       {_id: 1, name: "mow lawn", complete: true}]
   ```

In the next section will use `todoAlgebra` to build a model with [can-connect].

## can-connect

[can-connect] connects a data type, typically a `DefineMap` and its `DefineList`,
to a service layer. This is often done via the
[can-connect/can/base-map/base-map] module which bundles many common behaviors
into a single api:

```js
var baseMap = require("can-connect/can/base-map/base-map"),
    DefineMap = require("can-define/map/map"),
    DefineList = require("can-define/list/list"),
	set = require("can-set");

var Todo = DefineMap.extend({
	...
});
var TodosList = DefineMap.extend({
	"#": Todo,
	...
});
var todosAlgebra = new set.Algebra({
	...
});

var connection = baseMap({
	url: "/api/todos",
	Map: Todo,
	List: TodoList,
	algebra: todosAlgebra,
	name: "todo"
});
```

`baseMap` extends the `Map` type, in this case, `Todo`, with
the ability to make requests to the service layer.

 - [can-connect/can/map/map.getList Get a list] of Todos
   ```js
   Todo.getList({complete: true}).then(function(todos){})
   ```
 - [can-connect/can/map/map.get Get] a single Todo
   ```js
   Todo.get({_id: 6}).then(function(todo){})
   ```
 - [can-connect/can/map/map.prototype.save Create] a Todo
   ```js
   var todo = new Todo({name: "do dishes", complete: false})
   todo.save().then(function(todo){})
   ```
 - [can-connect/can/map/map.prototype.save Update] an [can-connect/can/map/map.prototype.isNew already created] Todo
   ```js
   todo.complete = true;
   todo.save().then(function(todo){})
   ```
 - [can-connect/can/map/map.prototype.destroy Delete] a Todo
   ```js
   todo.destroy().then(function(todo){})
   ```

[can-connect] is also middleware, so custom connections can
be assembled too:

```js
var base = require("can-connect/base/base");
var dataUrl = require("can-connect/data-url/data-url");
var constructor = require("can-connect/constructor/constructor");
var map = require("can-connect/can/map/map");

var options = {
	url: "/api/todos",
	Map: Todo,
	List: TodoList,
	algebra: todosAlgebra,
	name: "todo"
}
var connection = map(constructor(dataUrl(base(options))));
```

## can-stache

[can-stache] provides live binding mustache and handlebars syntax. While
templates should typically be loaded with a module loader like [steal-stache],
you can create a template programmatically that lists out todos within a
promise loaded from `Todo.getList` like:

```js
var stache = require("can-stache");

// Creates a template
var template = stache(
	"<ul>"+
		"{{#if todos.isPending}}<li>Loading…</li>{{/if}}"+
		"{{#if todos.isResolved}}"+
			"{{#each todos.value}}"+
				"<li class='{{#complete}}complete{{/complete}}'>{{name}}</li>"+
			"{{else}}"+
				"<li>No todos</li>"+
			"{{/each}}"+
		"{{/if}}"+
	"</ul>");

// Calls the template with some data
var frag = template({
	todos: Todo.getList({})
});

// Inserts the result into the page
document.body.appendChild(frag);
```

[can-stache] templates use magic tags like `{{}}` to control what
content is rendered. The most common forms of those magic tags are:

 - [can-stache.tags.escaped {{key}}] - Insert the value at `key` in the page. If `key` is a function or helper, run it and insert the result.
 - [can-stache.tags.section {{#key}}...{{/key}}] - Render the content between magic tags based on some criteria.  

[can-stache] templates return document fragments that update whenever
their source data changes.

## can-component

[can-component] creates custom elements with unit-testable view models. It
combines a view model created by [can-define/map/map] with a template
created by [can-stache].

```js
var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");

// Defines the todos-list view model
var TodosListVM = DefineMap.extend({
	// An initial value that is a promise containing the
	// list of all todos.
	todos: {
		value: function(){
			return Todo.getList({});
		}
	},
	// A method that toggles a todo’s complete property
	// and updates the todo on the server.
	toggleComplete: function(todo){
		todo.complete = !todo.complete;
		todo.save();
	}
});

Component.extend({
	tag: "todos-list",
	ViewModel: TodosVM,
	view: stache(
		"<ul>"+
			"{{#if todos.isPending}}<li>Loading…</li>{{/if}}"+
			"{{#if todos.isResolved}}"+
				"{{#each todos.value}}"+
					"<li on:click='toggleComplete(.)'"+
					     "class='{{#complete}}complete{{/complete}}'>{{name}}</li>"+
				"{{else}}"+
					"<li>No todos</li>"+
				"{{/each}}"+
			"{{/if}}"+
		"</ul>");
});
```

## can-stache-bindings

[can-stache-bindings] provides [can-view-callbacks.attr custom attributes] for
[can-stache] event and data bindings.

Bindings look like:

 - `on:event="key()"` for [can-stache-bindings.event event binding].
 - `prop:from="key"` for [can-stache-bindings.toChild one-way binding to a child].
 - `prop:to="key"` for [can-stache-bindings.toParent one-way binding to a parent].
 - `prop:bind="key"` for [can-stache-bindings.twoWay two-way binding].

[can-stache-bindings.event Event] binding examples:

```html
<!-- calls `toggleComplete` when the li is clicked -->
<li on:click="toggleComplete(.)"/>

<!-- calls `resetData` when cancel is dispatched on `my-modal`’s view model -->
<my-modal on:cancel="resetData()"/>
```

[can-stache-bindings.toChild One-way to child] examples:

```html
<!-- updates input’s `checked` property with the value of complete -->
<input type="checkbox" checked:from="complete"/>

<!-- updates `todo-lists`’s  `todos` property with the result of `getTodos`-->
<todos-list todos:from="getTodos(complete=true)"/>
```

[can-stache-bindings.toChild One-way to parent] examples:

```html
<!-- updates `complete` with input’s `checked` property -->
<input type="checkbox" checked:to="complete"/>

<!-- updates `todosList` with `todo-lists`’s `todos` property -->
<todos-list todos:to="todosList"/>
```

[can-stache-bindings.twoWay Two-way] examples:

```html
<!-- Updates the input’s `value` with `name` and vice versa -->
<input type="text" value:bind="name"/>

<!-- Updates `date-picker`’s `date` with `dueDate` and vice versa -->
<date-picker date:bind="dueDate"/>
```

## can-route and can-route-pushstate

[can-route] connects a `DefineMap`’s properties to values in the
url. Create a map type, [canjs/doc/can-route.map connect it to the url], and [can-route.ready begin routing] like:

```js
var route = require("can-route");
var DefineMap = require("can-define/map/map");

var AppViewModel = DefineMap.extend({
	seal: false
},{
	// Sets the default type to string
	"#": "string",
	todoId: "string",
	todo: {
		get: function(){
			if(this.todoId) {
				return Todo.get({_id: this.todoId})
			}
		}
	}
});

var appViewModel = new AppViewModel();
route.map(appViewModel);

route.ready();
```

When the url changes, to something like `#!&todoId=5`, so will the
`appViewModel`’s `todoId` and `todo` property:

```js
appViewModel.todoId //-> "5"
appViewModel.todo   //-> Promise<Todo>
```

Similarly, if `appViewModel`’s `todoId` is set like:

```js
appViewModel.todoId = 6;
```

The hash will be updated:

```js
window.location.hash //-> "#!&todoId=6"
```

The `route` function can be used to specify pretty routing rules that
translate property changes to a url and a url to property changes. For example,

```js
// a route like:
route("todo/{todoId}");

// and a hash like:
window.location.hash = "#!todo/7";

// produces an appViewModel like:
appViewModel.serialize() //-> {route: "todo/{todoId}", todoId: "7"}
```

[can-route-pushstate] adds [pushstate](https://developer.mozilla.org/en-US/docs/Web/API/History_API) support. It
mixes in this behavior so you just need to import the module:

```js
var route = require("can-route");
require("can-route-pushstate");
```


## Want to learn more?

If you haven’t already, check out the [guides] page on how to learn CanJS.  Specifically, you’ll
want to check out the [guides/chat] and [guides/todomvc] to learn the basics of using CanJS’s
core libraries.  After that, check out the [guides/api] on how to use and learn from these API docs.

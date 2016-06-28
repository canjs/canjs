@page can-core Core
@parent canjs
@description The best, most hardened and generally useful
libraries in CanJS.  

@body

## Use

CanJS's core libraries are the modules most commonly used to build web
applications.  Each module is part of an independent package, so you
should install the ones you use directly:

```
npm install can-define can-set can-connect can-component can-stache can-route --save
```

Lets export each one a bit more in detail.

## can-define

[can-define/map/map] and [can-define/list/list] allow you to create observable
objects with well defined properties.  You can
[can-define.types.propDefinition define a property's type initial value, enumerability, getter-setters and much more].
For example, you can define the behavior of a `Todo` type and a `TodoList` type as follows:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");

var Todo = DefineMap.extend({
  name: "string",
  complete: {type: "boolean", value: false},
  dueDate: "date",
  isPastDue: {
    get: function(){
	  return new Date() <  this.dueDate;
	}
  },
  toggleComplete: function(){
    this.complete = !this.complete;
  }
});

var TodoList = DefineList.extend({
  "*": Todo,
  completeCount: {
    get: function(){
      return this.filter("complete").length;
    }
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

[can-set] models a service layer's behavior as a [can-set.Algebra set.Algebra]. Once modeled, other libraries such as [can-connect] or [can-fixture] can
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

## can-connect

[can-connect] connects a data type, typically a `DefineMap` and its `DefineList`,
to a service layer. This is often done via the
[can-connect/can/super-map] module which bundles many common behaviors
and performance techniques into a single api:

```js
var superMap = require("can-connect/can/super-map/super-map"),
    DefineMap = require("can-define/map/map"),
    DefineList = require("can-define/list/list"),
	set = require("can-set");

var Todo = DefineMap.extend({
	...
});
var TodosList = DefineMap.extend({
	"*": Todo,
	...
});
var todosAlgebra = new set.Algebra({
	...
});

var connection = superMap({
	url: "/api/todos",
	Map: Todo,
	List: TodoList,
	algebra: todosAlgebra,
	name: "todo"
});
```

`superMap` extends the `Map` type, in this case, `Todo`, with
the ability to make requests to the service layer.

 - Get a list of Todos
   ```js
   Todo.getList({complete: true}).then(function(todos){})
   ```
 - Get a single Todo
   ```js
   Todo.get({_id: 6}).then(function(todo){})
   ```
 - Create a Todo
   ```js
   var todo = new Todo({name: "do dishes", complete: false})
   todo.save().then(function(todo){})
   ```
 - Update an already created Todo
   ```js
   todo.complete = true;
   todo.save().then(function(todo){})
   ```
 - Delete a Todo
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
		"{{#if todos.isPending}}<li>Loading...</li>{{/if}}"+
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
	// A method that toggles a todo's complete property
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
			"{{#if todos.isPending}}<li>Loading...</li>{{/if}}"+
			"{{#if todos.isResolved}}"+
				"{{#each todos.value}}"+
					"<li ($click)='toggleComplete(.)'"+
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

 - `(event)="key()"` for event binding.
 - `{prop}="key"` for one-way binding to a child.
 - `{^prop}="key"` for one-way binding to a parent.
 - `{(prop)}="key"` for two-way binding.

Adding `$` to a binding like `($event)="key()"` changes the binding from the viewModel to the element's attributes or properties.

[can-stache-bindings.event Event] binding examples:

```html
<!-- calls `toggleComplete` when the li is clicked -->
<li ($click)="toggleComplete(.)"/>

<!-- calls `resetData` when cancel is dispatched on `my-modal`'s view model -->
<my-modal (cancel)="resetData()"/>
```

[can-stache-bindings.toChild One-way to child] examples:

```html
<!-- updates input's `checked` property with the value of complete -->
<input type="checkbox" {$checked}="complete"/>

<!-- updates `todo-lists`'s  `todos` property with the result of `getTodos`-->
<todos-list {todos}="getTodos(complete=true)"/>
```

[can-stache-bindings.toChild One-way to parent] examples:

```html
<!-- updates `complete` with input's `checked` property -->
<input type="checkbox" {^$checked}="complete"/>

<!-- updates `todosList` with `todo-lists`'s `todos` property -->
<todos-list {^todos}="todosList"/>
```

[can-stache-bindings.twoWay Two-way] examples:

```html
<!-- Updates the input's `value` with `name` and vice versa -->
<input type="text" {($value)}="name"/>

<!-- Updates `date-picker`'s `date` with `dueDate` and vice versa -->
<date-picker {(date)}="dueDate"/>
```

## can-route and can-route-pushstate

[can-route] connects a `DefineMap`'s properties to values in the
url. Create a map type, connect it to the url, and begin routing like:

```js
var route = require("can-route");
var DefineMap = require("can-define/map/map");

var AppViewModel = DefineMap.extend({
	seal: false
},{
	// Sets the default type to string
	"*": "string",
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
`appViewModel`'s `todoId` and `todo` property:

```js
appViewModel.todoId //-> "5"
appViewModel.todo   //-> Promise<Todo>
```

Similarly, if `appViewModel`'s `todoId` is set like:

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
route("todo/:todoId");

// and a hash like:
window.location.hash = "#!todo/7";

// produces an appViewModel like:
appViewModel.serialize() //-> {route: "todo/:todoId", todoId: "7"}
```

[can-route-pushstate] adds [pushstate](https://developer.mozilla.org/en-US/docs/Web/API/History_API) support. It
mixes in this behavior so you just need to import the module:

```js
var route = require("can-route");
require("can-route-pushstate");
```

## can-compute

?

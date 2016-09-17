@page guides/todomvc TodoMVC Guide
@parent guides/experiment 3


This guide walks through building a slightly modified version of TodoMVC with CanJS's [can-core libraries]
and [can-fixture].


## Setup

The easiest way to get started is to clone the following JSBin:


<a class="jsbin-embed" href="http://jsbin.com/sasuje/4/embed?html,output">JS Bin on jsbin.com</a>

The JSBin starts
with the static HTML and CSS a designer might turn over to a JS developer. We will be
adding all the JavaScript functionality.

The JSBin also loads [can.all.js](https://github.com/canjs/canjs/blob/v3.0.0-pre.9/dist/global/can.all.js), which is a script that includes CanJS all of CanJS core, ecosystem, legacy and infrastructure libraries under a
single global `can` namespace.

Generally speaking, you should not use the global can script and instead
should import things directly with a module loader like [StealJS](http://stealjs.com),
WebPack or Browserify.  In a real app your code will look like:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/map/map");

var Todo = DefineMap.extend({ ... });
Todo.List = DefineList.extend({ ... });
```

Not:

```js
var Todo = can.DefineMap.extend({ ... });
Todo.List = can.DefineList.extend({ ... });
```

Read [guides/setup] on how to setup CanJS in a real app.

## Create and render the template

In this section, we will render the markup in a [can-stache] live bound template.  

Update the `HTML` tab to have a `<script>` tag around the html content.

```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 Start">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
        <input id="new-todo" placeholder="What needs to be done?">
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<ul id="todo-list">
			<li class="todo">
				<div class="view">
					<input class="toggle" type="checkbox">
					<label>Do the dishes</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" type="text" value="Do the dishes">
			</li>
			<li class="todo completed">
				<div class="view">
					<input class="toggle" type="checkbox">
					<label>Mow the lawn</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" type="text" value="Mow the lawn">
			</li>
			<li class="todo editing">
				<div class="view">
					<input class="toggle" type="checkbox">
					<label>Pick up dry cleaning</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" type="text" value="Pick up dry cleaning">
			</li>
		</ul>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>2</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed (1)
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 11,67,only

Update the `JavaScript` tab to:

 - Use [can-stache.from can-stache.from] to load the contents of the `<script>` tag as
 a [template renderer function](can-stache.renderer).
 - Render the template with an empty object into a [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment).
 - Insert the fragment into the document's `<body>` element.

 To load and render this template, and add the result to the
body, add the following to the `JavaScript` tab:

```js
var template = can.stache.from("todomvc-template");
var frag = template({});
document.body.appendChild(frag);
```
@highlight 1-3,only


When complete, you should see the same content as before.  Only now, it's
rendered with a live-bound stache template.  The live binding means that
when the template's data is changed, it will update automatically. We'll see
that in the next step.


## Define the todos type and show the active and complete count.

In this section, we will:

 - List todos from a list of todos.
 - Show the number of active (`complete === true`) and and complete todos.
 - Connect a todo's `complete` property to a checkbox so that when
   we toggle the checkbox the number of active and complete todos changes.


Update the `JavaScript` tab to:

 - Define a `Todo` type with [can-define/map/map].
 - Define a `Todo.List` type along with an `active` and `complete` property with [can-define/list/list].
 - Create a list of todos and pass those to the template.

```js
var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  }
});

var todos = new Todo.List([
  { id: 5, name: "mow lawn", complete: false },
  { id: 6, name: "dishes", complete: true },
  { id: 7, name: "learn canjs", complete: false }
]);

var template = can.stache.from("todomvc-template");
var frag = template({todos: todos});
document.body.appendChild(frag);
```
@highlight 1-25,28,only


Update the `HTML` tab to:

- Use [can-stache.helpers.each] to loop through every todo.
- Add `completed` to the `<li>`'s `className` if the `<li>`'s todo is  complete.
- Use [can-stache-bindings.twoWay] to two-way bind the checkbox's `checked` property to its todo's `complete` property.  
- Use [can-stache.tags.escaped] to insert the value todo's `name` as the content of the `<label>` and
  `value` of the text `<input/>`.
- Insert the active and complete number of todos.

```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - Create and render the template">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
        <input id="new-todo" placeholder="What needs to be done?">
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<ul id="todo-list">
          {{#each todos}}
			<li class="todo {{#if complete}}completed{{/if}}">
				<div class="view">
					<input class="toggle" type="checkbox" {($checked)}="complete">
					<label>{{name}}</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" type="text" value="{{name}}"/>
			</li>
          {{/each}}
		</ul>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todos.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todos.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 21-30,35,49,only

When complete, you should be able to toggle the checkboxes and see the number of
items left and the completed count change automatically.  This is because
[can-stache] is able to listen for changes in observables like [can-define/map/map],
[can-define/list/list] and [can-compute].

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left.webm" type="video/webm">
</video>


## Get todos from the server

In this section, we will:

 - Load todos from a restful service.
 - Fake that restful service.


Update the `JavaScript` tab to:

- Define what the restful service layer's parameters are with [can-set].
- Create a fake data store that is initialized with data for 3 todos with [can-fixture.store].
- Trap AJAX requests to `"/api/todos"` and provide responses with the data from the fake data store with [can-fixture].
- Connect the `Todo` and `Todo.List` types to the restful `"/api/todos"` endpoint using [can-connect/can/super-map/super-map].  This allows you to load, create, update, and destroy todos
on the server.
- Use [can-connect/can/map/map.getList] to load a list of all todos on the server. The result
  of `getList` is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to a `Todo.List` with the todos returned from the fake data store.  That `Promise`
  is passed to the template as `todosPromise`.


```js
var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var template = can.stache.from("todomvc-template");
var frag = template({todosPromise: Todo.getList({})});
document.body.appendChild(frag);
```
@highlight 1-15,37-43,46,only

Update the `HTML` tab to:

 - Use [can-stache.helpers.each] to loop through the promise's resolved value, which
   is the list of todos returned by the server.
 - Read the active and completed number of todos from the promise's resolved value.


```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - Create the todos type and get items left working">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
        <input id="new-todo" placeholder="What needs to be done?">
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<ul id="todo-list">
          {{#each todosPromise.value}}
			<li class="todo {{#if complete}}completed{{/if}}">
				<div class="view">
					<input class="toggle" type="checkbox" {($checked)}="complete">
					<label>{{name}}</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" type="text" value="{{name}}"/>
			</li>
          {{/each}}
		</ul>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 21,35,49,only

When complete, you'll notice a 1 second delay before seeing the list of todos as
they load for the first time from the fixtured data store. On future page reloads, the
list of todos will load immediately.  This is because [can-connect/can/super-map/super-map] ads the [can-connect/fall-through-cache/fall-through-cache] behavior.  The
[can-connect/fall-through-cache/fall-through-cache] behavior stores loaded data in
localStorage.  Future requests will hit localStorage for data first, present that data
to the user, before making a request to the server and updating the original data with
any changes.  Use `localStorage.clear()` to see the difference.


## Destroy todos

In this section, we will:

 - Delete a todo on the server when it's destroy button is clicked.  
 - Remove the todo from the page after it's deleted.

Update the `HTML` tab to:

 - Add `destroying` to the `<li>`'s `className` if the `<li>`'s todo is being destroyed using [can-connect/can/map/map.prototype.isDestroying].
 - Call the `todo`'s [can-connect/can/map/map.prototype.destroy] method when the `<button>` is clicked using [can-stache-bindings.event].

```
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - Destroy todos">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
        <input id="new-todo" placeholder="What needs to be done?">
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<ul id="todo-list">
          {{#each todosPromise.value}}
			<li class="todo {{#if complete}}completed{{/if}}
                    {{#if isDestroying}}destroying{{/if}}">
				<div class="view">
					<input class="toggle" type="checkbox" {($checked)}="complete">
					<label>{{name}}</label>
					<button class="destroy" ($click)="destroy()"></button>
				</div>
				<input class="edit" type="text" value="{{name}}"/>
			</li>
          {{/each}}
		</ul>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 22-23,27,only

When complete, you should be able to delete a todo by clicking its delete button.  After
clicking the todo, its name will turn red and italic.  Once deleted the todo will be
automatically removed from the page.  

The deleted todo is automatically removed from the page because [can-connect/can/super-map/super-map] ads the [can-connect/real-time/real-time] behavior.  The
[can-connect/real-time/real-time] behavior automatically updates lists (like `Todo.List`) when instances
are created, updated or destroyed.  If you've created the right [can-set.Algebra], you
shouldn't have to manage lists yourself.

Finally, if you refresh the page after deleting, you'll notice the page temporarily shows fewer items.
This is because the fall through cache's data is shown before the response from fixtured data store
is used.

## Create todos

In this section, we will:

 - Create a custom element that can create todos on the server.
 - Use that custom element.

Update the `JavaScript` tab to:

 - Use [can-define/map/map] to create a `TodoCreateVM` view model with:
   - A `todo` property that holds a new `Todo` instance.
   - A `createTodo` method that [can-connect/can/map/map.prototype.save]s the `Todo` instance
     and replaces it with a new one once saved.
 - Use [can-component] to create a custom `<todo-create>` component that renders the `todo-create-template` template with an instance of the `TodoCreateVM`.


```js
var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);


var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var TodoCreateVM = can.DefineMap.extend({
    todo: {Value: Todo},
    createTodo: function(){
        this.todo.save().then(function(){
            this.todo = new Todo();
        }.bind(this));
    }
});

can.Component.extend({
    tag: "todo-create",
    view: can.stache.from("todo-create-template"),
    ViewModel: TodoCreateVM
});

var template = can.stache.from("todomvc-template");
var frag = template({todosPromise: Todo.getList({})});
document.body.appendChild(frag);
```
@highlight 46-59,only

Update the `HTML` tab to:

 - Create the `todo-create-template` that:
   - Updates the `todo`'s `name` with the `<input>`'s `value` using [can-stache-bindings.toParent].
   - Calls `createTodo` when the `enter` key is pressed using [can-stache-bindings.event].
 - Use `<todo-create/>`

```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - Create todos">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type='text/stache' id='todo-create-template'>
<input id="new-todo"
    placeholder="What needs to be done?"
    {^$value}="todo.name"
    ($enter)="createTodo()"/>
</script>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
		<todo-create/>
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<ul id="todo-list">
          {{#each todosPromise.value}}
			<li class="todo {{#if complete}}completed{{/if}}
                    {{#if isDestroying}}destroying{{/if}}">
				<div class="view">
					<input class="toggle" type="checkbox" {($checked)}="complete">
					<label>{{name}}</label>
					<button class="destroy" ($click)="destroy()"></button>
				</div>
				<input class="edit" type="text" value="{{name}}"/>
			</li>
          {{/each}}
		</ul>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 11-16,18,22,only

When complete, you will be able to create a todo by typing the name of the todo and pressing
`enter`. Notice that the new todo automatically appears in the list of todos. This
is also because [can-connect/can/super-map/super-map] ads the [can-connect/real-time/real-time] behavior.  The
[can-connect/real-time/real-time] behavior automatically will inserted newly created items into
lists that they belong within.


## List todos

In this section, we will:

 - Define a custom element that lists todos passed to it.
 - Use that custom element.

Update the `JavaScript` tab to:

 - Create a `TodoListVM` view model type which has a `todos` property of type `Todo.List`.
 - Use [can-component] to define a `<todo-list>` element.

```js
var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var TodoCreateVM = can.DefineMap.extend({
    todo: {Value: Todo},
    createTodo: function(){
        this.todo.save().then(function(){
            this.todo = new Todo();
        }.bind(this));
    }
});

can.Component.extend({
    tag: "todo-create",
    view: can.stache.from("todo-create-template"),
    ViewModel: TodoCreateVM
});

var TodoListVM = can.DefineMap.extend({
    todos: Todo.List
});

can.Component.extend({
    tag: "todo-list",
    view: can.stache.from("todo-list-template"),
    ViewModel: TodoListVM
});

var template = can.stache.from("todomvc-template");
var frag = template({todosPromise: Todo.getList({})});
document.body.appendChild(frag);
```
@highlight 60-68,only

Update the `HTML` tab to:

 - Create the `todo-list-template` that loops through a list of `todos` (instead of `todosPromise.value`).
 - Create a `<todo-list>` element and set it's `todos` property to the resolved value of `todosPromise`
   using [can-stache-bindings.toChild].

```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - List todos">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type='text/stache' id='todo-create-template'>
<input id="new-todo"
    placeholder="What needs to be done?">
    {($value)}="todo.name"
    ($enter)="createTodo()"/>
</script>

<script type='text/stache' id='todo-list-template'>
<ul id="todo-list">
  {{#each todos}}
    <li class="todo {{#if complete}}completed{{/if}}
      {{#if isDestroying}}destroying{{/if}}">
      <div class="view">
        <input class="toggle" type="checkbox" {($checked)}="complete">
        <label>{{name}}</label>
        <button class="destroy" ($click)="destroy()"></button>
      </div>
      <input class="edit" type="text" value="{{name}}"/>
    </li>
  {{/each}}
</ul>
</script>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
		<todo-create/>
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<todo-list {todos}="todosPromise.value"/>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 18-32,43,only

When complete, everything should work the same. We didn't add any new functionality, we
just moved code around to make it more isolated, potentially reusable, and more maintainable.


## Edit todos

In this section, we will:

 - Make it possible to edit a todo's `name` and save that change to the server.

Update the `JavaScript` tab to:

 - Update the `TodoListVM` to include the methods and properties needed to edit a todo's name, including:
   - An `editing` property of type `Todo` that stores which todo is being edited.
   - A `backupName` property that stores the todo's name before being edited.
   - An `edit` method that sets up the editing state.
   - A `cancelEdit` method that undos the editing state.
   - A `updateName` method that updates the editing todo and saves it to the server.

```js
var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var TodoCreateVM = can.DefineMap.extend({
  todo: {Value: Todo},
  createTodo: function(){
    this.todo.save().then(function(){
      this.todo = new Todo();
    }.bind(this));
  }
});

can.Component.extend({
  tag: "todo-create",
  view: can.stache.from("todo-create-template"),
  ViewModel: TodoCreateVM
});

var TodoListVM = can.DefineMap.extend({
  todos: Todo.List,
  editing: Todo,
  backupName: "string",
  isEditing: function(todo){
    return todo === this.editing;
  },
  edit: function(todo){
    this.backupName = todo.name;
    this.editing = todo;
  },
  cancelEdit: function(){
    this.editing.name = this.backupName;
    this.editing = null;
  },
  updateName: function() {
    this.editing.save();
    this.editing = null;
  }
});

can.Component.extend({
  tag: "todo-list",
  view: can.stache.from("todo-list-template"),
  ViewModel: TodoListVM
});

var template = can.stache.from("todomvc-template");
var frag = template({todosPromise: Todo.getList({})});
document.body.appendChild(frag);
```
@highlight 62-78,only


Update the `HTML` tab to:

 - Use the `isEditing` method to add `editing` to the todo's `<li>` who is being edited.
 - Call `edit` with the current context using [can-stache/keys/this].
 - Setup the edit input to:
   - Two way bind it's value to the current todo's `name` using [can-stache-bindings.twoWay].
   - Call `updateName` when the enter key is pressed using [can-stache-bindings.event].
   - Call `cancelEdit` if the input element loses focus.

```
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - List todos">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type='text/stache' id='todo-create-template'>
<input id="new-todo"
    placeholder="What needs to be done?"
    {($value)}="todo.name"
    ($enter)="createTodo()"/>
</script>

<script type='text/stache' id='todo-list-template'>
<ul id="todo-list">
  {{#each todos}}
    <li class="todo {{#if complete}}completed{{/if}}
      {{#if isDestroying}}destroying{{/if}}
      {{#if isEditing(this)}}editing{{/if}}">
      <div class="view">
        <input class="toggle" type="checkbox" {($checked)}="complete">
        <label ($dblclick)="edit(this)">{{name}}</label>
        <button class="destroy" ($click)="destroy()"></button>
      </div>
      <input class="edit" type="text"
        {($value)}="name"
        ($enter)="updateName()"
        ($blur)="cancelEdit()"/>
    </li>
  {{/each}}
</ul>
</script>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
		<todo-create/>
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<todo-list {todos}="todosPromise.value"/>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a class="selected" href="#!">All</a>
			</li>
			<li>
				<a href="#!active">Active</a>
			</li>
			<li>
				<a href="#!completed">Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 23,26,29-32,only

When complete, you should be able to edit a todo's name.

## Routing

In this section, we will:

 - Make it possible to use the forward and backwards button to change
 between showing all todos, only active todos, or only completed todos.
 - Add links to change between showing all todos, only active todos, or only completed todos.
 - Make those links bold when the site is currently showing that link.


Update the `JavaScript` tab to:

 - Create a `AppVM` view model type that will manage the behavior of the `todomvc-template` and
   will update when the url changes.
 - Define a `filter` property that will be updated when the route changes.
 - Define a `route` property that will be updated when the route changes.
 - Define a `todosPromise` property that uses `filter` to determine what data should be
   loaded from the server.  
   - If `filter` is falsey, all data will be loaded.  
   - If `filter` is `"complete"`, only complete todos will be loaded.
   - If `filter` is any other value, the active todos will be loaded.
 - Create an instance of the application view model (`appVM`).
 - Connect changes in the url to changes in the `appVM` with [can-route.data].
 - Create a pretty routing rule so if the url looks like `"!active"`, the `filter` property of
   `appVM` will be set to `filter` with [can-route].
 - Initialize the url's values on `appVM` and setup the two way connection with [can-route.ready].
 - Render the `todomvc-template` with the `appVM`.


```js
var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var TodoCreateVM = can.DefineMap.extend({
  todo: {Value: Todo},
  createTodo: function(){
    this.todo.save().then(function(){
      this.todo = new Todo();
    }.bind(this));
  }
});

can.Component.extend({
  tag: "todo-create",
  view: can.stache.from("todo-create-template"),
  ViewModel: TodoCreateVM
});

var TodoListVM = can.DefineMap.extend({
  todos: Todo.List,
  editing: Todo,
  backupName: "string",
  isEditing: function(todo){
    return todo === this.editing;
  },
  edit: function(todo){
    this.backupName = todo.name;
    this.editing = todo;
  },
  cancelEdit: function(){
    this.editing.name = this.backupName;
    this.editing = null;
  },
  updateName: function() {
    this.editing.save();
    this.editing = null;
  }
});

can.Component.extend({
  tag: "todo-list",
  view: can.stache.from("todo-list-template"),
  ViewModel: TodoListVM
});

var AppVM = can.DefineMap.extend({
  filter: "string",
  route: "string",
  todosPromise: {
    get: function(){

      if(!this.filter) {
        return Todo.getList({});
      } else {
        return Todo.getList({complete: this.filter === "complete"});
      }
    }
  }
});

var template = can.stache.from("todomvc-template");

var appVM = new AppVM();
can.route.data = appVM;
can.route("{filter}");
can.route.ready();

var frag = template(appVM);
document.body.appendChild(frag);
```
@highlight 87-109,only

Update the `HTML` tab to:

 - Set `href` to a url that will set the desired properties on `appVM` when clicked.
 - Add `class='selected'` to the link if the current route matches the current properties of the `appVM` using [can-stache.helpers.routeCurrent].

```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - Routing">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type='text/stache' id='todo-create-template'>
<input id="new-todo"
    placeholder="What needs to be done?"
    {($value)}="todo.name"
    ($enter)="createTodo()"/>
</script>

<script type='text/stache' id='todo-list-template'>
<ul id="todo-list">
  {{#each todos}}
    <li class="todo {{#if complete}}completed{{/if}}
      {{#if isDestroying}}destroying{{/if}}
      {{#if isEditing(this)}}editing{{/if}}">
      <div class="view">
        <input class="toggle" type="checkbox" {($checked)}="complete">
        <label ($dblclick)="edit(this)">{{name}}</label>
        <button class="destroy" ($click)="destroy()"></button>
      </div>
      <input class="edit" type="text"
        {($value)}="name"
        ($enter)="updateName()"
        ($blur)="cancelEdit()"/>
    </li>
  {{/each}}
</ul>
</script>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
		<todo-create/>
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<todo-list {todos}="todosPromise.value"/>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a href="{{routeUrl filter=undefined}}"
					{{#routeCurrent filter=undefined}}class='selected'{{/routeCurrent}}>All</a>
			</li>
			<li>
				<a href="{{routeUrl filter='active'}}"
					{{#routeCurrent filter='active'}}class='selected'{{/routeCurrent}}>Active</a>
			</li>
			<li>
				<a href="{{routeUrl filter='complete'}}"
					{{#routeCurrent filter='complete'}}class='selected'{{/routeCurrent}}>Completed</a>
			</li>
		</ul>
		<button id="clear-completed">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 55-56,59-60,63-64,only

When complete, you should be able to click the `All`, `Active`, and `Completed` links and
see the right data.  When you click from `All` to `Active` or from `All` to `Completed`,
you'll notice that the list of todos is updated immediately, despite a request being made.
This is because the [can-connect/fall-through-cache/fall-through-cache] is able to make use
of the data loaded for the `All` todos page.  It's able to filter out the `Active` and
`Completed` data.

## Toggle all and clear completed

In this section, we will:

- Make the `toggle-all` button change all todos to complete or incomplete.
- Make the `clear-completed` button delete all complete todos.

Update the `JavaScript` tab to:

- Add the following properties and methods to `Todo.List`:
  - A `allComplete` property that returns `true` if every todo is complete.
  - A `saving` property that returns todos that are being saved using [can-connect/can/map/map.prototype.isSaving].
  - A `updateCompleteTo` method that updates every todo's `complete` property to the specified value and updates the compute on the server with [can-connect/can/map/map.prototype.save].
  - A `destroyComplete` method that deletes every complete todo with [can-connect/can/map/map.prototype.destroy].
- Adds the following properties to `AppVM`:
  - A `todosList` property that gets its value from the `todosPromise` using an [can-define.types.get asynchronous getter].
  - A `allChecked` property that returns `true` if every todo is complete.  The property can also be set to `true` or `false` and it will set every todo to that value.

```js
var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  active: {
    get: function(){
      return this.filter({complete: false})
    }
  },
  complete: {
    get: function(){
      return this.filter({complete: true});
    }
  },
  allComplete: {
    get: function(){
      return this.length === this.complete.length;
    }
  },
  saving: {
    get: function(){
      return this.filter(function(todo){
        return todo.isSaving();
      });
    }
  },
  updateCompleteTo: function(value){
    this.forEach(function(todo){
      todo.complete = value;
      todo.save();
    });
  },
  destroyComplete: function(){
    this.complete.forEach(function(todo){
      todo.destroy();
    });
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var TodoCreateVM = can.DefineMap.extend({
  todo: {Value: Todo},
  createTodo: function(){
    this.todo.save().then(function(){
      this.todo = new Todo();
    }.bind(this));
  }
});

can.Component.extend({
  tag: "todo-create",
  view: can.stache.from("todo-create-template"),
  ViewModel: TodoCreateVM
});

var TodoListVM = can.DefineMap.extend({
  todos: Todo.List,
  editing: Todo,
  backupName: "string",
  isEditing: function(todo){
    return todo === this.editing;
  },
  edit: function(todo){
    this.backupName = todo.name;
    this.editing = todo;
  },
  cancelEdit: function(){
    this.editing.name = this.backupName;
    this.editing = null;
  },
  updateName: function() {
    this.editing.save();
    this.editing = null;
  }
});

can.Component.extend({
  tag: "todo-list",
  view: can.stache.from("todo-list-template"),
  ViewModel: TodoListVM
});

var AppVM = can.DefineMap.extend({seal: false},{
  filter: "string",
  route: "string",
  todosPromise: {
    get: function(){

      if(!this.filter) {
        return Todo.getList({});
      } else {
        return Todo.getList({complete: this.filter === "complete"});
      }
    }
  },
  todosList: {
    get: function(lastSetValue, resolve){
      this.todosPromise.then(resolve);
    }
  },
  allChecked: {
    get: function(){
      return this.todosList && this.todosList.allComplete;
    },
    set: function(newVal){
      this.todosList && this.todosList.updateCompleteTo(newVal);
    }
  }
});

var template = can.stache.from("todomvc-template");

var appVM = new AppVM();
can.route.data = appVM;
can.route("{filter}");
can.route.ready();

var frag = template(appVM);
document.body.appendChild(frag);
```
@highlight 35-57,123-135,only

Update the `HTML` tab to:

- Cross bind the `toggle-all`'s `checked` property to the `appVM`'s `allChecked` property.
- Disable the `toggle-all` button while any todo is saving.
- Call the `Todo.List`'s `destroyComplete` method when the `clear-completed` button is clicked on.

```html
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="TodoMVC Guide 3.0 - Routing">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>

<script type='text/stache' id='todo-create-template'>
<input id="new-todo"
    placeholder="What needs to be done?"
    {($value)}="todo.name"
    ($enter)="createTodo()"/>
</script>

<script type='text/stache' id='todo-list-template'>
<ul id="todo-list">
  {{#each todos}}
    <li class="todo {{#if ./complete}}completed{{/if}}
      {{#if isDestroying}}destroying{{/if}}
      {{#if isEditing(this)}}editing{{/if}}">
      <div class="view">
        <input class="toggle" type="checkbox" {($checked)}="complete">
        <label ($dblclick)="edit(this)">{{name}}</label>
        <button class="destroy" ($click)="destroy()"></button>
      </div>
      <input class="edit" type="text"
        {($value)}="name"
        ($enter)="updateName()"
        ($blur)="cancelEdit()"/>
    </li>
  {{/each}}
</ul>
</script>

<script type="text/stache" id="todomvc-template">
<section id="todoapp">
	<header id="header">
		<h1>todos</h1>
		<todo-create/>
	</header>
	<section id="main" class="">
		<input id="toggle-all" type="checkbox"
          {($checked)}="allChecked"
          {$disabled}="todosList.saving.length"/>
		<label for="toggle-all">Mark all as complete</label>
		<todo-list {todos}="todosPromise.value"/>
	</section>
	<footer id="footer" class="">
		<span id="todo-count">
			<strong>{{todosPromise.value.active.length}}</strong> items left
		</span>
		<ul id="filters">
			<li>
				<a href="{{routeUrl filter=undefined}}"
					{{#routeCurrent filter=undefined}}class='selected'{{/routeCurrent}}>All</a>
			</li>
			<li>
				<a href="{{routeUrl filter='active'}}"
					{{#routeCurrent filter='active'}}class='selected'{{/routeCurrent}}>Active</a>
			</li>
			<li>
				<a href="{{routeUrl filter='complete'}}"
					{{#routeCurrent filter='complete'}}class='selected'{{/routeCurrent}}>Completed</a>
			</li>
		</ul>
		<button id="clear-completed"
            ($click)="todosList.destroyComplete()">
			Clear completed ({{todosPromise.value.complete.length}})
		</button>
	</footer>
</section>
</script>

<script src="https://code.jquery.com/jquery-2.2.4.js"></script>
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.9/dist/global/can.all.js"></script>
</body>

</html>
```
@highlight 45-47,69-70,only

When complete, you should be able to toggle all todos `complete` state and
delete the completed todos.  You should also have a really good idea how CanJS works!

<script src="http://static.jsbin.com/js/embed.min.js?3.39.15"></script>

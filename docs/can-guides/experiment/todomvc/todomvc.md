@page guides/todomvc TodoMVC Guide
@parent guides/experiment 3


This guide walks through building a slightly modified version of TodoMVC with CanJS's [can-core libraries]
and [can-fixture].


## Setup

The easiest way to get started is to clone the following JSBin:


<a class="jsbin-embed" href="http://jsbin.com/sasuje/2/embed?html,output">JS Bin on jsbin.com</a>

The JSBin starts
with the static HTML and CSS a designer might turn over to a JS developer.

The JSBin also loads [can.all.js](https://github.com/canjs/canjs/blob/v3.0.0-pre.6/dist/global/can.all.js), which is a script that includes
CanJS all of CanJS core, ecosystem, legacy and infrastructure libraries.

Generally speaking, you should not use the global can script and instead
should import things directly.  Read [guides/setup] on how to setup CanJS
in a real app.

## Create and render the template

Put the markup in a template.  Change the `HTML` tab to the following:

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
		<input id="new-todo" placeholder="What needs to be done?"
               autofocus="">
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
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.6/dist/global/can.all.js"></script>
</body>

</html>
```

> NOTE: autofocus

To render this template, update the `JavaScript` tab to:

```js
var template = can.stache.from("todomvc-template");
var frag = template({});
document.body.appendChild(frag);
```

## Create the todos type and get items left working

Update `JavaScript` to:

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

Update `HTML` to:

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
		<input id="new-todo" placeholder="What needs to be done?"
               autofocus="">
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
<script src="https://rawgit.com/canjs/canjs/v3.0.0-pre.6/dist/global/can.all.js"></script>
</body>

</html>
```

Note:

 - completed
 - items left / clear completed changes automatically 


## Get todos from the server

## Create todos

## List todos

## Destroy todos

## Edit todos


<script src="http://static.jsbin.com/js/embed.min.js?3.39.15"></script>

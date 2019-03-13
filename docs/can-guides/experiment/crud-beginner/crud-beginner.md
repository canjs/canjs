@page guides/crud-beginner CRUD Guide (Beginner)
@parent guides/experiment 0
@templateRender <% %>
@description Learn how to build a basic CRUD app with CanJS in 30 minutes.

@body

## Overview

In this tutorial, we’ll build a simple to-do app that let’s you:

- Load a list of to-dos from an API
- Create new to-dos with a form
- Mark to-dos as “completed”
- Delete to-dos

This tutorial does not assume any prior knowledge of CanJS and is meant for complete beginners.
We assume that you have have basic knowledge of HTML and JavaScript. If you don’t, start by
going through [MDN’s tutorials](https://developer.mozilla.org/en-US/docs/Web/Tutorials).

## Setup

We’ll use CodePen in this tutorial to edit code in our browser and immediately see the results.
If you’re feeling adventurous and you’d like to set up the code locally, the [guides/setup setup guide]
has all the info you’ll need.

To begin, click the “Edit on CodePen” button in the top right of the following embed:

<p class="codepen" data-height="170" data-theme-id="0" data-default-tab="js" data-user="bitovi" data-slug-hash="drZgqY" style="height: 170px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 5 — CRUD Guide Step 1">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/drZgqY/">
  CanJS 5 — CRUD Guide Step 1</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

### HTML

The CodePen above has one line of HTML already in it:

```html
<todos-app></todos-app>
```

`<todos-app>` is a [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).
When the browser encounters this element, it looks for the `todos-app` element to be defined in JavaScript.
In just a little bit, we’ll define the `todos-app` element with CanJS.

### JS

The CodePen above has three lines of JavaScript already in it:

```js
// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);
```

Instead of connecting to a real backend API or web service, we’ll use [can-fixture fixtures]
to “mock” an API. Whenever an [AJAX](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
request is made, the fixture will “capture” the request and instead respond with mock data.

How this works is outside the scope of this tutorial, but you can learn more in the
[can-fixture] documentation.

## Defining a custom element with CanJS

We mentioned above that CanJS helps you define custom elements. We call these [can-component components].

Add the following to the **JS** tab in your CodePen:

```js
// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);

import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
	`,
	ViewModel: {
	}
});
```
@highlight 5-14,only

After you add the above code, you’ll see “Today’s to-dos” displayed in the result pane.

Let’s break down what each of these lines does:

### Importing CanJS

With one line of code, we load CanJS from a CDN and import one of its modules:

```js
import { Component } from "//unpkg.com/can@5/core.mjs";
```

Here’s what the different parts mean:

- `import` is a keyword that [loads modules from files](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).
- `Component` is the _named export_ from CanJS that let’s us define custom elements.
- `//unpkg.com/can@5/core.mjs` loads the `core.mjs` file from CanJS 5. `unpkg.com` is a CDN that hosts packages like CanJS ([can](https://www.npmjs.com/package/can)).

### Defining a component

The `Component` _named export_ comes from CanJS’s [can-component can-component] package.

CanJS is composed of dozens of different packages that are responsible for different features.
[can-component can-component] is responsible for letting us define custom elements that can be
used by the browser.

```js
Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
	`,
	ViewModel: {
	}
});
```

Calling [can-component.extend Component.extend()] defines a custom element. It takes three arguments:

- `tag` is the name of the custom element
- `view` is a [can-stache stache template] that gets parsed by CanJS and inserted into the custom element; more on that later
- `ViewModel` is a [can-define/map/map DefineMap] that provides the data or _model_ to the _view_

The `view` is pretty boring right now; it just renders `<h1>Today’s to-dos</h1>`. In the next section, we’ll make it more interesting!

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

## Rendering a template with a ViewModel

A component’s [can-component.prototype.view] gets rendered with a [can-component.prototype.ViewModel].

Let’s update our component to be a little more interesting:

```js
// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);

import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "todos-app",
	view: `
		<h1>{{this.title}}</h1>
	`,
	ViewModel: {
		get title() {
			return "Today’s to-dos";
		}
	}
});
```
@highlight 10,13-15,only

We’ve added a `title` [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
to our `ViewModel`. Whenever the `title` property is accessed on the `ViewModel`, the string `"Today’s to-dos"`
will be returned.

Our `view` is a [can-stache stache template]. Whenever stache encounters the [can-stache.tags.escaped double curlies (`{{}}`)],
it looks inside them for an _expression_ to evaluate. In our code, that’s `this.title`.

The `view` is rendered with an instance of the `ViewModel`. `this` always refers to the ViewModel instance.
Thus, `this.title` is accessing the `title` getter that we define in the `ViewModel`, and `"Today’s to-dos"`
is returned. That’s how `<h1>Today’s to-dos</h1>` get rendered in the page!

## Connecting to a backend API

With most frameworks, you might use [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest),
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), or a third-party library to make HTTP requests.

CanJS makes it really easy to connect to backend APIs without having to write your own requests.

Let’s make a request to get all the to-dos sorted alphabetically by name:

```js
// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);

import { Component, realtimeRestModel } from "//unpkg.com/can@5/core.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
	`,
	ViewModel: {
		get todosPromise() {
			return Todo.getList({sort: "name"});
		}
	}
});
```
@highlight 5-7,15-17,only

First, we import [can-realtime-rest-model realtimeRestModel]. This module is responsible for creating
new data types and connecting to APIs.

Second, we call `realtimeRestModel()` with a string that represents the URLs that should be called for
Creating, Retrieving, Updating, and Deleting data. `/api/todos/{id}` will map to these API calls:

- `GET /api/todos` to retrieve all the to-dos
- `POST /api/todos` to create a to-do
- `GET /api/todos/1` to retrieve the to-do with `id=1`
- `PUT /api/todos/1` to update the to-do with `id=1`
- `DELETE /api/todos/1` to delete the to-do with `id=1`

`realtimeRestModel()` returns a connection that has a `.Map` property, which is a new data type.
Instead of making the above API calls, you can use these methods on the [can-define/map/map Map] type:

- `Todo.getList()` => `GET /api/todos`
- `(new Todo()).save()` => `POST /api/todos`
- `Todo.get({id: 1})` => `GET /api/todos/1`
- `todo.save()` => `PUT /api/todos/1`
- `todo.destroy()` => `DELETE /api/todos/1`

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

## Rendering a list of items

```js
Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{#if(this.todosPromise.isResolved)}}
			<ul>
				{{#for(todo of this.todosPromise.value)}}
					<li>
						{{todo.name}}
					</li>
				{{/for}}
			</ul>
		{{/if}}
	`,
	ViewModel: {
		get todosPromise() {
			return Todo.getList({sort: "name"});
		}
	}
});
```

## Handling loading and error states

```js
Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{#if(this.todosPromise.isPending)}}
			Loading todos…
		{{/if}}
		{{#if(this.todosPromise.isRejected)}}
			<p>Couldn’t load todos; {{this.todosPromise.reason.message}}</p>
		{{/if}}
		{{#if(this.todosPromise.isResolved)}}
			<input placeholder="What needs to be done?" value:bind="this.newTodoName" />
			<button on:click="this.save()" type="button">Add</button>
			<ul>
				{{#for(todo of this.todosPromise.value)}}
					<li>
						{{todo.name}}
					</li>
				{{/for}}
			</ul>
		{{/if}}
	`,
	ViewModel: {
		get todosPromise() {
			return Todo.getList({sort: "name"});
		}
	}
});
```

## Creating new items

```js
Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{#if(this.todosPromise.isPending)}}
			Loading todos…
		{{/if}}
		{{#if(this.todosPromise.isRejected)}}
			<p>Couldn’t load todos; {{this.todosPromise.reason.message}}</p>
		{{/if}}
		{{#if(this.todosPromise.isResolved)}}
			<input placeholder="What needs to be done?" value:bind="this.newTodoName" />
			<button on:click="this.save()" type="button">Add</button>
			<ul>
				{{#for(todo of this.todosPromise.value)}}
					<li>
						<input checked:bind="todo.complete" on:change="todo.save()" type="checkbox" />
						{{todo.name}}
					</li>
				{{/for}}
			</ul>
		{{/if}}
	`,
	ViewModel: {
		newTodoName: "string",
		get todosPromise() {
			return Todo.getList({sort: "name"});
		},
		save() {
			const todo = new Todo({name: this.newTodoName});
			todo.save();
			this.newTodoName = "";
		}
	}
});
```

## Updating existing items

```js
Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{#if(this.todosPromise.isPending)}}
			Loading todos…
		{{/if}}
		{{#if(this.todosPromise.isRejected)}}
			<p>Couldn’t load todos; {{this.todosPromise.reason.message}}</p>
		{{/if}}
		{{#if(this.todosPromise.isResolved)}}
			<input placeholder="What needs to be done?" value:bind="this.newTodoName" />
			<button on:click="this.save()" type="button">Add</button>
			<ul>
				{{#for(todo of this.todosPromise.value)}}
					<li>
						<input checked:bind="todo.complete" on:change="todo.save()" type="checkbox" />
						{{#eq(todo, this.selectedTodo)}}
							<input focused:from="true" on:blur="this.saveTodo(todo)" type="text" value:bind="todo.name" />
						{{else}}
							<span class="{{#if(todo.complete)}}done{{/if}}" on:click="this.selectedTodo = todo">{{todo.name}}</span>
						{{/eq}}
					</li>
				{{/for}}
			</ul>
		{{/if}}
	`,
	ViewModel: {
		newTodoName: "string",
		selectedTodo: {},
		get todosPromise() {
			return Todo.getList({sort: "name"});
		},
		save() {
			const todo = new Todo({name: this.newTodoName});
			todo.save();
			this.newTodoName = "";
		},
		saveTodo(todo) {
			todo.save();
			this.selectedTodo = null;
		}
	}
});
```

## Deleting items

```js
Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{#if(this.todosPromise.isPending)}}
			Loading todos…
		{{/if}}
		{{#if(this.todosPromise.isRejected)}}
			<p>Couldn’t load todos; {{this.todosPromise.reason.message}}</p>
		{{/if}}
		{{#if(this.todosPromise.isResolved)}}
			<input placeholder="What needs to be done?" value:bind="this.newTodoName" />
			<button on:click="this.save()" type="button">Add</button>
			<ul>
				{{#for(todo of this.todosPromise.value)}}
					<li>
						<input checked:bind="todo.complete" on:change="todo.save()" type="checkbox" />
						{{#eq(todo, this.selectedTodo)}}
							<input focused:from="true" on:blur="this.saveTodo(todo)" type="text" value:bind="todo.name" />
						{{else}}
							<span class="{{#if(todo.complete)}}done{{/if}}" on:click="this.selectedTodo = todo">{{todo.name}}</span>
						{{/eq}}
						<button on:click="todo.destroy()" type="button"></button>
					</li>
				{{/for}}
			</ul>
		{{/if}}
	`,
	ViewModel: {
		newTodoName: "string",
		selectedTodo: {},
		get todosPromise() {
			return Todo.getList({sort: "name"});
		},
		save() {
			const todo = new Todo({name: this.newTodoName});
			todo.save();
			this.newTodoName = "";
		},
		saveTodo(todo) {
			todo.save();
			this.selectedTodo = null;
		}
	}
});
```

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

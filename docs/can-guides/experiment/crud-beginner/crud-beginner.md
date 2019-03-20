@page guides/crud-beginner CRUD Guide (Beginner)
@parent guides/experiment 0
@templateRender <% %>
@description Learn how to build a basic CRUD app with CanJS in 30 minutes.
@hide

@body

## Overview

In this tutorial, we’ll build a simple to-do app that lets you:

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

@sourceref ./1.js

Instead of connecting to a real backend API or web service, we’ll use [can-fixture fixtures]
to “mock” an API. Whenever an [AJAX](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
request is made, the fixture will “capture” the request and instead respond with mock data.

How fixtures work is outside the scope of this tutorial and not necessary to understand to continue,
but you can learn more in the [can-fixture] documentation.

## Defining a custom element with CanJS

We mentioned above that CanJS helps you define custom elements. We call these [can-component components].

Add the following to the **JS** tab in your CodePen:

@sourceref ./2.js
@highlight 5-14,only

After you add the above code, you’ll see “Today’s to-dos” displayed in the result pane.

We’ll break down what each of these lines does in the next couple sections.

### Importing CanJS

With one line of code, we load CanJS from a CDN and import one of its modules:

```js
import { Component } from "//unpkg.com/can@5/core.mjs";
```

Here’s what the different parts mean:

- `import` is a keyword that [loads modules from files](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).
- `Component` is the _named export_ from CanJS that lets us define custom elements.
- `//unpkg.com/can@5/core.mjs` loads the `core.mjs` file from CanJS 5; this is explained more thoroughly in the [guides/setup#Explanationofdifferentbuilds setup guide].
- `unpkg.com` is a CDN that hosts packages like CanJS ([can](https://www.npmjs.com/package/can)).

### Defining a component

The `Component` _named export_ comes from CanJS’s [can-component can-component] package.

CanJS is composed of dozens of different packages that are responsible for different features.
[can-component can-component] is responsible for letting us define custom elements that can be
used by the browser.

@sourceref ./2.js
@highlight 7-14,only

Calling [can-component.extend Component.extend()] defines a custom element. It takes three arguments:

- `tag` is the name of the custom element.
- `view` is a [can-stache stache template] that gets parsed by CanJS and inserted into the custom element; more on that later.
- `ViewModel` is an object with properties and methods that provides the data or the _model_ to the _view_.

The `view` is pretty boring right now; it just renders `<h1>Today’s to-dos</h1>`. In the next section, we’ll make it more interesting!

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

## Rendering a template with a ViewModel

A component’s [can-component.prototype.view] gets rendered with a [can-component.prototype.ViewModel].

Let’s update our component to be a little more interesting:

@sourceref ./3.js
@highlight 10,13-15,only

Using this component will insert the following into the page:

```html
<todos-app>
	<h1>Today’s to-dos</h1>
</todos-app>
```

The next two sections will more thoroughly explain these lines.

### Defining properties on the ViewModel

Every time a component’s custom element is used, a new instance of the component’s `ViewModel` is created.

We’ve added a `title` [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
to our `ViewModel`, which returns the string `"Today’s to-dos"`:

@sourceref ./3.js
@highlight 13-15,only

### Reading properties in the stache template

Our `view` is a [can-stache stache template]. Whenever stache encounters the [can-stache.tags.escaped double curlies (`{{}}`)],
it looks inside them for an _expression_ to evaluate.

@sourceref ./3.js
@highlight 10,only

`this` inside a stache template refers to the ViewModel instance created for that component, so `{{this.title}}` makes stache
read the `title` property on the component’s ViewModel instance, which is how `<h1>Today’s to-dos</h1>` gets rendered in the page!

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

## Connecting to a backend API

With most frameworks, you might use [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest),
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), or a third-party library to make HTTP requests.

CanJS provides abstractions for connecting to backend APIs so you can:

- Use a standard interface for creating, retrieving, updating, and deleting data.
- Avoid writing the requests yourself.
- Convert raw data from the server to typed data, with properties and methods, _just like a ViewModel_.
- Have your UI update whenever the model data changes.
- Prevent multiple instances of a given object or multiple lists of a given set from being created.

In our app, let’s make a request to get all the to-dos sorted alphabetically by name:

@sourceref ./4.js
@highlight 5-7,15-17,only

The next three sections will more thoroughly explain these lines.

### Importing realtimeRestModel

First, we import [can-realtime-rest-model realtimeRestModel]:

@sourceref ./4.js
@highlight 5,only

This module is responsible for creating new connections to APIs and new data types.

### Creating a new connection

Second, we call `realtimeRestModel()` with a string that represents the URLs that should be called for
creating, retrieving, updating, and deleting data:

@sourceref ./4.js
@highlight 7,only

`/api/todos/{id}` will map to these API calls:

- `GET /api/todos` to retrieve all the to-dos
- `POST /api/todos` to create a to-do
- `GET /api/todos/1` to retrieve the to-do with `id=1`
- `PUT /api/todos/1` to update the to-do with `id=1`
- `DELETE /api/todos/1` to delete the to-do with `id=1`

`realtimeRestModel()` returns what we call a _connection_. It’s just an object that has a `.Map` property.

The `Todo` is a new data type that has these methods for making API calls:

- `Todo.getList()` calls `GET /api/todos`
- `(new Todo()).save()` calls `POST /api/todos`
- `Todo.get({id: 1})` calls `GET /api/todos/1`

Additionally, once you have an instance of a `todo`, you can call these methods on it:

- `todo.save()` calls `PUT /api/todos/1`
- `todo.destroy()` calls `DELETE /api/todos/1`

### Fetching all the to-dos

Third, we add a new getter to our ViewModel:

@sourceref ./4.js
@highlight 15-17,only

`Todo.getList({sort: "name"})` will make a `GET` request to `/api/todos?sort=name`.
It returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that resolves with the data returned by the API.

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

## Rendering a list of items

Now that we’ve learned how to fetch data from an API, let’s render the data in our component!

@sourceref ./5.js
@highlight 13-21,only

This template uses two stache helpers:

- [can-stache.helpers.if #if()] checks whether the result of the expression inside is truthy.
- [can-stache.helpers.for-of #for(of)] loops through an array of values.

This template also shows how we can read the state and value of a Promise:

- `.isResolved` returns `true` when the Promise resolves with a value
- `.value` returns the value with which the Promise was resolved

So first, we check `#if(this.todosPromise.isResolved)` is true. If it is, we loop through all
the to-dos (`#for(todo of this.todosPromise.value)`) and create a `todo` variable in our template.
Then we read `{{todo.name}}` to put the to-do’s name in the list.

## Handling loading and error states

Now let’s also:

- Show “Loading…” when the to-dos list loading
- Show a message if there’s an error loading the to-dos

@sourceref ./6.js
@highlight 13-18,only

This template shows how to read more state and an error from a Promise:

- `.isPending` returns `true` when the Promise has neither been resolved nor rejected
- `.isRejected` returns `true` when the Promise is rejected with an error
- `.reason` returns the error with which the Promise was rejected

`isPending`, `isRejected`, and `isResolved` are all mutually-exclusive; only one of them will be true
at any given time. The Promise will always start off as `isPending`, and then either change to `isRejected`
if the request fails or `isResolved` if it succeeds.

## Creating new items

CanJS makes it easy to create new instances of your model objects and save them to your backend API.

In this section, we’ll add an `<input>` for new to-do names and a button for saving new to-dos.
After a new to-do is created, we’ll reset the input so a new to-do’s name can be entered.

@sourceref ./7.js
@highlight 20-21,32,36-40,only

The next four sections will more thoroughly explain these lines.

### Binding to input form elements

CanJS has one-way and two-way bindings in the form of:

- [can-stache-bindings.twoWay <child-element property:bind="key">] (two-way binding a property on child element and parent ViewModel)
- [can-stache-bindings.toChild <child-element property:from="key">] (one-way binding to a child element’s property)
- [can-stache-bindings.toParent <child-element property:to="key">] (one-way binding to the parent ViewModel)

Let’s examine our code more closely:

@sourceref ./7.js
@highlight 20,only

`value:bind="this.newName"` will create a binding between the input’s `value` property and
the ViewModel’s `newName` property. When one of them changes, the other will be updated.

If you’re wondering where we’ve defined the `newName` in the ViewModel… we’ll get there in just a moment. 😊

### Listening for events

You can listen for events with the [can-stache-bindings.event <child-element on:event="method()">] syntax.

Let’s look at our code again:

@sourceref ./7.js
@highlight 21,only

When the button emits a `click` event, the `save()` method on the ViewModel will be called.

Again, you might be wondering where we’ve defined the `save()` method in the ViewModel… we’ll get there in just a moment. 😊

### Defining custom properties

Earlier we said that a:

> `ViewModel` is an object with properties and methods that provides the data or the _model_ to the _view_.

This is true, although there’s more information to be known. A component’s ViewModel is actually an instance of
[can-define/map/map DefineMap], which is an observable data type used throughout CanJS.

We’ve been defining properties and methods on the ViewModel with the
[standard JavaScript getter and method syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#Defining_method_functions).
Now we’re going to use [can-define.types.propDefinition#String DefineMap’s string syntax] to define
a property as a string:

@sourceref ./7.js
@highlight 32,only

In the code above, we define a new `newName` property on the ViewModel. When this property is set,
if the new value is not `null` or `undefined`, CanJS will convert the new value into a string.

CanJS supports many different types, including `boolean`, `date`, `number`, and more. You can find the
[can-define.types full list of types here].

### Saving new items to the backend API

Now it’s time to define the `save()` method on our ViewModel!

@sourceref ./7.js
@highlight 36-40,only

This code does three things:

1) Creates a new to-do with the name typed into the `<input>` (`const todo = new Todo({name: this.newName})`).
2) Saves the new to-do to the backend API (`todo.save()`).
3) Resets the `<input>` so a new to-do name can be typed in (`this.newName = ""`).

You’ll notice that just like within the stache template, `this` inside the `save()` method refers to the
component’s ViewModel instance. This is how we can both read and write the ViewModel’s `newName` property.

### New items are added to the right place in the sorted list

When `Todo.getList({sort: "name"})` is called, CanJS makes a GET request to `/api/todos?sort=name`

When the array of to-dos comes back, CanJS associates that array with the query `{sort: "name"}`.
When new to-dos are created, they’re added to the list that’s returned _automatically_, and
in the right spot! You don’t have to write any code to make sure the new to-do gets inserted
into the right spot in the list.

CanJS does this for filtering as well. If you make a query with a filter (e.g. `{filter: {complete: true}}`),
when items are added, edited, or deleted that match that filter, those lists will be updated automatically.

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

## Updating existing items

@sourceref ./8.js
@highlight 25-32,49-52,only

### Binding to checkbox form elements

### Checking for equality in templates

### Setting the selected to-do

### Editing to-do names

### Saving changes to an existing to-do

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

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
			<p>Couldn’t load todos; {{this.todosPromise.reason}}</p>
		{{/if}}
		{{#if(this.todosPromise.isResolved)}}
			<input placeholder="What needs to be done?" value:bind="this.newName" />
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
		newName: "string",
		selectedTodo: {},
		get todosPromise() {
			return Todo.getList({sort: "name"});
		},
		save() {
			const todo = new Todo({name: this.newName});
			todo.save();
			this.newName = "";
		},
		saveTodo(todo) {
			todo.save();
			this.selectedTodo = null;
		}
	}
});
```

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We’re always happy to help!

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

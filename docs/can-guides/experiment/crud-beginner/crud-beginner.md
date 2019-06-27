@page guides/crud-beginner CRUD Guide
@parent guides/getting-started 1
@templateRender <% %>
@description Learn how to build a basic CRUD app with CanJS in 30 minutes.

@body

## Overview

In this tutorial, we’ll build a simple to-do app that lets you:

- Load a list of to-dos from an API
- Create new to-dos with a form
- Mark to-dos as “completed”
- Delete to-dos

<p class="codepen" data-height="536" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="omqyMw" style="height: 536px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 5 — Basic Todo App">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/omqyMw/">
  CanJS 5 — Basic Todo App</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p><br>

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
</p><br>

The next two sections will explain what’s already in the HTML and JS tabs in the CodePen.

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

> **Note:** if you open your browser’s Network panel, you will *not* see any network requests.
> You can see the fixture requests and responses in your browser’s Console panel.

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

@sourceref ./2.js
@highlight 5,only

Here’s what the different parts mean:

- `import` is a keyword that [loads modules from files](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).
- `Component` is the _named export_ from CanJS that lets us [can-component define custom elements].
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

- [can-component.prototype.tag `tag`] is the name of the custom element.
- [can-component.prototype.view `view`] is a [can-stache stache template] that gets parsed by CanJS and inserted into the custom element; more on that later.
- [can-component.prototype.ViewModel `ViewModel`] is an object (with properties and methods) from which the _view_ gets its _model_ data.

The `view` is pretty boring right now; it just renders `<h1>Today’s to-dos</h1>`. In the next section, we’ll make it more interesting!

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We answer every question and we’re eager to help!

## Rendering a template with a ViewModel

A component’s [can-component.prototype.view] gets rendered with a [can-component.prototype.ViewModel].

Let’s update our component to be a little more interesting:

@sourceref ./3.js
@highlight 10,13-15,only

Using this component will insert the following into the page:

```html
<todos-app>
	<h1>Today’s to-dos!</h1>
</todos-app>
```

The next two sections will explain these lines.

### Defining properties on the ViewModel

Every time a component’s custom element is used, a new instance of the component’s `ViewModel` is created.

We’ve added a `title` [can-define.types.propDefinition#GETTER getter]
to our `ViewModel`, which returns the string `"Today’s to-dos!"`:

@sourceref ./3.js
@highlight 13-15,only

### Reading properties in the stache template

Our `view` is a [can-stache stache template]. Whenever stache encounters the [can-stache.tags.escaped double curlies (`{{ }}`)],
it looks inside them for an _expression_ to evaluate.

@sourceref ./3.js
@highlight 10,only

`this` inside a stache template refers to the ViewModel instance created for that component, so `{{ this.title }}` makes stache
read the `title` property on the component’s ViewModel instance, which is how `<h1>Today’s to-dos!</h1>` gets rendered in the page!

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We answer every question and we’re eager to help!

## Connecting to a backend API

With most frameworks, you might use [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest),
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), or a third-party library to make HTTP requests.

CanJS provides abstractions for connecting to backend APIs so you can:

- Use a standard interface for creating, retrieving, updating, and deleting data.
- Avoid writing the requests yourself.
- Convert raw data from the server to typed data, with properties and methods, _just like a ViewModel_.
- Have your UI update whenever the model data changes.
- Prevent multiple instances of a given object or multiple lists of a given set from being created.

In our app, let’s make a request to get all the to-dos sorted alphabetically by name. Note that we won’t
see any to-dos in our app yet; we’ll get to that in just a little bit!

@sourceref ./4.js
@highlight 5-7,15-17,only

The next three sections will explain these lines.

### Importing realtimeRestModel

First, we import [can-realtime-rest-model realtimeRestModel]:

@sourceref ./4.js
@highlight 5,only

This module is responsible for creating new connections to APIs and new models (data types).

### Creating a new model

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

The `Todo` is a new model that has these methods for making API calls:

- `Todo.getList()` calls `GET /api/todos`
- `new Todo().save()` calls `POST /api/todos`
- `Todo.get({id: 1})` calls `GET /api/todos/1`

Additionally, once you have an instance of a `todo`, you can call these methods on it:

- `todo.save()` calls `PUT /api/todos/1`
- `todo.destroy()` calls `DELETE /api/todos/1`

> **Note:** the [api#DataModeling Data Modeling section in the API Docs] has a cheat sheet with
> each JavaScript call, the HTTP request that’s made, and the expected JSON response.

### Fetching all the to-dos

Third, we add a new getter to our ViewModel:

@sourceref ./4.js
@highlight 15-17,only

`Todo.getList({sort: "name"})` will make a `GET` request to `/api/todos?sort=name`.
It returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that resolves with the data returned by the API.

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We answer every question and we’re eager to help!

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
Then we read `{{ todo.name }}` to put the to-do’s name in the list.

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

The next four sections will explain these lines.

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

> [can-component.prototype.ViewModel `ViewModel`] is an object (with properties and methods) from which the _view_ gets its _model_ data.

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

Now let’s look at the `save()` method on our ViewModel:

@sourceref ./7.js
@highlight 36-40,only

This code does three things:

1) Creates a new to-do with the name typed into the `<input>` (`const todo = new Todo({name: this.newName})`).
2) Saves the new to-do to the backend API (`todo.save()`).
3) Resets the `<input>` so a new to-do name can be typed in (`this.newName = ""`).

You’ll notice that just like within the stache template, `this` inside the `save()` method refers to the
component’s ViewModel instance. This is how we can both read and write the ViewModel’s `newName` property.

### New items are added to the right place in the sorted list

When `Todo.getList({sort: "name"})` is called, CanJS makes a GET request to `/api/todos?sort=name`.

When the array of to-dos comes back, CanJS associates that array with the query `{sort: "name"}`.
When new to-dos are created, they’re automatically added to the right spot in the list that’s returned.

**Try adding a to-do in your CodePen!** You don’t have to write any code to make sure the new to-do gets inserted
into the right spot in the list.

CanJS does this for filtering as well. If you make a query with a filter (e.g. `{filter: {complete: true }}`),
when items are added, edited, or deleted that match that filter, those lists will be updated automatically.

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We answer every question and we’re eager to help!

## Updating existing items

CanJS also makes it easy to update existing instances of your model objects and save them to your backend API.

In this section, we’ll add an `<input type="checkbox">` for marking a to-do as complete.
We’ll also make it possible to click on a to-do to select it and edit its name.
After either of these changes, we’ll save the to-do to the backend API.

@sourceref ./8.js
@highlight 25-32,40,49-52,only

The next four sections will more thoroughly explain the code above.

### Binding to checkbox form elements

Every [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox `<input type="checkbox">`]
has a `checked` property. We [can-stache-bindings.twoWay bind] to it so if `todo.complete` is true or false,
the checkbox is either checked or unchecked, respectively.

Additionally, when the checkbox is clicked, `todo.complete` is updated to be `true` or `false`.

@sourceref ./8.js
@highlight 25,only

We also listen for [change](https://developer.mozilla.org/en-US/docs/Web/Events/change) events with the
[can-stache-bindings.event on:event] syntax. When the input’s value changes, the
[can-connect/can/map/map.prototype.save `save()`] method on the `todo` is called.

### Checking for equality in templates

This section uses two stache helpers:

- [can-stache.helpers.eq #eq()] checks whether all the arguments passed to it are `===`
- [can-stache.helpers.else {{ else }}] will only render if `#eq()` returns `false`

@sourceref ./8.js
@highlight 26,28,32,only

The code above checks whether `todo` is equal to `this.selected`. We haven’t added `selected`
to our ViewModel yet, but we will in the next section!

### Setting the selected to-do

When you listen for events with the [can-stache-bindings.event on:event] syntax, you can
also [can-stache-bindings.event#on_VIEW_MODEL_OR_DOM_EVENT__KEY_VALUE_ set property values].

Let’s examine this part of the code:

@sourceref ./8.js
@highlight 29-31,40,only

`on:click="this.selected = todo"` will cause the ViewModel’s `selected` property to be set
to the `todo` when the `<span>` is clicked.

The template above also changes the span’s class depending on [can-stache.helpers.if if]
`todo.complete` is true or false.

Additionally, we add [can-define.types.propDefinition#function__ `selected: Todo`]
to the ViewModel. In our app, we only ever set `selected` to an instance of a `Todo`,
but if we were to set it to a plain object, a new `Todo` instance would be created with that object.

### Editing to-do names

After you click on a to-do’s name, we want the `<span>` to be replaced with an `<input>` that has the
to-do’s name (and immediately give it focus). When the input loses focus, we want the to-do to be saved
and the input to be replaced with the span again.

@sourceref ./8.js
@highlight 27,49-52,only

Let’s break down the code above:

- `focused:from="true"` will set the input’s `focused` attribute to `true`, immediately giving the input focus
- `on:blur="this.saveTodo(todo)"` listens for the [blur event](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event) (the input losing focus) so the ViewModel’s `saveTodo()` method is called
- `value:bind="todo.name"` binds the input’s value to the `name` property on the `todo`
- `saveTodo(todo)` in the ViewModel will call [can-connect/can/map/map.prototype.save `save()`] on the `todo` and reset the ViewModel’s `selected` property (so the input will disappear and just the to-do’s name is displayed)

> Find something confusing or need help? [Join our Slack](https://bitovi.com/community/slack) and post a question
> in the [#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A). We answer every question and we’re eager to help!

## Deleting items

Now there’s just one more feature we want to add to our app: deleting to-dos!

@sourceref ./9.js
@highlight 33,only

When the `<button>` is clicked, the to-do’s [can-connect/can/map/map.prototype.destroy destroy]
method is called, which will make a `DELETE /api/todos/{id}` call to delete the to-do in the
backend API.

## Result

Congrats! You’ve built your first app with CanJS and learned all the basics.

Here’s what your finished CodePen will look like:

<p class="codepen" data-height="536" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="omqyMw" style="height: 536px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 5 — Basic Todo App">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/omqyMw/">
  CanJS 5 — Basic Todo App</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

## Next steps

If you’re ready to go through another guide, check out the [guides/chat], which will walk you through
building a real-time chat app. The [guides/todomvc] is also another great guide to go through if you’re
not sick of building to-do apps. ☑️

If you’d rather learn about CanJS’s core technologies, the [guides/technology-overview] shows you the
basics of how CanJS works. From there, the [guides/html], [guides/routing], and [guides/data] guides
offer more in-depth information on how CanJS works.

If you haven’t already, [join our Slack](https://bitovi.com/community/slack) and come say hello in the
[#introductions channel](https://bitovi-community.slack.com/messages/CFMMLPNV7). We also have a
[#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A) for any comments or questions about CanJS.
We answer every question and we’re eager to help!

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

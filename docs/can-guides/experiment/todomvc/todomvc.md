@page guides/todomvc TodoMVC Guide
@parent guides/experiment 2
@templateRender <% %>

@description This guide will walk you through building a slightly modified version of [http://todomvc.com/ TodoMVC] with CanJS’s [can-core Core libraries]
and [can-fixture]. It takes about 1 hour to complete.

@body

## Setup

The easiest way to get started is to fork the following CodePen by clicking the __CodePen__ button on the top right:

<p class="codepen" data-height="520" data-theme-id="0" data-default-tab="html,result" data-user="bitovi" data-slug-hash="LYPWwNK" style="height: 520px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 - TodoMVC Start">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPWwNK/">
  CanJS 6.0 - TodoMVC Start</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The CodePen starts
with the static HTML and CSS a designer might turn over to a JS developer. We will be
adding all the JavaScript functionality.

Read [guides/setup] for instructions on alternate CanJS setups.

## Define and use the main component

### the problem

In this section, we will define a custom `<todo-mvc>` element and use it
in the page’s HTML.

### the solution

Replace the content of the __HTML__ tab with the `<todo-mvc>` element:

@sourceref ./1-create-template/html.html
@highlight 1

Update the `JavaScript` tab to define the `<todo-mvc>` element by:

 - Extending [can-stache-element StacheElement] and registering a custom element 
    with the tag name `todo-mvc`.
 - Setting the [can-stache-element#Defininganelement_sview view] to the html that should be displayed within
   the `<todo-mvc>` element. In this case it is the HTML that was originally in the page.
 - Instead of the hard-coded `<h1>Todos</h1>` title, we will read the title
   from the element’s properties. We'll do this by:
   - Adding magic tags like `{{ this.appName }}` that read `appTitle` from the element’s properties.
   - Defining an `appName` property that [can-observable-object/define/default]s to `"TodoMVC"`.

@sourceref ./1-create-template/js.js
@highlight 3-4,7,62-64,66


When complete, you should see the same content as before.  Only now, it’s
rendered with a live-bound stache template.  The live binding means that
when the template’s data is changed, it will update automatically. You can see this by entering the
following in the console:

```js
document.querySelector("todo-mvc").appName = "My Todos";
```


## Define the todos type and show the active and complete count

### the problem

In this section, we will:

 - Create a list of todos and show them.
 - Show the number of active (`complete === true`) and complete todos.
 - Connect a todo’s `complete` property to a checkbox so that when
   we toggle the checkbox the number of active and complete todos changes.

### the solution

In the `JavaScript` tab:

 - Define a `Todo` type with [can-observable-object ObservableObject].
 - Define a `Todo.List` type along with an `active` and `complete` property with [can-observable-array ObservableArray].

In `<todo-mvc>`’s props:

 - Create a list of todos and pass those to the template.

In `<todo-mvc>`’s `view`:

- Use [can-stache.helpers.for-of `{{# for(of) }}`] to loop through every todo.
- Add `completed` to the `<li>`’s `className` if the `<li>`’s todo is complete.
- Use [can-stache-bindings.twoWay `checked:bind`] to two-way bind the checkbox’s `checked` property to its todo’s `complete` property.  
- Use [can-stache.tags.escaped `{{ todo.name }}`] to insert the value todo’s `name` as the content of the `<label>` and
  `value` of the text `<input>`.
- Insert the active and complete number of todos.

@sourceref ./2-items-left/js.js
@highlight 1,3-9,11-23,36-45,50,64,72-80,only


When complete, you should be able to toggle the checkboxes and see the number of
items left and the completed count change automatically. This is because
[can-stache] is able to listen for changes in observables like [can-observable-object ObservableObject] and [can-observable-array ObservableArray].

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left/completed.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left/completed.webm" type="video/webm">
</video>


## Get todos from the server

### the problem

In this section, we will:

 - Load todos from a RESTful service.
 - Fake that RESTful service.

### the solution

In the `Todo` type:

- Specify `id` as the [can-observable-object/define/identity] property of the `Todo` type.

Update the `JavaScript` tab to:

- Create a fake data store that is initialized with data for 3 todos with [can-fixture.store].
- Trap AJAX requests to `"/api/todos"` and provide responses with the data from the fake data store with [can-fixture].
- Connect the `Todo` and `Todo.List` types to the RESTful `"/api/todos"` endpoint using [can-realtime-rest-model].  This allows you to load, create, update, and destroy todos
on the server.

In `<todo-mvc>`’s `props`:

- Use [can-connect/can/map/map.getList] to load a list of all todos on the server. The result
  of `getList` is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to a `Todo.List` with the todos returned from the fake data store.  That [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
  is available to the template as `this.todosPromise`.

In `<todo-mvc>`’s `view`:

 - Use [can-stache.helpers.for-of `{{# for(todo of todosPromise.value) }}`] to loop through the promise’s resolved value, which is the list of todos returned by the server.
 - Read the active and completed number of todos from the promise’s resolved value.


@sourceref ./3-models/js.js
@highlight 2,5,12,32-48,61,75,89,97-99,only

When complete, you’ll notice a 1 second delay before seeing the list of todos as
they load from the fixtured data store.


## Destroy todos

### the problem

In this section, we will:

 - Delete a todo on the server when its destroy button is clicked.
 - Remove the todo from the page after it’s deleted.

### the solution

Update `<todo-mvc>`’s `view` to:

 - Add `destroying` to the `<li>`’s `className` if the `<li>`’s todo is being destroyed using [can-connect/can/map/map.prototype.isDestroying].
 - Call the `todo`’s [can-connect/can/map/map.prototype.destroy] method when the `<button>` is clicked using [can-stache-bindings.event `on:click`].

@sourceref ./4-destroy/js.js
@highlight 63,67,only

When complete, you should be able to delete a todo by clicking its delete button.  After
clicking the todo, its name will turn red and italic.  Once deleted, the todo will be
automatically removed from the page.  

The deleted todo is automatically removed from the page because [can-realtime-rest-model] adds the [can-connect/real-time/real-time] behavior.  The
[can-connect/real-time/real-time] behavior automatically updates lists (like `Todo.List`) when instances
are created, updated or destroyed.  

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/4-destroy/completed.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/4-destroy/completed.webm" type="video/webm">
</video>

## Create todos

### the problem

In this section, we will:

 - Define a custom `<todo-create>` element that can create todos on the server.
 - Use that custom element.

### the solution

The `<todo-create>` component will respond to a user hitting the `enter`
key. The [can-event-dom-enter] event provides this functionality, but it
is an [can-ecosystem] module.  So to use the enter event we need to:

- Import [can-event-dom-enter enterEvent] from `everything.mjs` (which includes `enterEvent`) instead of `core.mjs`.
- Import [can-dom-events domEvents] (CanJS’s global event registry).
- Add the `enterEvent` to `domEvents`.

Update the `JavaScript` tab to define a `<todo-create>` component with the following:

- A [can-stache-element#Defininganelement_sview view] that:
  - Updates the `todo`’s `name` with the `<input>`’s `value` using [can-stache-bindings.twoWay `value:bind`].
  - Calls `createTodo` when the `enter` key is pressed using   [can-event-dom-enter `on:enter`].
- The following [can-stache-element.html#Defininganelement_sproperties props]:
  - A `todo` property that holds a new `Todo` instance.
  - A `createTodo` method that [can-connect/can/map/map.prototype.save]s the `Todo` instance and replaces it with a new one once saved.

Update `<todo-mvc>`’s `view` to:

- Use the `<todo-create>` component.

This results in the following code:


@sourceref ./5-create/js.js
@highlight 8-10,54-77,84,only


When complete, you will be able to create a todo by typing the name of the todo and pressing
`enter`. Notice that the new todo automatically appears in the list of todos. This
is also because [can-realtime-rest-model] automatically inserts newly created items into lists that they belong within.


## List todos

### the problem

In this section, we will:

 - Define a custom element for showing a list of todos.
 - Use that custom element by passing it the list of fetched todos.

### the solution

Update the `JavaScript` tab to:

- Define a `<todo-list>` component with:
  - A `todos` property that should be provided by the parent element.
  - A view that loops through a list of `todos` (instead of `todosPromise.value`).
- In `<todo-mvc>`’s view, create a `<todo-list>` element and set its `todos` property to the resolved value of `todosPromise`
  using [can-stache-bindings.toChild `todos:from='this.todosPromise.value'`].

@sourceref ./6-list/js.js
@highlight 79-100,112,only

When complete, everything should work the same. We didn’t add any new functionality, we
just moved code around to make it more isolated, potentially reusable, and more maintainable.


## Edit todos

### the problem

In this section, we will:

 - Make it possible to edit a todo’s `name` and save that change to the server.

### the solution

Update the `<todo-list>`’s `view` to:

- Use the `isEditing` method to add `editing` to the `className` of the `<li>` being edited.
- When the checkbox changes, update the todo on the server with [can-connect/can/map/map.prototype.save],
- Call `edit` with the current `todo`.
- Set up the edit input to:
  - Two-way bind its value to the current todo’s `name` using [can-stache-bindings.twoWay `value:bind`].
  - Call `updateName` when the enter key is pressed using [can-stache-bindings.event `on:enter`].
  - Focus the input when `isEditing` is true using the special [can-util/dom/attr/attr.special.focused] attribute.
  - Call `cancelEdit` if the input element loses focus.

Update the `<todo-list>`’s `props` to include the methods and properties needed to edit a todo’s name, including:

   - An `editing` property of type `Todo` that stores which todo is being edited.
   - A `backupName` property that stores the todo’s name before being edited.
   - An `edit` method that sets up the editing state.
   - A `cancelEdit` method that undos the editing state if in the editing state.
   - An `updateName` method that updates the editing todo and [can-connect/can/map/map.prototype.save saves] it to the server.

@sourceref ./7-edit/js.js
@highlight 84-85,87-92,96-103,111,112,115-134,only


When complete, you should be able to edit a todo’s name.

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/7-edit/edit.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/7-edit/edit.webm" type="video/webm">
</video>

## Routing

### the problem

In this section, we will:

 - Make it possible to use the browser’s forwards and backwards buttons to change
 between showing all todos, only active todos, or only completed todos.
 - Add links to change between showing all todos, only active todos, or only completed todos.
 - Make those links bold when the site is currently showing that link.

### the solution

Update the `JavaScript` tab to:

- Import [can-route route].

Update `<todo-mvc>`’s `view` to:

- Set the page links `href`s to a URL that will set the desired properties on [can-route.data route.data] when clicked using
  [can-stache-route-helpers.routeUrl].
- Add `class='selected'` to the link if the current route matches the current properties on [can-route.data route.data]
  using [can-stache-route-helpers.routeCurrent].

Update `<todo-mvc>`’s `props` to:

- Provide access to the observable [can-route.data route.data] by:
  - Defining a `routeData` property whose value is [can-route.data route.data].
  - Create a pretty routing rule so if the URL looks like `"#!active"`, the `filter` property of
    `route.data` will be set to `"active"` with [can-route.register route.register].
  - Initialize [can-route.data route.data]’s values with [can-route.start route.start()].
- Change `todosPromise` to check if `this.routeData.filter` is:
  - `falsy` - then return all todos.
  - `"complete"` - then return all complete todos.
  - `"incomplete"` - then return all incomplete todos.

@sourceref ./8-routing/js.js
@highlight 10,157-158,161-162,165-166,178-184,186-192,only


When complete, you should be able to click the `All`, `Active`, and `Completed` links and
see the right data.

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/8-routing/routing.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/8-routing/routing.webm" type="video/webm">
</video>

## Toggle all and clear completed

### the problem

In this section, we will:

- Make the `toggle-all` button change all todos to complete or incomplete.
- Make the `clear-completed` button delete all complete todos.

### the solution

Add the following to the `Todo.List` model:

- An `allComplete` property that returns `true` if every todo is complete.
- A `saving` property that returns todos that are being saved using [can-connect/can/map/map.prototype.isSaving].
- An `updateCompleteTo` method that updates every todo’s `complete` property to the specified value and updates the compute on the server with [can-connect/can/map/map.prototype.save].
- A `destroyComplete` method that deletes every complete todo with [can-connect/can/map/map.prototype.destroy].

Update `<todo-mvc>`’s `view` to:

- Cross bind the `toggle-all` `<input>`’s `checked` property to the `<todo-mvc>`’s `allChecked` property.
- Disable the `toggle-all` button while any todo is saving.
- Call the `Todo.List`’s `destroyComplete` method when the `clear-completed` button is clicked on.

Update `<todo-mvc>`’s `props` to include:

- A `todosList` property that gets its value from the `todosPromise` using an [can-observable-object/define/async asynchronous getter].
- An `allChecked` property that returns `true` if every todo is complete.  The property can also be set to `true` or `false` and it will set every todo to that value.

@sourceref ./9-toggle/js.js
@highlight 35-57,172-177,199,224-235,only




When complete, you should be able to toggle all todos `complete` state and
delete the completed todos.  You should also have a really good idea how CanJS works!

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/9-toggle/toggle.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/9-toggle/toggle.webm" type="video/webm">
</video>

## Result

When finished, you should see something like the following CodePen:

<p class="codepen" data-height="526" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="xxKgQdy" style="height: 526px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 - TodoMVC End">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/xxKgQdy/">
  CanJS 6.0 - TodoMVC End</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

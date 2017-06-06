@page guides/todomvc TodoMVC Guide
@parent guides/experiment 2
@templateRender <% %>

@description This guide will walk you through building a slightly modified version of [TodoMVC](http://todomvc.com/) with CanJS’s [can-core Core libraries]
and [can-fixture]. It takes about 1 hour to complete.

@body

## Setup

The easiest way to get started is to clone the following JS&nbsp;Bin by clicking the __JS&nbsp;Bin__ button on the top left:


<a class="jsbin-embed" href="//jsbin.com/sasuje/11/embed?html,output">JS Bin on jsbin.com</a>

The JS Bin starts
with the static HTML and CSS a designer might turn over to a JS developer. We will be
adding all the JavaScript functionality.

The JS Bin also loads [can.all.js](https://unpkg.com/can@3/dist/global/can.all.js), which is a script that includes all of CanJS core, ecosystem, legacy and infrastructure libraries under a
single global `can` namespace.

Generally speaking, you should not use the global `can` script, but instead you
should import things directly with a module loader like [StealJS](https://stealjs.com),
WebPack or Browserify.  In a real app, your code will look like:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");

var Todo = DefineMap.extend({ ... });
Todo.List = DefineList.extend({ ... });
```

Not:

```js
var Todo = can.DefineMap.extend({ ... });
Todo.List = can.DefineList.extend({ ... });
```

Read [guides/setup] for instructions on how to set up CanJS in a real app.

## Create and render the template

In this section, we will render the markup in a [can-stache] live-bound template.  

Update the `HTML` tab to have a `<script>` tag around the html content.

@sourceref ./1-create-template/html.html
@highlight 11,67,only

Update the `JavaScript` tab to:

 - Use [can-stache.from can-stache.from] to load the contents of the `<script>` tag as
 a [can-stache.renderer template renderer function].
 - Render the template with an empty object into a [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment).
 - Insert the fragment into the document’s `<body>` element.

To load, render, and add this template to the
body, add the following to the `JavaScript` tab:

@sourceref ./1-create-template/js.js
@highlight 1-3,only


When complete, you should see the same content as before.  Only now, it’s
rendered with a live-bound stache template.  The live binding means that
when the template’s data is changed, it will update automatically. We’ll see
that in the next step.


## Define the todos type and show the active and complete count

In this section, we will:

 - Create a list of todos and show them.
 - Show the number of active (`complete === true`) and complete todos.
 - Connect a todo’s `complete` property to a checkbox so that when
   we toggle the checkbox the number of active and complete todos changes.


Update the `JavaScript` tab to:

 - Define a `Todo` type with [can-define/map/map].
 - Define a `Todo.List` type along with an `active` and `complete` property with [can-define/list/list].
 - Create a list of todos and pass those to the template.

@sourceref ./2-items-left/js.js
@highlight 1-21,24,only

Update the `HTML` tab to:

- Use [can-stache.helpers.each `{{#each todos}}`] to loop through every todo.
- Add `completed` to the `<li>`’s `className` if the `<li>`’s todo is complete.
- Use [can-stache-bindings.twoWay `{($checked)}`] to two-way bind the checkbox’s `checked` property to its todo’s `complete` property.  
- Use [can-stache.tags.escaped `{{name}}`] to insert the value todo’s `name` as the content of the `<label>` and
  `value` of the text `<input/>`.
- Insert the active and complete number of todos.

@sourceref ./2-items-left/html.html
@highlight 21-30,35,49,only

When complete, you should be able to toggle the checkboxes and see the number of
items left and the completed count change automatically.  This is because
[can-stache] is able to listen for changes in observables like [can-define/map/map],
[can-define/list/list] and [can-compute].

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left/completed.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left/completed.webm" type="video/webm">
</video>


## Get todos from the server

In this section, we will:

 - Load todos from a RESTful service.
 - Fake that RESTful service.


Update the `JavaScript` tab to:

- Define what the RESTful service layer’s parameters are with [can-set.Algebra can-set.Algebra].
- Create a fake data store that is initialized with data for 3 todos with [can-fixture.store].
- Trap AJAX requests to `"/api/todos"` and provide responses with the data from the fake data store with [can-fixture].
- Connect the `Todo` and `Todo.List` types to the RESTful `"/api/todos"` endpoint using [can-connect/can/super-map/super-map].  This allows you to load, create, update, and destroy todos
on the server.
- Use [can-connect/can/map/map.getList] to load a list of all todos on the server. The result
  of `getList` is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to a `Todo.List` with the todos returned from the fake data store.  That `Promise`
  is passed to the template as `todosPromise`.


@sourceref ./3-models/js.js
@highlight 1-15,33-39,42,only

Update the `HTML` tab to:

 - Use [can-stache.helpers.each `{{#each todosPromise.value}}`] to loop through the promise’s resolved value, which
   is the list of todos returned by the server.
 - Read the active and completed number of todos from the promise’s resolved value.


@sourceref ./3-models/html.html
@highlight 21,35,49,only

When complete, you’ll notice a 1 second delay before seeing the list of todos as
they load for the first time from the fixtured data store. On future page reloads, the
list of todos will load immediately.  This is because [can-connect/can/super-map/super-map] adds the [can-connect/fall-through-cache/fall-through-cache] behavior.  The
[can-connect/fall-through-cache/fall-through-cache] behavior stores loaded data in
`localStorage`.  Future requests will hit `localStorage` for data first and present that data
to the user before making a request to the server and updating the original data with
any changes.  Use `localStorage.clear()` to see the difference.


## Destroy todos

In this section, we will:

 - Delete a todo on the server when its destroy button is clicked.
 - Remove the todo from the page after it’s deleted.

Update the `HTML` tab to:

 - Add `destroying` to the `<li>`’s `className` if the `<li>`’s todo is being destroyed using [can-connect/can/map/map.prototype.isDestroying].
 - Call the `todo`’s [can-connect/can/map/map.prototype.destroy] method when the `<button>` is clicked using [can-stache-bindings.event `($click)`].

@sourceref ./4-destroy/html.html
@highlight 22-23,27,only

When complete, you should be able to delete a todo by clicking its delete button.  After
clicking the todo, its name will turn red and italic.  Once deleted, the todo will be
automatically removed from the page.  

The deleted todo is automatically removed from the page because [can-connect/can/super-map/super-map] adds the [can-connect/real-time/real-time] behavior.  The
[can-connect/real-time/real-time] behavior automatically updates lists (like `Todo.List`) when instances
are created, updated or destroyed.  If you’ve created the right [can-set.Algebra], you
shouldn’t have to manage lists yourself.

Finally, if you click “Run with JS” after deleting a todo, you’ll notice the page temporarily shows fewer items.
This is because the fall-through cache’s data is shown before the response from fixtured data store
is used.

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/4-destroy/completed.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/4-destroy/completed.webm" type="video/webm">
</video>

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


@sourceref ./5-create/js.js
@highlight 42-55,only

Update the `HTML` tab to:

 - Create the `todo-create-template` that:
   - Updates the `todo`’s `name` with the `<input>`’s `value` using [can-stache-bindings.twoWay `{($value)}`].
   - Calls `createTodo` when the `enter` key is pressed using [can-stache-bindings.event `($enter)`].
 - Use `<todo-create/>`

@sourceref ./5-create/html.html
@highlight 11-16,22,only

When complete, you will be able to create a todo by typing the name of the todo and pressing
`enter`. Notice that the new todo automatically appears in the list of todos. This
is also because [can-connect/can/super-map/super-map] adds the [can-connect/real-time/real-time] behavior.  The
[can-connect/real-time/real-time] behavior automatically inserts newly created items into
lists that they belong within.


## List todos

In this section, we will:

 - Define a custom element for showing a list of todos.
 - Use that custom element by passing it the list of fetched todos.

Update the `JavaScript` tab to:

 - Create a `TodoListVM` view model type which has a `todos` property of type `Todo.List`.
 - Use [can-component] to define a `<todo-list>` element.

@sourceref ./6-list/js.js
@highlight 56-64,only

Update the `HTML` tab to:

 - Create the `todo-list-template` that loops through a list of `todos` (instead of `todosPromise.value`).
 - Create a `<todo-list>` element and set its `todos` property to the resolved value of `todosPromise`
   using [can-stache-bindings.toChild `{todos}`].

@sourceref ./6-list/html.html
@highlight 18-32,43,only

When complete, everything should work the same. We didn’t add any new functionality, we
just moved code around to make it more isolated, potentially reusable, and more maintainable.


## Edit todos

In this section, we will:

 - Make it possible to edit a todo’s `name` and save that change to the server.

Update the `JavaScript` tab to:

 - Update the `TodoListVM` to include the methods and properties needed to edit a todo’s name, including:
   - An `editing` property of type `Todo` that stores which todo is being edited.
   - A `backupName` property that stores the todo’s name before being edited.
   - An `edit` method that sets up the editing state.
   - A `cancelEdit` method that undos the editing state if in the editing state.
   - An `updateName` method that updates the editing todo and [can-connect/can/map/map.prototype.save saves] it to the server.

@sourceref ./7-edit/js.js
@highlight 58-76,only


Update the `HTML` tab to:

 - Use the `isEditing` method to add `editing` to the `className` of the `<li>` being edited.
 - When the checkbox changes, update the todo on the server with [can-connect/can/map/map.prototype.save],
 - Call `edit` with the current context using [can-stache/keys/this].
 - Set up the edit input to:
   - Two-way bind its value to the current todo’s `name` using [can-stache-bindings.twoWay `{($value)}`].
   - Call `updateName` when the enter key is pressed using [can-stache-bindings.event `($enter)`].
   - Focus the input when `isEditing` is true using the special [can-util/dom/attr/attr.special.focused] attribute.
   - Call `cancelEdit` if the input element loses focus.

@sourceref ./7-edit/html.html
@highlight 22-23,25-27,30-34,only

When complete, you should be able to edit a todo’s name.

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/7-edit/edit.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/7-edit/edit.webm" type="video/webm">
</video>

## Routing

In this section, we will:

 - Make it possible to use the browser’s forwards and backwards buttons to change
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
 - Create a pretty routing rule so if the url looks like `"#!active"`, the `filter` property of
   `appVM` will be set to `filter` with [can-route].
 - Initialize the url’s values on `appVM` and set up the two-way connection with [can-route.ready].
 - Render the `todomvc-template` with the `appVM`.


@sourceref ./8-routing/js.js
@highlight 85-99,102,only

Update the `HTML` tab to:

 - Set `href` to a url that will set the desired properties on `appVM` when clicked.
 - Add `class='selected'` to the link if the current route matches the current properties of the `appVM` using [can-stache.helpers.routeCurrent].

@sourceref ./8-routing/html.html
@highlight 57-58,61-62,65-66,only

When complete, you should be able to click the `All`, `Active`, and `Completed` links and
see the right data.  When you click from `All` to `Active` or from `All` to `Completed`,
you’ll notice that the list of todos is updated immediately, despite a request being made.
This is because the [can-connect/fall-through-cache/fall-through-cache] is able to make use
of the data loaded for the `All` todos page.  It’s able to filter out the `Active` and
`Completed` data.

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/8-routing/routing.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/8-routing/routing.webm" type="video/webm">
</video>

## Toggle all and clear completed

In this section, we will:

- Make the `toggle-all` button change all todos to complete or incomplete.
- Make the `clear-completed` button delete all complete todos.

Update the `JavaScript` tab to:

- Add the following properties and methods to `Todo.List`:
  - An `allComplete` property that returns `true` if every todo is complete.
  - A `saving` property that returns todos that are being saved using [can-connect/can/map/map.prototype.isSaving].
  - An `updateCompleteTo` method that updates every todo’s `complete` property to the specified value and updates the compute on the server with [can-connect/can/map/map.prototype.save].
  - A `destroyComplete` method that deletes every complete todo with [can-connect/can/map/map.prototype.destroy].
- Adds the following properties to `AppVM`:
  - A `todosList` property that gets its value from the `todosPromise` using an [can-define.types.get asynchronous getter].
  - An `allChecked` property that returns `true` if every todo is complete.  The property can also be set to `true` or `false` and it will set every todo to that value.

@sourceref ./9-toggle/js.js
@highlight 31-49,113-123,only

Update the `HTML` tab to:

- Cross bind the `toggle-all`’s `checked` property to the `appVM`’s `allChecked` property.
- Disable the `toggle-all` button while any todo is saving.
- Call the `Todo.List`’s `destroyComplete` method when the `clear-completed` button is clicked on.

@sourceref ./9-toggle/html.html
@highlight 47-49,71-72,only

When complete, you should be able to toggle all todos `complete` state and
delete the completed todos.  You should also have a really good idea how CanJS works!

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/9-toggle/toggle.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/9-toggle/toggle.webm" type="video/webm">
</video>

## Result

When finished, you should see something like the following JS&nbsp;Bin:

<a class="jsbin-embed" href="//jsbin.com/labajog/1/embed?html,js,output">JS Bin on jsbin.com</a>

<script src="https://static.jsbin.com/js/embed.min.js?3.39.15"></script>

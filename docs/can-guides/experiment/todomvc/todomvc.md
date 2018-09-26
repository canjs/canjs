@page guides/todomvc TodoMVC Guide
@parent guides/experiment 2
@templateRender <% %>

@description This guide will walk you through building a slightly modified version of [http://todomvc.com/ TodoMVC] with CanJS’s [can-core Core libraries]
and [can-fixture]. It takes about 1 hour to complete.

@body

## Setup

The easiest way to get started is to fork the following CodePen by clicking the __CodePen__ button on the top right:

<p data-height="500" data-theme-id="0" data-slug-hash="VGJNMK" data-default-tab="html,result" data-user="justinbmeyer" data-pen-title="CanJS 5.0 - TodoMVC Start" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/VGJNMK/">CanJS 5.0 - TodoMVC Start</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>


The CodePen starts
with the static HTML and CSS a designer might turn over to a JS developer. We will be
adding all the JavaScript functionality.

The CodePen also imports [core.mjs](https://unpkg.com/can@5/core.mjs), which is a script that includes
all of CanJS's [can-core core] and [can-infrastructure infrastructure] modules as named exports.

Read [guides/setup] for instructions on alternate CanJS setups.

## Define and use the main component

In this section, we will define a custom `<todo-mvc>` element and use it
in the page's HTML.

Replace the content of the __HTML__ tab with the `<todo-mvc>` element:

@sourceref ./1-create-template/html.html
@highlight 1

Update the `JavaScript` tab to define the `<todo-mvc>` element by:

 - Extending [can-component Component] with a [can-component.prototype.tag] that matches the
   custom element we are defining.
 - Setting the [can-component.prototype.view] to the html that should be displayed within
   the `<todo-mvc>` element.  In this case it is the HTML that was originally in the page.
 - Instead of the hard-coded `<h1>Todos</h1>` title, we will read the title
   from the `ViewModel`.  We'll do this by:
   - Adding magic tags like `{{this.appName}}` that read `appTitle` from the [can-component.prototype.ViewModel].
   - Defining a `ViewModel` with an `appName` property that [can-define.types.default]s to
     `"TodoMVC"`.

@sourceref ./1-create-template/js.js
@highlight 3-5,8,63-65


When complete, you should see the same content as before.  Only now, it’s
rendered with a live-bound stache template.  The live binding means that
when the template’s data is changed, it will update automatically. You can see this by entering the
following in the console:

```js
document.querySelector("todo-mvc").viewModel.appName = "My Todos";
```


## Define the todos type and show the active and complete count

In this section, we will:

 - Create a list of todos and show them.
 - Show the number of active (`complete === true`) and complete todos.
 - Connect a todo’s `complete` property to a checkbox so that when
   we toggle the checkbox the number of active and complete todos changes.

In the `JavaScript` tab:

 - Define a `Todo` type with [can-define/map/map DefineMap].
 - Define a `Todo.List` type along with an `active` and `complete` property with [can-define/list/list DefineList].

In `<todo-mvc>`'s `ViewModel`:

 - Create a list of todos and pass those to the template.

In `<todo-mvc>`'s `view`:

- Use [can-stache.helpers.for-of `{{#for(of)}}`] to loop through every todo.
- Add `completed` to the `<li>`’s `className` if the `<li>`’s todo is complete.
- Use [can-stache-bindings.twoWay `checked:bind`] to two-way bind the checkbox’s `checked` property to its todo’s `complete` property.  
- Use [can-stache.tags.escaped `{{todo.name}}`] to insert the value todo’s `name` as the content of the `<label>` and
  `value` of the text `<input/>`.
- Insert the active and complete number of todos.

@sourceref ./2-items-left/js.js
@highlight 1,3-7,9-17,32-43,48,62,69-77,only


When complete, you should be able to toggle the checkboxes and see the number of
items left and the completed count change automatically.  This is because
[can-stache] is able to listen for changes in observables like [can-define/map/map],
[can-define/list/list].

<video controls>
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left/completed.mp4" type="video/mp4">
   <source src="../../docs/can-guides/experiment/todomvc/2-items-left/completed.webm" type="video/webm">
</video>


## Get todos from the server

In this section, we will:

 - Load todos from a RESTful service.
 - Fake that RESTful service.

In the `Todo` type:

- Specify `id` as the [can-define.types.identity] property of the `Todo` type.

Update the `JavaScript` tab to:

- Create a fake data store that is initialized with data for 3 todos with [can-fixture.store].
- Trap AJAX requests to `"/api/todos"` and provide responses with the data from the fake data store with [can-fixture].
- Connect the `Todo` and `Todo.List` types to the RESTful `"/api/todos"` endpoint using [can-realtime-rest-model].  This allows you to load, create, update, and destroy todos
on the server.

In `<todo-mvc>`'s `ViewModel`:

- Use [can-connect/can/map/map.getList] to load a list of all todos on the server. The result
  of `getList` is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to a `Todo.List` with the todos returned from the fake data store.  That `Promise`
  is available to the template as `this.todosPromise`.

In `<todo-mvc>`'s `view`:

 - Use [can-stache.helpers.for-of `{{#for(todo of todosPromise.value)}}`] to loop through the promise’s resolved value, which
   is the list of todos returned by the server.
 - Read the active and completed number of todos from the promise’s resolved value.


@sourceref ./3-models/js.js
@highlight 1,4,19-32,47,63,77,84-86,only

When complete, you’ll notice a 1 second delay before seeing the list of todos as
they load from the fixtured data store.


## Destroy todos

In this section, we will:

 - Delete a todo on the server when its destroy button is clicked.
 - Remove the todo from the page after it’s deleted.

Update `<todo-mvc>`'s `view` to:

 - Add `destroying` to the `<li>`’s `className` if the `<li>`’s todo is being destroyed using [can-connect/can/map/map.prototype.isDestroying].
 - Call the `todo`’s [can-connect/can/map/map.prototype.destroy] method when the `<button>` is clicked using [can-stache-bindings.event `on:click`].

@sourceref ./4-destroy/js.js
@highlight 49,54,only

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

In this section, we will:

 - Define a custom `<todo-create>` element that can create todos on the server.
 - Use that custom element.

The `<todo-create>` component will respond to a user hitting the `enter`
key. The [can-event-dom-enter] event provides this functionality, but it
is an [can-ecosystem] module.  So to use the enter event we need to:

- Import [can-event-dom-enter enterEvent] from `everything.mjs` (which includes `enterEvent`) instead of `core.mjs`.
- Import [can-dom-events domEvents] (CanJS's global event registry).
- Add the `enterEvent` to `domEvents`.

Update the `JavaScript` tab to define a `<todo-create>` component with the following:

- A [can-component.prototype.view] that:
  - Updates the `todo`’s `name` with the `<input>`’s `value` using [can-stache-bindings.twoWay `value:bind`].
  - Calls `createTodo` when the `enter` key is pressed using   [can-event-dom-enter `on:enter`].
- A [can-component.prototype.ViewModel] with:
  - A `todo` property that holds a new `Todo` instance.
  - A `createTodo` method that [can-connect/can/map/map.prototype.save]s the `Todo` instance and replaces it with a new one once saved.

Update `<todo-mvc>`'s `view` to:

- Use the `<todo-create>` component.

@sourceref ./5-create/js.js
@highlight 1,2,4,37-53,61,only


When complete, you will be able to create a todo by typing the name of the todo and pressing
`enter`. Notice that the new todo automatically appears in the list of todos. This
is also because [can-realtime-rest-model] automatically inserts newly created items into lists that they belong within.


## List todos

In this section, we will:

 - Define a custom element for showing a list of todos.
 - Use that custom element by passing it the list of fetched todos.

Update the `JavaScript` tab to:

 - Create a `TodoListVM` view model type which has a `todos` property of type `Todo.List`.
 - Use [can-component] to define a `<todo-list>` element.

@sourceref ./6-list/js.js
@highlight 58-66,only

Update the __HTML__ tab to:

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
@highlight 60-78,only


Update the __HTML__ tab to:

 - Use the `isEditing` method to add `editing` to the `className` of the `<li>` being edited.
 - When the checkbox changes, update the todo on the server with [can-connect/can/map/map.prototype.save],
 - Call `edit` with the current context using [can-stache/keys/this].
 - Set up the edit input to:
   - Two-way bind its value to the current todo’s `name` using [can-stache-bindings.twoWay `value:bind`].
   - Call `updateName` when the enter key is pressed using [can-stache-bindings.event `on:enter`].
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
   will update when the URL changes.
   - Define a `filter` property that will be updated when the route changes.
   - Define a `route` property that will be updated when the route changes.
   - Define a `todosPromise` property that uses `filter` to determine what data should be
   loaded from the server.  
     - If `filter` is falsey, all data will be loaded.  
     - If `filter` is `"complete"`, only complete todos will be loaded.
     - If `filter` is any other value, the active todos will be loaded.
 - Create an instance of the application view model (`appVM`).
 - Connect changes in the URL to changes in the `appVM` with [can-route.data].
 - Create a pretty routing rule so if the URL looks like `"#!active"`, the `filter` property of
   `appVM` will be set to `filter` with [can-route].
 - Initialize the url’s values on `appVM` and set up the two-way connection with [can-route.start].
 - Render the `todomvc-template` with the `appVM`.


@sourceref ./8-routing/js.js
@highlight 87-101,104,only

Update the __HTML__ tab to:

 - Set `href` to a URL that will set the desired properties on `appVM` when clicked.
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
@highlight 31-49,115-125,only

Update the __HTML__ tab to:

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

When finished, you should see something like the following CodePen:



<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

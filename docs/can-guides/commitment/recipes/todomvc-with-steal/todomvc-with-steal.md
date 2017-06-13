@page guides/recipes/todomvc-with-steal TodoMVC with StealJS
@parent guides/recipes

@description This guide walks through building TodoMVC with
StealJS.

@body

## Setup (Framework Overview)

### The problem

- Setup steal to load a basic CanJS application.  A basic CanJS application has:
  - A [can-define/map/map] ViewModel and an instance of that ViewModel.
  - A [can-stache] view that is rendered with the instance of the ViewModel.
- In addition, this application should load the [can-todomvc-test](https://www.npmjs.com/package/can-todomvc-test) module and
  pass it the application's `ViewModel` instance.

### What you need to know

- To create a new project with StealJS, run:

  ```
  npm init
  npm install steal steal-tools steal-css --save-dev
  ```

- To host static files, install `http-server` and run it like:

  ```
  npm install http-server -g
  http-server -c-1
  ```

- If you load StealJS plugins, add them to your _package.json_ configuration like:

  ```
  "steal": {
    "plugins": [
      "steal-css"
    ]
  }
  ```

- Define a ViewModel type with [can-define/map/map]:

  ```js
  var DefineMap = require("can-define/map/");
  var Type = DefineMap.extend({ ... });
  ```

- Create an instance of a ViewModel by using `new Type(props)`:

  ```js
  var instance = new Type({ ... });
  ```

- Load a view with the [steal-stache] plugin like:

  ```js
  var view = require("./path/to/template.stache");
  ```

  Note that [steal-stache] is a StealJS plugin and needs to be configured as such.

- Render a view (or `template`) by passing it data.  It returns a document fragment that can  
  be inserted into the page like:

  ```js
  var frag = view(appVM);
  document.body.appendChild(frag);
  ```

- Use the following HTML that a designer might have provided:

  ```html
  <section id="todoapp">
      <header id="header">
          <h1>Todos</h1>
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
  ```

- Use [can-todomvc-test](https://www.npmjs.com/package/can-todomvc-test) to load the application's
  styles and run its tests:

  ```js
  require("can-todomvc-test")(appVM);
  ```



### The solution

Create a folder:

```cmd
mkdir todomvc
cd todomvc
```

Host it:

```
npm install http-server -g
http-server -c-1
```


Create a new project:

```cmd
npm init
```

Hit `Enter` to accept the defaults.


Install `steal`, `steal-tool`, and CanJS's core modules:

```cmd
npm install steal steal-tools steal-css --save-dev
npm install can-define can-stache steal-stache --save
```



Add __steal.plugins__ to _package.json_:

@sourceref ./1-setup/package.json
@highlight 21-25


Create the starting HTML page:

```html
<!-- index.html -->
<script src="./node_modules/steal/steal.js"></script>
```

Create the application template:

@sourceref ./1-setup/index.stache.html

Install the test harness:

```cmd
npm install can-todomvc-test --save-dev
```

Create the main app

@sourceref ./1-setup/index.js

## Define Todo type (DefineMap basics)

### The problem

- Define a `Todo` type as the export of  _models/todo.js_, where:
  - It is a [can-define/map/map] type.
  - The id or name property values are coerced into a string.
  - Its `complete` property is a `Boolean` that defaults to `false`.
  - It has a `toggleComplete` method that flips `complete` to the opposite value.

Example test code:

```js
var todo = new Todo({id: 1, name: 2});
QUnit.equal(todo.id, "1", "id is a string");
QUnit.equal(todo.name, "2", "name is a string");
QUnit.equal(todo.complete, false, "complete defaults to false");
todo.toggleComplete();
QUnit.equal(todo.complete, true, "toggleComplete works");
```

### What you need to know

- [DefineMap Basics Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeUmlrN2p0Yi1qUzg)
- [can-define/map/map.extend DefineMap.extend] defines a new `Type`.
- The [can-define.types.type type] behavior defines a property's type like:

  ```js
  DefineMap.extend({
      propertyName: {type: "number"}
  })
  ```

- The [can-define.types.value] behavior defines a property's initial value like:

  ```js
  DefineMap.extend({
      propertyName: {value: 3}
  })
  ```

- Methods can be defined directly on the prototype like:

  ```js
  DefineMap.extend({
      methodName: function(){}
  })
  ```

### The solution

Update _models/todo.js_ to:

@sourceref ./2-define-todo/todo.js

## Define Todo.List type (DefineList basics)

### The problem

- Define a `Todo.List` type on the export of  _models/todo.js_, where:
  - It is a [can-define/list/list] type.
  - The enumerable indexes are coerced into `Todo` types.
  - Its `.active` property returns a filtered `Todo.List` of the todos that are __not__ complete.
  - Its `.complete` property returns a filtered `Todo.List` of the todos that are complete.
  - Its `.allComplete` property true if all the todos are complete.

Example test code:

```js
QUnit.ok(Todo.List, "Defined a List");
var todos = new Todo.List([{complete: true},{},{complete: true}]);
QUnit.ok(todos[0] instanceof Todo, "each item in a Todo.List is a Todo");
QUnit.equal(todos.active.length, 1);
QUnit.equal(todos.complete.length, 2);
QUnit.equal(todos.allComplete, false, "not allComplete");
todos[1].complete = true;
QUnit.equal(todos.allComplete, true, "allComplete");
```

### What you need to know

- [DefineList Basics Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeRFUzclNhTlRjMDg)
- [can-define/list/list.extend DefineList.extend] defines a new `ListType`.
- The [can-define/list/list.prototype.wildcardItems] property defines the behavior of items in a list like:

  ```js
  DefineList.extend({
      #: {type: ItemType}
  })
  ```

- The [can-define.types.get] behavior defines observable computed properties like:

  ```js
  DefineMap.extend({
      propertyName: {
          get: function(){
              return this.otherProperty;
          }
      }
  })
  ```

- [can-define/list/list.prototype.filter] can be used to filter a list into a new list:

  ```js
  list = new ListType([...]);
  list.filter(function(item){
      return test(item);
  })
  ```

### The solution

Update _models/todo.js_ to the following:

@sourceref ./3-define-todo-list/todo.js
@highlight 3,17-32,only

## Render a list of todos (can-stache)

### The problem

- Add a `todosList` property to the `AppViewModel` whose default
  value will be a `Todo.List` with the following data:

  ```js
  [
    { name: "mow lawn", complete: false, id: 5 },
    { name: "dishes", complete: true, id: 6 },
    { name: "learn canjs", complete: false, id: 7 }
  ]
  ```

- Write out an `<li>` for each todo in `todosList`, including:
  - write the todo's name in the  `<label>`
  - add `completed` in the `<li>`'s `class` if the todo is `complete`.
  - check the todo's checkbox if the todo is `complete`.

- Write out the number of items left and completed count in the "clear completed" button.

### What you need to know

- [Stache Basics Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeSjVJMTRJdXRXcWs)
- CanJS uses [can-stache] to render data in a template
  and keep it live. Templates can be loaded with [steal-stache].

  A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```html
    {{something.name}}
  ```
- Use [can-stache.helpers.if {{#if value}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.each {{#each value}}] to do looping in `can-stache`.

### The solution

Update _index.js_ to the following:

@sourceref ./4-render-todos/index.js
@highlight 4,8-16,only

Update _index.stache_ to the following:

@sourceref ./4-render-todos/index.html
@highlight 11-21,26,40,only

## Toggle a todo's completed state (event bindings) ##

### The problem

- Call `toggleComplete` when a todo's checkbox is clicked upon.

### What you need to know

- [The can-stache-bindings Presentation's](https://drive.google.com/open?id=0Bx-kNqf-wxZeNDd4aTFNU2g1U0k) _DOM Event Bindings_
- Use [can-stache-bindings.event ($EVENT)] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked.

   ```html
   <div ($click)="doSomething()"> ... </div>
   ```

### The solution

@sourceref ./5-toggle-event/index.html
@highlight 14-16,only

## Toggle a todo's completed state (data bindings) ##

### The problem

- Update a todo's `complete` property when the checkbox's `checked` property changes with [can-stache-bindings.twoWay two-way bindings].

### What you need to know

- [The can-stache-bindings Presentation's](https://drive.google.com/open?id=0Bx-kNqf-wxZeNDd4aTFNU2g1U0k) _DOM Data Bindings_
- Use [can-stache-bindings.twoWay {($value)}] to setup a two-way binding in `can-stache`.  For example, the following keeps `name` and the input's `value` in sync:

   ```html
   <input  {($value)}="name"/>
   ```

### The solution

@sourceref ./6-toggle-data/index.html
@highlight 14-15,only

## Define Todo.algebra (can-set)

### The problem

- Create a `set.Algebra` that understand the parameters of the `/api/todos` service layer.  The `/api/todos` service
  layer will support the following parameters:
  - `complete` - Specifies a filter on todos' `complete` field.  Examples: `complete=true`, `complete=false`.
  - `sort` - Specifies the sorted order the todos should be returned.  Examples: `sort=name`.
  - `id` - Specifies the `id` property to use in `/api/todos/{id}`

  Example:

  ```
  GET /api/todos?complete=true&sort=name
  ```

Example test code:

```js
QUnit.deepEqual( Todo.algebra.difference({}, {complete: true}), {complete: false} );
QUnit.deepEqual( Todo.algebra.clauses.id, {id: "id"} );

var sorted = Todo.algebra.getSubset({sort: "name"}, {}, [
    { name: "mow lawn", complete: false, id: 5 },
    { name: "dishes", complete: true, id: 6 },
    { name: "learn canjs", complete: false, id: 7 }
]);
QUnit.deepEqual(sorted, [
    { name: "dishes", complete: true, id: 6 },
    { name: "learn canjs", complete: false, id: 7 },
    { name: "mow lawn", complete: false, id: 5 }
]);
```

### What you need to know

- [The can-set Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeV2lVNl9XanhHZ0k)
- [can-set] provides a way to describe the parameters used in the service layer.  You use it to create
  a [can-set.Algebra] like:

  ```js
  var todoAlgebra = new set.Algebra(
    set.props.boolean("completed"),
    set.props.id("_id"),
    set.props.offsetLimit("offset","limit")
  );
  ```

  The algebra can then be used to perform comparisons between parameters like:

  ```js
  todoAlgebra.difference({}, {completed: true}) //-> {completed: false}
  ```

- Use [can-set.props set.props] to describe the behavior of your set parameters.

### The solution

```
npm install can-set --save
```

@sourceref ./7-algebra/todo.js
@highlight 4,35-39,only

## Simulate the service layer (can-fixture) ##

### The problem

Simulate a service layer that handles the following requests and responses:

__GET /api/todos__

```
-> GET /api/todos

<- {
    "data": [
      { "name": "mow lawn", "complete": false, "id": 5 },
      { "name": "dishes", "complete": true, "id": 6 },
      { "name": "learn canjs", "complete": false, "id": 7 }
    ]
}
```

This should also support a `sort` and `complete` params like:

```
-> GET /api/todos?sort=name&complete=true
```


__GET /api/todos/{id}__

```
-> GET /api/todos/5

<- { "name": "mow lawn", "complete": false, "id": 5 }
```

__POST /api/todos__

```
-> POST /api/todos
   {"name": "learn can-fixture", "complete": false}

<- {"id": 8}
```

__PUT /api/todos/{id}__

```
-> PUT /api/todos/8
   {"name": "learn can-fixture", "complete": true}

<- {"id": 8, "name": "learn can-fixture", "complete": true}
```

__DELETE /api/todos/{id}__

```
-> DELETE /api/todos/8

<- {}
```

### What you need to know

- [The can-fixture Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeekROYmxvTnUtWmM)
- [can-fixture] - is used to trap AJAX requests like:

  ```js
  fixture("/api/entities", function(request){
    request.data.folderId //-> "1"

    return {data: [...]}
  })
  ```

- [can-fixture.store can-fixture.store] - can be used to automatically filter records if given a [can-set.Algebra].

  ```js
  var entities = [ .... ];
  var entitiesStore = fixture.store( entities, entitiesAlgebra );
  fixture("/api/entities/{id}", entitiesStore);

### The solution

```
npm install can-fixture --save
```

Create _models/todos-fixture.js_ as follows:

@sourceref ./8-fixtures/todos-fixture.js

## Connect the Todo model to the service layer (can-connect) ##

### The problem

- Decorate `Todo` with methods so it can get, create, updated, and delete todos at the `/api/todos` service.  Specifically:
  - `Todo.getList()` which calls `GET /api/todos`
  - `Todo.get({id: 5})` which calls `GET /api/todos/5`
  - `todo.save()` which calls `POST /api/todos` if `todo` doesn't have an `id` or `PUT /api/todos/{id}` if the `todo` has an id.
  - `todo.destroy()` which calls `DELETE /api/todos/5`

### What you need to know

- [The can-connect Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZebHFWMElNOVEwSlE) up to and including _Migrate 2 can-connect_.
- [can-connect/can/base-map/base-map] can decorate a `DefineMap` with methods that connect it to a restful URL like:

  ```js
  baseMap({
    Map: Type,
    url: "URL",
    algebra: algebra
  })
  ```

### The solution

```
npm install can-connect --save
```

@sourceref ./9-connection/todo.js
@highlight 5,42-48,only

## List todos from the service layer (can-connect use) ##


### The problem

Get all `todos` from the service layer using the "connected" `Todo` type.

### What you need to know

- [The can-connect Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZebHFWMElNOVEwSlE) up to and including _Important Interfaces_.
- [can-connect/can/map/map.getList Type.getList] gets data using the
  [can-connect/connection.getList connection's getList] and returns a
  promise that resolves to the `Type.List` of instances:

  ```js
  Type.getList({}).then(function(list){

  })
  ```
- An async [can-define.types.get getter] property behavior can be used
  to "set" a property to an initial value:

  ```js
  property: {
      get: function(lastSet, resolve) {
          SOME_ASYNC_METHOD( function callback(data) {
              resolve(data);
          });
      }
  }
  ```

### The solution

@sourceref ./10-connection-list/index.js
@highlight 4-5,9-13,only

## Toggling a todo's checkbox updates service layer (can-connect use) ##


### The problem

Update the service layer when a todo's completed status
changes. Also, disable the checkbox while the update is happening.

### What you need to know

- Call [can-connect/can/map/map.prototype.save] to update a "connected"
  `Map` instance:

  ```
  map.save();
  ```

  `save()` can also be called by an [can-stache-bindings.event] binding.

- [can-connect/can/map/map.prototype.isSaving] returns true when `.save()`
  has been called, but has not resolved yet.

  ```
  map.isSaving()
  ```


### The solution

@sourceref ./11-toggle-save/index.html
@highlight 16-17,only


## Delete todos in the page (can-connect use) ##

### The problem

When a todo's __destroy__ button is clicked, we need to delete the
todo on the server and remove the todo's element from the page. While
the todo is being destroyed, add `destroying` to the todo's `<li>`'s `class`
attribute.

### Things to know

- The remaining parts of the [can-connect Presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZebHFWMElNOVEwSlE), with an emphasis on how [can-connect/real-time/real-time] behavior works.
- Delete a record on the server with [can-connect/can/map/map.prototype.destroy] like:
  ```js
  map.destroy()
  ```

- [can-connect/can/map/map.prototype.isDestroying] returns true when `.destroy()`
  has been called, but has not resolved yet.

  ```js
  map.isDestroying()
  ```

### The solution

@sourceref ./12-connection-destroy/index.html
@highlight 13,20,only

## Create todos (can-component) ##

### The problem

Make it possible to create a todo, update the service layer
and show the todo in the list of todos.

This functionality should be encapsulated by a `<todo-create/>`
custom element.

### What you need to know

- [The  can-component presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeMnlHZzB6ZERUSEk) up to and including how to _define a component_.
- A [can-component] combines a custom tag name, [can-stache] view and a [can-define/map/map] ViewModel like:

  ```js
  var Component = require("can-component");
  var view = require("./template.stache");
  var ViewModel = DefineMap.extend({
    ...      
  });

  Component.extend({
      tag: "some-component",
      view: view,
      ViewModel: ViewModel
  });
  ```

- You can use `($enter)` to listen to when the user hits the __enter__ key.
- The [can-define.types.ValueConstructor] behavior creates a default value by using `new Value` to initialize the value when
a `DefineMap` property is read for the first time.

  ```js
  var SubType = DefineMap.extend({})
  var Type = DefineMap.extend({
      property: {Value: SubType}
  })

  var map = new Type();
  map.property instanceof SubType //-> true
  ```

- Use [can-view-import] to import a module from a template like:

  ```
  <can-import from="~/components/some-component/"/>
  <some-component>
  ```



### The solution

```
npm install can-component --save
```

Create _components/todo-create/todo-create.stache_ as follows:

@sourceref ./13-component-create/todo-create.stache.html

Create _components/todo-create/todo-create.js_ as follows:

@sourceref ./13-component-create/todo-create.js

Update _index.stache_ to:

@sourceref ./13-component-create/index.html
@highlight 2,6,only

## Edit todo names (can-stache-bindings) ##

### The problem

Make it possible to edit a `todos` name by
double-clicking it's label which should reveal
a _focused_ input element.  If the user hits
the __enter__ key, the todo should be updated on the
server.  If the input loses focus, it should go
back to the default list view.

This functionality should be encapsulated by a `<todo-list {todos}/>`
custom element.  It should accept a `todos` property that
is the list of todos that will be managed by the custom element.


### What you need to know

- [The can-stache-bindings presentation](https://drive.google.com/open?id=0Bx-kNqf-wxZeNDd4aTFNU2g1U0k) on _data bindings_.

- The [can-util/dom/attr/attr.special.focused] custom attribute can be used to specify when an element should be focused:

  ```html
  {$focused}="shouldBeFocused()"
  ```

- Use [can-stache-bindings.toChild] to pass a value from the scope to a component:

  ```
  <some-component {name-in-component}="nameInScope"/>
  ```

- [can-stache/keys/this] can be used to get the current context in stache:

  ```
  <div ($click)="doSomethingWith(this)"/>
  ```

### The solution

Create _components/todo-list/todo-list.stache_ as follows:

@sourceref ./14-component-edit/todo-list.stache.html

Create _components/todo-list/todo-list.js_ as follows:

@sourceref ./14-component-edit/todo-list.js

Update _index.stache_ to:

@sourceref ./14-component-edit/index.html
@highlight 3,12,only

## Toggle all todos complete state (DefineMap setter) ##

### The problem

Make the "toggle all" checkbox work.  It should be
unchecked if a single todo is unchecked and checked
if all todos are checked.

When the "toggle all" checkbox is changed, the
application should update every todo to match
the status of the "toggle all" checkbox.

The "toggle all" checkbox should be disabled if a
single todo is saving.

### What you need to know

- Using [can-define.types.set setters] and [can-define.types.get getters] a virtual property
can be simulated like:

  ```js
  DefineMap.extend({
      first: "string",
      last: "string",
      get fullName(){
          return this.first + " " + this.last;
      },
      set fullName(newValue){
          var parts = newValue.split(" ");
          this.first = parts[0];
          this.last = parts[1];
      }
  })
  ```

### The solution

@sourceref ./15-setter-toggle/todo.js
@highlight 34-44,only

@sourceref ./15-setter-toggle/index.js
@highlight 14-19,only

@sourceref ./15-setter-toggle/index.html
@highlight 10-12,only

## Setup routing (can-route) ##

Make it so that the following urls display the corresponding
todos:

 - `#!` or ` ` - All todos
 - `#!active` - Only the incomplete todos
 - `#!complete` - Only the completed todos

Also, the _All_, _Active_, and _Completed_ buttons should
link to those pages and a `class='selected'` property should
be added if they represent the current page.


### What you need to know

- [can-route] is used to connect a `DefineMap`'s properties
  to the URL.  This is done with [can-route.data] like:

  ```js
  route.data = new AppViewModel();
  ```

- [can-route] can create pretty routing rules.  For example,
  if `#!login` should set the `page` property of the
  `AppViewModel` to `"login"`, use `route()` like:

  ```js
  route("{page}");
  ```

- [can-route.ready] initializes the connection between the
  url and the `AppViewModel`.  After you've created all
  your application's pretty routing rules, call it like:

  ```js
  route.ready()
  ```

- The [can-stache/helpers/route] module provides helpers
  that use [can-route].  

  [can-stache.helpers.routeCurrent]
  returns truthy if the current route matches its first parameters properties.

  ```html
  {{#if routeCurrent(page='login',true)}}
    You are on the login page.
  {{/if}}
  ```

  [can-stache.helpers.routeUrl] returns a url that will
  set its first parameters properties:

  ```
  <a href="{{routeUrl page='login'}}">Login</a>
  ```

### The solution

```
npm install can-route --save
```

@sourceref ./16-routing/index.js
@highlight 5,9-26,39-41,only

@sourceref ./16-routing/index.html
@highlight 4,23-26,29-32,35-38,only

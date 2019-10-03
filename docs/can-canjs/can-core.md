@page can-core Core
@parent api 10
@templateRender <% %>
@description The best, most hardened and generally useful libraries in CanJS.

@body

## Use

CanJS’s core libraries are the best, most hardened and generally useful modules.
Each module is part of an independent package, so you
should install the ones you use directly:

```
npm install can-value can-stache-element can-realtime-rest-model can-observable-object can-observable-array can-route can-route-pushstate --save
```


Let’s explore each module a bit more.

## can-value

[can-value]s represent an observable value.  A value can contain its
own value and notify listeners of changes like:

```js
import { value } from "can";

let name = value.with("Justin");

// read the value
console.log(name.value); //-> "Justin"

name.on((newVal, oldVal) => {
    console.log(newVal); //-> "Matthew"
    console.log(oldVal); //-> "Justin"
});

name.value = "Matthew";
```
@codepen

More commonly, a value derives its value from other observables.  The following
`info` compute derives its value from a `person` object, `hobbies` array, and `age`
value:

```js
import { ObservableObject, ObservableArray, value } from "can";

let person = new ObservableObject({ first: "Justin", last: "Meyer" }),
    hobbies = new ObservableArray(["js", "bball"]),
    age = value.with(33);

let info = value.returnedBy(function(){
    return person.first +" "+ person.last + " is " + age.value +
        "and likes " + hobbies.join(", ") + ".";
});

console.log(info.value); //-> "Justin Meyer is 33 and likes js, bball."

info.on((newVal) => {
    console.log(newVal); //-> "Justin Meyer is 33 and likes js."
});

hobbies.pop();
```
@codepen


## can-observable-object and can-observable-array

[can-observable-object] and [can-observable-array] allow you to create observable
objects and arrays with well-defined properties.  You can
[can-observable-object/object.types.definitionObject define a property’s type initial value, enumerability, getter-setters and much more].
For example, you can define the behavior of a `Todo` type and a `TodoArray` type as follows:

```js
import { ObservableObject, ObservableArray, type } from "can";

class Todo extends ObservableObject {
  static props = {
      // A todo has a:
      // .name that’s a string
      name: String,

      complete: {                           // .complete that’s
          type: Boolean,                    //        a boolean
          default: false                    //        initialized to false
      },

      // .dueDate that’s a date
      dueDate: Date,

      get isPastDue(){                      // .pastDue that returns if the
          return new Date() > this.dueDate; //        dueDate is before now
      }
  };

  toggleComplete() {                        // .toggleComplete method that
    this.complete = !this.complete;         //        changes .complete
  }
}

class TodoArray extends ObservableArray {
  static props = {
      get completeCount(){                  // has .completeCount
          return this.filter(               //         that returns
            (todo) => todo.complete         //         # of
          )                                 //         complete todos
          .length;
      }
  };

  static items = type.convert(Todo);       // has numeric properties
                                           //         as todos
}
```
@codepen

This allows you to create a Todo, read its properties, and
call its methods like:

```js
import { ObservableObject } from "can";

class Todo extends ObservableObject {
  static props = {
      // A todo has a:
      // .name that’s a string
      name: String,

      complete: {                           // .complete that’s
          type: Boolean,                    //        a boolean
          default: false                    //        initialized to false
      },

      // .dueDate that’s a date
      dueDate: Date,

      get isPastDue(){                      // .pastDue that returns if the
          return new Date() > this.dueDate; //        dueDate is before now
      }
  };

  toggleComplete() {                        // .toggleComplete method that
    this.complete = !this.complete;         //        changes .complete
  }
}
const dishes = new Todo({
	name: "do dishes",
	// due yesterday
	dueDate: new Date(new Date() - 1000 * 60 * 60 * 24)
});
console.log(dishes.name);      //-> "do dishes"
console.log(dishes.isPastDue); //-> true
console.log(dishes.complete);  //-> false
dishes.toggleComplete();
console.log(dishes.complete);  //-> true
```
@highlight 26-35,only
@codepen

And it allows you to create a `TodoArray`, access its items and properties
like:

```js
import { ObservableObject, ObservableArray, type } from "can";

class Todo extends ObservableObject {
  static props = {
      // A todo has a:
      // .name that’s a string
      name: String,

      complete: {                           // .complete that’s
          type: Boolean,                    //        a boolean
          default: false                    //        initialized to false
      },

      // .dueDate that’s a date
      dueDate: Date,

      get isPastDue(){                      // .pastDue that returns if the
          return new Date() > this.dueDate; //        dueDate is before now
      }
  };

  toggleComplete() {                        // .toggleComplete method that
    this.complete = !this.complete;         //        changes .complete
  }
}

class TodoArray extends ObservableArray {
  static props = {
      get completeCount(){                  // has .completeCount
          return this.filter(               //         that returns
            (todo) => todo.complete         //         # of
          )                                 //         complete todos
          .length;
      }
  };

  static items = type.convert(Todo);       // has numeric properties
                                           //         as todos
}
const dishes = new Todo({
	name: "do dishes",
	// due yesterday
	dueDate: new Date(new Date() - 1000 * 60 * 60 * 24)
});
dishes.toggleComplete();
const todos = new TodoArray([dishes, { name: "mow lawn", dueDate: new Date() }]);
console.log(todos.length);         //-> 2
console.log(todos[0].complete);    //-> true
console.log(todos.completeCount);  //-> 1
```
@highlight 46-49,only
@codepen

These observables provide the foundation
for data connection (models), component properties and even routing in your application.

## can-set

[can-set] models a service layer’s behavior as a [can-set.Algebra set.Algebra]. Once modeled, other libraries such as [can-connect] or [can-fixture] can
add a host of functionality like: real-time behavior, performance optimizations, and
simulated service layers.

A `todosAlgebra` set algebra for a `GET /api/todos` service might look like:

```js
import set from "can-set";
let todosAlgebra = new set.Algebra(
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

In the next section will use `todoAlgebra` to build a model with [can-connect].

## can-connect

[can-connect] connects a data type, typically an `ObservableObject` and associated `ObservableArray`,
to a service layer. This is often done via the
[can-rest-model] module which bundles many common behaviors
into a single api:

```js
import { ObservableObject, ObservableArray, restModel } from "can";

class Todo extends ObservableObject {
    static props = {
        // ...
    };
}

class TodoArray extends ObservableObject {
    static props = {
        // ...
    };

    static items = Todo;
}

const connection = restModel({
	url: "/api/todos",
	ObjectType: Todo,
	ArrayType: TodoArray
});
```
@codepen

`baseMap` extends the Object type, in this case, `Todo`, with
the ability to make requests to the service layer.

 - [can-connect/can/map/map.getList Get a list] of Todos
   ```js
   Todo.getList({ complete: true }).then((todos) => {});
   ```
 - [can-connect/can/map/map.get Get] a single Todo
   ```js
   Todo.get({ _id: 6 }).then((todo) => {});
   ```
 - [can-connect/can/map/map.prototype.save Create] a Todo
   ```js
   const todo = new Todo({ name: "do dishes", complete: false });
   todo.save().then((todo) => {});
   ```
 - [can-connect/can/map/map.prototype.save Update] an [can-connect/can/map/map.prototype.isNew already created] Todo
   ```js
   todo.complete = true;
   todo.save().then((todo) => {});
   ```
 - [can-connect/can/map/map.prototype.destroy Delete] a Todo
   ```js
   todo.destroy().then((todo) => {});
   ```

## can-stache

[can-stache] provides live binding mustache and handlebars syntax. While
templates should typically be loaded with a module loader like [steal-stache],
you can create a template programmatically that lists out todos within a
promise loaded from `Todo.getList` like:

```js
import { stache, ObservableObject, ObservableArray, restModel } from "can";

class Todo extends ObservableObject {
    static props = {
        // ...
    };
}

class TodoArray extends ObservableObject {
    static props = {
        // ...
    };

    static items = Todo;
}

const connection = restModel({
	url: "/api/todos",
	ObjectType: Todo,
	ArrayType: TodoArray
});

// Creates a template
let template = stache(`
	<ul>
		{{# if(this.todos.isPending) }}<li>Loading…</li>{{/ if }}
		{{# if(this.todos.isResolved) }}
			{{# for(todo of this.todos.value) }}
				<li class="{{# todo.complete }}complete{{/ todo.complete }}">{{ todo.name }}</li>
			{{else}}
				<li>No todos</li>
			{{/for}}
		{{/if}}
	</ul>
`);

// Calls the template with some data
let fragment = template({
	todos: Todo.getList({})
});

// Inserts the result into the page
document.body.appendChild(fragment);
```
@codepen
@highlight 23-43, only

[can-stache] templates use magic tags like `{{}}` to control what
content is rendered. The most common forms of those magic tags are:

 - [can-stache.tags.escaped {{key}}] - Insert the value at `key` in the page. If `key` is a function or helper, run it and insert the result.
 - [can-stache.tags.section {{#key}}...{{/key}}] - Render the content between magic tags based on some criteria.

[can-stache] templates return document fragments that update whenever
their source data changes.

## can-stache-element

[can-stache-element] creates custom elements with unit-testable properties. It
combines a view model created by [can-observable-object] with a template
created by [can-stache].

```html
<todos-list></todos-list>

<script type="module">
import { StacheElement, stache, ObservableObject, ObservableArray, restModel } from "can";

class Todo extends ObservableObject {
    static props = {
        // ...
    };
}

class TodoArray extends ObservableObject {
    static props = {
        // ...
    };

    static items = Todo;
}

const connection = restModel({
	url: "/api/todos",
	ObjectType: Todo,
	ArrayType: TodoArray
});

class TodosList extends StacheElement {
    static view = `
			<ul>
				{{# if(this.todos.isPending) }}<li>Loading…</li>{{/ if }}
				{{# if(this.todos.isResolved) }}
					{{# for(todo of this.todos.value) }}
						<li class="{{# todo.complete }}complete{{/ todo.complete }}">{{ todo.name }}</li>
					{{else}}
						<li>No todos</li>
					{{/for}}
				{{/if}}
			</ul>
    `;

    // Defines the todos-list component’s properties
    static props = {
        // An initial value that is a promise containing the
        // list of all todos.
        todos: {
            get default() {
                return Todo.getList({});
            }
        },
        // A method that toggles a todo’s complete property
        // and updates the todo on the server.
        toggleComplete(todo) {
            todo.complete = !todo.complete;
            todo.save();
        }
    };
}
customElements.define("todos-list", TodosList);
</script>
```
@highlight 26-57, only
@codepen

## can-stache-bindings

[can-stache-bindings] provides [can-view-callbacks.attr custom attributes] for
[can-stache] event and data bindings.

Bindings look like:

 - `on:event="key()"` for [can-stache-bindings.event event binding].
 - `prop:from="key"` for [can-stache-bindings.toChild one-way binding to a child].
 - `prop:to="key"` for [can-stache-bindings.toParent one-way binding to a parent].
 - `prop:bind="key"` for [can-stache-bindings.twoWay two-way binding].

[can-stache-bindings.event Event] binding examples:

```html
<!-- calls `toggleComplete` when the li is clicked -->
<li on:click="toggleComplete(.)"/>

<!-- calls `resetData` when cancel is dispatched on `my-modal`’s view model -->
<my-modal on:cancel="resetData()"/>
```

[can-stache-bindings.toChild One-way to child] examples:

```html
<!-- updates input’s `checked` property with the value of complete -->
<input type="checkbox" checked:from="complete"/>

<!-- updates `todo-lists`’s  `todos` property with the result of `getTodos`-->
<todos-list todos:from="getTodos(complete=true)"/>
```

[can-stache-bindings.toChild One-way to parent] examples:

```html
<!-- updates `complete` with input’s `checked` property -->
<input type="checkbox" checked:to="complete"/>

<!-- updates `todosList` with `todo-lists`’s `todos` property -->
<todos-list todos:to="todosList"/>
```

[can-stache-bindings.twoWay Two-way] examples:

```html
<!-- Updates the input’s `value` with `name` and vice versa -->
<input type="text" value:bind="name"/>

<!-- Updates `date-picker`’s `date` with `dueDate` and vice versa -->
<date-picker date:bind="dueDate"/>
```

## can-route and can-route-pushstate

[can-route] connects an `ObservableObject`’s properties to values in the
url. Create an object type, [can-route.data connect it to the url], and [can-route.start begin routing] like:

```js
import { ObservableObject, route } from "can";

class AppViewModel extends ObservableObject {
    static props = {
        // Sets the default type to string
        todoId: String,
        todo: {
            get: function(){
                if(this.todoId) {
                    return Todo.get({_id: this.todoId})
                }
            }
        }
    };

    static items = String;
}

const appViewModel = new AppViewModel();
route.data = appViewModel;

route.start();
```
@codepen

When the url changes, to something like `#!&todoId=5`, so will the
`appViewModel`’s `todoId` and `todo` property:

```js
appViewModel.todoId //-> "5"
appViewModel.todo   //-> Promise<Todo>
```

Similarly, if `appViewModel`’s `todoId` is set like:

```js
appViewModel.todoId = 6;
```

The hash will be updated:

```js
window.location.hash //-> "#!&todoId=6"
```

The [can-route.register route.register] function can be used to specify pretty routing rules that
translate property changes to a url and a url to property changes. For example,

```js
// a route like:
route.register("todo/{todoId}");

// and a hash like:
window.location.hash = "#!todo/7";

// produces an appViewModel like:
appViewModel.serialize() //-> {route: "todo/{todoId}", todoId: "7"}
```

[can-route-pushstate] adds [pushstate](https://developer.mozilla.org/en-US/docs/Web/API/History_API) support.
To use it, set [can-route.urlData route.urlData] to an instance of `RoutePushstate`:

```js
import { route, RoutePushstate } from "can";

route.urlData = new RoutePushstate();
```


## Want to learn more?

If you haven’t already, check out the [guides] page on how to learn CanJS.  Specifically, you’ll
want to check out the [guides/chat] and [guides/todomvc] to learn the basics of using CanJS’s
core libraries.  After that, check out the [guides/api] on how to use and learn from these API docs.

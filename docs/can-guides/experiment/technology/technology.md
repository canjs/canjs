@page guides/technology-overview Technology Overview
@parent guides/getting-started 3
@outline 2

@description Learn the basics of CanJS’s technology.

@body


<style>
table.panels .background td {
    background: #f4f4f4;
    padding: 5px 5px 5px 5px;
    border: solid 1px white;
    margin: 1px;
    vertical-align: top;
}
table.panels pre {
    margin-top: 0px;
}
.obs {color: #800020;}
.code-toolbar + a {
    text-align: center; color: gray; display: block;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
}
.object-svg {
    max-width: 600px;
    padding-bottom: 15px;
}
</style>

## Overview

CanJS, at its most simplified, consists of key-value <span class='obs'>observables</span>
connected to web browser APIs using various libraries.


<object type='image/svg+xml' data='../../docs/can-guides/experiment/technology/overview.svg' class='bit-docs-screenshot object-svg'>
    Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer
</object>

The general idea is that you create <span class='obs'>observable</span> objects that encapsulate
the logic and state of your application and connect those <span class='obs'>observable</span>
objects to:

- The Document Object Model (DOM) to update your [guides/html] automatically.
- The browser URL to support the forward and back buttons through [guides/routing].
- Your service layer to make receiving, creating, updating, and deleting [guides/data service data] easier.


Instead of worrying about calling the various browser APIs, CanJS abstracts this
away, so you can focus on the logic of your application. The logic of your
application is contained within <span class='obs'>observables</span>.

The rest of this page walks through the basics of <span class='obs'>observables</span> and brief examples
of connecting observables to browser APIs. For a deeper dive, please read through the [guides/html], [guides/routing] and [guides/data]
guides.

## Key-Value Observables

The [can-observable-object ObservableObject] and
[can-observable-array ObservableArray] <span class='obs'>observables</span> define the logic and state
in your application. For example, the following uses [can-observable-object ObservableObject] to:

- Model a simple `Counter` type.
- Create instances of `Counter`, call its methods, and inspect its state.


```js
import {ObservableObject} from "can";

// Extend ObservableObject to create a custom observable type.
class Counter extends ObservableObject {
  static props = {
    // Defines a `count` property that defaults to 0.
    count: 0
  }

  // Defines an `increment` method that increments
  // the `count` property.
  increment() {
    this.count++;
  }
}

// Create an instance of the Counter observable type.
const myCounter = new Counter();

// Read the `count` property.
console.log( myCounter.count ) //-> 0

// Calls the `increment` method.
myCounter.increment()

// Read the `count` property again.
console.log( myCounter.count ) //-> 1
```
@codepen



`myCounter` is an instance of `Counter`. `myCounter.count` is part of the _state_ of the `myCounter` instance.  `myCounter.increment` is part of the _logic_ that controls the
state of `myCounter`.

`myCounter` is an <span class='obs'>observable</span> because you can listen to when
its state changes.  The following uses [can-event-queue/map/map.listenTo]
to log each time the [can-define/map/map/PropertyNameEvent count] changes:

```js
import {ObservableObject} from "can";

class Counter extends ObservableObject {
  static props = {
    count: 0
  }

  increment() {
    this.count++;
  }
}

const myCounter = new Counter();

myCounter.listenTo("count", (event, newCount) => {
  console.log(newCount); // logs 1, 10, then 11
});

myCounter.increment();
myCounter.count = 10;
myCounter.increment();
```
@highlight 15-17
@codepen



[can-observable-array ObservableArray] creates <span class='obs'>observable</span> lists. Observable lists are most commonly
used with the [service layer](#Observablesandtheservicelayer). The following
defines a `Counters` list type. Instances of `Counters` will have a `sum` property that returns the sum of
each `Counter` within the list:

```js
import {ObservableObject, ObservableArray, type} from "can";

class Counter extends ObservableObject {
  static props = {
    count: 0
  }

  increment() {
    this.count++;
  }
}

class Counters extends ObservableArray {
  // Specifies the type of items in the list.
  // Plain objects will be converted to Counter instances.
  static items = type.convert(Counter)

  // Defines a getter for sum
  get sum(){
    // Loop through each counter and sum its count;
    let sum = 0;
    this.forEach( (counter) => sum += counter.count );
    return sum;
  }
}

// Create an instance of Counters
let myCounters = new Counters([
  new Counter(),
  // Initializes count with value 3
  new Counter({count: 3}),
  // Plain objects will be converted to Counter instances.
  {count: 4}
]);

console.log( myCounters[0].count ) //-> 0

console.log( myCounters.sum )      //-> 7

myCounters[0].increment();
console.log( myCounters.sum )      //-> 8
```
@codepen


> __NOTE:__ CanJS application logic is coded within instances of [can-observable-object ObservableObject] and [can-observable-array ObservableArray].
> You often don’t need the DOM for unit testing!

[can-observable-object ObservableObject] and [can-observable-array ObservableArray] have a wide variety of features and shorthands for defining property behavior. For more information about how to write logic within
CanJS’s observables read the [can-observable-object#Use ObservableObject Use section] and the
[can-observable-object/object.types.definitionObject DefinitionObject documentation].

## Observables and HTML elements

CanJS applications use [can-stache-element Components] to connect <span class='obs'>observables</span>
to a page's HTML elements. We can use [can-stache-element StacheElement] to create a counting widget
for the `Counter` <span class='obs'>observables</span> we just created.

The following widget counts the number of times the <button>+1</button> button is clicked:

@demo demos/technology-overview/my-counter.html
@codepen

In CanJS, widgets are encapsulated with custom elements. Custom elements allow us to put an
element in our HTML like `<my-counter></my-counter>`, and the widget will spring to life.

The previous demo defines a custom element with a `view` and `Observale Properties` as separate entities. However,
a Component's [can-stache-element/static.props] and view are typically defined inline as follows:

```html
<my-counter></my-counter>

<script type="module">
import { StacheElement } from "can";

class MyCounter extends StacheElement {
  static view = `
    Count: <span>{{this.count}}</span>
    <button on:click='this.increment()'>+1</button>
  `

  static props = {
    count: 0
  }

  increment() {
    this.count++;
  }
}
customElements.define("my-counter", MyCounter);
</script>
```
@codepen

You might have noticed that StacheElements are mostly 2 parts:

- A [can-stache-element/static.view] that specifies the HTML content within the custom element. In this case, we’re adding a `<span>` and a `<button>` within the `<my-counter>` element. Magic tags
like `{{count}}` are provided by [can-stache stache] and bindings like `on:click` are provided by
[can-stache-bindings stacheBindings].
- [can-observable-object/object.static.props Properties] that manages the logic and state of the application.

These work together to receive input from the user, update the state of the application, and then update
the HTML the user sees accordingly. See how in this 2 minute video:

<iframe width="560" height="315" src="https://www.youtube.com/embed/3zMwoEuyX9g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

For more information on how to connect observables to the DOM, read the
[guides/html] guide.

## Observables and the browser's location

CanJS applications use [can-route route] (or mixin [can-route-pushstate RoutePushstate]) to connect an <span class='obs'>observable</span> to the browser's URL. The observable acts like a key-value
store of the data in the URL.

The following example shows that:

- When the observable state updates, the URL changes.
- When the URL changes, the observable state updates.

```js
import {route, ObservableObject} from "can";

location.hash = "#!&page=todos&id=1";

route.data = new ObservableObject();
route.start();

// The route data matches what's in the hash.
console.log(route.data.serialize())
//-> {id: "1", page: "todos" }

// If you change the route data ...
route.data.id = 2;

setTimeout(() => {
	// ... the hash is updated!
	console.log(location.hash)
	//-> "#!&page=todos&id=2"

	// If you change the hash ...
	location.hash = "#!&page=login"
},20);

setTimeout(()=>{
	// ... the route data is updated!
	console.log(route.data.serialize())
	//-> { page: "login" }
},40);
```
@codepen

The following shows the browser's forward and back buttons connected to the `<my-counter>` Component's observable state. Click `+1` a few times, then click
the forward (`⇦`) and back (`⇨`) buttons to see the count change:

@demo demos/technology-overview/route-counter.html

Notice how the URL changes when you click the `+1` button AND the _Count_ changes when the
forward and back button are clicked.


The following connects the `<my-counter>` to the browser's URL:

```html
<mock-url></mock-url>
<my-counter></my-counter>

<script type='module'>
// Imports the <mock-url> element that provides
// a fake back, forward, and URL controls.
import "//unpkg.com/mock-url@5";

import {route, StacheElement} from "can";

class MyCounter extends StacheElement {
  static view = `
    Count: <span>{{this.count}}</span>
    <button on:click='this.increment()'>+1</button>
  `

  static props = {
    count: 0
  }

  increment() {
    this.count++;
  }
}
customElements.define("my-counter", MyCounter);

// The `.data` property specifies the observable to cross
// bind the URL to.
route.data = document.querySelector("my-counter");
route.start();
</script>
```
@highlight 29-30
@codepen


Use [can-route.register route.register] to create routing rules.
Instead of URLs like `#!&count=1`, `#!&count=2`, `#!&count=3`;
the following changes the URLs to look like `#!1`, `#!2`, `#!3`:


```html
<mock-url></mock-url>
<my-counter></my-counter>

<script type='module'>
// Imports the <mock-url> element that provides
// a fake back, forward, and URL controls.
import "//unpkg.com/mock-url@^5.0.0";

import {route, StacheElement} from "can";

class MyCounter extends StacheElement {
  static view = `
    Count: <span>{{this.count}}</span>
    <button on:click='this.increment()'>+1</button>
  `

  static props = {
    count: 0
  }

  increment() {
    this.count++;
  }
}
customElements.define("my-counter", MyCounter);

// Register rules that translate from the URL to
// setting properties on the cross-bound observable.
route.register("{count}");
route.data = document.querySelector("my-counter");
route.start();
</script>
```
@highlight 29
@codepen


For more information on how to connect observables to the browser's URL, read the
[guides/routing] guide.


## Observables and the service layer ##

CanJS applications use models to connect
<span class='obs'>observables</span> to backend services. For example,
lets say the service layer is providing a JSON list of todo data at `/api/todos`. The
response looks like:

```js
{
    data: [
        { "id": 1, "name": "cook food",
          "complete": false, "dueDate": "Wed Jul 11 2018 13:42:31 GMT-0500" },
        { "id": 2, "name": "do taxes",
          "complete": true, "dueDate": "Sun Jul 29 2018 20:58:25 GMT-0500" },
        ...
    ]
}
```

The following loads this list of data and logs it to the console by:

- Defining an observable data type to represent individual todos (`Todo`).
- Defining an observable data type to represent a list of todos (`Todo.List`).
- Connecting those observable data types to the RESTFUL service layer
  with [can-rest-model restModel].
- Using the [can-connect/can/map/map.getList] method mixed-into the `Todo` type to get
  the todos from the server and log them to the console.

```js
import {restModel, ObservableObject, ObservableArray, type } from "can";
import mockTodosService from "//unpkg.com/todos-fixture@1";

// Defines the observable Todo type and its properties
class Todo extends ObservableObject {
  static props = {
    // `identity: true` specifies that `id` values must be unique.
    id: { type: Number, identity: true },
    complete: false,
    dueDate: type.convert(Date),
    name: String
  }
}

// Defines an observable list of Todo instances and its methods
Todo.List = class extends ObservableArray {
  static items = type.convert(Todo)

  // A helper method to complete every todo in the list.
  completeAll(){
    return this.forEach((todo) => { todo.complete = true; });
  }
}

// Mixes in methods on `Todo` useful for
// creating, retrieving, updating and deleting
// data at the URL provided.
restModel({
  Map: Todo,
  url: "/api/todos/{id}"
});

// Call to setup the mock server before we make a request.
mockTodosService(20);

// Gets a Promise that resolves to a `Todo.List` of `Todo` instances.
let todosPromise = Todo.getList();
todosPromise.then(function(todos){
  // .get() converts the Todo instances back to plain JS objects
  // for easier to read logging.
  console.log(todos.get())
});
```
@highlight 28-31,37-42
@codepen


The following lists the todos in the page by defining a `<todo-list>` component
that:

- Gets a promise that resolves to a list of all todos with `Todo.getList({})`.
- Loops through the list of todos and creates an `<li>` for each one with
  `{{# for(todo of todosPromise.value) }}`.

```html
<todo-list></todo-list>

<script type='module'>
import {restModel, ObservableObject, ObservableArray, StacheElement, type } from "can";
import mockTodosService from "//unpkg.com/todos-fixture@1";

class Todo extends ObservableObject {
  static props = {
    id: { type: Number, identity: true },
    complete: false,
    dueDate: type.convert(Date),
    name: String
  }
}

Todo.List = class extends ObservableArray {
  static items = Todo;

  completeAll(){
    return this.forEach((todo) => { todo.complete = true; });
  }
}

restModel({
  Map: Todo,
  url: "/api/todos/{id}"
});

mockTodosService(20);

class TodoListElement extends StacheElement {
  static view = `
    <ul>
      {{# for(todo of this.todosPromise.value) }}
        <li>
          <input type='checkbox' checked:from='todo.complete' disabled/>
          <label>{{todo.name}}</label>
          <input type='date' valueAsDate:from='todo.dueDate' disabled/>
        </li>
      {{/ for }}
    </ul>
  `

  static props = {
    todosPromise: {
      get default() {
        return Todo.getList({});
      }
    }
  }
}
customElements.define("todo-list", TodoListElement);
</script>
```
@highlight 31-52
@codepen

You can do a lot more with CanJS’s data layer besides showing a list of data. Read
the [guides/data] guide for more information on how to:

- Create, update and delete data.
- Automatically insert or remove items from lists when data is created, updated or deleted (automatic list management).

## Next Steps

Now that you've got a rough idea idea on the major pieces of CanJS, we suggest:

- [guides/html HTML]
- [guides/routing Routing]
- [guides/data Service Layer]

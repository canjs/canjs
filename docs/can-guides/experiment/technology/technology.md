@page guides/tech Technology Overview
@parent guides/getting-started 1


@description Learn the basics of the core parts of CanJS's technology.

@body

## Overview

CanJS, at it's most simplified, consists of __Observables__
connected to different web browser APIs through various connecting
libraries.

<img src="../../docs/can-guides/experiment/technology/overview.png"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  width="800px"/>

The general idea is that you create observable objects that encapsulate
the logic and state of your application and connect those observable
objects to:

- The Document Object Model (DOM) to update your page automatically.
- Your service layer to make receiving, creating, updating, and deleting server data easier.
- The route to support the forward and back button.

Instead of worrying about calling the various browser APIs, CanJS abstracts this away, so you can focus on the logic of your application. Lets see an example!


The [can-define/map/map DefineMap] and
[can-define/list/list DefineList] __Observables__ define the logic and state
in your application. For example, if we wanted to model
a simple counter, we can use [can-define/map/map DefineMap] as follows:

```js
import DefineMap from "can-define/map/map";
var Counter = DefineMap.extend("Counter",{
    count: {value: 0},
    increment() {
        this.count++;
    }
});
```

We can create instances of `Counter` and call its methods and
inspect its state like:

```js
var myCounter = new Counter();
myCounter.count //-> 0
myCounter.increment()
myCounter.count //-> 1
```

`myCounter` is an instance of `Counter`. `myCounter.count` is what we call the _state_ of the `myCounter` instance.  `myCounter.increment` is part of the _logic_ that controls the
state of `myCounter`.

> NOTE: CanJS application logic is coded within `DefineMap` and `DefineList`s and
> often doesn't require a DOM for unit testing!

[can-define/map/map DefineMap] and [can-define/map/map DefineList] have a wide variety of features (and shorthands)
useful for defining property behavior. In the previous example, `count: {value: 0}` defined `count` to
have an initial value of `0`. The `{value: 0}` object is a [can-define.types.propDefinition].

The following example uses the [can-define.types.value] and [can-define.types.get] property
definition behaviors to define a `TodosApp` constructor function's `todos` and `completeCount`
property behavior:

```js
var TodosApp = DefineMap.extend("TodosApp",{
    todos: {
        // todos defaults to a DefineList of todo data.
        value: () => new DefineList([
            {complete: true, name: "Do the dishes."},
            {complete: true, name: "Wash the car."},
            {complete: false, name: "Learn CanJS."}
        ])
    },
    // completedCount is the number of completed todos in the `todos`
    // property.
    completeCount: {
        get() {
            return this.todos.filter({complete: true}).length
        }
    }
});
```

Instances of `TodosApp` will have default `todos` value and a `completeCount`
that dynamically changes when `todos` changes:

```js
var todosApp = new TodosApp();
todosApp.todos //-> DefineList[{complete: true, name: "Do the dishes."}, ...]

todosApp.completeCount //-> 2

todosApp.todos[2].complete = true;

todosApp.completeCount //-> 3
```


#### Observables and the browser's location

CanJS's general pattern is that you define application logic in one or
more of these observables. Then you connect this state to
various browser APIs.  For example, you could connect `myCounter`
to `window.location` with:

```js
import route from "can-route";

route.data = myCounter
route.start()
```


Now, if you called `increment()` on my counter, the `window.location` would
change to `#!1`. If you hit the back-button, `myCounter.count` would be
back to `0`:

```js
myCounter.increment()
window.location.hash  //-> "#!1"

history.back()
myCounter.count       //-> 0
window.location.hash  //-> "#!0"
```

[can-route] is used to setup a bi-directional relationship with an observable and
the browser's location.

<img src="../../docs/can-guides/experiment/technology/observable-routing.png"
  alt=""
  width="500px"/>

#### Observables and HTML Elements

The page's HTML (DOM) is the
most common browser API people need to connect to. [can-stache], [can-stache-bindings]
and [can-component] are used to connect the DOM
to __observables__ like `myCounter`. We can create HTML that:

- Calls methods on observables using [can-stache-bindings].
- Updates the page when the state of an observable changes using [can-stache].

The following example:

- Creates a <button>+1</button> button that calls methods on `myCounter` when DOM events happen: `on:click='increment()'`.
- Updates a `<span/>` when the state of `myCounter` changes: `{{count}}`.

@demo demos/technology-overview/observable-dom.html

[can-stache] is used to create HTML that updates automatically when observable
state changes. It uses magic tags to read values and perform simple logic. The following
are the most commonly used tags:

- [can-stache.tags.escaped] - Inserts the result of `expression` in the page.
  ```
  Count: <span>{{count}}</span>
  ```
- [can-stache.helpers.if] - Render the _block_ content if the expression evaluates
  to a _truthy_ value; otherwise, render the _inverse_ content.
  ```
  {{#if(count)}} Count not 0 {{else}} Count is 0 {{/if}}
  ```
- [can-stache.helpers.is] - Render the _block_ content if all comma seperated expressions
  evaluate to the same value; otherwise, render the _inverse_ content.
  ```
  {{#is(count, 1)}} Count is 1 {{else}} Count is not 1 {{/if}}
  ```
- [can-stache.helpers.each] - Render the _block_ content for each item in the list the expression evaluates to.
  ```
  {{#each(items)}} {{name}} {{/each}}
  ```

[can-stache-bindings] is used to:

- Call methods on observables when DOM events happen. The following uses
  [can-stache-bindings.event] to call `doSomething` with the `<input>`'s value on a `keypress` event:
  ```
  <input on:keypress="doSomething(scope.element.value)"/>
  ```
- Update observables with element attribute and property values.  The following uses [can-stache-bindings.toParent]
  to send the `<input>`'s value _to_ an observable's `count` property.
  ```
  <input value:to="count"/>
  ```
- Update element attribute and property values with observable values.  The following uses [can-stache-bindings.toChild]
  to update the `<input>`'s _value_ from  an observable's `count` property.
  ```
  <input value:from="count"/>
  ```
- Cross bind element attribute and property values with observable values.  The following uses
  [can-stache-bindings.twoWay] to update the `<input>`'s _value_ from  an observable's `count` property
  and vice versa:
  ```
  <input value:bind="count"/>
  ```

The following uses [can-stache.helpers.each] to loop through a list of todos and [can-stache.helpers.is]
to write out if all todos are complete.  It uses [can-stache-bindings.twoWay] to update the `complete`
state of a todo when a _checkbox_ is checked and vice-versa.  Finally, it uses [can-stache-bindings.event]
to call a method that completes every todo.

@demo demos/technology-overview/simple-todos.html


The final core __view__ library is [can-component].

<img src="../../docs/can-guides/experiment/technology/observables-dom.png"
  alt=""
  width="439px"/>

[can-component] is used to create customs elements.  For example, you
might use [can-component] to create a `<my-slider>` element that creates a
slider on the page:


 that manage
widget or application logic and the HTML within the custom elements.




[can-component] encapsulates
a [can-stache] view and an [can-define/map/map DefineMap] observable.  They are used to
create widgets that can be easily instantiated within HTML.

@page guides/technology-overview Technology Overview
@parent guides/getting-started 1
@outline 3

@description Learn the basics of the core parts of CanJS's technology.

@body

## Overview

CanJS, at it's most simplified, consists of key-value __Observables__
connected to different web browser APIs through various connecting
libraries.

<img src="../../docs/can-guides/experiment/technology/overview.png"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  width="800px"/>

The general idea is that you create observable objects that encapsulate
the logic and state of your application and connect those observable
objects to:

- The Document Object Model (DOM) to update your page automatically.
- The route to support the forward and back button.
- Your service layer to make receiving, creating, updating, and deleting server data easier.


Instead of worrying about calling the various browser APIs, CanJS abstracts this away, so you can focus on the logic of your application. The logic of your application is contained within observables. Lets see how!


## Key-Value Observables

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

## Observables and HTML Elements

CanJS's pattern is that you define application logic in one or
more observables, then you connect these observables to
various browser APIs. The page's HTML (DOM) is the
most common browser API people need to connect to. [can-stache], [can-stache-bindings]
and [can-component] are used to connect the DOM
to __observables__ like `myCounter`. We can create HTML that:

- Calls methods on observables using [can-stache-bindings].
- Updates the page when the state of an observable changes using [can-stache].

The following example increments the _Count_ when the <button>+1</button> is clicked:


@demo demos/technology-overview/observable-dom.html

>NOTE: Click the __JS__ tab to see the code.

The demo uses a [can-stache] view:

```js
var view = stache(`
  <button on:click='increment()'>+1</button>
  Count: <span>{{count}}</span>
`);
```

The _view_:

- Updates a `<span/>` when the state of `myCounter` changes _using_ `{{count}}`.
- Creates a <button>+1</button> button that calls methods on `myCounter` when DOM events happen _using_ `on:click='increment()'`.

### Stache templates and bindings

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

[can-stache-bindings] is used pass values between the DOM and observables and call methods on
observables. Use it to:

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

The following demo:

- Loops through a list of todos with [can-stache.helpers.each] - `{{#each( todos )}} ... {{/each}}`.
- Write out if all todos are complete with [can-stache.helpers.is] - `{{#is( completeCount, todos.length )}}`.
- Update the `complete` state of a todo when a _checkbox_ is checked and vice-versa with [can-stache-bindings.twoWay] - `checked:bind='complete'`.
- Completes every todo with [can-stache-bindings.event] - `on:click='completeAll()'`.

@demo demos/technology-overview/simple-todos.html


### Components

The final core __view__ library is [can-component].

<img src="../../docs/can-guides/experiment/technology/observables-dom.png"
  alt=""
  width="300px"/>

[can-component] is used to create customs elements.  Custom elements are used to
encapsulate widgets or application logic. For example, you
might use [can-component] to create a `<percent-slider>` element that creates a
slider widget on the page:

@demo demos/technology-overview/component-slider.html

Or, you might use [can-component] to make a `<task-editor>` that uses `<percent-slider>`
and manages the application logic around editing a todo:

@demo demos/technology-overview/task-editor.html


A [can-component] is a combination of:

- a [can-define/map/map DefineMap] observable,
- a [can-stache] view, and
- a [can-view-callbacks registered] tag name.

For example, the following demo defines and uses a `<my-counter>` custom element. Hit the <button>+1</button> button
to see it count.

@demo demos/technology-overview/my-counter.html

The demo defines the `<my-counter>` element with:

- The `Counter` observable constructor as shown in the [Key-Value Observables](#Key_ValueObservables) section of this guide:
  ```js
  import DefineMap from "can-define/map/map";
  var Counter = DefineMap.extend("Counter",{
      count: {value: 0},
      increment() {
          this.count++;
      }
  });
  ```
- The [can-stache] view that incremented the counter as shown in the beginning of this guide:
  ```js
  import stache from "can-stache";
  var view = stache(`
    <button on:click='increment()'>+1</button>
    Count: <span>{{count}}</span>
  `);
- A [can-component] that combines the `Counter` and `view` as follows:
  ```js
  import Component from "can-component";

  Component.extend({
      tag: "my-counter",
      ViewModel: Counter,
      view: view
  });
  ```

The demo then creates a `<my-counter>` element like:

```
<my-counter></my-counter>
```

So __Components__ are just a combination of a [can-stache] __view__ and a
[can-define/map/map DefineMap] __observable__.  [can-component] calls the observable a
[can-component.prototype.ViewModel]. This is because CanJS's observables are typically
built within a [Model-view-viewmodel architecture](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel).

<img src="../../docs/can-guides/experiment/technology/can-component.png"
  alt=""/>

Components are created by inserting their [can-component.prototype.tag] in the DOM or
another [can-stache] view. For example, `<my-counter></my-counter>` creates an instance of the `Counter`
__ViewModel__ and renders it with the __view__ and inserts the resulting HTML inside the `<my-counter>` tag.

[can-stache-bindings] can be used to pass values between
component ViewModels and [can-stache]'s scope.  For example,
we can start the counter's count at 5 with the following:

```html
<my-counter count:from='5'></my-counter>
```

This is shown in the following demo:

@demo demos/technology-overview/my-counter-5.html

[can-stache]'s scope is usually made up of other component ViewModels.  [can-stache-bindings]
passes values from one ViewModel to another.  For example, the `<task-editor>` component
connects its `progress` property to the `value` property of the `<my-slider>` with:

```js
<percent-slider value:bind='progress'/>
```

@demo demos/technology-overview/task-editor.html

So on a high-level, CanJS applications are composed of components whose logic is managed
by an observable _view-model_ and whose _views_ create
other components. The following might be the topology of an example application:

<img src="../../docs/can-guides/experiment/technology/component-architecture-overview.png"
  alt=""
  width="800px"/>

Notice that `<my-app>`'s _view_ will
render either `<page-login>`, `<page-signup>`,
`<page-products>`, or `<page-purchase>` based on
the state of it's _view-model_.  Those sub-components
might use sub-components themselves like `<ui-password>` or `<credit-card>`.


## Observables and the browser's location

CanJS's pattern is that you define application logic in one or
more observables, then you connect these observables to
various browser APIs.  For example, you can connect the `myCounter` observable from
the [Key-Value Observables](#Key_ValueObservables) section to `window.location` with:

```js
import route from "can-route";

route.data = myCounter
route.start()
```

This will add `#!&count=0` to the [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) hash.  

Now, if you called `increment()` on my counter, the `window.location` would
change to `#!count=1`. If you hit the back-button, `myCounter.count` would be
back to `0`:

```js
myCounter.increment()
window.location.hash  //-> "#!&count=1"

history.back()
myCounter.count       //-> 0
window.location.hash  //-> "#!&count=0"
```

@demo demos/technology-overview/route-counter.html

[can-route] is used to setup a bi-directional relationship with an observable and
the browser's location.

<img src="../../docs/can-guides/experiment/technology/observable-routing.png"
  alt=""
  width="500px"/>

By default, `can-route` serializes the observable's data with [can-param],
so that the following observable data produces the following url hashes:

```js
{foo: "bar"}          //-> "#!&foo=bar"
{foo: ["bar", "baz"]} //-> "#!&foo[]=bar&foo[]=baz"
{foo: {bar: "baz"}}   //-> "#!&foo[bar]=baz"
{foo: "bar & baz"}    //-> "#!&foo=bar+%26+baz"
```

> The hash-bang (`#!`) is used as default to comply with a now deprecated
> [Google SEO](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started) recommendation.  Use [can-route-pushstate] for modern applications.

You can register routes that controls the relationship between the
observable and the browser's location. The following registers
a translation between URLs and route properties:

```js
route.register("{count}")
```

This results in the following translation between observable data and url hashes:

```js
{count: 0}                  //-> "#!0"
{count: 1}                  //-> "#!1"
{count: 1, type: "counter"} //-> "#!1&type=counter"
```

You can add data when the url is matched.  The following registers
data for when the URL is matched:

```js
route.register("products",{page: "products"});
route.register("products/{id}",{page: "products"})
```

This results in the following translation between observable data and url hashes:

```js
{page: "products"}          //-> "#!products"
{page: "products", id: 4}   //-> "#!products/4"
```

Registering the empty route (`""`)'s provides initial state for the
application. The following makes sure the count starts at 0 when the hash is empty:

```js
route.register("",{count: 0});
```

@demo demos/technology-overview/route-counter-registered.html




To use [can-route] effectively, there's two main things you need to do:

- Model your observable application view-model
- Register routes that translate between the URL and the application view-model
- Display the right sub-components based on the application view-model state.

For example, you might have a products



Registering routes



## Observables and the service layer

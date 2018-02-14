@page guides/technology-overview Technology Overview
@parent guides/getting-started 1
@outline 2

@description Learn the basics of the core parts of CanJS's technology.

@body

## Overview

CanJS, at its most simplified, consists of key-value __Observables__
connected to different web browser APIs through various connecting
libraries.


<img src="../../docs/can-guides/experiment/technology/overview.svg"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  class='bit-docs-screenshot' width='600px'/>

The general idea is that you create observable objects that encapsulate
the logic and state of your application and connect those observable
objects to:

- The Document Object Model (DOM) to update your page automatically.
- The route to support the forward and back button.
- Your service layer to make receiving, creating, updating, and deleting server data easier.


Instead of worrying about calling the various browser APIs, CanJS abstracts this
away, so you can focus on the logic of your application. The logic of your
application is contained within observables.

The rest of this guide walks you through:

- The basics of defining your own [key-value observable](#Key_ValueObservables) types and
  adding logic to them.
- Connecting those [observables to DOM elements](#ObservablesandHTMLElements) using:
  - stache templates like `<span>{{count}}</span>`,  
  - bindings like `<input value:bind='count'>`, and
  - components that create custom elements like `<my-counter/>`.
- Connecting [observables to the browser's location](#Observablesandthebrowser_slocation) and
  building an example app that routes between different pages, including a login screen.

## Key-Value Observables

The [can-define/map/map DefineMap] and
[can-define/list/list DefineList] __Observables__ define the logic and state
in your application. For example, if we wanted to model
a simple counter, we can use [can-define/map/map DefineMap] as follows:

```js
import DefineMap from "can-define/map/map";
const Counter = DefineMap.extend( {
	count: { default: 0 },
	increment() {
		this.count++;
	}
} );
```

We can create instances of `Counter`, call its methods, and
inspect its state like so:

```js
const myCounter = new Counter();
myCounter.count; //-> 0
myCounter.increment();
myCounter.count; //-> 1
```

`myCounter` is an instance of `Counter`. `myCounter.count` is what we call the _state_ of the `myCounter` instance.  `myCounter.increment` is part of the _logic_ that controls the
state of `myCounter`.

> __NOTE:__ CanJS application logic is coded within instances of `DefineMap` and `DefineList`.
> You often don’t need the DOM for unit testing!

[can-define/map/map DefineMap] and [can-define/list/list DefineList] have a wide variety of features (and shorthands)
for defining property behavior. In the previous example, `count: {default: 0}` defined the `count` property to
have an initial value of `0`. The `{default: 0}` object is a [can-define.types.propDefinition].

The following example uses the [can-define.types.default] and [can-define.types.get] property
definition behaviors to define a `TodosApp` constructor function's `todos` and `completeCount`
property behavior:

```js
const TodosApp = DefineMap.extend( {
	todos: {

		// todos defaults to a DefineList of todo data.
		default: () => new DefineList( [
			{ complete: true, name: "Do the dishes." },
			{ complete: true, name: "Wash the car." },
			{ complete: false, name: "Learn CanJS." }
		] )
	},

	// completedCount is the number of completed todos in the `todos`
	// property.
	completeCount: {
		get() {
			return this.todos.filter( { complete: true } ).length;
		}
	}
} );
```

Instances of `TodosApp` will have default `todos` value and a `completeCount`
that dynamically changes when `todos` changes:

```js
const todosApp = new TodosApp();
todosApp.todos; //-> DefineList[{complete: true, name: "Do the dishes."}, ...]
todosApp.completeCount; //-> 2
todosApp.todos[ 2 ].complete = true;
todosApp.completeCount; //-> 3
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

> __NOTE:__ Click the __JS__ tab to see the code.

The demo uses a [can-stache] view:

```js
const view = stache( `
<button on:click='increment()'>+1</button>
Count: <span>{{count}}</span>
` );
```

The _view_:

- Updates a `<span/>` when the state of `myCounter` changes _using_ `{{count}}`.
- Creates a <button>+1</button> button that calls methods on `myCounter` when DOM events happen _using_ `on:click='increment()'`.

### Stache templates and bindings

[can-stache] is used to create HTML that updates automatically when observable
state changes. It uses magic tags to read values and perform simple logic. The following
are the most commonly used tags:

- [can-stache.tags.escaped] - Inserts the result of `expression` in the page.
  ```html
  Count: <span>{{count}}</span>
  ```
- [can-stache.helpers.if] - Render the _block_ content if the expression evaluates
  to a _truthy_ value; otherwise, render the _inverse_ content.
  ```html
  {{#if(count)}} Count not 0 {{else}} Count is 0 {{/if}}
  ```
- [can-stache.helpers.is] - Render the _block_ content if all comma seperated expressions
  evaluate to the same value; otherwise, render the _inverse_ content.
  ```html
  {{#is(count, 1)}} Count is 1 {{else}} Count is not 1 {{/if}}
  ```
- [can-stache.helpers.each] - Render the _block_ content for each item in the list the expression evaluates to.
  ```html
  {{#each(items)}} {{name}} {{/each}}
  ```

[can-stache-bindings] is used pass values between the DOM and observables and call methods on
observables. Use it to:

- Call methods on observables when DOM events happen. The following uses
  [can-stache-bindings.event] to call `doSomething` with the `<input>`'s value on a `keypress` event:
  ```html
  <input on:keypress="doSomething(scope.element.value)"/>
  ```
- Update observables with element attribute and property values.  The following uses [can-stache-bindings.toParent]
  to send the `<input>`'s _value to_ an observable's `count` property.
  ```html
  <input value:to="count"/>
  ```
- Update element attribute and property values with observable values.  The following uses [can-stache-bindings.toChild]
  to update the `<input>`'s _value from_  an observable's `count` property.
  ```html
  <input value:from="count"/>
  ```
- Cross bind element attribute and property values with observable values.  The following uses
  [can-stache-bindings.twoWay] to update the `<input>`'s _value_ from  an observable's `count` property
  and vice versa:
  ```html
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
  class='bit-docs-screenshot'/>

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
const Counter = DefineMap.extend( {
	count: { default: 0 },
	increment() {
		this.count++;
	}
} );
```
- The [can-stache] view that incremented the counter as shown in the beginning of this guide:
  ```js
import stache from "can-stache";
const view = stache( `
<button on:click='increment()'>+1</button>
Count: <span>{{count}}</span>
` );
```
- A [can-component] that combines the `Counter` and `view` as follows:
  ```js
import Component from "can-component";
Component.extend( {
	tag: "my-counter",
	ViewModel: Counter,
	view: view
} );
```

The demo then creates a `<my-counter>` element like:

```html
<my-counter></my-counter>
```

So __components__ are just a combination of a [can-stache] __view__ and a
[can-define/map/map DefineMap] __observable__.  [can-component] calls the observable a
[can-component.prototype.ViewModel]. This is because CanJS's observables are typically
built within a [Model-View-ViewModel (MVVM) architecture](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel).

<img src="../../docs/can-guides/experiment/technology/can-component.png"
  alt="" class='bit-docs-screenshot'/>

Instead of creating the view, view-model as separate entities, they are
often done together as follows:

```js
import Component from "can-component";
Component.extend( {
	tag: "my-counter",
	view: `
<button on:click='increment()'>+1</button>
Count: <span>{{count}}</span>
`,
	ViewModel: {
		count: { default: 0 },
		increment() {
			this.count++;
		}
	}
} );
```

[can-component] will create a `can-stache` template from a string [can-component.prototype.view] value
and define a [can-define/map/map DefineMap] type from a plain
object [can-component.prototype.ViewModel] value. This is a useful short-hand for creating components. __We will use it for all components going forward.__

#### Passing data to and from components

Components are created by inserting their [can-component.prototype.tag] in the DOM or
another [can-stache] view. For example, `<my-counter></my-counter>` creates an instance of the
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

```html
<percent-slider value:bind='progress'/>
```

@demo demos/technology-overview/task-editor.html

So on a high-level, CanJS applications are composed of components whose logic is managed
by an observable _view-model_ and whose _views_ create
other components. The following might be the topology of an example application:

<img src="../../docs/can-guides/experiment/technology/component-architecture-overview.png"
  alt=""
  class='bit-docs-screenshot'/>

Notice that `<my-app>`'s _view_ will
render either `<page-login>`, `<page-signup>`,
`<page-products>`, or `<page-purchase>` based on
the state of it's _view-model_.  Those page-level components
might use sub-components themselves like `<ui-password>` or `<product-list>`.


## Observables and the browser's location

CanJS's pattern is that you define application logic in one or
more observables, then connect the observables to
various browser APIs.  For example, you can connect the `myCounter` observable from
the [Key-Value Observables](#Key_ValueObservables) section to `window.location` with:

```js
import route from "can-route";
route.data = myCounter;
route.start();
```

This will add `#!&count=0` to the [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) hash.  

Now, if you called `increment()` on my counter, the `window.location` would
change to `#!count=1`. If you hit the back-button, `myCounter.count` would be
back to `0`:

```js
myCounter.increment();
window.location.hash;  //-> "#!&count=1"
history.back();
myCounter.count;       //-> 0
window.location.hash;  //-> "#!&count=0"
```

@demo demos/technology-overview/route-counter.html

[can-route] is used to setup a bi-directional relationship with an observable and
the browser's location.

<img src="../../docs/can-guides/experiment/technology/observable-routing.png"
  alt=""
  class='bit-docs-screenshot'/>

By default, `can-route` serializes the observable's data with [can-param],
so that the following observable data produces the following url hashes:

```js
{foo: "bar";}          //-> "#!&foo=bar"
{foo: [ "bar", "baz" ];} //-> "#!&foo[]=bar&foo[]=baz"
{foo: {
	bar: "baz";
}}   //-> "#!&foo[bar]=baz"
{foo: "bar & baz";}    //-> "#!&foo=bar+%26+baz"
```

> __NOTE 1:__ This guide uses hash-based routing instead of pushstate because hash-based routing
is easier to setup. Pushstate routing requires server-support. Use [can-route-pushstate] for pushstate-based applications. The use of [can-route-pushstate] is almost identical to [can-route].

> __NOTE 2:__ [can-route] uses hash-bangs (`#!`) to comply with a now-deprecated
> [Google SEO](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started)
> recommendation.

You can register routes that controls the relationship between the
observable and the browser's location. The following registers
a translation between URLs and route properties:

```js
route.register( "{count}" );
```

This results in the following translation between observable data and url hashes:

```
{count: 0}                  //-> "#!0"
{count: 1}                  //-> "#!1"
{count: 1, type: "counter"} //-> "#!1&type=counter"
```

You can add data when the url is matched.  The following registers
data for when the URL is matched:

```js
route.register( "products", { page: "products" } );
route.register( "products/{id}", { page: "products" } );
```

This results in the following translation between observable data and url hashes:

```
{page: "products"}          //-> "#!products"
{page: "products", id: 4}   //-> "#!products/4"
```

Registering the empty route (`""`) provides initial state for the
application. The following makes sure the count starts at 0 when the hash is empty:

```js
route.register( "", { count: 0 } );
```

@demo demos/technology-overview/route-counter-registered.html


### Routing and the root component

Understanding how to use [can-route] within an application comprised of [can-component]s
and their [can-stache] views and observable view-models can be tricky.  

We'll use the following example to help make sense of it:

@demo demos/technology-overview/route-mini-app.html

This example shows the `<page-login>` component until someone has logged in.  Once they have
done that, it shows a particular component based upon the hash. If the hash is empty (`""` or `"#!"`),
the `<page-home>` component is shown.  If the hash is like `tasks/{taskId}` it will show the `<task-editor>` component we created previously. (_NOTE: We will show how to persist changes
to todos in a upcoming service layer section._)

The switching between different components is managed by a `<my-app>` component. The topology of
the application looks like:

<img src="../../docs/can-guides/experiment/technology/routing-app-overview.png"
  alt="The my-app component on top. The page-home, page-login, task-editor nodes are children of my-app. percent-slider component is a child of task-editor."
  class='bit-docs-screenshot'/>  

In most applications, [can-route] is connected to the top-level component's
[can-component.prototype.ViewModel]. We are going to go through the process of
building `<my-app>` and connecting it
to [can-route]. This is usually done in four steps:

1. Connect the top-level component's view-model to the routing [can-route.data].
2. Have the top-level component's [can-component.prototype.view] display the right sub-components based on the view-model state.
3. Define the top-level component's view-model (sometimes called _application view-model_).
4. Register routes that translate between the URL and the application view-model.

### Connect a component's view-model to can-route

To connect a component's view-model to can-route, we first need to create a basic
component. The following creates a `<my-app>` component that displays its `page` property and
includes links that will change the page property:

```js
import Component from "can-component";
import stache from "can-stache";
import DefineMap from "can-define/map/map";
import route from "can-route";
import "can-stache-route-helpers";
Component.extend( {
	tag: "my-app",
	view: stache( `
The current page is {{page}}.
<a href="{{ routeURL(page='home') }}">Home</a>
<a href="{{ routeURL(page='tasks') }}">Tasks</a>
` ),
	ViewModel: {
		page: "string"
	}
} );
```

> __NOTE:__ Your html needs a `<my-app></my-app>` element to be able to see the
> component's content.  It should say "The current page is .".

To connect the component's VM to the url, we:

- set [can-route.data] to the custom element.
- call and [can-route.start] to begin sending url values to the component.

```js
route.data = document.querySelector( "my-app" );
route.start();
```

At this point, changes in the URL will cause changes in the `page`
property. See this by clicking the links and the back/refresh buttons below:

@demo demos/technology-overview/route-mini-app-start.html

### Display the right sub-components

When building components, we suggest designing the [can-component.prototype.view]
before the [can-component.prototype.ViewModel].  This helps you figure out what logic
the [can-component.prototype.ViewModel] needs to provide an easily understood
[can-component.prototype.view].

We'll use [can-stache.helpers.switch] to switch between different components
based on a `componentToShow` property on the view-model. The result looks like the following:

```js
Component.extend( {
	tag: "my-app",
	view: stache( `
{{#switch(componentToShow)}}
{{#case("home")}}
<page-home isLoggedIn:from="isLoggedIn" logout:from="logout"/>
{{/case}}
{{#case("tasks")}}
<task-editor id:from="taskId" logout:from="logout"/>
{{/case}}
{{#case("login")}}
<page-login isLoggedIn:bind="isLoggedIn" />
{{/case}}
{{#default}}
<h2>Page Missing</h2>
{{/default}}
{{/switch}}
` )

// ...
} );
```

Notice that the view-model will need the following properties:

- __isLoggedIn__ - If the user is logged in.
- __logout__ - A function that when called logs the user out.
- __taskId__ - A taskId in the hash.

We will implement these properties and `componentToShow` in the
[can-component.prototype.ViewModel].

### Define the view-model

Now that we've designed the _view_ it's time to code the observable view-model
with the logic to make the view behave correctly. We implement the
`ViewModel` as follows:

```js
Component.extend( {
	tag: "my-app",

	// ...
	ViewModel: {

		// Properties that come from the url
		page: "string",
		taskId: "string",

		// A property if the user has logged in.
		// `serialize: false` keeps `isLoggedIn` from
		// affecting the `url` and vice-versa.
		isLoggedIn: {
			default: false,
			type: "boolean",
			serialize: false
		},

		// We show the login page if someone
		// isn't logged in, otherwise, we
		// show what the url points to.
		get componentToShow() {
			if ( !this.isLoggedIn ) {
				return "login";
			}
			return this.page;
		},

		// A function we pass to sub-components
		// so they can log out.
		logout() {
			this.isLoggedIn = false;
		}
	}
} );
```

> NOTE: The [can-define.types.serialize] property behavior controls the
> [can-define/map/map.prototype.serialize serializable] properties of
> a [can-define/map/map DefineMap]. Only
> serializable properties of the map are used by [can-route] to
> update the url. `serialize: false` keeps `isLoggedIn` from
> affecting the `url` and vice-versa. Getters like `componentToShow`
> are automatically configured with `serialize: false`.


Finally, our component works, but the urls aren't easy to
remember (ex: `#!&page=home`). We will clean that up in the
next section.


### Register routes

Currently, after the user logs in, the application will show `<h2>Page Missing</h2>` because if the url hash is empty, `page` property will be undefined. To have `page`
be `"home"`, one would have to navigate to `"#!&page=home"` ... yuck!  

We want the `page` property to be `"home"` when the hash is empty.  Furthermore,
we want urls like `#!tasks` to set the `page` property.  We can do that
by registering the following route:

```js
route.register( "{page}", { page: "home" } );
```

Finally, we want `#!tasks/5` to set `page` to `"tasks"` and `taskId`
to `"5"`.  Registering the following route does that:

```js
route.register( "tasks/{taskId}", { page: "tasks" } );
```

Now the mini application is able to translate changes in the url to
properties on the component's view-model.  When the component's view-model
changes, the view updates the page.

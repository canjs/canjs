@page guides/technology-overview Technology Overview
@parent guides/essentials 1
@outline 2

@description Learn the basics of CanJS's technology.

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
.obs {color: #800020; font-weight: bold}
.code-toolbar + a {
    text-align: center; color: gray; display: block;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
}
</style>

## Overview

CanJS, at its most simplified, consists of key-value <span class='obs'>Observables</span>
connected to web browser APIs through various connecting
libraries.


<img src="../../docs/can-guides/experiment/technology/overview.svg"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  class='bit-docs-screenshot' width='600px'/>

The general idea is that you create <span class='obs'>observable</span> objects that encapsulate
the logic and state of your application and connect those <span class='obs'>observable</span>
objects to:

- The Document Object Model (DOM) to update your [guides/html] automatically.
- The browser URL to support the forward and back button through [guides/routing].
- Your service layer to make receiving, creating, updating, and deleting [guides/service-data server data] easier.


Instead of worrying about calling the various browser APIs, CanJS abstracts this
away, so you can focus on the logic of your application. The logic of your
application is contained within <span class='obs'>observables</span>.

The rest of this page walks through the basics of <span class='obs'>observables</span> and brief examples
of connecting observables to browser APIs. For a deeper dive, please read through the [guides/html], [guides/routing] and [guides/service-data]
guides.

## Key-Value Observables

The [can-define/map/map DefineMap] and
[can-define/list/list DefineList] <span class='obs'>observables</span> define the logic and state
in your application. For example, the following uses [can-define/map/map DefineMap] to:

- Model a simple `Counter` type.
- Create instances of `Counter`, call its methods, and inspect its state.


```js
import {DefineMap} from "can";

// Extend DefineMap to create a custom observable type.
const Counter = DefineMap.extend({

    // Defines a `count` property that defaults to 0.
    count: {default: 0},

    // Defines an `increment` method that increments
    // the `count` property.
    increment() {
        this.count++;
    }
});

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



`myCounter` is an instance of `Counter`. `myCounter.count` is what we call the _state_ of the `myCounter` instance.  `myCounter.increment` is part of the _logic_ that controls the
state of `myCounter`.

> __NOTE:__ CanJS application logic is coded within instances of `DefineMap` and `DefineList`.
> You often don’t need the DOM for unit testing!

[can-define/map/map DefineMap] and [can-define/list/list DefineList] have a wide variety of features (and shorthands)
for defining property behavior. In the previous example, `count: {default: 0}` defined the `count` property to
have an initial value of `0`. The `{default: 0}` object is a [can-define.types.propDefinition].


## Observables and HTML Elements

CanJS applications use [can-component Component] to connect <span class='obs'>observables</span>
to a page's HTML elements. We can use [can-component Component] to create a counting widget
for the `Counter` <span class='obs'>observables</span> we just created.

The following widget counts the number of times the <button>+1</button> button is clicked:

<p data-height="106" data-theme-id="dark" data-slug-hash="jKJqoJ" data-default-tab="result" data-user="justinbmeyer" data-embed-version="2" data-pen-title="my-counter (5.pre)" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/jKJqoJ/">my-counter (5.pre)</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>

In CanJS, widgets are encapsulated with custom elements. Custom elements allow us to put an
element in our HTML like `<my-counter></my-counter>`, and the widget will spring to life.

The following HTML includes a `<my-counter>` element and defines the `<my-counter>` [can-component Component]:

```html
<!-- Adds the custom element to the page -->
<my-counter></my-counter>

<script type="module">
import { DefineMap, Component } from "can";

// Define the `Counter` observable type
const Counter = DefineMap.extend({
    count: {default: 0},
    increment() {
        this.count++;
    }
});

// Extend Component to define a custom element
Component.extend({

    // The name of the custom element
    tag: "my-counter",

    // The HTML content within the custom element.
    //  - {{count}} is a `stache` magic tag.
    //  - `on:click` is a `stache` event binding.
    view: `
        Count: <span>{{count}}</span>
        <button on:click='increment()'>+1</button>
    `,

    // The Observable type used to control the
    // logic of this custom element
    ViewModel: Counter
});
</script>
```
@codepen

Typically, a Component's <span class='obs'>observable</span> [can-component.prototype.ViewModel] is defined
inline as follows:

```html
<my-counter></my-counter>

<script type="module">
import { Component } from "can";

Component.extend({
    tag: "my-counter",
    view: `
        Count: <span>{{count}}</span>
        <button on:click='increment()'>+1</button>
    `,
    // If `ViewModel` is set to an Object,
    // that Object is used to extend `DefineMap`.
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
</script>
```
@codepen

You might have noticed that Components are mostly 2 parts:

- A [can-component.prototype.view] that specifies the HTML content within the custom element. In this case, we’re adding a `<span>` and a `<button>` within the `<my-counter>` element.
- An <span class='obs'>observable</span> [can-component.prototype.ViewModel] that manages the logic and state of the application.

These work together to receive input from the user, update the state of the application, and then update
the HTML the user sees accordingly. See how in this 2 minute video:

<iframe width="560" height="315" src="https://www.youtube.com/embed/3zMwoEuyX9g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

For more information on how to connect <span class='obs'>observables</span> to the DOM, read the
[guides/html] guide.

## Observables and the browser's location

CanJS applications use [can-route route] (or [can-route-pushstate routePushstate]) to connect an
<span class='obs'>observable</span> to the browser's URL.

The following shows the browser's forward and back buttons connected to the `myCounter` <span class='obs'>observable</span>
created in the [Key Observables](#Key_ValueObservables) section.

@demo demos/technology-overview/route-counter.html


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
myCounter.increment()
window.location.hash  //-> "#!&count=1"

history.back()
myCounter.count       //-> 0
window.location.hash  //-> "#!&count=0"
```




## Observables and the service layer ##



<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

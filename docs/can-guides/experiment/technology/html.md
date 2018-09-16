@page guides/html HTML
@parent guides/essentials 2
@outline 2

@description Learn how to update HTML and listen to user interactions.

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
</style>

## Overview

In a web application, one of the most common needs  is to listen to user
interactions and then update the page.  

Let's say you want to create a page that counts clicks like the following: (_click the `+1` button_):

<p style="border: 1px solid #ccc; padding: 15px;"><my-counter></my-counter></p>

<style>
  my-counter button {margin-left: 15px;}
</style>
<script type="text/steal-module">
const Component = require("can-component");
Component.extend({
    tag: "my-counter",
    view: " Count: <span>{{count}}</span> <button on:click='increment()'>+1</button> ",
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count = this.count + 1;
        }
    }
});
</script>

With native HTML (DOM) APIs, you might implement this widget like:

```html
<div id="my-counter"></div>

<script type="module">
    // Get the counter element.
    const counter = document.getElementById("my-counter");

    // Store the state of the widget.
    let count = 0;

    // Initialize the HTML within the widget.
    counter.innerHTML = `
        Count: <span>0</span>
        <button>+1</button>
    `;

    // Listen to when the +1 is clicked.
    counter.querySelector("button").addEventListener("click", function(){

        // Update the HTML.
        counter.querySelector("span").textContent = (++count)
    })
</script>
```
@codepen


This implementation uses `addEventListener()` to listen to user interactions (clicks) and
`.innerHTML` and `.textContent` to update the page.  CanJS removes the need to
call these native DOM APIs directly, reducing the amount of code you have to write. But more importantly,
CanJS will improve this code in other ways:

- It will manage state better.
- It will be easier to test.
- Multiple counter widgets can be created easily.

In CanJS, widgets are encapsulated with custom elements. Custom elements allow us to put an
element in our HTML like `<my-counter></my-counter>`, and the widget will spring to life.
[can-component Component] is used to create custom elements.

The following implementation uses [can-component Component] to create the counter
functionality above. This implementation:

- Includes a `<my-counter>` element in the page's HTML.
- Defines a `<my-counter>` [can-component Component].

```html
<!-- Adds the custom element to the page -->
<my-counter></my-counter>

<script type="module">
import { Component } from "can";

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

    // Defines a DefineMap used to control the
    // logic of this custom element.
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

- A [can-stache stache] [can-component.prototype.view] that specifies the HTML content within the custom element. In this case, we’re adding a `<span>` and a `<button>` within the `<my-counter>` element.
- An <span class='obs'>observable</span> [can-component.prototype.ViewModel] that manages the logic and state of the application.

These work together to receive input from the user, update the state of the application, and then update
the HTML the user sees accordingly. See how in this 2 minute video:

<iframe width="560" height="315" src="https://www.youtube.com/embed/3zMwoEuyX9g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

[can-component Component] uses [can-stache stache] to update the HTML
and [can-stache-bindings stacheBindings] to listen to user interactions and pass data between
components.  The remainder of this guide breaks down these pieces and goes into more detail
about how [can-component Component] works and how to use it.

## Stache templates and bindings

[can-stache] is used to create HTML that updates automatically when observable
state changes. It uses magic tags to read values and perform simple logic. The following
are the most commonly used tags:

- [can-stache.tags.escaped] - Inserts the result of `expression` in the page.
  ```html
  Count: <span>{{ count }}</span>
  ```
- [can-stache.helpers.if] - Render the _block_ content if the expression evaluates
  to a _truthy_ value; otherwise, render the _inverse_ content.
  ```html
  {{# if(count) }} Count not 0 {{ else }} Count is 0 {{/ if }}
  ```
- [can-stache.helpers.is] - Render the _block_ content if all comma seperated expressions
  evaluate to the same value; otherwise, render the _inverse_ content.
  ```html
  {{# is(count, 1) }} Count is 1 {{ else }} Count is not 1 {{/ if }}
  ```
- [can-stache.helpers.for-of] - Render the _block_ content for each item in the list the expression evaluates to.
  ```html
  {{# for(item of items) }} {{item.name}} {{/ for }}
  ```

[can-stache-bindings] are used to pass values between the DOM and observables and call methods on
observables. Use it to:

- Call methods on observables when DOM events happen. The following uses
  [can-stache-bindings.event] to call `doSomething` with the `<input>`’s value on a `keyup` event:
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { Component } from "can";

  Component.extend({
      tag: "my-demo",
      view: `<input on:keyup="doSomething(scope.element.value)"/>`,
      ViewModel: {
          doSomething(value) {
            console.log("You wrote "+value);
          }
      }
  });
  </script>
  ```
  @highlight 8
  @codepen

- Update observables with element attribute and property values.  The following uses [can-stache-bindings.toParent]
  to send the `<input>`’s _value to_ the [can-component.prototype.ViewModel]’s `count` property when the user presses enter.
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { Component } from "can";

  Component.extend({
      tag: "my-demo",
      view: `<input value:to="count"/> Count: {{count}}`,
      ViewModel: {
          count: "number"
      }
  });
  </script>
  ```
  @highlight 8
  @codepen


- Update element attribute and property values with observable values.  The following uses [can-stache-bindings.toChild]
  to update the `<input>`’s _value from_  the [can-component.prototype.ViewModel]’s `count` property.
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { Component } from "can";

  Component.extend({
      tag: "my-demo",
      view: `<input value:from="count"/>`,
      ViewModel: {
          count: {
              // Makes count increase by 1 every
              // second.
              value(prop) {
                  let count = prop.resolve(0);
                  let timer = setInterval( () => {
                      prop.resolve(++count);
                  },1000);
                  // Return a cleanup function
                  // that is called when count
                  // is longer used.
                  return () => {
                      clearTimeout(timer);
                  };
              }
          }
      }
  });
  </script>
  ```
  @highlight 8
  @codepen
- Cross bind element attribute and property values with observable values.  The following uses
  [can-stache-bindings.twoWay] to update the `<input>`’s _value_ from the [can-component.prototype.ViewModel]’s `count` property
  and vice versa:
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { Component } from "can";

  Component.extend({
      tag: "my-demo",
      view: `
          <input value:bind="count"/> Count: {{count}}
          <button on:click="increment()">+1</button>
      `,
      ViewModel: {
          count: "number",
          increment() {
              this.count++;
          }
      }
  });
  </script>
  ```
  @highlight 9
  @codepen

The following demo:

- Loops through a list of todos with [can-stache.helpers.each] - `{{# for( todo of todos ) }} ... {{/ for }}`.
- Writes out if all todos are complete with [can-stache.helpers.is] - `{{#is( completeCount, todos.length )}}`.
- Updates the `complete` state of a todo when a _checkbox_ is checked and vice-versa with [can-stache-bindings.twoWay] - `checked:bind='complete'`.
- Completes every todo with [can-stache-bindings.event] - `on:click='completeAll()'`.

@demo demos/technology-overview/simple-todos.html
@codepen

## Components

The final core __view__ library is [can-component].

<img src="../../docs/can-guides/experiment/technology/observables-dom.png"
  alt=""
  class='bit-docs-screenshot'/>

[can-component] is used to create customs elements.  Custom elements are used to
encapsulate widgets or application logic. For example, you
might use [can-component] to create a `<percent-slider>` element that creates a
slider widget on the page:

@demo demos/technology-overview/component-slider.html
@codepen

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
@codepen

The demo defines the `<my-counter>` element with:

- The `Counter` observable constructor as shown in the [Key-Value Observables](technology-overview#Key_ValueObservables) section of the Technology Overview:
  ```js
  import {DefineMap} from "can";
  const Counter = DefineMap.extend({
      count: {default: 0},
      increment() {
          this.count++;
      }
  });
  ```
- The [can-stache] view that incremented the counter as shown in the beginning of this guide:
  ```js
  import {stache} from "can";
  const view = stache(`
    <button on:click='increment()'>+1</button>
    Count: <span>{{count}}</span>
  `);
  ```
- A [can-component] that combines the `Counter` and `view` as follows:
  ```js
  import {Component} from "can";
  Component.extend({
      tag: "my-counter",
      ViewModel: Counter,
      view: view
  });
  ```

The demo then creates a `<my-counter>` element like:

```html
<my-counter></my-counter>
```

So __components__ are just a combination of a [can-stache] __view__ and a
[can-define/map/map DefineMap] __observable__.  [can-component] calls the observable a
[can-component.prototype.ViewModel]. This is because CanJS’s observables are typically
built within a [Model-View-ViewModel (MVVM) architecture](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel).

<img src="../../docs/can-guides/experiment/technology/can-component.png"
  alt="" class='bit-docs-screenshot'/>

Instead of creating the view and view-model as separate entities, they are
often created together as follows:

```js
import {Component} from "can";

Component.extend({
    tag: "my-counter",
    view: `
        <button on:click='increment()'>+1</button>
        Count: <span>{{count}}</span>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
```

[can-component] will create a `can-stache` template from a string [can-component.prototype.view] value
and define a [can-define/map/map DefineMap] type from a plain
object [can-component.prototype.ViewModel] value. This is a useful short-hand for creating components. __We will use it for all components going forward.__

### Passing data to and from components

Components are created by inserting their [can-component.prototype.tag] in the DOM or
another [can-stache] view. For example, `<my-counter></my-counter>` creates an instance of the
__ViewModel__ and renders it with the __view__ and inserts the resulting HTML inside the `<my-counter>` tag.

[can-stache-bindings] can be used to pass values between
component ViewModels and [can-stache]’s scope.  For example,
we can start the counter's count at 5 with the following:

```html
<my-counter count:from='5'></my-counter>
```

This is shown in the following demo:

@demo demos/technology-overview/my-counter-5.html
@codepen

[can-stache]’s scope is usually made up of other component ViewModels.  [can-stache-bindings]
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

Notice that `<my-app>`’s _view_ will
render either `<page-login>`, `<page-signup>`,
`<page-products>`, or `<page-purchase>` based on
the state of its _view-model_.  Those page-level components
might use sub-components themselves like `<ui-password>` or `<product-list>`.

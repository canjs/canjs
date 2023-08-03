@page guides/html HTML
@parent guides/topics 3
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
    view: " Count: <span>{{ this.count }}</span> <button on:click='increment()'>+1</button> ",
    ViewModel: {
        count: { default: 0 },
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
[can-stache-element StacheElement] is used to create custom elements.

The following implementation uses [can-stache-element StacheElement] to create the counter
functionality above. This implementation:

- Includes a `<my-counter>` element in the page's HTML.
- Defines a `<my-counter>` [can-stache-element StacheElement].

```html
<!-- Adds the custom element to the page -->
<my-counter></my-counter>

<script type="module">
import { StacheElement } from "can";

// Extend Component to define a custom element
class MyCounter extends StacheElement {
  static view = `
      Count: <span>{{ this.count }}</span>
      <button on:click='this.increment()'>+1</button>
  `;

  static props = {
      count: 0
  };

  increment() {
      this.count++;
  }
}
customElements.define("my-counter", MyCounter);
</script>
```
@codepen

You might have noticed that `StacheElement` custom elements are mostly 2 parts:

- A [can-stache stache] [can-stache-element/static.view] that specifies the HTML content within the custom element. In this case, we’re adding a `<span>` and a `<button>` within the `<my-counter>` element.
- An <span class='obs'>observable</span> [can-stache-element/static.props] that manages the logic and state of the application.

These work together to receive input from the user, update the state of the application, and then update
the HTML the user sees accordingly.

[can-stache-element StacheElement] uses [can-stache can-stache] to update the HTML
and [can-stache-bindings can-stache-bindings] to listen to user interactions and pass data between
custom elements.  The remainder of this guide breaks down these pieces and goes into more detail
about how [can-stache-element StacheElement] works and how to use it.

## Stache templates and bindings

[can-stache] is used to create HTML that updates automatically when observable
state changes. It uses magic tags to read values and perform simple logic. The following
are the most commonly used tags:

- [can-stache.tags.escaped] - Inserts the result of `expression` in the page.
  ```html
  Count: <span>{{ this.count }}</span>
  ```
- [can-stache.helpers.if] - Render the _block_ content if the expression evaluates
  to a _truthy_ value; otherwise, render the _inverse_ content.
  ```html
  {{# if(this.count) }} Count not 0 {{ else }} Count is 0 {{/ if }}
  ```
- [can-stache.helpers.is] - Render the _block_ content if all comma seperated expressions
  evaluate to the same value; otherwise, render the _inverse_ content.
  ```html
  {{# is(this.count, 1) }} Count is 1 {{ else }} Count is not 1 {{/ if }}
  ```
- [can-stache.helpers.for-of] - Render the _block_ content for each item in the list the expression evaluates to.
  ```html
  {{# for(item of this.items) }} {{ item.name }} {{/ for }}
  ```

[can-stache-bindings] are used to pass values between the DOM and observables and call methods on
observables. Use it to:

- Call methods on observables when DOM events happen. The following uses
  [can-stache-bindings.event] to call `doSomething` with the `<input>`’s value on a `keyup` event:
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { StacheElement } from "can";

  class MyDemo extends StacheElement {
    static view = `
      <input on:keyup="this.doSomething(scope.element.value)"/>
    `;

    static props = {};

    doSomething(value) {
      console.log("You wrote " + value);
    }
  }
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @highlight 8
  @codepen

- Update observables with element attribute and property values.  The following uses [can-stache-bindings.toParent]
  to send the `<input>`’s _value to_ the [can-stache-element/static.props]’s `count` property when the user changes the value of the `<input>`.
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { StacheElement, type } from "can";

  class MyDemo extends StacheElement {
    static view = `
      <input value:to="this.count"/> Count: {{ this.count }}
    `;

    static props = {
      count: type.convert(Number)
    };
  }
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @highlight 8
  @codepen


- Update element attribute and property values with observable values.  The following uses [can-stache-bindings.toChild]
  to update the `input`’s _value from_  the [can-stache-element/static.props]’s `count` property.
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { StacheElement } from "can";

  class MyDemo extends StacheElement {
    static view = `
      <input value:from="count"/>
    `;

    static props = {
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
    };
  }
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @highlight 8
  @codepen
- Cross bind element attribute and property values with observable values. The following uses
  [can-stache-bindings.twoWay] to update the `<input>`’s _value_ from the [can-stache-element/static.props]’s `count` property
  and vice versa:
  ```html
  <my-demo></my-demo>

  <script type="module">
  import { StacheElement, type } from "can";

  class MyDemo extends StacheElement {
    static view = `
      <input value:bind="this.count"/> Count: {{ this.count }}
      <button on:click="this.increment()">+1</button>
    `;

    static props = {
      count: type.convert(Number)
    };

    increment() {
      this.count++;
    }
  }
  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @highlight 8
  @codepen

The following demo:

- Loops through a list of todos with [can-stache.helpers.for-of] - `{{# for(todo of todos) }} ... {{/ for }}`.
- Writes out if all todos are complete with [can-stache.helpers.eq] - `{{# eq(completeCount, todos.length) }}`.
- Updates the `complete` state of a todo when a _checkbox_ is checked and vice-versa with [can-stache-bindings.twoWay] - `checked:bind='complete'`.
- Completes every todo with [can-stache-bindings.event] - `on:click='completeAll()'`.

@demo demos/technology-overview/simple-todos.html
@codepen

## Components

The final core __view__ library is [can-stache-element].

<img src="../../docs/can-guides/experiment/technology/observables-dom.svg"
  alt=""
  class='bit-docs-screenshot'/>

[can-stache-element] is used to create customs elements.  Custom elements are used to
encapsulate widgets or application logic. For example, you
might use [can-stache-element] to create a `<percent-slider>` element that creates a
slider widget on the page:

@demo demos/technology-overview/component-slider.html
@codepen

Or, you might use [can-stache-element] to make a `<task-editor>` that uses `<percent-slider>`
and manages the application logic around editing a todo:

@demo demos/technology-overview/task-editor.html


A [can-stache-element] is a combination of:

- a [can-observable-object ObservableObject] observable,
- a [can-stache] view.

For example, the following demo defines and uses a `<my-counter>` custom element. Hit the <button>+1</button> button
to see it count.

@demo demos/technology-overview/my-counter.html
@codepen

The demo defines the `<my-counter>` element with:

- The `Counter` observable constructor as shown in the [Key-Value Observables](technology-overview#Key_ValueObservables) section of the Technology Overview:
  ```js
  import { ObservableObject } from "can";

  class Counter extends ObservableObject {
      static props = {
        count: 0
      };

      increment() {
          this.count++;
      }
  };
  ```
- The [can-stache] view that incremented the counter as shown in the beginning of this guide:
  ```js
  import { stache } from "can";

  const view = stache(`
    <button on:click='this.increment()'>+1</button>
    Count: <span>{{ this.count }}</span>
  `);
  ```
- A [can-stache-element] that combines the `Counter` and `view` as follows:
  ```js
  import { StacheElement } from "can";

  class MyCounter extends StacheElement {
      static view = `
          <button on:click="this.increment()">+1</button>
          Count: <span>{{ this.count }}</span>
      `;

      static props = {
          count: 0
      };

      increment() {
          this.count++;
      }
  }
  customElements.define("my-counter", MyCounter);
  ```

The demo then creates a `<my-counter>` element like:

```html
<my-counter></my-counter>
```

So __components__ are just a combination of a [can-stache-element/static.view] created with [can-stache] and
observable [can-stache-element/static.props] similar to a [can-observable-object can-observable-object].

<img src="../../docs/can-guides/experiment/technology/can-stache-element.svg"
  alt="" class='bit-docs-screenshot'/>

[can-stache-element] will create a [can-stache] template from a string [can-stache-element/static.view] value
and define a [can-observable-object ObservableObject] type from a plain
object [can-stache-element/static.props] value.

### Passing data to and from components

Components are created by calling [customeElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) with the [can-stache-element#DefiningacustomelementwithaStacheElementconstructor]. For example, `<my-counter></my-counter>` creates an instance of the
__ObservableObject__ and renders it with the __view__ and inserts the resulting HTML inside the `<my-counter>` tag.

[can-stache-bindings] can be used to pass values between
components and [can-stache]’s scope.  For example,
we can start the counter's count at 5 with the following:

```html
<my-counter count:from='5'></my-counter>
```

This is shown in the following demo:

@demo demos/technology-overview/my-counter-5.html
@codepen

[can-stache]’s scope is usually made up of other component properties.  [can-stache-bindings]
passes values from one component to another.  For example, the `<task-editor>` component
connects its `progress` property to the `value` property of the `<my-slider>` with:

```html
<percent-slider value:bind='progress'/>
```

@demo demos/technology-overview/task-editor.html

So on a high-level, CanJS applications are composed of components whose logic is managed
by observable _properties_ and whose _views_ create
other components. The following might be the topology of an example application:

<img src="../../docs/can-guides/experiment/technology/component-architecture-overview.svg"
  alt=""
  class='bit-docs-screenshot'/>

Notice that `<my-app>`’s _view_ will
render either `<page-login>`, `<page-signup>`,
`<page-products>`, or `<page-purchase>` based on
the state of its _properties_.  Those page-level components
might use sub-components themselves like `<ui-password>` or `<product-list>`.

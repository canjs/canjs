@page guides/html HTML
@parent guides/essentials 2
@outline 2

@description Learn how to u

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
const view = stache(`
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
  const Counter = DefineMap.extend({
      count: {default: 0},
      increment() {
          this.count++;
      }
  });
  ```
- The [can-stache] view that incremented the counter as shown in the beginning of this guide:
  ```js
  import stache from "can-stache";
  const view = stache(`
    <button on:click='increment()'>+1</button>
    Count: <span>{{count}}</span>
  `);
  ```
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

@module {function} can-stache-element
@parent can-views
@collection can-core
@group can-stache-element/static 0 static
@group can-stache-element/lifecycle-methods 1 lifecycle methods
@group can-stache-element/lifecycle-hooks 2 lifecycle hooks
@alias can.StacheElement
@package ../package.json
@outline 2

@description Create a custom element with [can-observable-object ObservableObject]-like properties and [can-stache stache views].

@signature `StacheElement`

  `can-stache-element` exports a `StacheElement` class used to define custom elements.

  Extend `StacheElement` with a:

  - `static view` - A [can-stache stache] view.
  - `static props` - [can-observable-object ObservableObject]-like property definitions.
  - getters, setters, and methods.
  - lifecycle hooks - [can-stache-element/lifecycle-hooks.connected] and [can-stache-element/lifecycle-hooks.disconnected].

  The following defines a  `<count-er>` element:

  ```html
  <count-er></count-er>
  <script type="module">
  import { StacheElement } from "can";
  class Counter extends StacheElement {
    static view = `
      Count: <span>{{ this.count }}</span>
      <button on:click="this.increment()">+1</button>
    `;
    static props = {
      count: 0
    };
    increment() {
      this.count++;
    }
  }
  customElements.define("count-er", Counter);
  </script>
  ```
  @codepen

  To create an element instance, either:

  - Write the element tag and [can-stache-bindings bindings] in a [can-stache] template like:
    ```html
    <count-er count:from="5"/>
    ```
  - Write the element tag in an HTML page:
    ```html
    <count-er></count-er>
    ```
  - Create an instance of the class programmatically like:
    ```js
    const myCounter = new Counter();
    document.body.appendChild(myCounter);
    myCounter.count = 6;
    myCounter.innerHTML; //-> Count: <span>6</span>...
    ```

@body

## Basic Use

The following sections cover everything you need to create a custom element with `StacheElement`.

### Defining a custom element with a StacheElement constructor

In order to create a basic custom element with `StacheElement`, create a class that extends `StacheElement` and call [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) with the tag for the element and the constructor:

```html
<count-er></count-er>
<script type="module">
import { StacheElement } from "can";
class Counter extends StacheElement {
}
customElements.define("count-er", Counter);
</script>
```
@highlight 6,only
@codepen

This custom element can be used by putting a `<count-er></count-er>` tag in an HTML page.

### Defining an element's view

StacheElement uses [can-stache] to render live-bound HTML as the element's innerHTML.

To create a [can-stache] view for the element, add a [can-stache-element/static.view static view] property to the class:

```html
<count-er></count-er>
<script type="module">
import { StacheElement } from "can";
class Counter extends StacheElement {
  static view = `
    Count: <span>{{ this.count }}</span>
    <button on:click="this.increment()">+1</button>
  `;
}
customElements.define("count-er", Counter);
</script>
```
@codepen
@highlight 5-8

The element's HTML will automatically update when any of the element's properties used by the `view` change.

### Defining an element's properties

To manage the logic and state of an element, [can-observable-object ObservableObject]-like property definitions can be added to explicitly configure how an element's properties are defined.

To add property definitions, add a [can-stache-element/static.props static props] object to the class:

```html
<count-er></count-er>
<script type="module">
import { StacheElement } from "can";
class Counter extends StacheElement {
  static view = `
    Count: <span>{{ this.count }}</span>
    <button on:click="this.increment()">+1</button>
  `;
  static props = {
    count: 6
  };
}
customElements.define("count-er", Counter);
</script>
```
@codepen
@highlight 9-11,only

#### Observable class fields

`StachElement` [class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) are also observable.,
 the counter example can be written like the following:

 ```html
 <count-er></count-er>

<script type="module">
import { StacheElement } from "can";
class Counter extends StacheElement {
  static view = `
    Count: <span>{{ this.count }}</span>
    <button on:click="this.increment()">+1</button>
  `;
  
  count = 6
}
customElements.define("count-er", Counter);
</script>
```
@codepen
@highlight 11,only

> **Note:** In order to make `count` property observable, either `count-er` element must be added to the page
> or `initialize` method on the `Counter` instance gets invoked.

### Defining Methods, Getters, and Setters

Methods (as well as getters and setters) can be added to the class body as well:

```html
<count-er></count-er>
<script type="module">
import { StacheElement } from "can";
class Counter extends StacheElement {
  static view = `
    Count: <span>{{ this.count }}</span>
    <button on:click="this.increment()">+1</button>
  `;
  static props = {
    count: 6
  };
  increment() {
    this.count++;
  }
}
customElements.define("count-er", Counter);
</script>
```
@codepen
@highlight 12-14,only

### Lifecycle hooks

If needed, [can-stache-element/lifecycle-hooks.connected] and [can-stache-element/lifecycle-hooks.disconnected] lifecycle hooks can be added to the class body. These will be called when the element is added and removed from the page, respectively.

```html
<button id="add">Add Timer</button>
<button id="remove">Remove Timer</button>
<script type="module">
import { StacheElement } from "can";

class Timer extends StacheElement {
  static view = `
    <p>{{ this.time }}</p>
  `;
  static props = {
    time: { type: Number, default: 0 },
    timerId: Number
  };
  connected() {
    this.timerId = setInterval(() => {
      this.time++;
    }, 1000);
    console.log("connected");
  }
  disconnected() {
    clearInterval(this.timerId);
    console.log("disconnected");
  }
}
customElements.define("time-er", Timer);

let timer;
document.body.querySelector("button#add").addEventListener("click", () => {
  timer = document.createElement("time-er");
  document.body.appendChild(timer);
});

document.body.querySelector("button#remove").addEventListener("click", () => {
  document.body.removeChild(timer);
});
</script>
```
@codepen
@highlight 14-23,only

### Passing templates (customizing layout)

It's a very common need to customize the html of a custom element. For example,
you might want a `<hello-world>` element to write out the "Hello World" message inside an
`<h1>`, `<h2>` or any other DOM structure.

On a high level, this customization involves two steps:

- Passing templates with `<can-template>`
- Calling the templates with `{{ this.template() }}`

#### Passing templates with `<can-template>`

When rendering a StacheElement in a [can-stache] template, you can declaratively create and
pass templates with the `<can-template>` element.

For example, one might want to customize one `<hello-world>` element to write out
"Hello World" message in a `<h1>` or in an italic paragraph as follows:

```html
<hello-world>
  <can-template name="messageTemplate">
    <h1>{{ message }}</h1>
  </can-template>
</hello-world>

<hello-world>
  <can-template name="messageTemplate">
    <p>I say "<i>{{ message }}</i>"!</p>
  </can-template>
</hello-world>
```

Here's what you need to know about `<can-template>`:

- Every `<can-template>` __MUST__ have a name attribute. This is
  the name of the property on the custom
  element that will be set to the template. In the previous example, both `<hello-world>`'s will be created
  with a `messageTemplate` property:

  ```js
  document.querySelector("hello-world").messageTemplate //-> templateFunction()
  ```

- You can have multiple `<can-template>`s within a custom element.  For example,
  the following passes two templates to configure `<hello-world>`:

  ```html
  <hello-world>
    <can-template name="greetingTemplate">
      <b>{{ greeting }}</b>
    </can-template>
    <can-template name="subjectTemplate">
      <b>{{ subject }}</b>
    </can-template>
  </hello-world>
  ```

- `<can-template>`s have the same scope of the custom element, __plus__
  a `LetScope` that the custom element can optionally provide. This means
  that a `{{ this.someData }}` immediately outside the `<hello-world>` will
  reference the same value as `{{ this.someData }}` within a `<can-template>`:

  ```html
  {{ this.someData }}
  <hello-world>
    <can-template name="messageTemplate">
      <h1>{{ message }}</h1>
      <p>Also: {{ this.someData }}</p>
    </can-template>
  </hello-world>
  ```
  @highlight 1,5

  The custom element can add additional data, like `message`, to these
  templates. We will see how to do that in the next section.

#### Calling the templates with `{{ this.template() }}`

Once templates are passed to a custom element, you can call those templates
within the `StacheElement`'s [can-stache-element/static.view]. For example,
`<hello-world>` might call a passed `messageTemplate` as follows:

```html
<my-app></my-app>

<script type="module">
import { StacheElement } from "can";

class HelloWorld extends StacheElement {
  static view = `
    <div>{{ this.messageTemplate() }}</div>
  `;
  static props = {
    messageTemplate: {type: Function, required: true},
    message: "Hello World"
  }
}
customElements.define("hello-world", HelloWorld);

class App extends StacheElement {
  static view = `
    <hello-world>
      <can-template name="messageTemplate">
        <h1>{{ message }}</h1>
      </can-template>
    </hello-world>
  `;
}
customElements.define("my-app", App);
</script>
```
@codepen
@highlight 19,23,only

While the above will render the passed `messageTemplate`, it will not provide it
a `{{ message }}` variable that can be read. You can pass values into a template
with a [can-stache/expressions/hash]. The following passes the message:

```html
<my-app></my-app>

<script type="module">
import { StacheElement } from "can";

class HelloWorld extends StacheElement {
  static view = `
    <div>{{ this.messageTemplate(message = this.message) }}</div>
  `;
  static props = {
    messageTemplate: {type: Function, required: true},
    message: "Hello World"
  }
}
customElements.define("hello-world", HelloWorld);

class App extends StacheElement {
  static view = `
    <hello-world>
      <can-template name="messageTemplate">
        <h1>{{ message }}</h1>
      </can-template>
    </hello-world>
  `;
}
customElements.define("my-app", App);
</script>
```
@codepen
@highlight 8,only

Sometimes, instead of passing each variable, you might want to pass the
entire custom element:

```html
<my-app></my-app>

<script type="module">
import { StacheElement } from "can";

class HelloWorld extends StacheElement {
  static view = `
    <div>{{ this.messageTemplate(helloWorld = this) }}</div>
  `;
  static props = {
    messageTemplate: {type: Function, required: true},
    message: "Hello World"
  }
}
customElements.define("hello-world", HelloWorld);

class App extends StacheElement {
  static view = `
    <hello-world>
      <can-template name="messageTemplate">
        <h1>{{ helloWorld.message }}</h1>
      </can-template>
    </hello-world>
  `;
}
customElements.define("my-app", App);
</script>
```
@codepen
@highlight 8,21,only

Finally, you might want to provide a default template if one is not
provided. You can do this either in the view or as a default props
value.

In the view:

```html
<my-app></my-app>

<script type="module">
import { StacheElement } from "can";

class HelloWorld extends StacheElement {
  static view = `
    {{# if( this.messageTemplate ) }}
      <div>{{ this.messageTemplate(helloWorld = this) }}</div>
    {{ else }}
      <h1>Default: {{this.message}}</h1>
    {{/ if }}
  `;
  static props = {
    messageTemplate: Function,
    message: "Hello World"
  }
}
customElements.define("hello-world", HelloWorld);

class App extends StacheElement {
  static view = `
    <hello-world>
    </hello-world>
  `;
}
customElements.define("my-app", App);
</script>
```
@codepen
@highlight 7-13,15,only

As a default props value:

```html
<my-app></my-app>

<script type="module">
import { StacheElement, stache } from "can";

class HelloWorld extends StacheElement {
  static view = `
    <div>{{ this.messageTemplate(helloWorld = this) }}</div>
  `;
  static props = {
    messageTemplate: {
      type: Function,
      default: stache(`<h1>Default: {{ helloWorld.message }}</h1>`)
    },
    message: "Hello World"
  }
}
customElements.define("hello-world", HelloWorld);

class App extends StacheElement {
  static view = `
    <hello-world>
    </hello-world>
  `;
}
customElements.define("my-app", App);
</script>
```
@codepen
@highlight 7-9,13,only

If a property changes, the rendered passed template also update 
its HTML like following:

```html
<my-app></my-app>

<script type="module">
import { StacheElement, stache } from "can";

class HelloWorld extends StacheElement {
  static view = `
    <div>{{ this.messageTemplate(helloWorld = this) }}</div>
  `;
  static props = {
    messageTemplate: {
      type: Function,
      default: stache(`<h1>Default: {{ helloWorld.message }}</h1>`)
    },
    message: "Hello World"
  }
  change() {
    this.message = "Hello CanJS"
  }
}
customElements.define("hello-world", HelloWorld);

class App extends StacheElement {
  static view = `
    <hello-world>
      <can-template name="messageTemplate">
        <h1>{{ helloWorld.message }}</h1>
        <button on:click="helloWorld.change()">Toggle</button>
      </can-template>
    </hello-world>
  `;
}
customElements.define("my-app", App);
</script>
```
@codepen
@highlight 17-19,28,only


## Testing

Custom elements have [lifecycle methods](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) that are automatically called by the browser.

- `connectedCallback` is called when the element is added to the page
- `disconnectedCallback` is called when the element is removed from the page

StacheElement uses the custom element lifecycle methods to initiate its own lifecycle.

The `connectedCallback` will call:

1. [can-stache-element/lifecycle-methods.initialize] - to set up the element's properties
2. [can-stache-element/lifecycle-methods.render] - to create the innerHTML of the element
3. [can-stache-element/lifecycle-methods.connect] - to connect the element to the DOM

The `disconnectedCallback` will call:

1. [can-stache-element/lifecycle-methods.disconnect] - to clean up event handlers and call teardown functions

StacheElement's lifecycle methods can be used to test each part of the lifecycle. The following sections explain how to do this.

### Testing an element's properties and methods

To test an element's properties and methods, call the [can-stache-element/lifecycle-methods.initialize] method with any initial property values:


```js
import { StacheElement } from "can";
class Counter extends StacheElement {
  static view = `
    Count: <span>{{ this.count }}</span>
    <button on:click="this.increment()">+1</button>
  `;
  static props = {
    count: 6
  };
  increment() {
    this.count++;
  }
}
customElements.define("count-er", Counter);
const counter = new Counter()
  .initialize({ count: 20 });

counter.count === 20; // -> true

counter.increment();
counter.count === 21; // -> true
```
@codepen
@highlight 15,only

### Testing an element's view

To test an element's view, call the [can-stache-element/lifecycle-methods.render] method with any initial property values:

```js
import { StacheElement } from "can";
class Counter extends StacheElement {
  static view = `
    Count: <span>{{ this.count }}</span>
    <button on:click="this.increment()">+1</button>
  `;
  static props = {
    count: 6
  };
  increment() {
    this.count++;
  }
}
customElements.define("count-er", Counter);
const counter = new Counter()
  .render({ count: 20 });

counter.firstElementChild.innerHTML === "20"; // -> true

counter.increment();
counter.firstElementChild.innerHTML === "21"; // -> true
```
@codepen
@highlight 15,only

### Testing an element's lifecycle hooks

To test the functionality of the `connected` or `disconnected` hooks, you can call the [can-stache-element/lifecycle-methods.connect] or [can-stache-element/lifecycle-methods.disconnect] method.

```js
import { StacheElement } from "can";

class Timer extends StacheElement {
  static view = `
    <p>{{ this.time }}</p>
  `;
  static props = {
    time: { type: Number, default: 0 },
    timerId: Number
  };
  connected() {
    this.timerId = setInterval(() => {
      this.time++;
    }, 1000);
  }
  disconnected() {
    clearInterval(this.timerId);
  }
}
customElements.define("time-er", Timer);

const timer = new Timer()
  .connect();

timer.firstElementChild; // -> <p>0</p>

// ...some time passes
timer.firstElementChild; // -> <p>42</p>

timer.disconnect();

// ...some moretime passes
timer.firstElementChild; // -> <p>42</p>
```
@codepen
@highlight 11-18,23,30,only

@property {String|can-stache.view}  can-stache-element/static.view view
@parent can-stache-element/static 0

@description Provides a way to render the element's innerHTML using a [can-stache] template.

@signature `static view = " ... ";`

  The view can be defined using a `static` class field like shown below.

  ```html
  <count-er></count-er>
  <script type="module">
  import { StacheElement } from "can";
  class Counter extends StacheElement {
  	static view = `
  		<p>Count: <span>1</span></p>
  	`;
  }
  customElements.define("count-er", Counter);
  </script>
  ```
  @codepen

> Note: to see all the options supported by `view`, see [can-stache].

@signature `static get view() { return " ... "; }`

  For browsers that do not support class fields (and applications not using a transpiler), properties can be defined using a `static` getter like shown below.

  ```js
  import { StacheElement } from "can";
  class Counter extends StacheElement {
  	static get view() {
  		return `
			<p>Count: <span>1</span></p>
  		`;
  	}
  }
  ```

@signature `static get view = function() {};`

  A function can be passed as the view property. This is useful for loading views in their own files and loading them with [steal-stache] or similar.

  ```js
  import { StacheElement, stache } from "can";

  const renderer = stache(`<p>Count: <span>1</span></p>`);

  class Counter extends StacheElement {
	  static view = renderer;
  }
  ```

@body

## Background

StacheElement uses [can-stache] views. Please read [can-stache stache's documentation] to understand how to do things like:

- Write values to the page
- Branching logic
- Looping

This page details the special abilities of an element's view that are not normally available to a generic stache view.

## Use

The `view` property represents the innerHTML of a custom element.

There are three things to understand about an element's view:

  - __Rendered with the element__ - The view is rendered with `this` as the element instance.
  - __Rendered into the element's innerHTML__ - The rendered result of the view is inserted into the element.
  - __Rendered at the right time__ - The view is rendered when the element is [can-stache-element/lifecycle-methods.connectedCallback inserted into the page] or when [can-stache-element/lifecycle-methods.render] is called for testing.

## Rendered with the element

The view is rendered with `this` as the element instance. The following prints the `age` property of the element.

```js
import { StacheElement } from "can";

class Person extends StacheElement {
	static view = `
		<p>You are {{this.age}}</p>
	`;
}
customElements.define("per-son", Person);

const el = new Person();
el.age = 36;
document.body.appendChild(el);
```
@codepen

## Rendered into the element's innerHTML

The view specified by `view` is rendered directly within the custom element.

For example the following element:

```js
class Greeting extends StacheElement {
	static view = `
		<h1>Hello There</h1>
	`;
}
customElements.define("my-greeting", Greeting);
```

With the following source html:

```html
<header>
	<my-greeting></my-greeting>
</header>
```

Produces the following html:

```html
<header>
	<my-greeting><h1>Hello There</h1></my-greeting>
</header>
```

If there is existing content within the source html, like:

```html
<header>
	<my-greeting>DO REMOVE ME!!!</my-greeting>
</header>
```

…that content is removed and replaced by the element’s view:

```html
<header>
	<my-greeting><h1>Hello There</h1></my-greeting>
</header>
```

## Rendered at the right time

StacheElement handles rendering the view at the right time. In normal application use, this is done during the [can-stache-element/lifecycle-methods.connectedCallback connectedCallback], which is called by the browser when the element is inserted into the page as part of the normal lifecycle of custom elements.

```html
<count-er></count-er>
<script type="module">
import { StacheElement } from "can";
class Counter extends StacheElement {
	static view = `
		<p>Count: <span>1</span></p>
	`;
	// Normally you do not need to implement connectedCallback
	// this is just being done for explanation purposes
	connectedCallback() {
		console.log("HTML before connectedCallback:", this.innerHTML);
		super.connectedCallback();
		console.log("HTML after connectedCallback:", this.innerHTML);
	}
}
customElements.define("count-er", Counter);
</script>
```
@codepen

For testing purposes, the [can-stache-element/lifecycle-methods.render] method can be called to manually render the view. This means that the view can be tested without putting the element in the page, which greatly improves the performance of tests.

```js
import { StacheElement } from "can";
class Counter extends StacheElement {
	static view = `
		<p>Count: <span>1</span></p>
	`;
	// Normally you do not need to implement connectedCallback
	// this is just being done for explanation purposes
	connectedCallback() {
		console.log("HTML before connectedCallback:", this.innerHTML);
		super.connectedCallback();
		console.log("HTML after connectedCallback:", this.innerHTML);
	}
}
customElements.define("count-er", Counter);

const counter = new Counter();
console.log("HTML before render:", counter.innerHTML);
counter.render();
console.log("HTML after render:", counter.innerHTML);
```
@codepen

## Importing Views

The [guides/setup] guide has details on how to import stache views directly. For example,
the following example uses `import view from "./app.stache";`:

```js
import { StacheElement } from "can";
import view from "./app.stache";

class MyApp extends StacheElement {
	static view = view;
	static props = {
      message: "Hello World"
	};
}
customElements.define("my-app", MyApp);
```

This allows:

- authoring stache files in their own files
- faster load times as the stache files are pre-parsed

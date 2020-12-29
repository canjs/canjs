@function can-stache-element/lifecycle-methods.render render
@parent can-stache-element/lifecycle-methods 2

@description Render a `StacheElement` instance.

@signature `render(props)`

  Calling `render` will [can-stache-element/lifecycle-methods.initialize] an element and render its [can-stache-element/static.view] into its `innerHTML`. Normally this is called by the [can-stache-element/lifecycle-methods.connectedCallback], but can be called manually for testing:

  ```js
  import { StacheElement } from "can";

  class MyElement extends StacheElement {
	  static view = `
		  <p>{{this.age}}</p>
	  `;
	  static props = {
		  age: { type: Number, default: 30 }
	  };
  }
  customElements.define("my-el", MyElement);

  const myEl = new MyElement()
	  .render({ age: 32 });

  myEl.age;               // -> 32
  myEl.firstElementChild; // -> <p>32</p>
  ```
  @codepen

	@param {Object} props The initial property values.

	@return {Element} The `element` instance.

@body

## Purpose

For testing purposes or integration with other libraries, `render` can be called to render an element with its view.

The first time `render` is called, it will:

- [can-stache-element/lifecycle-methods.initialize] the element with the property values passed to `render`.
- render the stache view into the element.

Subsequent calls to `render` will not have any effect.

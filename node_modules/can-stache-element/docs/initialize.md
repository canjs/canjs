@typedef {function} can-stache-element/lifecycle-methods.initialize initialize
@parent can-stache-element/lifecycle-methods 1

@description Initialize a `StacheElement` instance with property values.

@signature `initialize(props)`

  Calling `initialize` will set up property definitions and set initial property values. Normally this is called by the [can-stache-element/lifecycle-methods.connectedCallback], but can be called manually for testing:

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
	  .initialize({ age: 32 });

  myEl.age; // -> 32
  ```
  @codepen

	@param {Object} props The initial property values.

	@return {Element} The `element` instance.

@body

## Purpose

For testing purposes or integration with other libraries, `initialize` can be called to initialize an element with property values.

After `initialize` has been called, subsequent calls will not have any effect.

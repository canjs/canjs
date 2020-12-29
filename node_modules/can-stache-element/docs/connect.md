@function can-stache-element/lifecycle-methods.connect connect
@parent can-stache-element/lifecycle-methods 3

@description Connect a `StacheElement` instance to the DOM.

@signature `connect(props)`

  Calling `connect` will [can-stache-element/lifecycle-methods.initialize] and [can-stache-element/lifecycle-methods.render] an element and call its [can-stache-element/lifecycle-hooks.connected] hook. Normally this is called by the [can-stache-element/lifecycle-methods.connectedCallback], but can be called manually for testing:

  ```js
  import { StacheElement } from "can";

  class MyElement extends StacheElement {
	  static view = `
		  <p>{{this.age}}</p>
	  `;
	  static props = {
		  age: { type: Number, default: 30 }
	  };
	  connected() {
		  const p = document.createElement("p");
		  p.innerHTML = "World";
		  this.appendChild(p);
	  }
  }
  customElements.define("my-el", MyElement);

  const myEl = new MyElement()
	  .connect({ greeting: "Hi" });

  myEl.greeting  // -> Hi
  myEl.innerHTML // -> <p>Hi</p>
                 //    <p>World</p>
  ```
  @codepen

	@param {Object} props The initial property values.

	@return {Element} The `element` instance.

@body

## Purpose

For testing purposes or integration with other libraries, `connect` can be called to simulate an element being connected with the DOM.

The first time `connect` is called, it will:

- [can-stache-element/lifecycle-methods.initialize] the element with the property values passed to `connect`.
- [can-stache-element/lifecycle-methods.render] the stache view into the element.
- call the [can-stache-element/lifecycle-hooks.connected] lifecycle hook.

Subsequent calls to `connect` will not have any effect.

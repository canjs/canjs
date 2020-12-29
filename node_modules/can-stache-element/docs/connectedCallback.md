@function can-stache-element/lifecycle-methods.connectedCallback connectedCallback
@parent can-stache-element/lifecycle-methods 0

@description A lifecycle hook called after the element is inserted into the document.

@signature `connectedCallback(props)`

  The browser calls a custom element's `connectedCallback` when the element is added to the page. StacheElement uses this to set up the element's properties, render its view, and call the `connected` lifecycle hook.

  The `connectedCallback` can also be called manually to trigger these things. For example, the following defines a `greeting` property, uses it in the `view`, and also programmatically adds a `<p>` element in the `connected` hook:

  ```js
  import { StacheElement } from "can";

  class MyElement extends StacheElement {
	static view = `
		<p>{{this.greeting}}</p>
	`;
	static props = {
		greeting: { type: String, default: "Hello" }
	};
	connected() {
		const p = document.createElement("p");
		p.innerHTML = "World";
		this.appendChild(p);
	}
  }
  customElements.define("my-el", MyElement);

  const myEl = new MyElement()
	  .connectedCallback();

  myEl.greeting;          // -> Hello
  myEl.firstElementChild; // -> <p>Hello</p>
                          //    <p>World</p>
  ```
  @codepen

	@param {Object} props The initial property values.

	@return {Element} The `element` instance.

@body

## Purpose

`StacheElement` implements the custom element `connectedCallback` hook to:

1. [can-stache-element/lifecycle-methods.initialize] the element with property values. These will be passed to `initialize`.
2. [can-stache-element/lifecycle-methods.render] the stache view into the element.
3. [can-stache-element/lifecycle-methods.connect] the element to the DOM.

The `connectedCallback` can be _called_ to initiate these lifecycle methods. **When creating an extended `StacheElement`, the `connectedCallback` should not be overwritten.** Code that needs to run when an element is added to the page should be put in [can-stache-element/lifecycle-hooks.connected].

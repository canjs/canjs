@function can-stache-element/lifecycle-methods.disconnectedCallback disconnectedCallback
@parent can-stache-element/lifecycle-methods 4

@description A lifecycle hook called after the element is removed from the document.

@signature `disconnectedCallback()`

  The browser calls a custom element's `disconnectedCallback` when the element is removed from the page. StacheElement uses this to clean up event handlers and call the `disconnected` lifecycle hook.

  The `disconnectedCallback` can also be called manually to trigger these things:

  ```js
  import { StacheElement } from "can";

  class MyElement extends StacheElement {
	  connected() {
		  this.listenTo("greeting", (greeting) => {
			  console.log(`greeting changed to ${greeting}`);
		  });
	  }
  }
  customElements.define("my-el", MyElement);

  const myEl = new MyElement()
	  .connectedCallback();

  myEl.greeting = "Hello"; // -> "greeting changed to Hello"

  myEl.disconnectedCallback(); // -> "cleaned up"

  myEl.greeting = "Hi"; // nothing logged
  myEl.greeting = "Hello";

  myEl.disconnectedCallback();
  ```
  @codepen

	@return {Element} The `element` instance.

@body

## Purpose

`StacheElement` implements the custom element `disconnectedCallback` hook to:

- [can-stache-element/lifecycle-methods.disconnect] the element from the DOM.

The `disconnect` method handles cleaning up any event handlers created for the element (including calling [can-event-queue/map/map.stopListening stopListening]) and then calls the [can-stache-element/lifecycle-hooks.disconnected disconnected hook].

**When creating an extended `StacheElement`, the `disconnectedCallback` should not be overwritten.** Code that needs to run when an element is removed from the page should be put in [can-stache-element/lifecycle-hooks.disconnected].

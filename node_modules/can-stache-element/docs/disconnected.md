@function can-stache-element/lifecycle-hooks.disconnected disconnected
@parent can-stache-element/lifecycle-hooks

@description A lifecycle hook called after the element is inserted into the document.

@signature `disconnected()`

  The `disconnected` hook is called by the [can-stache-element/lifecycle-methods.disconnectedCallback] when an element is removed from the page. Code that needs to run when the element is no longer in the page should be put in `disconnected` so that you do not need to worry about the rest of the lifecycle (you do not need to use `super` when implementing `disconnected`). Code that has both setup and teardown can be simplified using [can-stache-element/lifecycle-hooks.connected] since the teardown function has a closure over variables created in `connected`.

   The following example uses `disconnected` to make an HTTP POST request when the element is removed from the page:

  ```js
  import { StacheElement } from "can";

  class MyElement extends StacheElement {
	  disconnected() {
		  fetch("/api/log", {
			  method: "POST",
			  body: JSON.stringify({
				  msg: "my-el was removed from the page"
			  })
		  });
	  }
  }
  customElements.define("my-el", MyElement);

  const myEl = new MyElement();
  document.body.appendChild(myEl);
  document.body.removeChild(myEl); // -> POSTs to /api/log
  ```
  @codepen

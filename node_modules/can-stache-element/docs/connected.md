@function can-stache-element/lifecycle-hooks.connected connected
@parent can-stache-element/lifecycle-hooks

@description A lifecycle hook called after the element is inserted into the document.

@signature `connected()`

  The `connected` hook is called by the [can-stache-element/lifecycle-methods.connectedCallback] when an element is added to the page. Code that needs to run when the element is in the page should be put in `connected` so that you do not need to worry about the rest of the lifecycle (you do not need to use `super` when implementing `connected`). The following example uses `connected` to increment a timer every second and returns a teardown function to clean up the timer:

  ```html
  <time-er></time-er>
  <script type="module">
  import { StacheElement } from "can";

  class Timer extends StacheElement {
	  static view = `
		  <p>{{this.time}}</p>
	  `;
	  static props = {
		  time: { type: Number, default: 0 }
	  };
	  connected() {
		  let intervalId = setInterval(() => {
			  this.time++;
		  }, 1000);

		  return () => {
			  clearInterval(intervalId);
		  };
	  }
  }
  customElements.define("time-er", Timer);
  </script>
  ```
  @codepen

  @return {Function|undefined} A teardown function to be called during [can-stache-element/lifecycle-methods.disconnect disconnect]. This function can be used to tear down anything that was set up during `connected`, using any local variables in its closure.

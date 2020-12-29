@function can-stache-element/lifecycle-methods.disconnect disconnect
@parent can-stache-element/lifecycle-methods 5

@description Disconnect a `StacheElement` instance from the DOM.

@signature `disconnect()`

  Calling `disconnect` will clean up an element's event handlers and call its [can-stache-element/lifecycle-hooks.disconnected disconnected hook]. Normally this is called by the [can-stache-element/lifecycle-methods.disconnectedCallback], but can be called manually for testing:

  ```js
  import { StacheElement } from "can";

  const logs = [];

  class MyElement extends StacheElement {
	  static view = `
		  <p>{{this.name}} has been running for {{this.time}} seconds</p>
	  `;

	  static props = {
		  name: { type: String, default: "App" },
		  time: { type: Number, default: 0 }
	  };

	  connected() {
		  this.listenTo("name", (ev, newName) => {
			  logs.push(`name change to ${newName}`);
		  });

		  let intervalId = setInterval(() => {
			  this.time++;
		  }, 1000);

		  return () => {
			  clearInterval(intervalId);
		  };
	  }

	  disconnected() {
		  logs.push("disconnected");
	  }
  }
  customElements.define("my-el", MyElement);

  const myEl = new MyElement()
	  .connect();

  myEl.innerHTML; // -> <p>App has been running for 0 seconds</p>

  myEl.name = "Counter";
  logs; // -> [ "name changed to Counter" ]
  myEl.innerHTML; // -> <p>Counter has been running for 0 seconds</p>

  // ...some time passes
  myEl.innerHTML; // -> <p>Counter has been running for 3 seconds</p>

  myEl.disconnect();
  myEl.innerHTML; // -> <p>Counter has been running for 3 seconds</p>

  myEl.name = "Stopped Counter";
  logs; // -> [ "name changed to Counter", "disconnected" ]

  // ...some time passes
  myEl.innerHTML; // -> <p>Stopped Counter has been running for 3 seconds</p>
  ```
  @codepen

	@return {Element} The `element` instance.

@body

## Purpose

For testing purposes or integration with other libraries, `disconnect` can be called to simulate an element being disconnected from the DOM.

The first time `disconnect` is called, it will:

- call [can-event-queue/map/map.stopListening stopListening].
- call a teardown handler returned by the [can-stache-element/lifecycle-hooks.connected connected hook].
- call the [can-stache-element/lifecycle-hooks.disconnected disconnected hook].

Subsequent calls to `disconnect` will not have any effect.

@typedef {function} can-component/connectedCallback connectedCallback
@parent can-component.lifecycle 1

@description A lifecycle hook called after the component's element is inserted into the document.

@signature `connectedCallback: function (element) { ... }`

  Use to orchestrate property bindings that would
  otherwise be a stream or an inappropriate side-effect during a getter.

  For example, the following listens to changes on the `name` property
  and counts them in the `nameChanged` property:

  ```html
  <my-component></my-component>

  <script type="module">
  import {Component} from "can";

  Component.extend({
  	tag: "my-component",
  	view: `
  		<p>Name changed: {{nameChanged}}</p>
  		<p>Name: <input value:bind="name"/></p>
  	`,
  	ViewModel: {
  		nameChanged: {type: "number", default: 0},
  		name: "string",
  		connectedCallback( element ) {
  			this.listenTo( "name", function() {
  				this.nameChanged++;
  			} );
  			const disconnectedCallback = this.stopListening.bind( this );
  			return disconnectedCallback;
  		}
  	}
  });
  </script>
  ```
  @highlight 15-21
  @codepen

  `connectedCallback` is named as such to match the [web components](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) spec for the same concept.

  @return {Function|undefined} The `disconnectedCallback` function to be called during teardown. Defined in the same closure scope as setup, it's used to tear down anything that was set up during the `connectedCallback` lifecycle hook. If `undefined` is returned, the default `disconnectedCallback` function will be the
  `viewModel`'s [can-event-queue/map/map.stopListening] function. So if you overwrite `disconnectedCallback`,
  you probably want to make sure [can-event-queue/map/map.stopListening] is called.

@body

## Use

Checkout the [guides/recipes/video-player] for a good example of using `connectedCallback` to create
side effects.  For example, it listens to the `viewModel`'s `playing` and `currentTime` and calls
side-effectual DOM methods like `.play()`.

```js
connectedCallback(element) {
	this.listenTo("playing", function(event, isPlaying) {
		if (isPlaying) {
			element.querySelector("video").play();
		} else {
			element.querySelector("video").pause();
		}
	});
	this.listenTo("currentTime", function(event, currentTime) {
		const videoElement = element.querySelector("video");
		if (currentTime !== videoElement.currentTime) {
			videoElement.currentTime = currentTime;
		}
	});
}
```

As a reminder, event bindings bound with [can-event-queue/map/map.listenTo] (which is available on [can-define/map/map]) will automatically be torn down when the component is removed from the page.

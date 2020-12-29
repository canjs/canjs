@module {function} can-view-target
@parent can-views
@collection can-infrastructure
@package ./package.json

@signature `target(nodes)`

Create a document fragment that can be cloned but have callbacks be
called quickly on elements within the cloned fragment.

```js
import viewTarget from "can-view-target";

const target = viewTarget( [
	{
		tag: "h1",
		callbacks: [ function( data ) {
			this.className = data.className;
		} ],
		children: [
			"Hello ",
			function( data ) {
				this.nodeValue = data.message;
			}
		]
	}
] );

// target.clone -> <h1>|Hello||</h1>
// target.paths -> path: [0], callbacks: [], children: {paths: [1], callbacks:[function(){}]}

const frag = target.hydrate( { className: "title", message: "World" } );

frag; //-> <h1 class='title'>Hello World</h1>
```

@param {Array} nodes

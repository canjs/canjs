@function can-compute.computed.off off
@parent can-compute/computed/methods

Remove an event listener.

@signature `compute.off(eventType, handler)`

```js
const age = compute( 33 );

const handler = function( ev, newVal, oldVal ) {
	ev; //-> {type: "change", batchNum: 5}
	newVal; //-> 34
	oldVal; //-> 33
};

age.on( "change", handler );

age( 34 );

age.off( "change", handler );
```

@param {String} eventType The name of the event to bind on, usually `change`.

@param {function(event, ...args)} handler The handler to be removed.  This has to be the same function that was passed to [can-compute.computed.on].

@return {can-compute.computed} The compute instance.

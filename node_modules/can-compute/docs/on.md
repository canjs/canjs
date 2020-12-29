@function can-compute.computed.on on
@parent can-compute/computed/methods

Listen to when a compute changes value.

@signature `compute.on(eventType, handler)`

```js
const age = compute( 33 );

age.on( "change", function( ev, newVal, oldVal ) {
	ev; //-> {type: "change", batchNum: 5}
	newVal; //-> 34
	oldVal; //-> 33
} );

age( 34 );
```

@param {String} eventType The name of the event to bind on, usually `change`.

@param {function(event, ...args)} handler The handler to be called when this type of event fires.

@return {can-compute.computed} The compute instance.

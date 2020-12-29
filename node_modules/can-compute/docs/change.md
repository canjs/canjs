@typedef {Event} can-compute.computed.ChangeEvent change
@parent can-compute/computed/events

Event fired when the value of the [can-compute.computed] changes.

@signature handler(event, newValue, oldValue)

Handlers registered on `"change"` events will be called back as follows:

```js
const age = compute( 33 );

age.on( "change", function( ev, newVal, oldVal ) {
	ev; //-> {type: "change", batchNum: 5}
	newVal; //-> 34
	oldVal; //-> 33
} );

age( 34 );
```



@param {Event} event An event object.
@param {*} newVal The new value of the compute.
@param {*} oldVal The old value of the compute.

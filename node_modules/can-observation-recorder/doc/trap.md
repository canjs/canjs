@function can-observation-recorder.trap trap
@parent can-observation-recorder/methods

@hide

@signature `ObservationRecorder.trap()`
Trap all observations until the `untrap` function is called. The state of
traps prior to `ObservationRecorder.trap()` will be restored when `untrap()` is called.

```js
const untrap = ObservationRecorder.trap();

ObservationRecorder.add( obj, "prop1" );

const traps = untrap();
console.log( traps[ 0 ].obj === obj ); // -> true
```

@return {can-observation-recorder.getTrapped} A function to get the trapped observations.

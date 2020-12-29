@function can-observation-recorder.isRecording isRecording
@parent can-observation-recorder/methods

@description Return if the current code exists between a [can-observation-recorder.start]
and [can-observation-recorder.stop] call.

@signature `ObservationRecorder.isRecording()`

Return if the current code exists between a [can-observation-recorder.start]
and [can-observation-recorder.stop] call.

```js
ObservationRecorder.isRecording(); //-> false

ObservationRecorder.start();
ObservationRecorder.isRecording(); //-> true
ObservationRecorder.stop();
```

@return {Boolean} True if something is in the process of recording observes.


@body

## Use Cases

`.isRecording` can be used to optimize libraries like [can-observation] so they preemptively
setup their cached value when being read within something that is likely to bind to themselves.

For example, [can-observation]'s `.get` uses this to preemptively bind to itself if its going to be bound later:

```js
{
	get: function() {
		if ( ObservationRecord.isRecording() && !this.bound ) {
			temporarilyBind( this );
		}
		if ( this.bound ) {
			return this.cachedValue;
		} else {

			// run the function
			return this.fn.call( this.context );
		}
	}
}
```

@function can-observation-recorder.addAll addAll
@parent can-observation-recorder/methods

@description Specify how to observe a value that is currently being read with multiple bindings.

@signature `ObservationRecorder.addMany(observes)`


The same as [can-observation-recorder.add] but takes an array of `[object, event]` arrays.

The following indicates to [can-reflect/observe.onKeyValue] `obj1` and `obj2` and
[can-reflect/observe.onValue] `value`:

```js
ObservationRecorder.addMany( [
	[ obj1, "prop1" ],
	[ value ],
	[ obj2, "prop2" ]
] );
```

@param {Array} observes An array of `[object, event]` "observable" arrays. If an "observable" array only has one item,
it's assumed to be a [can-reflect/observe.onValue] binding.

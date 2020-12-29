@function can-observation-recorder.add add
@parent can-observation-recorder/methods

@description Specify how to observe a value that is currently being read.


@signature `ObservationRecorder.add(object [,event] )`

Signals that an object should be observed. Adds the observable being read to
the top of the stack.

```js
// for objects with observable properties:
ObservationRecorder.add( object, "prop" );

// for observables that represent a single value:
ObservationRecorder.add( object );
```

@param {Object} object An observable object which is being observed.
@param {String} [event] The name of the event (or property) that is being observed.

  If an event is provided, the object and event will be in the `.keyDependencies` of [can-observation-recorder.stop]'s
  returned observation record. It's expected that the object implements [can-symbol/symbols/onKeyValue].

  If no `event` is provided, the objet will be added in the
  `.valueDependencies` of [can-observation-recorder.stop]'s returned observation record.  It's expected that the object implements [can-symbol/symbols/onValue].

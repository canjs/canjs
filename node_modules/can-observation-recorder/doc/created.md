@function can-observation-recorder.created created
@parent can-observation-recorder/methods

@description Adds a child dependency to the parent observation's childDependencies.

@signature `ObservationRecorder.created(object)`

Signals that an object was created. Adds the created observable to the top of the stack.

```js
ObservationRecorder.created(object);
```

@param {Object} object An observable object that was recently created.

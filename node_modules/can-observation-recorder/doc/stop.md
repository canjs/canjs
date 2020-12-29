@function can-observation-recorder.stop stop
@parent can-observation-recorder/methods

@description Stop recording calls to [can-observation-recorder.add].

@signature `ObservationRecorder.stop()`

Stop recording calls to [can-observation-recorder.add] and returns an
observation record.

```js
ObservationRecorder.start();

//... some code /* ... */
ObservationRecorder.stop(); //-> observationRecord
```

@return {Object} An observation record with the following structure:

  ```
  {
      keyDependencies: Map<observable,Set<key>>
      valueDependencies: Set<observable>
  }
  ```

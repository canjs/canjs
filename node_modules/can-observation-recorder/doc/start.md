@function can-observation-recorder.start start
@parent can-observation-recorder/methods

@description Start recording calls to [can-observation-recorder.add].

@signature `ObservationRecorder.start()`

Start recording calls to [can-observation-recorder.add] and creates an
observation record that will be returned by [can-observation-recorder.stop].

Start recording also returns the new observation record.

```js
ObservationRecorder.start();

//... some code /* ... */
ObservationRecorder.stop(); //-> observationRecord
```

`.start()` adds a new observation record to the top stack.  So if there are multiple calls to
`.start()` before `.stop()`, only the top of the stack will gain the dependencies. The following shows that
`obj2` is ONLY added to the record at the top of the stack: `record2`.  Once `record2` is popped off,
`record1` receives `ObservationRecorder.add` calls.

```js
ObservationRecorder.start();

ObservationRecorder.add( obj1 );

ObservationRecorder.start();

ObservationRecorder.add( obj2 );

const record1 = ObservationRecorder.stop();

ObservationRecorder.add( obj3 );

const record2 = ObservationRecorder.stop();


record1; //-> {valueDependencies: Set[obj2]}
record2; //-> {valueDependencies: Set[obj1, obj3]}
```


@return {Object} An observation record with the following structure:

  ```
  {
      keyDependencies: Map<observable,Set<key>>
      valueDependencies: Set<observable>
  }
  ```

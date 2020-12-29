@module {Object} can-observation-recorder
@parent can-observables
@collection can-infrastructure
@group can-observation-recorder/methods methods
@package ../package.json

@description Specify how to listen to changes in a value being read and record
those specifications between two points in time.

Record observables being read and indicate how to listen to changes
in a value being read.

@type {Object}

`can-observation-recorder` exports an object with the following methods:

```js
{
    start()  // Starts recording ObservationRecorder.add calls and
             // returns an ObservationRecord representing
             // the ObservationRecorder.add calls.

    stop()   // Stops recording ObservationRecorder.add calls and
             // returns an ObservationRecord representing
             // the ObservationRecorder.add calls.

    add(obj, [key]) // Signal that an observable value was read.

    addMany(observations) // Add many observations at once

    ignore(fn) // Return a function that when called, prevents
               // Any ObservationRecorder.add calls from being noticed
}
```

`can-observation-recorder` serves two main purposes.

- It allows observable values, when read, to specify how to listen to changes in the
  value being read.  
  ```js
  ObservationRecorder.add( map, "value" );

  ObservationRecorder.add( simpleValue );
  ```
- Record all calls to `ObservationRecorder.add` between [can-observation-recorder.start] and
  [can-observation-recorder.stop]:
  ```js
  ObservationRecorder.start();
  ObservationRecorder.add( person, "age" );
  ObservationRecorder.add( fullName );
  const observationRecord = ObservationRecorder.stop();
  observationRecord; //-> {
  //  keyDependencies:   Map{ person: Set[age] },
  //  valueDependencies: Set[fullName]
  //}
  ```

@body

## Use Cases



`can-observation-recorder` is primarily used in two ways:

1. When any of CanJS's observable values (like [can-define]) are read, they __MUST__
call [can-observation-recorder.add] to let [can-observation] and other observable behaviors ([react-view-model]) know to bind to them.
2. It is used by [can-observation] and other observables are able to track all the observables
read within a function.  


## Specifying how to bind when a value is read

All of CanJS's observables __MUST__ call [can-observation-recorder.add] when an observable value is read. `.add(observable [,key])` is called with arguments
representing how to listen to when that value changes.

Depending if the observable represents a single value or key-value pairs, it will callback [can-observation-recorder.add]
with one or more values.

### Key-value observables

If an object has observable key-value pairs, and a key was read through its `.get` method, it might
implement `.get` as follows:

```js
const observableKeyValues = {
	_data: {},
	get: function( key ) {
		ObservationRecorder.add( this, key );
		return this._data[ key ];
	}

	// ...
};
```

`ObservationRecorder.add(observable, key)` called with two arguments indicates that the `observable` argument's [can-symbol/symbols/onKeyValue] will
be called with the `key` argument.  In the case that `observableKeyValues.get("prop")` was called, [can-observation] would call:

```js
observableKeyValues[ canSymbol.for( "can.onKeyValue" ) ]( "prop", updateObservation, "notify" );
```

So not only __MUST__ observables call [can-observation-recorder.add], they also must have the corresponding observable symbols implemented. For `observableKeyValues`, this might look like:

```js
const observableKeyValues = {

	// ...
	handlers: new KeyTree( [ Object, Object, Array ] ),
	[ canSymbol.for( "can.onKeyValue" ) ]: function( key, handler, queue ) {
		this.handlers.add( [ key, queue || "mutate", handler ] );
	},
	[ canSymbol.for( "can.offKeyValue" ) ]: function( key, handler, queue ) {
		this.handlers.delete( [ key, queue || "mutate", handler ] );
	}
};
```

[can-event-queue] has utilities that make this pattern easier. Also checkout [can-key-tree] and [can-queues].

### Single Value Observables

If an observable represents a single value, and that value is read through a `.value` property, it might
implement that property as follows:

```js
const observableValue = {
	_value: {},
	get value() {
		ObservationRecorder.add( this );
		return this._value;
	}

	// ...
};
```

`ObservationRecorder.add(observable)` called with one arguments indicates that the `observable` argument's [can-symbol/symbols/onValue] will be called.  In the case that `observableKeyValues.value` was read, [can-observation] would call:

```js
observableValue[ canSymbol.for( "can.onValue" ) ]( updateObservation, "notify" );
```

So not only __MUST__ observables call [can-observation-recorder.add], they also must have the corresponding observable symbols implemented. For `observableValue`, this might look like:

```js
const observableValue = {

	// ...
	handlers: new KeyTree( [ Object, Array ] ),
	[ canSymbol.for( "can.onValue" ) ]: function( handler, queue ) {
		this.handlers.add( [ queue || "mutate", handler ] );
	},
	[ canSymbol.for( "can.offValue" ) ]: function( handler, queue ) {
		this.handlers.delete( [ queue || "mutate", handler ] );
	}
};
```

[can-event-queue] has utilities that make this pattern easier. Also checkout [can-key-tree] and [can-queues].


## Tracking observables read between two points in time

One of CanJS's best features is that reading values broadcasts through `ObservationRecorder.add` how to
listen to when those values changes.  [can-observation-recorder.start] and [can-observation-recorder.stop]
are used to capture that information, allowing utilities to listen to any values read between `.start()` and `.stop()`.

This is sued by [can-observation] to make "computed" observables and by [react-view-model] to re-render and diff React's
virtual DOM.  Maybe you've got some cool uses too!

Use `.start()` and `.stop()` to track all `.add(observation [,key] )` calls between two points as follows:

```js
ObservationRecorder.start();

ObservationRecorder.add( observableKeyValues, "propA" );
ObservationRecorder.add( observableKeyValues, "propB" );
ObservationRecorder.add( map, "propC" );

ObservationRecorder.add( observableValue );
ObservationRecorder.add( fullNameCompute );

const observationRecord = ObservationRecorder.stop();
```

`observationRecord` would contain the following:

```js
{
    keyDependencies: Map{
        [observableKeyValues]: Set["propA", "propB"],
        [map]: Set["propC"]
    },
    valueDependencies: Set[observableValue, fullNameCompute]
}
```

`keyDependencies` are kept in a `Map` that maps each observable to a set of the keys recorded for that observable.
`valueDependencies` are kept in a `Set`.

[can-observation-recorder.start] adds a new observation record to the stack each time it is called. Read its docs for more
information about what this means.

## How it works

`can-observation-recorder` is a stateful global. We should avoid breaking its API as much as possible.

It keeps a `stack` of _observation records_.  `.start()` pushes to that stack. `.add()` adds values to the
top of the stack. `.stop()` pops the stack and returns the former top of the stack.

[How it works: can-observation and can-observation-recorder](https://www.youtube.com/watch?v=UIhB-zXR5Yg)
covers how `can-observation-recorder` works.

[How it works: can-observation and can-observation-recorder](https://www.youtube.com/watch?v=UIhB-zXR5Yg)
covers how `can-observation` works.

<iframe width="560" height="315" src="https://www.youtube.com/embed/UIhB-zXR5Yg" frameborder="0" allowfullscreen></iframe>

@function can-observation-recorder.ignore ignore
@parent can-observation-recorder/methods

@description Generate functions that can not be observed.

@signature `ObservationRecorder.ignore(fn)`

`.ignore` creates a function that, when called, will prevent observations from
being added.  Notice that the observation record returned by [can-observation-recorder.stop]
has no dependencies:

```js
const fn = ObservationRecorder.ignore( function() {

	// This will be ignored
	ObservationRecorder.add( obj, "prop1" );
} );

OvervationRecorder.start();
fn();
ObservationRecorder.stop(); //-> {
//   keyDependencies: {},
//   valueDependencies: {}
// }
```



@param {Function} fn Any function that contains potential calls to
[can-observation-recorder.add].

@return {Function} A function that is free of observation side-effects.


@body

## Use Cases

Some code should not be observable to utilities like [can-observation].  An example is a [can-stache]
template.  Templates manage observability themselves.  So `can-stache` returns renderer functions wrapped with
`.ignore`.

Another common place that often needs to be ignored is complex initialization code.  Say for example, you had a setter
that created an object and then read some of its properties like:

```js
{
	set prop( value ) {
		const thing = new Thing( value );
		if ( !thing.someObservableProperty ) {
			thing.someObservableProperty = "VALUE";
		}
		return thing;
	}
}
```

We wouldn't want this setter to be observed by something, because it's possible that the reading and
setting of `someObservableProperty` will cause an infinite loop.  

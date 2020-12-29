@function can-compute.computed compute
@parent can-compute
@group can-compute/computed/events events
@group can-compute/computed/methods methods

@description A derived value from other computes and observable maps.

@signature `compute([newVal])`

Gets the compute's value if no arguments are provided, otherwise calls the compute's setter with the value passed as the first argument.

@param {*} [newVal] If the compute is called with an argument, the first argument is used
to set the compute to a new value. This may trigger a
`"change"` event that can be listened for with [can-computed.bind].

If the compute is called without any arguments (`compute()`), it simply returns
the current value.

@return {*} The current value of the compute.

@body

## Use

A compute instance is created with [can-compute] and used as an observable value. Computes are useful to provide a value representative of multiple other observables:

```js
const person = new Person( {
	first: "Matthew",
	last: "Phillips"
} );

const fullName = compute( function() {
	return person.first + " " + person.last;
} );

console.log( fullName() ); // -> "Matthew Phillips".
```

Calling the compute with a value will cause it to run as a setter function:

```js
const count = compute( 0 );

console.log( count() ); // -> 0

count( 5 );

console.log( count() ); // -> 5
```

This depends on how the [can-compute getterSetter] is defined, and can adjust how it handles setters:

```js
const plusOne = compute( function( val ) {
	if ( val ) {
		return val + 1;
	} else {
		return 1;
	}
} );

console.log( plusOne() ); // -> 1

plusOne( 5 );

console.log( plusOne() ); // -> 6
```

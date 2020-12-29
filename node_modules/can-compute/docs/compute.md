@module {function} can-compute
@parent can-observables
@collection can-legacy
@release 1.1
@link ../docco/compute/compute.html docco
@package ../package.json

@description Create an observable value.

@signature `compute(getterSetter[, context])`

Create a compute that derives its value from other observables. Uses [can-observation] to call the `getterSetter` and track observables.

```js
const age = compute( 32 );

const nameAndAge = compute( function() {
	return "Matthew - " + age();
} );

console.log( nameAndAge() ); // -> Matthew - 32

age( 33 );

console.log( nameAndAge() ); // -> Matthew - 33
```

@param {function(*+,*+)} getterSetter(newVal,oldVal) A function that gets, and optionally sets, the value of the compute. When called with no arguments, _getterSetter_ should return the current value of the compute. When called with a single argument, _getterSetter_ should arrange things so that the next read of the compute produces that value. This compute will automatically update its value when any observables values are read.

@param {Object} [context] The `this` to use when calling the `getterSetter` function.

@return {can-compute.computed} A new compute.


@signature `compute(initialValue [, settings])`

Creates a compute from a value and optionally specifies how to read, update, and
listen to changes in dependent values. This form of compute can be used to
create a compute that derives its value from any source.

@param {*} initialValue The initial value of the compute. If `settings` is
not provided, the compute simply updates its value to whatever the first argument
to the compute is.

    var age = compute(30);
    age() //-> 30
    age(31) //-> fires a "change" event

@param {can-compute.computeSettings} [settings]

Configures all behaviors of the [can-compute.computed]. The following cross
binds an input element to a compute:

```js
const input = document.getElementById( "age" );
const value = compute( "", {
	get: function() {
		return input.value;
	},
	set: function( newVal ) {
		input.value = newVal;
	},
	on: function( updated ) {
		input.addEventListener( "change", updated, false );
	},
	off: function( updated ) {
		input.removeEventListener( "change", updated, false );
	}
} );
```

@return {can-compute.computed} The new compute.


@signature `compute(initialValue, setter(newVal,oldVal))`

Create a compute that has a setter that can adjust incoming new values.

```js
const age = compute( 6, function( newVal, oldVal ) {
	if ( !isNaN( +newVal ) ) {
		return +newVal;
	} else {
		return oldVal;
	}
} );
```


@param {*} initialValue

The initial value of the compute.

@param {function(*,*):*} setter(newVal,oldVal)

A function that is called when a compute is called with an argument. The function is passed
the first argumented passed to [can-compute.computed] and the current value. If
`set` returns a value, it is used to compare to the current value of the compute. Otherwise,
`get` is called to get the current value of the compute and that value is used
to determine if the compute has changed values.

@return {can-compute.computed} A new compute.

@signature `compute(object, propertyName [, eventName])`

Create a compute from an object's property value. This short-cut
signature lets you create a compute on objects that have events
that can be listened to with [can-compute.computed.on].

```js
const input = document.getElementById( "age" );
const age = compute( input, "value", "change" );

const me = new DefineMap( { name: "Justin" } );
const name = compute( me, "name" );
```

@param {Object} object An object that has an `addEventListener` method and events dispatched on it.

@param {String} propertyName The property value to read on `object`.  The
property will be read via `object.attr(propertyName)` or `object[propertyName]`.

@param {String} [eventName=propertyName] Specifies the event name to listen
to on `object` for `propertyName` updates.

@return {can-compute.computed} A new compute.


@body

## Use

`can-compute` exports a function that lets you make an observable value.  The following
makes an observable `age` compute whose value changes from `33` to `34`:

```js
import compute from "can-compute";

const age = compute( 33 );
age(); // 33

age.on( "change", function( ev, newVal, oldVal ) {
	newVal; //-> 34
	oldVal; //-> 33
} );

age( 34 );
age(); // 33
```

Computes are similar
to observable maps like [can-define/map/map], but they represent a single value rather than a collection of values.

Computes can derive their value from other computes, maps and lists.
When the derived values change, the compute's value will be automatically updated.  This
is `can-compute`'s best feature.  For example, the following combines the age
compute in the previous example, and a `name` compute into an `info` compute:

```js
const age = compute( 33 ),
	name = compute( "Justin" ),
	info = compute( function() {
		return name() + " is " + age() + ".";
	} );

info(); //-> "Justin is 33."
```

If we listen to [can-compute.computed.ChangeEvent] on `info`, if either `age` or `name`
changes, `info` will be updated automatically:

```js
info.on( "change", function( ev, newVal, oldVal ) {
	newVal; //-> "Justin is 34."
} );

age( 34 );
```

Computes are similar to event streams like `Bacon.js` or `RXJS`.  However, computes
are easier to compose values because:

 - you can just read other observables and computes and return a value.  
 - you don't have to manage subscribing and merging streams yourself.

Also, computes can also have [can-event/batch/batch batched updates] to prevent unnecessary
updates. For example, if both `age` and `name` were changed at the same time, we
could prevent `info` from updating twice with:

```js
import canBatch from "can-event/batch/batch";

canBatch.start();
age( 35 );
name( "Justin Meyer" );
canBatch.stop();
```

There are a wide variety of ways to create computes. Read on to understand the basics.

## Observing a value

The simplest way to use a compute is to have it store a single value, and to set it when
that value needs to change:

```
var tally = compute(12);
tally(); // 12

tally.on("change",function(ev, newVal, oldVal){
    console.log(newVal,oldVal)
})

tally(13);
tally(); // 13
```

Any value can be observed.  The following creates a compute
that holds an object and then changes it to an array.

```js
const data = compute( { name: "Justin" } );
data( [ { description: "Learn Computes" } ] );
```


## Derived computes

If you use a compute that derives its
value from properties of an observable map or other [can-compute]s, the compute will listen for changes in those
properties and automatically recalculate itself, emitting a _change_ event if its value
changes.

The following example shows creating a `fullName` compute
that derives its value from two properties on the `person` observe:

```js
const person = new Person( {
	firstName: "Alice",
	lastName: "Liddell"
} );

const fullName = compute( function() {
	return person.firstName + " " + person.lastName;
} );

fullName.on( "change", function( ev, newVal, oldVal ) {
	console.log( "This person's full name is now " + newVal + "." );
} );

person.firstName = "Allison"; // The log reads:
//-> "This person's full name is now Allison Liddell."
```

Because Person is an observable [can-define/map/map] can-compute knows to listen for changes because the map's firstName and lastName properties are read.

## Translator computes - computes that update their derived values

Sometimes you need a compute to be able to translate one value to another. For example,
consider a widget that displays and allows you to update the progress in percent
of a task. It accepts a compute with values between 0 and 100. But,
our task observe has progress values between 0 and 1 like:

```js
const task = new DefineMap( {
	progress: 0.75
} );
```

Use `compute( getterSetter )` to create a compute that updates itself
when task's `progress` changes, but can also update progress when
the compute function is called with a value.  For example:

```js
const progressPercent = compute( function( percent ) {
	if ( arguments.length ) {
		task.progress = percent / 100;
	} else {
		return task.progress * 100;
	}
} );

progressPercent(); // -> 75

progressPercent( 100 );

task.progress; // -> 1
```


The following is a similar example that shows converting feet into meters and back:

```js
const wall = new DefineMap( {
	material: "brick",
	length: 10 // in feet
} );

const wallLengthInMeters = compute( function( lengthInM ) {
	if ( arguments.length ) {
		wall.length = lengthInM * 3.28084;
	} else {
		return wall.length / 3.28084;
	}
} );

wallLengthInMeters(); // 3.048

// When you set the compute...
wallLengthInMeters( 5 );
wallLengthInMeters(); // 5

// ...the original map changes too.
wall.length;          // 16.4042
```

## Events

When a compute's value is changed, it emits a [can-compute.computed.ChangeEvent] event. You can listen for this change
event by using `on` to bind an event handler to the compute:

```js
const tally = compute( 0 );
tally.on( "change", function( ev, newVal, oldVal ) {
	console.log( "The tally is now at " + newVal + "." );
} );

tally( tally() + 5 ); // The log reads:
// 'The tally is now at 5.'
```

## Caching values

A compute that has an event listener will cache its value and only update when one of its source observables change.

For example:

```js
const foo = {
	first: "Wonder"
};
const last = compute( "Woman" );
const hero = {
	fullName: compute( function() {
		return foo.first + " " + last();
	} )
};
hero.fullName.on( "change", function() {} ); // bind to compute
console.log( hero.fullName() ); // console.logs "Wonder Woman"
foo.first = "Super";
console.log( hero.fullName() ); // console.logs "Wonder Woman" because the source observable (last) hasn't changed
last( "Man" );
console.log( hero.fullName() ); // console.logs "Super Man" because fullName updates its value now after hearing the change on "last"
```
In contrast, if we didn't bind to the compute:

```js
const foo = {
	first: "Wonder"
};
const last = compute( "Woman" );
const hero = {
	fullName: compute( function() {
		return foo.first + " " + last();
	} )
};
console.log( hero.fullName() ); // console.logs "Wonder Woman"
foo.first = "Super";
console.log( hero.fullName() ); // console.logs "Super Woman" because fullName did not cache its previous value
last( "Man" );
console.log( hero.fullName() ); // console.logs "Super Man"
```

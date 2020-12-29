@module {Object} can-reflect-dependencies
@parent can-typed-data
@collection can-infrastructure
@package ../package.json

@description Functions to keep track of observable dependencies.

@type {Object}

The `can-reflect-dependencies` package provides methods used to register and
retrieve observable dependencies.

Exports an object with the following methods:

```js
{
	addMutatedBy,        // Register observable mutation dependencies
	deleteMutatedBy,     // Delete observable mutation dependencies
	getDependencyDataOf // Get the dependencies of an observable
}
```

@body

## Use

There are two steps to keep in mind in order to reliably keep track of
observable dependencies:

- Register what affects the observable and,
- Register what the observable affects (the opposite of the first step)

### Register what affects the observable

If the observable derives its value from other observables internally, at least
one of the following symbols must be implemented:

- [can-symbol/symbols/getKeyDependencies @@@can.getKeyDependencies]: The key dependencies of the observable
- [can-symbol/symbols/getValueDependencies @@@can.getValueDependencies]: The value dependencies of the observable

In the following example `MyCustomObservable` uses an [can-observation Observation]
instance internally to derive its value:

```js
import canSymbol from "can-symbol";
import observation from "can-observation";

function MyCustomObservable( value ) {
	this.observation = new Observation( /* ... */ );
}

MyCustomObservable.prototype.get = function() {
	return this.observation.get();
};
```

Since `MyCustomObservable` is a value-like observable, it has to implement
[can-symbol/symbols/getValueDependencies @@@can.getValueDependencies] so this
dependency is visible to [can-reflect-dependencies.getDependencyDataOf].

```js
import canReflect from "can-reflect";

function MyCustomObservable() { /* ... */ }

canReflect.assignSymbols( MyCustomObservable, {
	"can.getValueDependencies": function() {
		return {
			valueDependencies: new Set( [ this.observation ] )
		};
	}
} );
```

It's possible that a specific instance's value of `MyCustomObservable` is set by
another observable in a specific context, this kind of dependecy won't be registered
by the symbols discussed so far.

The following example shows two observables, a map-like instance `someMap` and a
value-like instance `myObservable`. When the `foo` property of `someMap` changes,
it sets the value of `myObservable`, in order to keep track of this dependency,
[can-reflect-dependencies.addMutatedBy] has to be used as follows:

```js
const someMap = new SomeMap();
const myObservable = new MyCustomObservable();
import canReflectDeps from "can-reflect-dependencies";

// when the foo property changes, update myObservable
someMap.on( "foo", function() {
	myObservable.set( /* some value */ );
} );

// Register that `myObservable` is affected by the `foo` property of `someMap`
canReflectDeps.addMutatedBy( myObservable, {
	keyDependencies: new Map( [ [ someMap, new Set( [ "foo" ] ) ] ] )
} );
```

If this dependency is conditional, it's important to call [can-reflect-dependencies.deleteMutatedBy]
to remove the dependency from `can-reflect-dependencies` internal registry, e.g:

```js
/* code omitted for brevity */

if ( hasToStopListeningToFooChanges ) {

	// remove the event listener
	someMap.off( "foo", onFooChange );

	// remove the dependency from `can-reflect-dependencies`
	canReflectDeps.deleteMutatedBy( myObservable, {
		keyDependencies: new Map( [ [ someMap, new Set( [ "foo" ] ) ] ] )
	} );
}
```

### Register the observable changes

In the previous section, `addMutatedBy` was used to register that `someMap.foo`
affects `myObservable`'s value; in its current form `can-reflect-dependencies`
can only _see_ the dependency from `myObservable`, that means:

```js
// this works!
canReflectDeps.getDependencyDataOf( myObservable );

// but this does not, it returns `undefined` :(
canReflectDeps.getDependencyDataOf( someMap, "foo" );
```

In order to register the dependency in the opossite direction, the following
things need to happen:

- `SomeMap` must implement the `@@@can.getWhatIChange` symbol
- Event handlers must keep track of the observables affected by implementing the
	`@@@can.getChangesDependencyRecord` symbol.

CanJS observables make this easier by attaching event handling capabilities through
[can-event-queue] mixins, adding in the [can-event-queue/value/value value mixin]
to `SomeMap`'s prototype will add a base implementation of `@@@can.getWhatIChange`
which iterates over the registered handlers and calls `@@@can.getChangesDependencyRecord`
on each.

Having `@@@can.getWhatIChange` implemented by `can-event-queue`, the next thing
to do is to implement `@@@can.getChangesDependencyRecord` on the event handler
that mutates `myObservable`.

```js
/* code omitted for brevity */

// Bind the callback to a variable to make adding the symbol easier
const onFooChange = function() {
	myObservable.set( /* some value */ );
};

canReflect.assignSymbols( onFooChange, {
	"can.getChangesDependencyRecord": function() {
		return {
			valueDependencies: new Set( [ myObservable ] )
		};
	}
} );

someMap.on( "foo", onFooChange );
```

With this in place the following code should work now:

```js
canReflectDeps.getDependencyDataOf( someMap, "foo" ); // ...myObservable
```

> Note: This implementation requires `can-event-queue/value/value` mixin to be
> added to `SomeMap`'s prototype, if your observable uses custom event handling
> logic you need to implement `@@@can.getWhatIChange` and keep track of what the
> event handlers are mutating manually.

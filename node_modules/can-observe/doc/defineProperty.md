@property {Symbol} can-observe/defineProperty defineProperty
@parent can-observe/properties

@description Define a rich property behavior on a proxy-wrapped object.

@signature `observe.defineProperty( target, property, fn )`

Defining your own behaviors should be as easy as possible: There is an `defineProperty` helper which accepts the target object, the property name, and a function that returns a single-value observable (ie: it implements [can-symbol/symbols/getValue], [can-symbol/symbols/setValue], [can-symbol/symbols/onValue], and [can-symbol/symbols/offValue]). For more specifics on how one might create single-value observables, see [can-simple-observable].

@param {Object} target A proxy-wrapped object or the prototype of a class which extends [can-observe.Object] or [can-observe.Array].
@param {String} property The name of the property where this behavior should apply.
@param {Function} fn A function which returns a single-value observable.

> _Note_: `target` can be an instance (such as the output of `observe({})`) *or* a class (such as `class extends ObserveObject`). If target is a class, it will put this method on the prototype, so all instances get this new behavior.

```js
import Observation from "can-observation";

observe.defineProperty( target, "name", function( instance, property ) {
	return canReflect.assignSymbols( {}, {
		"can.getValue": function() { /* ... */ },
		"can.setValue": function( value ) { /* ... */ },
		"can.onValue": function( handler ) { /* ... */ },
		"can.offValue": function( handler ) { /* ... */ }
	} );
} );
```

@body

## Using decorators with `defineProperty`

One of the features provided by the latest-and-greatest (and bleeding edge) ECMA is [decorators](https://github.com/tc39/proposal-decorators); in this case, they allow for a very concise way to insert computed properties into a class definition. In addition to being able to create your own, we have also provided a few built-in decorators ([can-observe/decorators/async] and [can-observe/decorators/resolver]).

```js
import Observation from "can-observation";

// generally, this function would come from a different file
function decorate( target, key, descriptor ) {
	const method = descriptor.value;
	observe.defineProperty( target, key, function( instance, property ) {
		return new Observation( method, instance );
	} );
}

class Person extends ObserveObject {
	@@decorate
	fullName() {
		return this.first + " " + this.last;
	}
}
```

> _Note_: the specific example above is equivalent to our built-in automatic observability of getters on classes: simply defining `fullName` as a getter would give the functionality that the example decorator is providing.

## Example: type checking

```js
import { ObserveObject, defineProperty } from "can-observe";
import SimpleObservable from "can-simple-observable";

function type(type) {
	return function checkType( target, key, descriptor ) {
		const method = descriptor.value;
		defineProperty( target, key, function( instance, property ) {
			var value = new SimpleObservable();

			return canReflect.assignSymbols( {}, {
				"can.setValue": function( newValue ) {
					if( typeof newValue !== type ) {
						throw new Error( `Value set at ${key} on ${canReflect.getName(this)} must be of type ${type}.` );
					}

					return value.set( newValue );
				},
				"can.getValue": value.get.bind( value ),
				"can.onValue": value.on.bind( value ),
				"can.offValue": value.off.bind( value )
			} );
		} );
	}
}

class Person extends ObserveObject {
	@@type("string")
	name = "Christopher"
}
```

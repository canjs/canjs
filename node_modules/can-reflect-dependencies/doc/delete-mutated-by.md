@function can-reflect-dependencies.deleteMutatedBy deleteMutatedBy
@parent can-reflect-dependencies

@description Unregister (one to many) mutation dependencies.

@signature `.deleteMutatedBy(observable, [key], observableOrDependencyRecord)`

Unregister a mutation dependency between an observable and optional `key`, to one 
or many observables.

Call this method with the exact same arguments passed to [can-reflect-dependencies.addMutatedBy] 
to delete the mutation dependency, make sure to do this if the event handler that 
introduced the mutation dependency in the first place is unbound at some point.

The following example shows to to delete the mutation dependency when the event
handler is unbound: 

```js
import canReflect from "can-reflect";
import SimpleObservable from "can-simple-observable";
import canReflectDeps from "can-reflect-dependencies";

const one = new SimpleObservable( "one" );
const two = new SimpleObservable( "two" );

const cb = function() {
	two.set( /* new value */ );
};

canReflect.onValue( one, cb );
canReflect.addMutatedBy( two, one );

// ...

if ( shouldUnbound ) {
	canReflect.offValue( one, cb );
	canReflect.deleteMutatedBy( two, one );
}
```

Check the [can-reflect-dependencies.addMutatedBy] documentation to learn the 
different ways mutation dependencies can be registered.

@param {Object} observable The observable being set by other observable 
@param {String} [key] The key on a map-like observable
@param {Object} [observableOrDependencyRecord] The value-like observable or 
	dependency record with the observable(s) that set the value of the first
	argument.

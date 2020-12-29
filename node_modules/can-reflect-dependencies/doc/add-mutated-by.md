@function can-reflect-dependencies.addMutatedBy addMutatedBy
@parent can-reflect-dependencies

@description Register (one to many) mutation dependencies.

@signature `.addMutatedBy(observable, [key], observableOrDependencyRecord)`

Register a mutation dependency between an observable and optional `key`, to one or
many observables.

Mutation dependencies happen when an observable sets another observable's value,
the following example creates two [can-simple-observable simple observable]
instances, then listens to the value event on the `one` observable and sets the
value of the observable bound to the `two` variable:

```js
import canReflect from "can-reflect";
import SimpleObservable from "can-simple-observable";
import canReflectDeps from "can-reflect-dependencies";

const one = new SimpleObservable( "one" );
const two = new SimpleObservable( "two" );

canReflect.onValue( one, function() {
	two.set( /* new value */ );
} );
```

In order to register this dependency (which is critical for [can-debug] to work
properly), you can use `.addMutatedBy` like this:

```js
/* code omitted for brevity */

canReflectDeps.addMutatedBy( two, one );
```

The previous example uses a shorthand to register a value dependency. 

It's also possible to register `keyDependencies` by passing a dependency record 
object instead. Let's build upon the previous example by creating a [can-simple-map simple map] 
instance that sets `two`'s value when its `age` property changes:

```js
import canReflect from "can-reflect";
import SimpleMap from "can-simple-map";
import SimpleObservable from "can-simple-observable";
import canReflectDeps from "can-reflect-dependencies";

const one = new SimpleObservable( "one" );
const two = new SimpleObservable( "two" );
const me = new SimpleMap( { age: 30 } );

canReflect.onValue( one, function() {
	two.set( /* new value */ );
} );

canReflect.onKeyValue( me, "age", function() {
	two.set( /* new value */ );
} );
```

Both `me` and `one` set the value of `two`, and this can be registered as follows:

```js
/* code omitted for brevity */

canReflectDeps.addMutatedBy( two, {
	valueDependencies: new Set( [ one ] ),
	keyDependencies: new Map( [ [ me, new Set( [ "age" ] ) ] ] )
} );
```

An optional `key` can be passed as a second argument when registering [can-reflect.isMapLike map like] 
observable mutations, e.g:


```js
import canReflect from "can-reflect";
import SimpleMap from "can-simple-map";
import canReflectDeps from "can-reflect-dependencies";

const me = new SimpleMap( { age: 30 } );
const month = new SimpleMap( { day: 10 } );

canReflect.onKeyValue( month, "day", function() {
	me.set( age, /* new value */ );
} );

canReflectDeps.addMutatedBy( me, "age", {
	keyDependencies: new Map( [ [ month, new Set( [ "day" ] ) ] ] )
} );
```

@param {Object} observable The observable being set by other observable 
@param {String} [key] The key on a map-like observable
@param {Object} [observableOrDependencyRecord] The value-like observable or 
	dependency record with the observable(s) that set the value of the first
	argument.

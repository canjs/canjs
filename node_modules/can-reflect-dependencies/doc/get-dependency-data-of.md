@function can-reflect-dependencies.getDependencyDataOf getDependencyDataOf
@parent can-reflect-dependencies

@description Get the dependencies of an observable.

@signature `.getDependencyDataOf(observable, [key])`

Get the dependencies of an observable, if `key` is provided, it would returns the
dependencies of the `key` on the observable.

```js
const one = new SimpleObservable( "one" );
const me = new SimpleMap( { age: 30 } );

canReflectDeps.getDependencyDataOf( one );

// or pass a key for map-like observables
canReflectDeps.getDependencyDataOf( me, "age" );
```

The ouput is an object with either (or both) top level properties:

```js
{
	whatIChange,    // Observables affected by the object passed as an argument,
	whatChangesMe  // Observables that affect the object passed as an argument
}
```

Each of these properties contain an object with the following shape:

```js
{
	mutate,  // Mutation dependencies
	derive  // Observables from which the parent derives its value
}
```

Finally, `mutate` and `derive` contain dependency records which are objects with
either a `valueDependecies` property (a Set of observables) or a `keyDependencies`
property (a Map where each key is an observable and the keys' value is a set of
keys or properties of the observable).

@param {Object} observable The observable to get dependencies from.
@param {String} [key] The key on a map-like observable.

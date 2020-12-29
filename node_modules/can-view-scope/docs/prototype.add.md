@function can-view-scope.prototype.add add
@parent can-view-scope.prototype

@signature `scope.add(context [,meta])`

Creates a new scope and sets the current scope to be the parent.

```js
const scope = new Scope( [
	{ name: "Chris" },
	{ name: "Justin" }
] ).add( { name: "Brian" } );
scope.get( "name" ); //-> "Brian"
```

@param {*} context The context to add on top of the current scope.
@param {can-view-scope/Meta} meta A meta option that can be used to configure special behaviors of this context.

@body

## Use

`scope.add(context)` creates a new scope object. Values can be looked up in the parent `scope` object by prefixing the key with `"../"`. [can-view-scope::find find] can also be used to search in the parent’s context after the initial context is explored. For example:

```js
const list = [ { name: "Justin" }, { name: "Brian" } ];
const justin = list[ 0 ];

const curScope = new Scope( list ).add( justin );

// use `get` to find a value in an explicit context
curScope.get( "name" ); //-> "Justin"
curScope.get( "../length" ); //-> 2

// use `find` to search for a value in any context
curScope.find( "name" ); //-> "Justin"
curScope.find( "length" ); //-> 2
```

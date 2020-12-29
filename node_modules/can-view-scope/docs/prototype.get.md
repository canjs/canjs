@function can-view-scope.prototype.get get
@parent can-view-scope.prototype

@signature `scope.get(key [, options])`

Walks up the scope to find a value at `key`.  Stops at the first context where `key` has
a value.

```js
scope.get( "first.name" );
```

@param {can-stache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@return {*} The found value or undefined if no value is found.

@body

## Use

`scope.get(key)` looks up a value in the current scope’s
context. Values can be looked up in the parent `scope` object by prefixing the key with `"../"`.
[can-view-scope::find find] can also be used to search in the parent’s context after the initial context is explored. For example:

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

Prefixing a key with more than one `"../"` shifts the lookup path
that many levels up.

```js
const list = [ { name: "Justin" }, { name: "Brian" } ];
list.name = "Programmers";

const justin = list[ 0 ];
const brian = list[ 1 ];
const curScope = new Scope( list ).add( justin ).add( brian );

curScope.get( "name" ); //-> "Brian"
curScope.get( "../name" ); //-> "Justin"
curScope.get( "../../name" ); //-> "Programmers"
```

@function can-view-scope.prototype.find find
@parent can-view-scope.prototype

@signature `scope.find(key [, options])`

Walks up the scope to find a value at `key`.  Stops at the first context where `key` has
a value.

```js
scope.find( "first.name" );
```

@param {can-stache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@return {*} The found value or undefined if no value is found.

@body

## Use

`scope.find(key)` looks up a value in the current scope’s
context, if a value is not found, parent scope’s context
will be explored.

```js
const list = [ { name: "Justin" }, { name: "Brian" } ];
const justin = list[ 0 ];

const curScope = new Scope( list ).add( justin );

curScope.find( "name" ); //-> "Justin"
curScope.find( "length" ); //-> 2
```

Prefixing a key with `"./"` prevents any parent scope look ups.
Prefixing a key with one or more `"../"` shifts the lookup path
that many levels up.

```js
const list = [ { name: "Justin" }, { name: "Brian" } ];
list.name = "Programmers";
list.surname = "CanJS";

const justin = list[ 0 ];
const brian = list[ 1 ];
const curScope = new Scope( list ).add( justin ).add( brian );

curScope.find( "name" ); //-> "Brian"
curScope.find( "surname" ); //-> "CanJS"
curScope.find( "./surname" ); //-> undefined
curScope.find( "../name" ); //-> "Justin"
curScope.find( "../surname" ); //-> "CanJS"
curScope.find( ".././surname" ); //-> "undefined"
curScope.find( "../../name" ); //-> "Programmers"
```

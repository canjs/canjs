@function can-view-scope.attr attr
@hide

@signature `scope.attr(key)`

@param {can-mustache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@return {*} The found value or undefined if no value is found.

@body

## Use

`scope.attr(key)` looks up a value in the current scope’s
context, if a value is not found, parent scope’s context
will be explored.

```js
const list = [ { name: "Justin" }, { name: "Brian" } ];
const justin = list[ 0 ];

const curScope = new Scope( list ).add( justin );

curScope.attr( "name" ); //-> "Justin"
curScope.attr( "length" ); //-> 2
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

curScope.attr( "name" ); //-> "Brian"
curScope.attr( "surname" ); //-> "CanJS"
curScope.attr( "./surname" ); //-> undefined
curScope.attr( "../name" ); //-> "Justin"
curScope.attr( "../surname" ); //-> "CanJS"
curScope.attr( ".././surname" ); //-> "undefined"
curScope.attr( "../../name" ); //-> "Programmers"
```

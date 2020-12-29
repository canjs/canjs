@function can-view-scope.prototype.peek peek
@parent can-view-scope.prototype

Read a value from the scope without being observable.

@signature `scope.peek(key [, options])`


Works just like [can-view-scope.prototype.get], but prevents any calls to [can-observation-recorder.add].


Walks up the scope to find a value at `key`.  Stops at the first context where `key` has
a value.

```js
scope.peek( "first.name" );
```

@param {can-stache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@return {*} The found value or undefined if no value is found.

@body

## Use

`scope.peek(key)` looks up a value in the current scope’s
context, if a value is not found, parent scope’s context
will be explored.

```js
const list = [ { name: "Justin" }, { name: "Brian" } ];
const justin = list[ 0 ];

const curScope = new Scope( list ).add( justin );

curScope.peek( "name" ); //-> "Justin"
curScope.peek( "length" ); //-> 2
```

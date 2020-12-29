@function can-view-scope.prototype.set set
@parent can-view-scope.prototype

@signature `scope.set(key, value [, options])`

Tries to set `key` in the scope to `value`.

```js
scope.set( "person.first.name", "Justin" );
```

@param {can-stache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@param {*} value The value to be set.

@body

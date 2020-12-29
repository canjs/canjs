@function can-view-scope.prototype.compute compute
@parent can-view-scope.prototype

@signature `scope.compute(key [, options])`

Get a compute that is two-way bound to the `key` value in the scope. These computes
can be optimized beyond wrapping a compute around a call to [can-view-scope::get].

```js
scope.compute( "first.name" );
```

@param {can-stache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@return {can-compute.computed} A compute.

@body

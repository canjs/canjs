@function can-view-scope.compute compute
@hide

@signature `scope.compute(key, [options])`
@release 2.1

@param {can-mustache.key} key A dot-separated path.  Use `"\."` if you have a
property name that includes a dot.

@param {can-view-scope.readOptions} [options] Options that configure how the `key` gets read.

@return {can-compute.computed} A compute that can get or set `key`.

@module {Map} can-cid/set/set
@parent can-cid

Exports the native [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
or a polyfill.

@body

## Use

This module exports the native [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
object if `Set` is present.  If not, a `Set`-like constructor function is exported that supports `O(1)` insertion and
deletion by adding a [can-cid] property to objects passed to `.set`.

```js
var Set = require("can-util/js/cid-set/cid-set");

var map = new set();

var obj = {};

map.add(obj);
map.has(obj) //-> true;
```

The following methods and properties are supported by the polyfill:

- `clear()`
- `delete(value)`
- `forEach(callback[,thisArg])`
- `get(value)`
- `has(value)`
- `add(value)`
- `size`

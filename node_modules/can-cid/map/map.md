@module {Map} can-cid/map/map
@parent can-cid

Exports the native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
or a polyfill.

@body

## Use

This module exports the native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
object if `Map` is present.  If not, a `Map`-like constructor function is exported that supports `O(1)` insertion and
deletion by adding a [can-cid] property to objects passed to `.set`.

```js
var Map = require("can-util/js/cid-map/cid-map");

var map = new Map();

var obj = {};

map.set(obj, "value");
map.get(obj) //-> "value";
```

The following methods and properties are supported by the polyfill:

- `clear()`
- `delete(key)`
- `forEach(callback[,thisArg])`
- `get(key)`
- `has(key)`
- `set(key, value)`
- `size`

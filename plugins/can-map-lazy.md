@page can-map-lazy
@parent canjs.plugins

@link http://www.npmjs.com/package/can-map-lazy npm
@link http://canjs.github.io/can-map-lazy/docs docs
@link http://github.com/canjs/can-map-lazy github

- [Usage Guide](http://canjs.github.io/can-map-lazy/docs/can.LazyMap.html)
- [GitHub](ttp://github.com/canjs/can-map-lazy)

Just like `can.Map`, `can.LazyMap` provides a way to listen for and keep track of changes to objects. But unlike Map, a LazyMap only initializes data when bound, set or read. For lazy observable arrays, `can.LazyList` is also available.

This on demand initialization of nested data can yield big performance improvements when using large datasets that are deeply nested data where only a fraction of the properties are accessed or bound to.

See the [plugin docs](http://canjs.github.io/can-map-lazy/docs/can.LazyMap.html) for more details.
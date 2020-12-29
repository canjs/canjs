@module {function} can-map-compat
@parent can-observables
@collection can-ecosystem
@package ./package.json
@signature `makeMapCompat(Type)`

Makes an observable type, such as [can-define/map/map] or an [can-observe.Object ObserveObject] compatible with the [can-map] APIs such as [can-map.prototype.attr] and [can-map.prototype.removeAttr].

```js
import makeMapCompat from "can-map-compat";
import DefineMap from "can-define/map/map";

var MyMap = makeMapCompat(DefineMap.extend({
  count: {
    type: "number",
    default: 0
  }
}));

var map = new MyMap({ count: 0 });

map.attr("count", 1);
console.log(map.attr("count")); // -> 1


map.removeAttr("count");
console.log(map.attr("count")); // -> undefined
```

@param {Object} Type The __Type__ to make compatible with [can-map].
@return {Object} The Type, with the can-map methods added.

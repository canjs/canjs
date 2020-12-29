@function can-define/map/map.prototype.assignDeep assignDeep
@parent can-define/map/map.prototype

@description Sets multiple properties on a map instance or a property that wasn't predefined.

@signature `map.assignDeep(props)`

  Similar to [can-define/map/map.prototype.assign .assign()], `.assignDeep()` will overwrite
  values within a `map` with values from `props`. Where `.assign()` will replace values or
  properties one level deep, `.assignDeep()` will overwrite values or properties on objects
  and lists recursively.

  Properties not in `props` will not be changed.

  ```js
  import {DefineMap, DefineList} from "can";

  const MyMap = DefineMap.extend({
    list: DefineList,
    name: "string"
  });

  const obj = new MyMap({
    list: ["1", "2", "3"],
    foo: "bar"
  });

  obj.assignDeep({
    list: ["first"]
  });

  console.log( obj.serialize() ); //-> { foo: "bar", list: ["first", "2", "3"] }
  ```
  @codepen

  @param {Object} props A collection of key-value pairs to set.
  If any properties already exist on the map, they will be overwritten.

  @return {can-define/map/map} The map instance for chaining.

@function can-define/map/map.prototype.updateDeep updateDeep
@parent can-define/map/map.prototype

@description Sets multiple properties on a map instance or a property that wasn't predefined.

@signature `map.updateDeep(props)`

  Assigns each value in `props` to a property on this map instance named after the
  corresponding key in `props`, effectively merging `props` into the Map.
  Properties not in `props` will be set to `undefined`.

  ```js
  import {DefineMap, DefineList} from "can";

  const MyMap = DefineMap.extend({
    list: DefineList,
    name: "string"
  });

  const obj = new MyMap({
    list: ["1", "2", "3"],
    name: "bar",
    foo: {
      bar: "zed",
      boo: "goo"
    }
  });

  obj.updateDeep({
    list: ["first"],
    foo: {
      bar: "abc"
    }
  });

  console.log( obj.serialize() ); //-> {
  //   foo: { bar: "abc" },
  //   list: ["first"]
  // }
  console.log( obj.foo.boo ); //-> undefined
  console.log( obj.name ); //-> undefined
  ```
  @codepen

  @param {Object} props A collection of key-value pairs to set.
  If any properties already exist on the map, they will be overwritten.

  @return {can-define/map/map} The map instance for chaining.

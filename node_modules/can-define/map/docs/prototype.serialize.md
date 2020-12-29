@function can-define/map/map.prototype.serialize serialize
@parent can-define/map/map.prototype

@description Get a serialized representation of the map instance and its children.

@signature `map.serialize()`

  Get the serialized Object form of the map.  Serialized
  data is typically used to send back to a server.  Use [can-define.types.serialize]
  to customize a property's serialized value or if the property should be added to
  the result or not.

  `undefined` serialized values are not added to the result.

  ```js
  import {DefineMap} from "can";

  const MyMap = DefineMap.extend({
    date: {
      type: "date",
      serialize: (date) => {
        return date.getTime();
      }
    }
  });

  const myMap = new MyMap({date: new Date(), count: 5});
  console.log( myMap.serialize() ); //-> {date: 1469566698504, count: 5}
  ```
  @codepen

  @return {Object} A JavaScript Object that can be serialized with `JSON.stringify` or other methods.

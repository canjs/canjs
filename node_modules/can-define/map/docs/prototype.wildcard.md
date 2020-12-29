@property {can-define.types.propDefinition} can-define/map/map.prototype.wildcard *
@parent can-define/map/map.prototype

@description Define default behavior for a Map instance.

@option {can-define.types.propDefinition}

  By defining a wildcard property like `"*"` on the prototype, this will supply a
  default behavior for every property.  The default wildcard `"*"` definition
  makes every property run through the "observable" [can-define.types] converter.
  It looks like:

  ```js
  "*": {
    type: "observable"
  }
  ```

  The following defaults every property to be a number:

  ```js
  import {DefineMap} from "can";

  const AllNumbers = DefineMap.extend({
    "*": {type: "number"},
    age: {},
    count: {}
  });

  const someNumbers = new AllNumbers({
    age: "22",
    count: "23",
    version: "24"	  
  });

  console.log( someNumbers.serialize() ) //-> {
  //   age: 22,
  //   count: 23,
  //   version: 24
  // }
  ```
  @codepen

  Setting the wildcard is useful when every property on a
  map instance should behave in a particular way.  For example, for map types used
  with [can-route]:

  ```js
  const MyMap = DefineMap.extend({
    "*": {
      type: "stringOrObservable"
    }
  });
  ```

  Or if you want to turn off implicit conversion of Objects and Arrays to DefineMap and DefineLists:

  ```js
  const MyMap = DefineMap.extend({
    "*": {
      type: "any"
    }
  });
  ```

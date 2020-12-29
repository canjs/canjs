@function can-define/map/map.prototype.deleteKey deleteKey
@parent can-define/map/map.prototype

@description Delete an "expando" key value.

@signature `map.deleteKey(key)`

  Deletes a key that was added to an instance, but not pre-defined by the type.

  ```js
  import {DefineMap, Reflect} from "can";

  const map = new DefineMap( {propA: "valueA"} );
  console.log( map.propA ); //-> "valueA"

  map.deleteKey("propA");
  console.log( map.propA ); //-> undefined
  ```
  @codepen

  @param {String} key A string of the key being deleted.

  @return {can-define/map/map} The map instance for chaining.

@body

## Use

If `deleteKey` is called on a pre-defined type it sets the value to `undefined`. This is to keep the setters and getters on all instances of that Type.

```js
import {DefineMap, Reflect} from "can";

const Type = DefineMap.extend(
  {seal: false},
  {
    propA: "string"
  }
);

const map = new Type( {propA: "valueA"} );
map.set("propB","valueB");
map.deleteKey("propB"); // This works.
map.deleteKey("propA"); // This doesn't delete the key, but does set the key to undefined.

console.log( Reflect.getOwnKeys(map) ); //-> ["propA"]
console.log( map.propA ); //-> undefined
```
@codepen

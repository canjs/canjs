@function can-define/map/map.prototype.forEach forEach
@parent can-define/map/map.prototype

@description Call a function on each property of a DefineMap.

@signature `map.forEach( callback( value, propName ) )`

  `forEach` iterates through the map instance, calling a function
  for each property value and key.

  ```js
  import {DefineMap} from "can";

  const names = [];
  const map = new DefineMap({a: "Alice", b: "Bob", e: "Eve"});

  map.forEach( (value, propName) => names.push(value) );

  console.log( names ); //-> ["Alice", "Bob", "Eve"]
  ```
  @codepen

  @param {function(*,String)} callback(value,propName) The function to call for each property
  The value and key of each property will be passed as the first and second
  arguments, respectively, to the callback.

  @return {can-define/map/map} The map instance for chaining.

@body

## Use

If the callback returns `false` the loop will stop.

```js
import {DefineMap} from "can";

const names = [];
const map = new DefineMap({a: "Alice", b: "Bob", e: "Eve"});

map.forEach( (value, propName) => {
  if (propName === "e") {
    return false;
  }
  names.push(value);
} );

console.log( names ); //-> ["Alice", "Bob"]
```
@codepen

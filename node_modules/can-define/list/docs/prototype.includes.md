@function can-define/list/list.prototype.includes includes
@parent can-define/list/list.prototype

@description Return true if a value is in a DefineList.

@signature `list.includes(itemToFind[, fromIndex])`

  It uses [`Array.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes), an error will be thrown if it is not supported by the environment (Internet Explorer) and no polyfill is found.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["a", "b", "c"]);

  console.log(list.includes("a")); // true
  console.log(list.includes("foo")); // false
  console.log(list.includes("c", -100)); // true
  console.log(list.includes("b", 100)); // false

  ```
  @codepen

  @param {*} [itemToFind] The item to find in the `list`.
  
  @param {*} [fromIndex] The position in the `list` at which to begin searching for `itemToFind`.
  
  @return {Boolean} `false` if `itemToFind` is not found in the `list`, `true` otherwise

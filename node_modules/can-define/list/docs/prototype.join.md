@function can-define/list/list.prototype.join join
@parent can-define/list/list.prototype

@description Join a DefineList's elements into a string.
@signature `list.join(separator)`

  `join` turns a DefineList into a string by inserting _separator_ between the string representations
  of all the elements of the DefineList.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["Alice", "Bob", "Eve"]);

  console.log(list.join(", ")); //-> "Alice, Bob, Eve"
  ```
  @codepen

  @param {String} separator The string to separate elements.

  @return {String} The joined string.

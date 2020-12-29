@function can-define/list/list.prototype.lastIndexOf lastIndexOf
@parent can-define/list/list.prototype

@description Look for an item in a DefineList starting from the end.
@signature `list.lastIndexOf(item)`

  `lastIndexOf` finds the last position of a given item in the DefineList.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["Alice", "Bob", "Alice", "Eve"]);

  console.log(list.lastIndexOf("Alice")); //-> 2
  console.log(list.lastIndexOf("Charlie")); //-> -1
  ```
  @codepen

  @param {*} item The item to find.

  @return {Number} The position of the item in the DefineList, or -1 if the item is not found.

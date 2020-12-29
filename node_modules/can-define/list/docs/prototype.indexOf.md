@function can-define/list/list.prototype.indexOf indexOf
@parent can-define/list/list.prototype

@description Look for an item in a DefineList.
@signature `list.indexOf(item)`

  `indexOf` finds the first index position of a given item in the DefineList.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["Alice", "Bob", "Eve"]);

  console.log(list.indexOf("Alice")); //-> 0
  console.log(list.indexOf("Charlie")); //-> -1
  ```
  @codepen

  @param {*} item The item to find.

  @return {Number} The index of the item in the DefineList, or -1 if the item is not found.

@function can-define/list/list.prototype.reverse reverse
@parent can-define/list/list.prototype

@description Reverse the order of a DefineList.
@signature `list.reverse()`

  Reverses the elements of the DefineList in place.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["Alice", "Bob", "Eve"]);
  const reversedList = list.reverse();

  console.log(reversedList.get()); //-> ["Eve", "Bob", "Alice"]
  console.log(list === reversedList); //-> true
  ```
  @codepen

  @return {can-define/list/list} The DefineList, for chaining.

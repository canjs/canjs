@function can-define/list/list.prototype.get get
@parent can-define/list/list.prototype

Gets an item or all items from a DefineList.

@signature `list.get()`

  Returns the list converted into a plain JS array. Any items that also have a
  `get` method will have their `get` method called and the resulting value will be used as item value.

  This can be used to recursively convert a list instance to an Array of other plain JavaScript objects.
  Cycles are supported and only create one object.

  `get()` can still return other non-plain JS objects like Dates.
  Use [can-define/map/map.prototype.serialize] when a form proper for `JSON.stringify` is needed.

  ```js
  import { DefineList } from "can";
  const list = new DefineList(["A","B"]);
  console.log(list.get()); //-> ["A","B"]
  ```
  @codepen


  @return {Array} A plain JavaScript `Array` that contains each item in the list.

@signature `list.get(index)`

  Gets the item at `index`. `list.get(index)` should be used instead of
  `list[index]` if the list's items are going to be updated via [can-define/list/list.prototype.set list.set(index, value)]
  (as opposed to [can-define/list/list.prototype.splice] which is the better way).

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);

  console.log(list.get(1)); //-> "B"
  ```
  @codepen

  @param {Number} index A numeric position in the list.

  @return {*} The value at index.

@signature `list.get(prop)`

  Gets the property at `prop` if it might not have already been defined.


  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);

  list.set("count",1000);

  console.log(list.get("count")); //-> 1000
  ```
  @codepen

  @param {String} prop A property on the list.

  @return {*} The value at `prop`.
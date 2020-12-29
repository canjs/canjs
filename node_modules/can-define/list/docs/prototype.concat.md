@function can-define/list/list.prototype.concat concat
@parent can-define/list/list.prototype

@description Merge many collections together into a DefineList.
@signature `list.concat(...listN)`

  Returns a `DefineList` with the `list`'s items merged with the Arrays and lists
  passed as arguments.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["a","b"]);

  const result = list.concat(
  	[1,2],
  	new DefineList(["X","Y"]),
	{value: "Z"}
  );

  console.log( result.serialize() );
  //-> ["a", "b", 1, 2, "X", "Y", {value: "Z"}]
  ```
  @codepen

  @param {Array|can-define/list/list|} listN Any number of arrays, Lists, or values to add in
  For each parameter given, if it is an Array or a DefineList, each of its elements will be   added to
  the end of the concatenated DefineList. Otherwise, the parameter itself will be added.

  @return {can-define/list/list} A DefineList of the same type.


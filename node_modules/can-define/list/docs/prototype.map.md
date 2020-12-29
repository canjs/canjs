@function can-define/list/list.prototype.map map
@parent can-define/list/list.prototype

@description Map the values in this list to another list.

@signature `list.map(callback[, thisArg])`

  Loops through the values of the list, calling `callback` for each one until the list
  ends.  The return values of `callback` are used to populate the returned list.

  ```js
  import {DefineList} from "can";

  const todos = new DefineList([
      {name: "dishes", complete: false},
      {name: "lawn", complete: true}
  ]);

  const names = todos.map((todo) => {
      return todo.name;
  });

  console.log(names.get()); //-> ["dishes","lawn"]
  ```
  @codepen

  @param {function(item, index, list)} callback A function to call with each element of the DefineList.
  The three parameters that callback gets passed are:
    - item (*) - the element at index.
    - index (Integer) - the index of the current element of the list.
    - list (DefineList) - the `DefineList` the elements are coming from.

  The return value of `callback`, including `undefined` values are used to populate the resulting list.

  @param {Object} [thisArg] The object to use as `this` inside the callback.
  @return {can-define/list/list} a new `DefineList` with the results of the map transform.

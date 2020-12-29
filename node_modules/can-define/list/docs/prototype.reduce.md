@function can-define/list/list.prototype.reduce reduce
@parent can-define/list/list.prototype

@description Map the values in this list to a single value

@signature `list.reduce(callback, initialValue, [, thisArg])`

  Loops through the values of the list, calling `callback` for each one until the list
  ends.  The return value of `callback` is passed to the next iteration as the first argument,
  and finally returned by `reduce`.

  ```js
  import {DefineList} from "can";

  const todos = new DefineList([
      {name: "dishes", complete: false},
      {name: "lawn", complete: true}
  ]);

  const todosAsOneObject = todos.reduce((todos, todo) => {
      todos[todo.name] = todo.complete;
      return todos;
  }, {});

  console.log(todosAsOneObject); //-> { dishes: false, lawn: true }
  ```
  @codepen

  @param {function(item, index, list)} callback A function to call with each element of the DefineList.
  The four parameters that callback gets passed are:
    - current (*) - the current aggregate value of reducing over the list -- the initial value if the first iteration
    - item (*) - the element at index.
    - index (Integer) - the index of the current element of the list.
    - list (DefineList) - the `DefineList` the elements are coming from.

  The return value of `callback` is passed to the next iteration as the first argument, and returned from
  `reduce` if the last iteration.

  @param {*} [initialValue] The initial value to use as `current` in the first iteration
  @param {Object} [thisArg] The object to use as `this` inside the callback.
  @return {*} The result of the final call of `callback` on the list.

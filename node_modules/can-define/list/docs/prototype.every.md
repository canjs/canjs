@function can-define/list/list.prototype.every every
@parent can-define/list/list.prototype

Return true if every item in a list matches a predicate.

@signature `list.every( callback [,thisArg] )`

  Tests each item in `list` by calling `callback` on it.  If `callback` returns truthy for every 
  element in `list`, `every` returns `true`.

  ```js
  import { DefineList } from "can";

  const names = new DefineList(["alice","adam","zack","zeffer"]);

  const aNames = names.every((name) => {
    return name[0] === "a";
  });

  console.log(aNames); //-> false
  ```
  @codepen

  @param  {function(*, Number, can-define/list/list)} callback(item, index, list) A
  function to call with each element of the DefineList. The three parameters that callback gets passed are:
   - item (*) - the element at index.
   - index (Integer) - the index of the current element of the list.
   - list (DefineList) - the `DefineList` the elements are coming from.

  If `callback` returns a truthy result, `every` will evaluate the callback on the next element.  Otherwise, `every`
  will return `false`.

  @param  {Object}  thisArg  What `this` should be in the `callback`.
  @return {Boolean} `true` if calling the callback on every element in `list` returns a truthy value, `false` otherwise.

@signature `list.every( props )`

  Tests each item in `list` by comparing its properties to `props`.  If `props` match for every element in
  `list`, `every` returns `true`.

  ```js
  import {DefineList} from "can";

  const todos = new DefineList([
      {name: "dishes", complete: false},
      {name: "lawn", complete: true}
  ]);

  const complete = todos.every({complete: true});

  console.log(complete); //-> false
  ```
  @codepen

  @param  {Object}  props An object of key-value properties.  Each key and value in
  `props` must be present on an `item` for the `item` to match.
  @return {Boolean} `true` if every element in `list` matches `props`, `false` otherwise.

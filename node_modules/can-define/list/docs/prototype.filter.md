@function can-define/list/list.prototype.filter filter
@parent can-define/list/list.prototype

Filter a list to a new list of the matched items.

@signature `list.filter( callback [,thisArg] )`

  Filters `list` based on the return value of `callback`.

  ```js
  import{DefineList} from "can";

  const names = new DefineList(["alice","adam","zack","zeffer"]);

  const aNames = names.filter((name) => {
      return name[0] === "a";
  });

  console.log(aNames.get()); //-> ["alice","adam"]
  ```
  @codepen

  @param  {function(*, Number, can-define/list/list)} callback(item, index, list) A
  function to call with each element of the DefineList. The three parameters that callback gets passed are:
   - item (*) - the element at index.
   - index (Integer) - the index of the current element of the list.
   - list (DefineList) - the `DefineList` the elements are coming from.

  If `callback` returns a truthy result, `item` will be added to the result.  Otherwise, the `item` will be
  excluded.

  @param  {Object}  thisArg  What `this` should be in the `callback`.
  @return {can-define/list/list} A new instance of this `DefineList` (may be a subclass), containing the items that passed the filter.

@signature `list.filter( props )`

  Filters items in `list` based on the property values in `props`.

  ```js
  import { DefineList } from "can";
  const todos = new DefineList([
      {name: "dishes", complete: false},
      {name: "lawn", complete: true}
  ]);
  const complete = todos.filter({complete: true});
  console.log(complete.get()); //-> [{name: "lawn", complete: true}]
  ```
  @codepen

  @param  {Object}  props An object of key-value properties.  Each key and value in
  `props` must be present on an `item` for the `item` to be in the returned list.
  @return {can-define/list/list} A new `DefineList` of the same type.

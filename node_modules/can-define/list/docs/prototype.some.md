@function can-define/list/list.prototype.some some
@parent can-define/list/list.prototype

Return true if at least one item in a list matches a predicate.

@signature `list.some( callback [,thisArg] )`

  Tests each item in `list` by calling `callback` on it.  If `callback` returns truthy for some element in
  `list`, `some` returns `true`.

  ```js
  import {DefineList} from "can";

  const names = new DefineList(["alice","adam","zack","zeffer"]);
  const aNames = names.some((name) => {
      return name[0] === "a";
  });

  console.log(aNames); //-> true
  ```
  @codepen

  @param  {function(*, Number, can-define/list/list)} callback(item, index, list) A
  function to call with each element of the DefineList. The three parameters that callback gets passed are:
   - item (*) - the element at index.
   - index (Integer) - the index of the current element of the list.
   - list (DefineList) - the DefineList the elements are coming from.

  If `callback` returns a falsy result, `some` will evaluate the callback on the next element.  Otherwise, `some`
  will return `true`.

  @param  {Object}  thisArg  What `this` should be in the `callback`.
  @return {Boolean} `false` if calling the callback on some element in `list` returns a falsy value, `true` otherwise.

@signature `list.some( props )`

  Tests each item in `list` by comparing its properties to `props`.  If `props` match for some element in
  `list`, `some` returns `true`.

  ```js
  import {DefineList} from "can";

  const todos = new DefineList([
      {name: "dishes", complete: false},
      {name: "lawn", complete: true}
  ]);

  const complete = todos.some({complete: true});

  console.log(complete); //-> true
  ```
  @codepen

   @param  {Object}  props An object of key-value properties.  Each key and value in
   `props` must be present on an `item` for the `item` to match.
   @return {Boolean} `false` if every element in `list` fails to match `props`, `true` otherwise

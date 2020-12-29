@function can-define/list/list.prototype.update update
@parent can-define/list/list.prototype

Updates a list with new values or new property values.

@signature `list.update(newItems)`

  If `newItems` [can-reflect.isListLike is list like] the values in `newItems` will replace all values in `list`.  For example:

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);

  list.update( ["a"] );
  console.log( list.serialize() ); //-> ["a"]
  ```
  @codepen

  If `newItems` is an object, `newItem`'s properties and values will be used to overwrite
  `list`'s properties and values. Any enumerable properties on `list` that are
  not in `newItems` will be removed.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);

  list.update( {count: 1000, skip: 2} );

  list.update( {count: 99} )
  console.log( list.skip ); //-> undefined
  ```
  @codepen

  > NOTE: Use [can-define/list/list.prototype.assign .assign()] to only add properties
  from `newItems` and not delete missing items.

  @param {Array|Object} newItems A list or array of values, or an object of properties.
  @return {can-define/list/list} The list instance.

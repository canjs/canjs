@function can-define/list/list.prototype.assign assign
@parent can-define/list/list.prototype

Sets values within a list or properties on a list.

@signature `list.assign(newItems)`

  If `newItems` [can-reflect.isListLike is list like] the values in `newItems` will replace the indexed value in the `list`.  For example:

  ```js
  import { DefineList } from "can";

  const list = new DefineList(["A","B"]);

  list.assign( ["a"] );
  console.log( list.serialize() ); //-> ["a","B"]
  ```
  @codepen

  > NOTICE: `.assign()` will not remove properties in the list that have indexes
  greater than or equal to the `newItem`'s length.  Use [can-define/list/list.prototype.update .update()] to replace all of a list's values.

  If `newItems` is an object, the object's properties will be added as properties to
  the `list`.  For example:

  ```js
  import { DefineList } from "can";

  const list = new DefineList(["A","B"]);

  list.assign( {count: 1000, skip: 2} );
  console.log( list.count ); //-> 1000
  ```
  @codepen

  @param {Array|Object} newItems A list or array of values, or an object of properties.
  @return {can-define/list/list} The list instance.

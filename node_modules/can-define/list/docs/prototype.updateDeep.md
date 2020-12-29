@function can-define/list/list.prototype.updateDeep updateDeep
@parent can-define/list/list.prototype

Recursively updates a list with new values or new property values.

@signature `list.updateDeep(newItems)`

  Similar to [can-define/list/list.prototype.update .update()], `.updateDeep()` will
  overwrite values within `list` with values from `newItems`.  Where `update()` will replace
  values or properties one level deep, `.updateDeep()` will overwrite values or
  properties on objects and lists recursively.

  The following will:

  - remove `payal` from `people`,
  - set `justin`'s `name` to `"JUSTIN"`, and
  - remove `justin`'s `age` property:

  ```js
  import {DefineMap, DefineList} from "can";

  const justin = new DefineMap({name: "Justin", age: 35}),
        payal = new DefineMap({name: "Payal", age: 35});

  const people = new DefineList([justin, payal]);

  people.updateDeep([
  	{name: "JUSTIN"}
  ]);

  console.log( justin.serialize(), payal.serialize() );
  //-> {name: "JUSTIN"}, {age: 35, name: "Payal"}
  console.log( people.serialize() ) //-> [
  //   {name: "JUSTIN"}
  // ]
  ```
  @codepen

  Use [can-define/list/list.prototype.assignDeep .assignDeep()] if you want recursive updating that doesn't remove properties.  Use [can-diff/merge-deep/merge-deep]
  if you want recursive updating that is [can-reflect.getIdentity identity] aware.


  @param {Array|Object} newItems A list or array of values, or an object of property values.
  If an object is passed, the properties of the list will be updated with the values
  in  `newItems`.
  @return {can-define/list/list} The list instance.

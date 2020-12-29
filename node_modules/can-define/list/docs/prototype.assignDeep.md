@function can-define/list/list.prototype.assignDeep assignDeep
@parent can-define/list/list.prototype

Recursively sets values within a list or properties on a list.

@signature `list.assignDeep(newItems)`

  Similar to [can-define/list/list.prototype.assign .assign()], `.assignDeep()` will
  overwrite values within `list` with values from `newItems`.  Where `assign()` will replace
  values or properties one level deep, `.assignDeep()` will overwrite values or
  properties on objects and lists recursively.

  For example, the following only assigns `justin`'s `age` to 36:

  ```js
  import { DefineMap, DefineList } from "can";

  const justin = new DefineMap({name: "Justin", age: 35}),
        payal = new DefineMap({name: "Payal", age: 35});

  const people = new DefineList([justin, payal]);

  people.assignDeep([
  	{age: 36}
  ]);

  console.log(people.serialize()) //-> [
  //   {name: "Justin", age: 36},
  //   {name: "Payal", age: 35}
  // ]
  ```
  @codepen


  @param {Array|Object} newItems A list or array of values, or an object of property values.
  If an object is passed, the properties of the list will be assigned with the values
  in  `newItems`.
  @return {can-define/list/list} The list instance.

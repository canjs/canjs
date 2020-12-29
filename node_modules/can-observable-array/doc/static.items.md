@property {can-observable-object/object.types.property} can-observable-array/static.items items
@parent can-observable-array/static

@description Define default behavior for items in the list.

@option {can-observable-object/object.types.property}

  By defining an `items` property, this will supply a
  default behavior for items in the list.

  Setting the wildcard is useful when items should be converted to a particular type.

  ```js
import { ObservableArray, ObservableObject, type } from "can/everything";

  class Person extends ObservableObject { /* ... */ }
  class People extends ObservableArray {
    static items = type.convert(Person);
  }

  let scientists = new People([
    { first: "Ada", last: "Lovelace" },
    { first: "John", last: "McCarthy" }
  ]);

  console.log(scientists[0] instanceof Person);
  // -> true
  ```
  @codepen

@function can-observable-array/array.prototype.serialize serialize
@parent can-observable-array/prototype

Returns the a serialized version of this array.

@signature `array.serialize()`

  Goes through each item in the array and gets its serialized value and returns them in a plain Array.

  Each items serialized value is the result of calling [can-reflect.serialize canReflect.serialize()] on the item.

  ```js
  import { ObservableArray } from "can/everything";

  const array = new ObservableArray(["first", {foo: "bar"}]);
  const serializedArray = array.serialize();

  console.log(serializedArray); //-> ["first", {foo: "bar"}]
  ```
  @codepen

  @return {Array} An array with each item's serialized value.

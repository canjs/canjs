@property {function} can-observe/shift shift
@parent can-observe/array

@description Removes the first element from an array.
@signature `list.shift()`

  `shift` removes an element from the front of an array.

  ```js
  import { observe } from "can/everything";

  const names = new observe.Array(['Alice', 'Bob', 'Chris']);
  console.log(names.shift()); //-> 'Alice'
  console.log(names.shift()); //-> 'Bob'
  console.log(names.shift()); //-> 'Chris'
  console.log(names.shift()); //-> undefined
  ```
  @codepen

  @return {*} The element shifted off from the array, or `undefined` if the array is empty

@body

## Events

`shift` causes _length_ events to be fired.

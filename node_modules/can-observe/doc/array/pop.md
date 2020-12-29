@property {function} can-observe/pop pop
@parent can-observe/array

@description Remove an element from the end of an observe array.
@signature `list.pop()`

  `pop` removes the last element from the array.

  ```js
  import { observe } from "can/everything";

  const names = new observe.Array(['Alice', 'Bob']);

  console.log(names.pop()); //-> ['Bob']
  ```
  @codepen

  @return {*} The element from the end of the Array

@body

## Events

`pop` causes _length_ events to be fired.

@property {function} can-observe/reverse reverse
@parent can-observe/array

@description Reverses the order of the observe array.
@signature `list.reverse()`

  `reverse` reverses the order of the array in place.

  ```js
  import { observe } from "can/everything";

  const names = new observe.Array(['Alice', 'Bob', 'Chris']);
  names.reverse();

  console.log(names); //-> ['Chris', 'Bob', 'Alice']
  ```
  @codepen

  @return {can-observe.Array} The array with reverse ordered elements

@body

## Events

`reverse` causes _length_ events to be fired.

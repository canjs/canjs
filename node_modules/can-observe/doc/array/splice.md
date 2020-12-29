@property {function} can-observe/splice splice
@parent can-observe/array

@description Insert and remove elements from an observe array.
@signature `list.splice(index[, howMany[, ...newItems]])`

  `splice` inserts and removes elements from an observe array.

  ```js
  import { observe } from "can/everything";

  const names = new observe.Array(['Alice', 'Bob', 'Chris']);
  console.log(names.splice(0, 1)); //-> ['Alice']

  console.log(names); //-> ['Bob', 'Chris']
  ```
  @codepen

  @param {Number} index Where to start removing or inserting elements

  @param {Number} howMany The number of elements to remove, if _howMany_ is not provided `splice` will remove all elements from the `index` to the end of the array.

  @param {*} newItems Items to insert into the array

  @return {Array} The elements removed by the `splice`.

@body

## Use

`splice` lets you remove and insert items into an observe array.
This example shows replacing an item at a given index:

```js
import { observe } from "can/everything";

const names = new observe.Array(['Alice', 'Bob', 'Chris']);
console.log(names.splice(1, 1, 'Dave')); //-> ['Bob']

console.log(names); //-> ['Alice', 'Bob', 'Chris']
```
@codepen

## Events

`splice` causes _length_ events to be fired.

@function can-define/list/list.prototype.forEach forEach
@parent can-define/list/list.prototype

@description Call a function for each element of a DefineList.
@signature `list.forEach(callback[, thisArg])`

  Loops through the values of the list, calling `callback` for each value until the list ends
  or `false` is returned.

  ```js
  import {DefineList} from "can";

  const list = new DefineList([1, 2, 3]);

  list.forEach((element, index, list) => {
      list.set(index, element * element);
  });

  console.log(list.get()); //-> [1, 4, 9]
  ```
  @codepen

  @param {function(item, index, list)} callback A function to call with each element of the DefineList.
  The three parameters that callback gets passed are:
   - item - the element at index.
   - index - the current element of the list.
   - list - the DefineList the elements are coming from.

  If the callback returns `false` the looping stops.

  @param {Object} [thisArg] The object to use as `this` inside the callback.
  @return {can-define/list/list} The list instance.
@body

## Use

If `false` is returned by the callback the `forEach` loop would exit.

```js
import {DefineList} from "can";

const list = new DefineList([1, 2, 3, 4, 5]);

list.forEach((element, index, list) => {
    if (index === 2) {
      return false;
    }
    list.set(index, `index: ${index}`);
});

console.log(list.get()); //-> ["index: 0", "index: 1", 3, 4, 5]
```
@codepen

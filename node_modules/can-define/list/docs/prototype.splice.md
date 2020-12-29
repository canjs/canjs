@function can-define/list/list.prototype.splice splice
@parent can-define/list/list.prototype

@parent can-define/list/list.prototype
@description Insert and remove elements from a DefineList.
@signature `list.splice(index[, howMany[, ...newItems]])`

  Removes `howMany` items at `index` and adds `newItems` in their place.

  @param {Number} index Where to start removing or inserting elements.

  @param {Number} [howMany] The number of elements to remove
  If _howMany_ is not provided, `splice` will remove all elements from `index` to the end of the DefineList.

  @param {*} newItems Items to insert into the DefineList

  @return {Array} The elements removed by `splice`.

@body

## Use

`splice` lets you remove elements from and insert elements into a DefineList.

This example demonstrates how to do surgery on a list of numbers:

```js
import {DefineList} from "can";

const list = new DefineList([0, 1, 2, 3]);

// starting at index 2, remove one element and insert 'Alice' and 'Bob':
list.splice(2, 1, 'Alice', 'Bob');
console.log(list.get()); //-> [0, 1, 'Alice', 'Bob', 3]
```
@codepen

## Events

`splice` causes the DefineList it's called on to emit
_add_ events, _remove_ events, and _length_ events. If there are
any elements to remove, a _remove_ event, and a
_length_ event will be fired. If there are any elements to insert, a
separate _add_ event, and a separate _length_ event
will be fired.

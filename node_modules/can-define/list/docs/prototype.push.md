@function can-define/list/list.prototype.push push
@parent can-define/list/list.prototype

@description Add elements to the end of a list.
@signature `list.push(...elements)`

  `push` adds elements onto the end of a DefineList.

  ```js
  import { DefineList } from "can";

  const names = new DefineList(['Alice']);
  names.push('Bob', 'Eve');

  console.log(names.get()); //-> ['Alice','Bob', 'Eve']
  ```
  @codepen

  @param {*} elements the elements to add to the DefineList

  @return {Number} the new length of the DefineList

@body

## Use

If you have an array you want to concatenate to the end
of the DefineList, you can use `apply`:

```js
import {DefineList} from "can";
const names = ['Bob', 'Eve'];
const list = new DefineList(['Alice']);

list.push.apply(list, names);
console.log(list.get()); // ['Alice', 'Bob', 'Eve']
```
@codepen

## Events

`push` causes _add_, and _length_ events to be fired.

## See also

`push` has a counterpart in [can-define/list/list::pop pop], or you may be
looking for [can-define/list/list::unshift unshift] and its counterpart [can-define/list/list::shift shift].

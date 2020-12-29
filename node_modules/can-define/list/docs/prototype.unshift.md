@function can-define/list/list.prototype.unshift unshift
@parent can-define/list/list.prototype

@description Add items to the beginning of a DefineList.
@signature `list.unshift(...items)`

  `unshift` adds items onto the beginning of a DefineList.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(['Alice']);

  list.unshift('Bob', 'Eve');
  console.log(list.get()); //-> ['Bob', 'Eve', 'Alice']
  ```
  @codepen

  @param {*} items The items to add to the DefineList.

  @return {Number} The new length of the DefineList.

@body

## Use

If you have an array you want to concatenate to the beginning
of the DefineList, you can use `apply`:

```js
import {DefineList} from "can";

const names = ['Bob', 'Eve'];
const list = new DefineList(['Alice']);

list.unshift.apply(list, names);
console.log(list.get()); //-> ['Bob', 'Eve', 'Alice']
```
@codepen

## Events

`unshift` causes _add_ and _length_ events to be fired.

## See also

`unshift` has a counterpart in [can-define/list/list::shift shift], or you may be
looking for [can-define/list/list::push push] and its counterpart [can-define/list/list::pop pop].

@function can-define/list/list.prototype.pop pop
@parent can-define/list/list.prototype

@description Remove an element from the end of a DefineList.
@signature `list.pop()`

  `pop` removes an element from the end of a DefineList.

  ```js
  import { DefineList } from "can";

  const names = new DefineList(['Alice', 'Bob', 'Eve']);

  console.log(names.pop()); //-> 'Eve'
  ```
  @codepen

  @return {*} The element just popped off the DefineList, or `undefined` if the DefineList was empty

@body

## Use

`pop` is the opposite action from [can-define/list/list::push push]:

```js
import {DefineList} from "can";

const list = new DefineList(['Alice', 'Bob', 'Eve']);

console.log(list.pop()); //-> 'Eve'
console.log(list.pop()); //-> 'Bob'
console.log(list.pop()); //-> 'Alice'
console.log(list.pop()); //-> undefined
```
@codepen

## Events

`pop` causes _remove_ and _length_ events to be fired if the DefineList is not empty
when it is called.

## See also

`pop` has its counterpart in [can-define/list/list::push push], or you may be
looking for [can-define/list/list::unshift unshift] and its counterpart [can-define/list/list::shift shift].

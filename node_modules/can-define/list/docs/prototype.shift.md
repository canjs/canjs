@function can-define/list/list.prototype.shift shift
@parent can-define/list/list.prototype

@description Remove an item from the front of a list.
@signature `list.shift()`

  `shift` removes an element from the beginning of a DefineList.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(['Alice','Adam']);

  console.log(list.shift()); //-> 'Alice'
  console.log(list.shift()); //-> 'Adam'
  console.log(list.shift()); //-> undefined
  ```
  @codepen

  @return {*} The element just shifted off the DefineList, or `undefined` if the DefineList is empty

@body

## Use

`shift` is the opposite action from `[can-define/list/list::unshift unshift]`:

## Events

`pop` causes _remove_ and _length_ events to be fired if the DefineList is not empty
when it is called.

## See also

`shift` has a counterpart in [can-define/list/list::unshift unshift], or you may be
looking for [can-define/list/list::push push] and its counterpart [can-define/list/list::pop pop].

@function can-define/list/list.prototype.replace replace
@parent can-define/list/list.prototype
@hide

@description Replace all the elements of a DefineList.
@signature `list.replace(collection)`

  Replaces every item in the list with `collection`.

  ```js
  import {DefineList} from "can";

  const names = new DefineList(["alice","adam","eve"]);
  names.replace(["Justin","Xena"]);

  console.log(names.get()); //-> ["Justin","Xena"]
  ```
  @codepen

  @param {Array|can-define/list/list} collection The collection of items that will be in `list`.
  @return {can-define/list/list} Returns the `list`.

@body

## Use

`replace` is essentially a shortcut for [can-define/list/list.prototype.splice].

## Events

`replace` causes _remove_, _add_, and _length_ events.

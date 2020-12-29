@function can-define/list/list.prototype.slice slice
@parent can-define/list/list.prototype

@description Make a copy of a part of a DefineList.
@signature `list.slice([start[, end]])`

  `slice` creates a copy of a portion of the DefineList.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["Alice", "Bob", "Charlie", "Daniel", "Eve"]);
  const newList = list.slice(1, 4);

  console.log(newList.get()); //-> ["Bob", "Charlie", "Daniel"]
  ```
  @codepen

  @param {Number} [start=0] The index to start copying from. Defaults to `0`.

  @param {Number} [end] The first index not to include in the copy
  If _end_ is not supplied, `slice` will copy until the end of the list.

  @return {can-define/list/list} A new `DefineList` with the extracted elements.

@body

## Use

`slice` is the simplest way to copy a DefineList:

```js
import {DefineList} from "can";

const list = new DefineList(["Alice", "Bob", "Eve"]);
const copy = list.slice();

console.log(copy.get()); //-> ["Alice", "Bob", "Eve"]
console.log(list === copy); //-> false
```
@codepen

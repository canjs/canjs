@module {{}} can-dom-data
@parent can-dom-utilities
@collection can-infrastructure
@package ../package.json
@description Associate key/value pair data with a DOM node in a memory-safe way.

@type {Object} The `can-dom-data` package exports an object with
[can-dom-data.clean clean], [can-dom-data.delete delete], [can-dom-data.get get],
and [can-dom-data.set set] methods.

@body

## Use

```js
import domData from "can-dom-data";

const element = document.createElement("p");
document.body.appendChild(element);

domData.set(element, "metadata", {
  hello: "world"
});

let metadata = domData.get(element, "metadata");
// metadata is {hello: "world"}

document.body.removeChild(element);

metadata = domData.get(element, "metadata");
// metadata === undefined because the element was removed from the DOM
```

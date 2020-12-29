@function can-dom-data.delete domData.delete
@parent can-dom-data

Remove all data for an element previously added by [can-dom-data.set set].

@signature `domData.delete(node)`
@param {Node} node The element.

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

domData.delete(element, "metadata");

metadata = domData.get(element, "metadata");
// metadata === undefined after clean() was called
```

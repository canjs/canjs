@function can-dom-data.clean domData.clean
@parent can-dom-data

Remove data from an element previously added by [can-dom-data.set set].

@signature `domData.clean(node, key)`
@param {Node} node The element.
@param {String} key The property to remove from the element’s data.

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

domData.clean(element, "metadata");

metadata = domData.get(element, "metadata");
// metadata === undefined after clean() was called
```

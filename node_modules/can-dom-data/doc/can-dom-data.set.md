@function can-dom-data.set domData.set
@parent can-dom-data

Set data to be associated with a DOM node using the specified `key`.
If data already exists for this key, it will be overwritten.

@signature `domData.set(node, key, value)`
@param {Node} node The element.
@param  {String} key The property under which to store the value.
@param {*} value The value to store for the key.

@body

## Use

```js
import domData from "can-dom-data";

const element = document.createElement("p");
document.body.appendChild(element);

domData.set(element, "metadata", {
  hello: "world"
});
```

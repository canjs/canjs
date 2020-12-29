@module {function} can-deparam can-deparam
@parent can-routing
@collection can-infrastructure
@package ./package.json
@description Deserialize a query string into an array or object.
@signature `deparam(params)`
 
@param {String} params A form-urlencoded string of key-value pairs.
@param {function} [valueDeserializer] A function that decodes the string values. For example, using
[can-string-to-any] will convert `"null"` to `null` like:

```js
import stringToAny from "can-string-to-any";
deparam("value=null", stringToAny) //-> {value: null}
```
@return {Object} The params formatted into an object

Takes a string of name value pairs and returns a Object literal that represents those params.

```js
var deparam = require("can-deparam");

console.log(JSON.stringify(deparam("?foo=bar&number=1234"))); // -> '{"foo" : "bar", "number": 1234}'
console.log(JSON.stringify(deparam("#foo[]=bar&foo[]=baz"))); // -> '{"foo" : ["bar", "baz"]}'
console.log(JSON.stringify(deparam("foo=bar%20%26%20baz"))); // -> '{"foo" : "bar & baz"}'
```
@body

## Try it

Run the following example on CodePen to play around with this package:

```html
<script type="module">
import { deparam } from "can";

var queryString = 'canjs=awesome%20%26%20great';
var parameters = deparam(queryString);
console.log(parameters);
</script>
```
@codepen

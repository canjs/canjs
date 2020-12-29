@module {function} can-string-to-any
@parent can-js-utilities
@collection can-infrastructure
@package ./package.json
@description Turns a string representation of a primitive type back into the associated primitive.

@signature `stringToAny(string)`

Examines the provided string to see if it can be converted to a primitive type. Supported arguments are:

* "true"
* "false"
* "null"
* "undefined"
* "NaN"
* "Infinity"
* Any [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
* Any [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

```js
import stringToAny from "can-string-to-any";

stringToAny( "NaN" ); // -> NaN
stringToAny( "44.4" ); // -> 44.4
stringToAny( "false" ); // -> false
```

	@param {String} string A string to convert back to its primitive type.

	@return {*} The primitive representation of the provided string.

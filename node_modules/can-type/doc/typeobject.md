@typedef {{}} can-type.typeobject TypeObject
@parent can-type/types 2
@description An object describing how to test membership for and convert to a specified type.

@option {function(value)} can.new A function that returns an instance of a type using the provided `value`.

@option {function(value)} can.isMember A function that receives a `value` and returns `true` if the value is a member of the specified type.

@body An object which can be used with [can-reflect.convert canReflect.convert()] to convert a value to a specied type.

A `TypeObject` is any object which conforms to this API:

```js
import { Reflect } from "can";

const dateType = {
  [Symbol.for("can.new")](value) {
    return new Date(value);
  },

  [Symbol.for("can.isMember")](value) {
    return value instanceof Date;
  }
};

let val = Reflect.convert("12/02/1355", dateType);
console.log(val); // -> Date{12/02/1355}
```
@codepen

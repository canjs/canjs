@module {Object} can-data-types/maybe-number/maybe-number
@parent can-data-types
@description A type that can be a Number, `null`, or `undefined`.

@type {Object}
  An object with the `can.new`, `can.getSchema`, `can.isMember` symbols.

@body

## Use

Normally, `MaybeNumber` is used as part of [can-define] or [can-query-logic],
but it can be used directly too:

```js
import MaybeNumber from "can-data-types/maybe-number/maybe-number";
import canReflect from "can-reflect";

canReflect.new(MaybeNumber, "1") //-> 1

MaybeNumber[Symbol.for("can.isMember")](1)    //-> true
MaybeNumber[Symbol.for("can.isMember")]("1")  //-> false
MaybeNumber[Symbol.for("can.isMember")](null) //-> true
```

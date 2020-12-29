@module {Object} can-data-types/maybe-string/maybe-string
@parent can-data-types
@description A type that can be a String, `null`, or `undefined`.

@type {Object}
  An object with the `can.new`, `can.getSchema`, `can.isMember` symbols.

@body

## Use

Normally, `MaybeString` is used as part of [can-define] or [can-query-logic],
but it can be used directly too:

```js
import MaybeString from "can-data-types/maybe-string/maybe-string";
import canReflect from "can-reflect";

canReflect.new(MaybeString, 1) //-> "1"

MaybeString[Symbol.for("can.isMember")]("1")    //-> true
MaybeString[Symbol.for("can.isMember")](1)  //-> false
MaybeString[Symbol.for("can.isMember")](null) //-> true
```

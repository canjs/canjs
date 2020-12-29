@module {Object} can-data-types/maybe-boolean/maybe-boolean
@parent can-data-types
@description A type that can be a Boolean, `null`, or `undefined`.

@type {Object}
  An object with the `can.new`, `can.getSchema`, `can.isMember` symbols.

  The strings `"false"` and `"0"` will be converted to `false`.  Any
  falsey values like `""` will also be converted to false.

@body

## Use

Normally, `MaybeBoolean` is used as part of [can-define] or [can-query-logic],
but it can be used directly too:

```js
import MaybeBoolean from "can-data-types/maybe-boolean/maybe-boolean";
import canReflect from "can-reflect";

canReflect.new(MaybeBoolean, "true") //-> true

MaybeBoolean[Symbol.for("can.isMember")](true)    //-> true
MaybeBoolean[Symbol.for("can.isMember")]("true")  //-> false
MaybeBoolean[Symbol.for("can.isMember")](null) //-> true
```

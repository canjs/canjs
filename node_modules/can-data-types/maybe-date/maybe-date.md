@module {Object} can-data-types/maybe-date/maybe-date
@parent can-data-types
@description A type that can be a Date, `null`, or `undefined`.

@type {Object}
  An object with the `can.new`, `can.getSchema`, `can.isMember`, and
  `can.ComparisonSetType` symbols.

  When using [can-reflect/call.new canReflect.new]:
  - Strings will be converted with `Date.parse(str)`
  - Dates will be passed to `new Date(str)`

@body

## Use

Normally, `MaybeDate` is used as part of [can-define] or [can-query-logic],
but it can be used directly too:

```js
import MaybeDate from "can-data-types/maybe-date/maybe-date";
import canReflect from "can-reflect";

canReflect.new(MaybeDate, "2018-1-31") //-> Date.parse("2018-1-31")

MaybeDate[Symbol.for("can.isMember")](new Date()) //-> true
MaybeDate[Symbol.for("can.isMember")]({})  //-> false
MaybeDate[Symbol.for("can.isMember")](null) //-> true
```

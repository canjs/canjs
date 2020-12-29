@module {Object} can-data-types
@parent can-typed-data
@collection can-infrastructure
@package ./package.json
@description A package of type objects that are used to test if a value is a
member of the type and convert values to the type.

@body

## Use

This package is used by [can-define] (and eventually [can-observe]) to define
types. These types include a [can-reflect.getSchema] that enables them to be
converted to [can-query-logic] set types.

```js
import {DefineMap, MaybeDate, MaybeString, MaybeNumber} from "can";

const Todo = DefineMap.extend({
    id: MaybeNumber,
    name: MaybeString,
    dueDate: MaybeDate
});
```

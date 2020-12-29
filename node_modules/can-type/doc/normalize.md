@function can-type/normalize normalize
@parent can-type/methods 6
@description Given any type, ensure a [can-type.typeobject] is created for it.
@signature `type.normalize(Type)`

  Given any Type, including builtin types such as `Date` and `Number`, returns a [can-type.typeobject]. For builtin constructors `type.normalize` returns a strict type for that constructor.

  ```js
  import { type } from "can";

  const normalizedType = type.normalize(Date);
  const dateStrictType = type.check(Date);

  // normalizedType and dateStrictType are equivalent.
  ```

  @param {Object|function} Type Anything, but usually an object of some sort.

  @return {can-type.typeobject} A TypeObject representing the underlying type.

@function can-type/isTypeObject isTypeObject
@parent can-type/methods 5
@description Determines if an object is a [can-type.typeobject].
@signature `type.isTypeObject(Type)`

  Given a Type, determines if it fits the [can-type.typeobject] protocol. To be a TypeObject, a Type needs to be an object which contains the following symbols:

  * `Symbol.for("can.new")`
  * `Symbol.for("can.isMember")`

  ```js
  import { ObservableObject, type } from "can";

  class Faves extends ObservableObject {}

  console.log("An Typed Observable", type.isTypeObject(faves)); // true

  console.log("A custom TypeObject", type.isTypeObject({
    [Symbol.for("can.new")]() {},
    [Symbol.for("can.isMember")]() {}
  })); // -> true

  console.log("A primitive", type.isTypeObject(null)); // -> false
  ```
  @codepen

  @param {*} Type Anything, but usually an object of some sort.

  @return {Boolean} true if it conforms to the [can-type.typeobject] protocol, otherwise false.

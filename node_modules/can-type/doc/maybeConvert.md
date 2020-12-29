@function can-type/maybeConvert maybeConvert
@parent can-type/methods 3
@description Create a converting [can-type.typeobject] that also accepts `null` and `undefined`.

@signature `type.maybeConvert(Type)`

  Given a type, returns a [can-type.typeobject] that will check values against that type. Coerces if the value is not of the provided type or `null` or `undefined`.

  ```js
  import { ObservableObject, type } from "can";

  class Person extends ObservableObject {
    static props = {
      age: maybeConvert(Number)
    };
  }

  let person = new Person();
  person.age = 42; // -> 42

  person.age = null; // -> null

  person.age = undefined; // -> undefined

  person.age = "42"; // -> 42
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against.

  @return {can-type.typeobject} A [can-type.typeobject] which will enforce conversion to the given type.

@body

## Use Case

Like with [can-type/convert], __type.maybeConvert__ is particularly useful when building models for service layers (like with [can-rest-model] and [can-realtime-rest-model]. Some server-side data layers will transfer empty values in database as either `null` or `undefined`. Using type.maybeConvert will prevent these values from throwing, but also attempt to convert them when a value does exist.

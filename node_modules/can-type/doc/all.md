@function can-type/all all
@parent can-type/methods 7
@description Derive a new type that changes the types of properties using a converter function.

@signature `type.all(converter, Type)`

  Create a new type that inherits the same properties of `Type`, but with each property run through the converter function. The converter function should be one of [can-type/check], [can-type/maybe], [can-type/convert], or [can-type/maybeConvert].

  ```js
  import { ObservableObject, Reflect, type } from "can";

  class Person extends ObservableObject {
    static props = {
      age: Number
    }
  }

  // Age is a strict number.

  let person = new Person();
  try {
      person.age = "13";
  } catch(err) {
    console.log("Oops, tried to convert a strict type.");
  }

  let ConvertingPerson = type.all(type.convert, Person);
  person = Reflect.new(Person);
  person.age = "13";
  console.log("Age is", person.age); // logs 13
  ```
  @codepen

  @param {can-type/check|can-type/maybe|can-type/convert|can-type/maybeConvert} converter One of [can-type/check], [can-type/maybe], [can-type/convert], or [can-type/maybeConvert].
  @param {Function} Type Any type with a [can-reflect.getSchema] implementation.

  @return {can-type.typeobject} A [can-type.typeobject] which derives properties from the input Type.

@function can-type/convertAll convertAll
@parent can-type/methods 8
@description Derive a new type that makes every property of Type convert, eliminating strict type checking.

@signature `type.convertAll(Type)`

  Create a new type that inherits the same properties of `Type`, but where each property on the `Type` is converted, rather than being strictly checked.

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

  let ConvertingPerson = type.convertAll(Person);
  person = Reflect.new(Person);
  person.age = "13";
  console.log("Age is", person.age); // logs 13
  ```
  @codepen

  @param {Function} Type Any type with a [can-reflect.getSchema] implementation.

  @return {can-type.typeobject} A [can-type.typeobject] which derives properties from the input Type.

@body

## Use with fixture.store

This function is useful to create derived types where any strict types are ignored. Useful in cases where you might receive strings for each key.

One example is using [can-fixture.store], which will provide string values in some cases. `type.convertAll` can be used to create a type where this works.

```js
import { fixture, ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
    age: Number
  };
}

const items = [{ id: 1, age: "13"}];

fixture.store(items, type.convertAll(Person));
```

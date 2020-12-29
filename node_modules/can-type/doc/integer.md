@property {can-type.typeobject} can-type.Integer Integer
@parent can-type/types 1
@description A integer type for numbers without a fraction.

@signature `type.Integer`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a strict Integer. JavaScript does not have a native Integer type, so this provides one.

  An integer is a whole, non-fractional, number.

  ```js
  import { ObservableObject, type } from "can";

  class Fruit extends ObservableObject {
    static props = {
      apples: type.convert(type.Integer),
      oranges: type.check(type.Integer)
    };
  }

  let fruit = new Fruit();
  fruit.apples = 6.3;
  fruit.oranges = 7;
  
  console.log("Apples", fruit.apples, "Oranges", fruit.oranges);

  fruit.oranges = 7.1; // throws!
  ```
  @codepen


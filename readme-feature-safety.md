## Add safety to your code with runtime type checking & conversion

CanJS has two features that contribute to code safety and better defined types:

- [can-observable-array](https://canjs.com/doc/can-observable-array.html) and [can-observable-object](https://canjs.com/doc/can-observable-object.html) help you define custom array and object types, respectively
- [can-type](https://canjs.com/doc/can-type.html) helps you specify rules for type checking and conversion

`can-observable-object` helps you define the properties that are on an object. With `can-type`, you can specify what the values of those properties should be:

- [check](https://canjs.com/doc/can-type/check.html): make sure the assigned value is always of a certain type
- [convert](https://canjs.com/doc/can-type/convert.html): always convert assigned values to this type
- [maybe](https://canjs.com/doc/can-type/maybe.html): let the assigned value be the specified type, `null`, or `undefined`
- [maybeConvert](https://canjs.com/doc/can-type/maybeConvert.html): convert the assigned value to the specified type if they are not `null` or `undefined`

With this system in place, you can be sure that the values in your app are always of a certain type and errors are thrown when they’re the wrong type (or you can choose to convert the values).

This adds safety to your code by making sure values are always what you expect, even when they come from outside sources like other APIs or backend services.

```js
import { ObservableObject, type } from "can/everything";

class Person extends ObservableObject {
  static props = {
    age: type.maybe(Number),
    first: String
  };
}

const person = new Person();
person.age = 37; // -> 👌
person.first = "Grace"; // -> 👌

person.first = false; // -> Uncaught Error: Type value 'false' is not of type String.
```
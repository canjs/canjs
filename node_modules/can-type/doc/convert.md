@function can-type/convert convert
@parent can-type/methods 2
@description Create a [can-type.typeobject] that converts values to the given type.

@signature `type.convert(Type)`

  Given a type, returns a [can-type.typeobject] that will coerce values to that type.

  ```js
  import { ObservableObject, type } from "can";

  class Event extends ObservableObject {
    static props = {
      date: type.convert(Date)
    };
  }

  let event = new Event({
    date: new Date()
  });

  console.log(event.date); // -> Date

  event.date = "12/14/1933";
  console.log(event.date); // -> Date{12/14/1933}
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against.

  @return {can-type.typeobject} A [can-type.typeobject] which will *coerce* values to the provided type.

@body

## Use Case

Use __type.convert__ to build types for models, such as those with [can-rest-model] and [can-realtime-rest-model]. You often want to use convert because the database where data is stored will serialize types. This is true of of the [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) type which is often serialized as strings. It's also true of subtypes (like other [can-observable-object ObservableObjects]) which are serialized as plain objects.

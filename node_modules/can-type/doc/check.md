@function can-type/check check
@parent can-type/methods 0
@description Create a strictly typed TypeObject.

@signature `type.check(Type)`

  Given a type, returns a [can-type.typeobject] that will check values against that type. Throws if another type is provided as a value.

  The following creates an object with a strongly typed [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) so that any other value cannot be passed to it.

  ```js
  import { ObservableObject, type } from "can";

  class Pagination extends ObservableObject {
    static props = {
      num: type.check(Number)
    };
  }

  let page = new Pagination({ num: 1 });
  console.log(page.num); // -> 1

  page.num = 2;
  console.log(page.num); // -> 2

  page.num = "4";
  // throws for providing an invalid type.
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against. Often this will be the primitive constructors [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean), or [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), but could be any class type.

  @return {can-type.typeobject} A [can-type.typeobject] which will strictly enforce values of the provided type.

@body

## Use Case

Use __type.check__ to create strongly typed properties. This is useful when used with [can-stache-element StacheElement] components. Strongly typed properties helps to *ensure* that the component works correctly because invalid types cannot creep in and cause unexpected behavior.

Using strongly typed properties with can-type sends a singal to users of the component that the component needs these properties in a certain type.

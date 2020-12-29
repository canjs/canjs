@function can-type/maybe maybe
@parent can-type/methods 1
@description Create a strictly typed TypeObject that also accepts `null` and `undefined` values.

@signature `type.maybe(Type)`

  Given a type, returns a [can-type.typeobject] that will check values against against that type. Throws if the value is not of the provided type or `null` or `undefined`.

  ```js
  import { ObservableObject, type } from "can";

  class Person extends ObservableObject {
    static props = {
      first: type.check(String),
      last: type.maybe(String)
    };
  }

  let person = new Person({
    first: "Matthew",
    last: null
  });

  console.log(person.first, person.last); // "Matthew" null
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against.

  @return {can-type.typeobject} A [can-type.typeobject] which will enforce conversion to the given type.

@body

# Use Case

Using __type.maybe__ you can create types that accept a type, null, or undefined. This is useful in cases where a type is *optional* but it is more convenient to pass a value even when one doesn't exist.

An example is when binding to a child component (such as a [can-stache-element StacheElement]). Using bindings means you'll always pass *something* to that child component, you can't pass nothing. Without a good default value you might want to pass undefined.

```js
import { StacheElement, type } from "can";

class Child extends StacheElement {
  static view = `
    {{# if(this.name) }}
      {{name}}
    {{ else }}
      No name given!
    {{/ if }}
  `;

  static props = {
    name: type.maybe(String)
  };
}

customElements.define("child-el", Child);

class Parent extends StacheElement {
  static view = `
    <child-el name:from="this.name" />
  `;

  static props = {
    name: type.maybe(String)
  };
}

customElements.define("parent-el", Parent);
let el = new Parent();
document.body.append(el);
```
@codepen

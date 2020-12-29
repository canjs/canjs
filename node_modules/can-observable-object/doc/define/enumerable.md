@property can-observable-object/define/enumerable enumerable
@parent can-observable-object/object.behaviors

@description enumerable

Defines whether the property is [enumerable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties) and is serialized by [can-observable-object/define/serialize .serialize()].

@signature `Boolean`

  Specifies if the property should be enumerable.  By default, all properties except for
  ones with defined [can-observable-object/define/get getters], [can-observable-object/define/async], and [can-observable-object/define/value] are serialized.

  You can prevent a property from being serialized like:

  ```js
  import { ObservableObject } from "can/everything";

  class MyMap extends ObservableObject {
    static props = {
      propertyName: {
        enumerable: false
      },
      secondPropertyName: String
    };
  }

  const map = new MyMap({ propertyName: "foobar", secondPropertyName: "bar" });

  console.log( map.serialize() ); //-> {secondPropertyName: "bar"}
  ```
  @codepen

  Make a [can-observable-object/define/get getter] property part of the serialized result like:

  ```js
  import { ObservableObject } from "can/everything";

  class MyMap extends ObservableObject {
    static props = {
      propertyName: {
        get() {
          return "test";
        },
        enumerable: true
      }
    };
  }

  const map = new MyMap();

  console.log( map.serialize() ); //-> { propertyName: "test" }
  ```
  @codepen

  __enumerable__ also controls `for/in` loops, [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign), and [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), among others. See [enumerability](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Enumerable_attribute) for more information.

@property can-observable-object/define/default default
@parent can-observable-object/object.behaviors
@description

Specifies the default value for instances of the defined type.

@signature `default`

  Provide *primitive* values to act as the initial value for the property if no value is provided upon instantiation. For example:

  ```js
  import { ObservableObject } from "can/everything"

  class Example extends ObservableObject {
    static props = {
      prop: {
        default: "foo"
      }
    };
  }

  const ex = new Example();
  console.log( ex.prop ); //-> "foo"
  ```
  @codepen

  This could also be written using the [can-observable-object/object.types.property] shorthand method:

  ```js
  class Example extends ObservableObject {
    static props = {
      prop: "foo"
    };
  }
  ```

  @param {*} defaultVal The default value, which will be passed through setter and type.

@body

## Use

The following defaults `age` to `0` and `address` to an object:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    // A default age of `0`:
    age: {
      default: 0
    }
  };
}

const person = new Person();
console.log( person.age ); //-> 0
```
@codepen

## Other ways to set the default

There is a second way to provide a default value, which is explained in [can-observable-object/define/get-default ] and is useful when defining an object as a default.

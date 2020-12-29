@property can-observable-object/define/get-default get default()
@parent can-observable-object/object.behaviors
@description

Returns the default value for instances of the defined type.  The default value is defined on demand, when the property is read for the first time.

@signature `get default()`

  A getter that returns the default value used for this property, like:

  ```js
  import { ObservableObject } from "can/everything";

  class Example extends ObservableObject {
    static props = {
      prop: {
        get default() {
          return [];
        }
      }
    };
  }

  const ex = new Example();
  console.log( ex.prop ); //-> []
  ```
  @codepen

  If the default value should be an object of some type, it should be specified as the return value of a getter function (the above call signature) so that all instances of this map don't point to the same object.  For example, if the property `value` above had not returned an empty array but instead just specified an array using [can-observable-object/define/default], all instances of that map would point to the same array (because JavaScript passes objects by reference).

  @return {*} The default value.  This will be passed through setter and type.

@body

## Use

The following defaults `age` to `0` and `address` to an object using the two default signatures:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    age: {
      default: 0
    },
    address: {
      get default() {
        return { city: "Chicago", state: "IL" };
      }
    }
  };
}

const person = new Person();
console.log( person.age ); //-> 0
console.log( person.address ); //-> { city: "Chicago", state: "IL" }
```
@codepen

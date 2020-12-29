@function can-define.types.default default
@parent can-define.behaviors

Returns the default value for instances of the defined type.  The default value is defined on demand, when the property
is read for the first time.

@signature `default()`

  A function can be provided that returns the default value used for this property, like:

  ```js
  import {DefineMap} from "can";

  const Example = DefineMap.extend( {
    prop: {
      default: function() {
        return [];
      }
    }
  } );

  const ex = new Example();
  console.log( ex.prop.serialize() ); //-> []
  ```
  @codepen

  If the default value should be an object of some type, it should be specified as the return value of a function (the above call signature) so that all instances of this map don't point to the same object.  For example, if the property `value` above had not returned an empty array but instead just specified an array using the next call signature below, all instances of that map would point to the same array (because JavaScript passes objects by reference).

  @return {*} The default value.  This will be passed through setter and type.

@signature `default`

  Any value can be provided as the default value used for this property, like:

  ```js
  import {DefineMap} from "can"

  const Example = DefineMap.extend( {
    prop: {
      default: "foo"
    }
  } );

  const ex = new Example();
  console.log( ex.prop ); //-> "foo"

  ```
  @codepen

  @param {*} defaultVal The default value, which will be passed through setter and type.

@body

## Use

The following defaults `age` to `0` and `address` to an object:

```js
import {DefineMap} from "can";


const Person = DefineMap.extend( {
  // A default age of `0`:
	age: {
		default: 0
	},
  // A default address:
	address: {
		default() {
			return { city: "Chicago", state: "IL" };
		}
	}
} );

const person = new Person();
console.log( person.age ); //-> 0
console.log( person.address.serialize() ); //-> { city: "Chicago", state: "IL" }
```
@codepen

## Alternates

There is a third way to provide a default value, which is explained in the [can-define.types.defaultConstructor] docs page. `default`, lowercase, is for providing default values for a property type, while `[can-define.types.defaultConstructor Default]`, uppercase, is for providing a constructor function, which will be invoked with `new` to create a default value for each instance of this map.

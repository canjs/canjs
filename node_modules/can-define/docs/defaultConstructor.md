@function can-define.types.defaultConstructor Default
@parent can-define.behaviors

Provides a constructor function to be used to provide a default value for a property.  

@signature `Default`

  A constructor function can be provided that is called to create a default value used for this property.
  This constructor will be invoked with `new` for each created instance. The default
  value is created on demand when the property is read for the first time.

  Specify `Default` like:

  ```js
  {
    prop: {
      Default: Array
    },
    person: {
      Default: Person
    }
  }
  ```

@body

## Use

```js
import {DefineMap} from "can";

const Address = DefineMap.extend( {
	street: { type: "string", default: "321 Longbow" },
	city: { type: "string", default: "Dallas" }
} );

const Direction = DefineMap.extend( {
	from: { Type: Address, Default: Address },
	to: { Type: Address, Default: Address }
} );

const direction = new Direction( {
	to: { street: "2070 N. Stave" }
} );

console.log( direction.from.street ); //-> "321 Longbow"
console.log( direction.to.street );   //-> "2070 N. Stave"
```
@codepen

@typedef {function|can-define.types.propDefinition|Array} can-define.types.typeConstructor Type
@parent can-define.behaviors

Provides a constructor function to be used to convert any set value into an appropriate
value.

@signature `Type`

  A constructor function can be provided that is called to convert incoming values set on this property, like:

  ```js
  import {DefineMap} from "can";
  import {Person} from "//unpkg.com/can-demo-models@5";

  const Example = DefineMap.extend({
    prop: {
      Type: Person
    }
  });
  const ex = new Example();
  ex.prop = {first: "Justin", last: "Meyer"};

  console.log( ex.prop instanceof Person ); //-> true
  console.log( ex.prop.fullName ); //-> "Justin Meyer"
  ```
  @codepen

  The `Type` constructor is called before the [can-define.types.type] property and before [can-define.types.set]. It checks if the incoming value
  is an [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) `Type`. If it is, or if it is `null` or `undefined`, it passes the original value through.  If not, it passes the original value to `new Type(originalValue)` and returns the
  new instance to be set.

@signature `{propDefinition}`

  A [can-define.types.propDefinition] that defines an inline [can-define/map/map] type.  For example:

  ```js
  {
    address: {
      Type: {
        street: "string",
        city: "string"
      }
    }
  }
  ```

@signature `[Type|propDefinition]`

  Defines an inline [can-define/list/list] type that's an array of `Type` or inline [can-define.types.propDefinition] [can-define/map/map]
  instances.  For example:

  ```js
  import {DefineMap} from "can";
  import {Person} from "//unpkg.com/can-demo-models@5";

  const List = DefineMap.extend({
    people: {
      Type: [ Person ]
    },
    addresses: {
      Type: [ {
        street: "string",
        city: "string"
      } ]
    }
  });

  const myList = new List({
    people: [ {first: "Justin", last: "Meyer"} ],
    addresses: [ {street: "11 Example Ave.", city: "Chicago"} ]
  });

  console.log( myList.serialize() );
  ```
  @codepen

@body

## Use

```js
import {DefineMap, Reflect as canReflect} from "can";

const Address = DefineMap.extend( {
    street: "string",
    city: {type:"string", default: "Chicago"}
} );

const Direction = DefineMap.extend( {
    from: { Type: Address },
    to: Address
} );

const direction = new Direction( {
    from: {street: "2060 N. Stave"},
    to: new Address( {street: "123 Greenview", city: "Libertyville"} )
} );

console.log( direction.from instanceof Address ); //-> true
console.log( direction.serialize() ); //-> {
//   from: {city: "Chicago", street: "2060 N. Stave"}
//   to: {city: "Libertyville", street: "123 Greenview"}
// }
```
@codepen

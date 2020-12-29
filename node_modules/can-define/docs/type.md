@typedef {function|string} can-define.types.type type
@parent can-define.behaviors

Converts a value set on an instance into an appropriate value.

@signature `type(newValue, propertyName)`

  Given the set value, transform it into a value appropriate to be set.
  `type` is called before [can-define.types.set].  

  ```js
  import {DefineMap} from "can";

  const Person = DefineMap.extend({
    age: {
      type: ( newValue, propertyName ) => {
        return +newValue;
      }
    }
  });

  const p = new Person();
  p.age = "25";
  console.log( "p.age is a", typeof p.age, "The value is", p.age ); //-> "p.age is a number. The value is 25"
  ```
  @codepen

  @param {*} newValue The value set on the property.
  @param {String} propertyName The property name being set.

  @return {*} The value that should be passed to `set` or (if there is no `set` property) the value to set on the map instance.

@signature `"typeName"`

  Sets the type to a named type in [can-define.types].  The default typeName is `"observable"`.

  ```js
  import {DefineMap} from "can";

  const Person = DefineMap.extend({
    age: {
      type: "number"
    }
  });

  const p = new Person({ age: "5" });

  console.log( p.age ) //-> 5
  ```
  @codepen

  @param {String} typeName A named type in [can-define.types].


@signature `{propDefinition}`

  A [can-define.types.propDefinition] that defines an inline [can-define/map/map] type.  For example:

  ```js
  import {DefineMap} from "can";

  const Home = DefineMap.extend({
    address: {
      type: {
        street: "string",
        city: { type: "string", default: "Chicago" }
      }
    }
  });

  const myHouse = new Home({
    address: {
      street: "101 Example St."
    }
  });

  console.log( myHouse.serialize() ); //-> { address: {city: "Chicago", street: "101 Example St."} }
  ```
  @codepen

@signature `[Type|propDefinition]`

  Defines an inline [can-define/list/list] type that's an array of `Type` or inline `propDefinition` [can-define/map/map]
  instances.  For example:

  ```js
  import {DefineMap} from "can";
  import {Person} from "//unpkg.com/can-demo-models@5";

  const List = DefineMap.extend({
    people: {
      type: [ Person ]
    },
    addresses: {
      type: [ {
        street: "string",
        city: "string"
      } ]
    }
  });

  const myList = new List({
    people: [ {first: "Justin", last: "Meyer"} ],
    addresses: [ {street: "11 Example Ave.", city: "Chicago"} ]
  });

  console.log( myList.serialize() ); //-> {
  //   addresses: [ {city: "Chicago", street: "11 Example Ave."} ],
  //   people: [ {first: "Justin", last: "Meyer"} ]
  // }
  ```
  @codepen

@body

## Use

The `type` property specifies the type of the attribute.  The type can be specified
as either:

- A type function that returns the type coerced value.
- A named type in [can-define.types].
- An object that gets converted into an inline `[can-define/map/map DefineMap]`.
- An array that gets converted to an inline `[can-define/list/list DefineList]`.

### Basic Example

The following example converts the `count` property to a number and the `items` property to an array.

```js
import {DefineMap} from "can";

const Map = DefineMap.extend( {
	count: { type: "number" },
	items: {
		type( newValue ) {
			if ( typeof newValue === "string" ) {
				return newValue.split( "," );
			} else if ( Array.isArray( newValue ) ) {
				return newValue;
			}
		}
	}
} );

const map = new Map();
map.assign({ count: "4", items: "1,2,3" });

console.log(map.count, map.items); //-> 4 ["1", "2", "3"]
```
@codepen

### Preventing Arrays and Objects from Automatic Conversion

When an array value is set, it is automatically converted into a DefineList. Likewise, objects are converted into DefineMap instances. This behavior can be prevented like the following:

In this example when a user tries to set the `locations` property, the resulting value will remain an array.
```js
import {DefineMap, DefineList} from "can";

const MyMap = DefineMap.extend({
	locations: {type: "any"},
});
const map = new MyMap( {locations: [1, 2, 3]} );

// locations is an array, not a DefineList
console.log( map.locations instanceof DefineList ); //-> false
console.log( Array.isArray( map.locations ) ); //-> true
```
@codepen

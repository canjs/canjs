@property can-observable-object/define/type type
@parent can-observable-object/object.behaviors
@outline 2

@description

Specify a type for the property.

@signature `PrimitiveFunction`

  Sets the type to a primitive constructor function. Valid primitive constructors includes `String`, `Number`, and `Boolean`.

  If the value provided for this property is of another type, or is `null` or `undefined`, it will throw.

  ```js
  import { ObservableObject } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      age: {
        type: Number
      }
    };
  }

  const p = new Person({ age: 5 });

  console.log( p.age ) //-> 5

  const p2 = new Person({ age: "5" }); //throws
  ```
  @codepen

  @param {Function} PrimitiveFunction A primitive constructor function.

@signature `ConstructorFunction`

  Sets the type to a constructor function.

  If the value provided for this property is of another type, or is `null` or `undefined`, it will throw.

  ```js
  import { ObservableObject } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      birthday: {
        type: Date
      }
    };
  }

  const p = new Person({ birthday: new Date(1970, 2, 3) });

  console.log( p.age ) //-> 5

  const p2 = new Person({ birthday: "2/3/1970" }); //throws
  ```
  @codepen

  @param {Function} ConstructorFunction Any constructor function.

@signature `TypeObject`

  Defines a type that conforms to the TypeObject API: an object with a `can.new` and `can.isMember` symbol.

  For example here is an inline [can-type.typeobject] that behaves like [can-type/convert type.convert(Date)]:

  ```js
  import { ObservableObject } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      birthday: {
        type: {
          [Symbol.for("can.new")](value) {
            return new Date(value);
          },
          [Symbol.for("can.isMember")](value) {
            return (value instanceof Date);
          }
        }
      }
    };
  }
  ```

@body

## Use

The `type` property specifies the type of the attribute.  The type can be specified
as either:

- A primitive constructor function.
- A built-in constructor function like `Date`.
- A constructor function such as another [can-observable-object ObservableObject].
- A [can-type.typeobject].

### Basic Example

The following example converts the `count` property to a number and the `items` property to an array.

```js
import { ObservableObject, type } from "can";

const ArrayType = {
  [Symbol.for("can.new")]( newValue ) {
    if ( typeof newValue === "string" ) {
      return newValue.split( "," );
    } else if ( Array.isArray( newValue ) ) {
      return newValue;
    }
  },
  [Symbol.for("can.isMember")]( value ) {
    return Array.isArray(value);
  }
};

class Map extends ObservableObject {
  static props = {
    count: {
      type: Number
    },
    items: {
      type: ArrayType
    }
  };
}

const map = new Map({ count: "4", items: "1,2,3" });

console.log(map.count, map.items); //-> 4 ["1", "2", "3"]
```
@codepen

### Shorthand

The [can-observable-object/object.types.property] docs specify shorthands for setting the type. The shorthand allows you to define the type without using a [can-observable-object/object.types.definitionObject] like so:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  age: Number
}
```

### Use with can-type

[can-type] provides convenient ways to use types with a variety of behaviors like type [can-type/check checking] and [can-type/convert converting]. You can use these with the [can-observable-object/object.types.property] shorthand like so:

```js
import { ObservableObject, type } from "can/everything";

class Person extends ObservableObject {
  age: type.convert(Number)
}
```

@property can-observable-object/define/serialize serialize
@parent can-observable-object/object.behaviors

@description serialize

Defines custom serialization behavior for a property.

@signature `serialize( currentValue, propertyName )`

  Specifies the serialized value of a property.

  ```js
  import { ObservableObject } from "can";

  class MyMap extends ObservableObject {
    static props = {
      example: {
        serialize( currentValue, propertyName ) {
          console.log( currentValue ); //-> "Value"
          console.log( propertyName ); //-> "example"
          return currentValue;
        }
      }
    };
  }

  const map = new MyMap({ example: "Value" });

  map.serialize();
  ```
  @codepen

	@param {*} currentValue The current value of the attribute.

	@param {String} propertyName The name of the property being serialized.

	@return {*|undefined} If `undefined` is returned, the value is not serialized.

@body

## Use

[can-observable-object/define/serialize] is useful for serializing an instance into
a more JSON-friendly form.  This can be used for many reasons, including saving a
[can-connect]ed instance on the server or serializing [can-route.data can-route.data]'s internal
map for display in the hash or pushstate URL.

The serialize property allows an opportunity to define how
each property will behave when the instance is serialized.  This can be useful for:

- serializing complex types like dates, arrays, or objects into string formats
- causing certain properties to be ignored when serialize is called

The following causes a locationIds property to be serialized into
the comma separated ID values of the location property on this instance:

```js
import { ObservableObject, DefineArray } from "can/everything";

class MyMap extends ObservableObject {
  static props = {
    locations: DefineArray,
    locationIds: {
      serialize() {
        return this.locations.map( ( location ) => {
          return location.id;
        } ).join( "," );
      }
    }
  };
}

const map = new MyMap({
  locations: [{id: 1}, {id: 2}, {id: 3}]
});

console.log( map.serialize().locationIds ); //-> "1,2,3"
```
@codepen

Returning `undefined` for any property means this property will not be part of the serialized
object.  For example, if the property numPages is not greater than zero, the following example
won't include it in the serialized object.

```js
import { ObservableObject } from "can/everything";

class MyBook extends ObservableObject {
  static props = {
    prop: {
      serialize( num ) {
        if ( num <= 0 ) {
            return undefined;
        }
        return num;
      }
    }
  };
}

const book = new MyBook({ prop: -5, bar: "foo" });

console.log( book.serialize() ); //-> { bar: "foo" }
```
@codepen

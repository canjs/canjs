@function can-define.types.serialize serialize
@parent can-define.behaviors

Defines custom serialization behavior for a property.

@signature `Boolean`

  Specifies if the property should be serialized.  By default, all properties except for
  ones with defined [can-define.types.get getters] are serialized. Prevent a property
  from being serialized like:

  ```js
  import {DefineMap} from "can";

  const myMap = DefineMap.extend({
    propertyName: {
      serialize: false
    },
    secondPropertyName: "string"
  });

  const map = new myMap({ propertyName: "foobar", secondPropertyName: "bar" });

  console.log( map.serialize() ); //-> {secondPropertyName: "bar"}
  ```
  @codepen

  Make a [can-define.types.get getter] property part of the serialized result like:

  ```js
  import {DefineMap} from "can";

  const myMap = DefineMap.extend({
    propertyName: {
      get() { return "test"; },
      serialize: true
    }
  });

  const map = new myMap();

  console.log( map.serialize() ); //-> { propertyName: "test" }
  ```
  @codepen

@signature `serialize( currentValue, propertyName )`

  Specifies the serialized value of a property.

  ```js
  import {DefineMap} from "can";

  const myMap = DefineMap.extend({
    example: {
      serialize( currentValue, propertyName ) {
        console.log( currentValue ); //-> "Value"
        console.log( propertyName ); //-> "example"
      }
    }
  });
  
  const map = new myMap({ example: "Value" });

  map.serialize();
  ```
  @codepen

	@param {*} currentValue The current value of the attribute.

	@param {String} propertyName The name of the property being serialized.

	@return {*|undefined} If `undefined` is returned, the value is not serialized.

@body

## Use

[can-define/map/map.prototype.serialize] is useful for serializing an instance into
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
import {DefineMap} from "can";

const myMap = DefineMap.extend({
  locations: [],
	locationIds: {
		serialize() {
			return this.locations.map( ( location ) => {
				return location.id;
			} ).join( "," );
		}
	}
});
const map = new myMap({
  locations: [{id: 1}, {id: 2}, {id: 3}]
});

console.log( map.serialize().locationIds ); //-> "1,2,3"
```
@codepen

Returning `undefined` for any property means this property will not be part of the serialized
object.  For example, if the property numPages is not greater than zero, the following example
won't include it in the serialized object.

```js
import {DefineMap} from "can";

const myBook = DefineMap.extend({
  prop: {
    serialize: function( num ) {
      if ( num <= 0 ) {
          return undefined;
      }
      return num;
    }
  },
  bar: "string"
});
const book = new myBook({ prop: -5, bar: "foo" });

console.log( book.serialize() ); //-> { bar: "foo" }
```
@codepen

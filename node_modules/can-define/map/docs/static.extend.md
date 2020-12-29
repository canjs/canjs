@function can-define/map/map.extend extend
@parent can-define/map/map.static

@description Define a custom map type.

@signature `DefineMap.extend([name,] [static,] prototype)`

  Extends DefineMap, or constructor functions derived from DefineMap,
  to create a new constructor function.

  ```js
  import {DefineMap} from "can";

  const Person = DefineMap.extend(
    // Optional debugger name
    "Person",
	// Optional static properties.
    {
      // Seal instances of this type. This is the default.
      seal: true
    },
    {
      first: "string",
      last: { type: "string" },
      fullName: {
        get: function() {
          return this.first + " " + this.last;
        }
      },
      age: { default: 0 }
    }
  );

  const me = new Person( { first: "Justin", last: "Meyer" } );
  console.log( me.fullName ); //-> "Justin Meyer"
  console.log( me.age ); //-> 0
  ```
  @codepen

  @param {String} [name] Provides an optional name for this type that will
  show up nicely in debuggers.

  @param {Object} [static] Static properties that are set directly on the
  constructor function.

  @param {can-define.types.propDefinition} prototype A definition of the properties or methods on this type. See [can-define.types.propDefinition] for all available property definitions.

@body

## Use

If the property definition is a __plain function__, it's considered a method.

```js
import {DefineMap} from "can";

const Person = DefineMap.extend( {
  sayHi: function() {
    console.log( "hi" );
  }
} );

const me = new Person();
me.sayHi(); //-> "hi"
```
@codepen

If the property definition is a __string__, it's considered a `type` setting to be looked up in [can-define.types can-define.types].

```js
import {DefineMap, DefineList} from "can";

const Person = DefineMap.extend( {
  age: "number",
  isCool: "boolean",
  hobbies: "observable"
} );

const me = new Person( { age: "33", isCool: "false", hobbies: [ "js", "bball" ] } );
console.log( me.age ); //-> 33
console.log( me.isCool ); //-> false
console.log( me.hobbies instanceof DefineList ); //-> true
```
@codepen


If the property definition is a Constructor function, it's considered a `Type` setting.

```js
import {DefineMap} from "can";

const Address = DefineMap.extend( {
  zip: "number"
} );
const Person = DefineMap.extend( {
  address: Address
} );

const me = new Person( { address: { zip: "60048" } } );
console.log( me.address.zip ); //-> 60048
```
@codepen

If the property is an __object__, it's considered to be a [can-define.types.propDefinition].

```js
import {DefineMap} from "can";

const Person = DefineMap.extend( {
  fullName: {
    get: function() {
      return this.first + " " + this.last;
    },
    set: function( newVal ) {
      const parts = newVal.split( " " );
      this.first = parts[ 0 ];
      this.last = parts[ 1 ];
    }
  },

  // slick way of creating an 'inline' type.
  address: {
    Type: {
      zip: "number"
    }
  }
} );

const me = new Person( { fullName: "Rami Myer", address: { zip: "60048" } } );
console.log( me.first ); //-> "Rami"
console.log( me.address.zip ); //-> 60048
```
@codepen

@return {can-define/map/map} A DefineMap constructor function.

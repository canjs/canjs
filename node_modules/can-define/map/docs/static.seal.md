@property {Boolean} can-define/map/map.seal seal

@parent can-define/map/map.static

@description Defines if instances of the map should be [sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) in development.

@option {Boolean} If `true`, in development, instances of this object will be [sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal).  In  [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) errors will be thrown when undefined properties are set.  This is the default behavior of [can-define/map/map.extend extended DefineMaps]:

  ```js
  "use strict"
  import {DefineMap} from "can";

  const Person = DefineMap.extend( {} );
  const me = new Person();

  try {
    me.age = 33;
  } catch(error) {
    console.error( error.name + ": " + error.message ); //-> "TypeError: Cannot add property age, object is not extensible"
  }
  ```
  @codepen

  If `false`, the object will not be sealed.  This is the default behavior of
  unextended [can-define/map/map DefineMaps].  Use [can-define/map/map.prototype.get] and [can-define/map/map.prototype.set] to get and set values:

  ```js
  import {DefineMap} from "can";

  const person = new DefineMap();
  person.set( "first", "Justin" );
  person.set( "last", "Meyer" );

  console.log( person.get( "first" ) ); //-> "Justin"
  console.log( person.get( "last" ) ); //-> "Meyer"
  ```
  @codepen

  It is also possible to extend a sealed object and unseal it:

  ```js
  "use strict"
  import {DefineMap} from "can";

  const Person = DefineMap.extend( {} );
  const Programmer = Person.extend( { seal: false }, {} );
  const me = new Programmer();

  try {
    me.age = 33; // no error thrown
  } catch(error) {
    console.error( error.name + ": " + error.message );
  }
  ```
  @codepen

  Set `seal` to `false` on objects that have an indeterminate number of properties:

  ```js
  import {DefineMap} from "can";

  import "//unpkg.com/underscore@1/underscore-min.js";

  const Style = DefineMap.extend( {
    seal: false
  }, {
    cssText: {
      get: function() {
        return _.map( this.get(), ( val, prop ) => {
          return prop + ": " + val + ";";
        } ).join( " " );
      }
    }
  } );

  const style = new Style();
  style.set( "color", "green" );
  style.set( "font", "awesome" );

  console.log( style.cssText ); //-> "color:green; font: awesome;"
  ```
  @codepen

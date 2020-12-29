@property {Boolean} can-observable-object/object.static.seal seal
@parent can-observable-object/object.static

@description Defines if instances of the map should be [sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) in development.

@option {Boolean} If `true`, in development, instances of this object will be [sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal). In  [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) errors will be thrown when undefined properties are set. By default ObservableObjects are not sealed.

  ```js
  import { ObservableObject } from "can/everything";

  class Person extends ObservableObject {
    static seal = true;
  }

  const me = new Person();

  try {
    me.age = 33;
  } catch(error) {
    console.error( error.name + ": " + error.message ); //-> "TypeError: Cannot add property age, object is not extensible"
  }
  ```
  @codepen

  If `false`, the object will not be sealed. This is the default behavior of ObservableObjects.

  ```js
  import { ObservableObject } from "can/everything";

  const person = new ObservableObject();
  person.first = "Ada";
  person.last = "Lovelace";

  console.log( person.first ); //-> "Ada"
  console.log( person.last ); //-> "Lovelace"
  ```
  @codepen
  

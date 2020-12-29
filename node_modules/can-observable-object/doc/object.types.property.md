@typedef {PrimitiveValue|PrimitiveConstructor|Constructor|TypeObject|Function|DefinitionObject} can-observable-object/object.types.property Property
@parent can-observable-object/object.types

@type {PrimitiveValue} Specify a property with a default primitive value. Using this signature will result in strict type checking being applied to this property.

  ```js
  import { ObservableObject } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      age: 72
    };
  }

  const me = new Person();
  me.age; // -> 72

  me.age = "45"; // throws
  ```
  @codepen

@type {PrimitiveConstructor} Specify a property by defining its type as a primitive constructor. This can be `String`, `Number`, or `Boolean`. Using this signature results in strict type checking for this property.

  ```js
  import { ObservableObject } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      age: Number
    };
  }

  const me = new Person();

  me.age = 75;
  me.age; //-> 75

  me.age = "45"; // throws
  ```
  @codepen

@type {Constructor} Specify a property by defining its type as a constructor. This can be any constructor function, such as another [can-observable-object ObservableObject], builtins like `Date`, or plain JavaScript constructor functions.

  Specify a constructor function as a property's value will result in strict type checking for this property.

  ```js
  import { ObservableObject } from "can/everything";

  class Occupation extends ObservableObject {}

  class Person extends ObservableObject {
    static props = {
      occupation: Occupation,
      birthday: Date
    };
  }

  const me = new Person({
    birthday: new Date(1970, 2, 4),
    occupation: new Occupation()
  });

  me.birthday = "1970/3/19"; // throws
  ```
  @codepen

@type {TypeObject} Specify a property as a special TypeObject. Most of the time you'll use this in conjunction with [can-type] to specify a type.

  ```js
  import { ObservableObject, type } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      first: type.check(String),
      last: type.check(String),
      middle: type.maybe(String)
    };
  }

  const me = new Person({
    first: "Michael",
    last: "Jordan"
  });

  console.log(me);
  ```
  @codepen

  In the above example `first` and `last` use [can-type.check] which does strict type checking. `middle` uses [can-type.maybe] which accepts a String, null, or undefined.

  These methods on [can-type] produce a `TypeObject` which looks like below:

  ```js
  const dateType = {
    [Symbol.for("can.new")](value) {
      return new Date(value);
    },
    [Symbol.for("can.isMember")](value) {
      return value instanceof Date;
    }
  };
  ```

@type {Function} Specify a property as a function sets the property to `type: Function` and uses the provided function as the default value. A use-case for this signature is to have a [can-stache] renderer as a default template while allowing consumers of your component to provide an alternative renderer.

  ```js
  import { ObservableObject, stache } from "can/everything";

  // This is a function
  const headerView = stache(`
    <header>
      <h1>{{title}} page</h1>
    </header>
  `);

  class ViewModel extends ObservableObject {
    static props = {
      header: headerView
    };
  }
  ```

@type {DefinitionObject} Define a property through a [can-observable-object/object.types.definitionObject]. This allows you define several different behaviors (as shown in the sidebar).

  ```js
  import { ObservableObject, type } from "can/everything";

  class Person extends ObservableObject {
    static props = {
      age: {
        type: type.convert(Number),
        default: 1
      },
      birthday: {
        type: type.check(Date),
        set( newVal, current ) {
          if(newVal > new Date()) {
            console.warn('Birthday cannot be greater than today');
            return current;
          }
          return newVal;
        }
      }
    };
  }

  const me = new Person({
    age: 6
  });

  console.log(me);
  ```
  @codepen

@module {Object} can-type
@parent can-data-validation
@collection can-core
@group can-type/methods 0 methods
@group can-type/types 1 types
@package ../package.json
@outline 2

@description Define types that can verify values are of the correct type, or convert values to the correct type.

@type {Object}

  Exports an object with methods related to type operations like checking and conversion. The following describes the properties and methods on the export.

  ```js
  {
    // Create a type that throws if a value of another type
    // is passed.
    check( Type ),

    // Create a type that will convert a value to that type.
    convert( Type ),

    // Create a type that accepts the type, null, or undefined.
    maybe( Type ),

    // Create a type that will convert a value,
    // unless null or undefined.
    maybeConvert( Type ),

    // A type that represents any type.
    Any,

    // Define a function that will return a type later.
    late( fn ),

    // Create type where all properties are converted
    // to their given type.
    convertAll( Type ),

    // Test if an object is a typeObject known to can-type's
    // type system.
    isTypeObject( Type )
  }
  ```

@body

## Use Cases

Use can-type to define rules around types to handle type checking and type conversion. Works well with [can-observable-object], and [can-stache-element], [can-define].

can-type works well for the following scenarios:

### Prevent incorrect types from being passed

Using [can-type/check] you can ensure that properties of the wrong type are not passed to your components. If a value of any other type is passed it will throw (in development mode) and let the developer know the mistake they made.

```js
import { ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
    name: type.check(String)
  };
}

let person = new Person();

person.name = "Thomas";
console.log(person.name); // -> "Thomas"

person.name = null; // throws!
```
@codepen

> Note: Instead of using `name: type.check(String)` above, `name: String` could be used. If a type is provided (example: `type: Date`), `type.check()` is performed by default (example: `type: type.check(Date)`).  

### Convert a value to a type

Using [can-type/convert] you can define a property that will *convert* any value to that type.

In the following example we have a text input, which will always have a string value, bound to a property of type `type.convert(Number)`. This converts that value to a [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number):

```js
import { StacheElement, type } from "can";

class PersonForm extends StacheElement {
  static view = `
    <input type="text" value:to="this.age">
  `;

  static props = {
    age: type.convert(Number)
  };
}

customElements.define("person-form", PersonForm);
let el = new PersonForm();
document.body.append(el);

el.listenTo("age", () => {
  console.log("Age is now", el.age);
});
```
@codepen


### Allowing null/undefined as values

Using [can-type/maybe] you can define types that also allow null/undefined. This is useful when dealing with data sources, such as APIs, where a value might be optional.

This type is *strict* in that any value with a type other than the provided type, `null`, or `undefined` will result in it throwing.

```js
import { ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
    first: type.check(String),
    last: type.maybe(String)
  };
}

let person = new Person({
  first: "Ted",
  last: null
});

console.log(person.first, person.last); // -> "Ted" null
```
@codepen

### Converting a value to a type if not null/undefined

[can-type/maybeConvert] is a combination of [can-type/maybe] and [can-type/convert]. It will allow `null` or `undefined` as values, but otherwise will try to *convert* the value to the correct type.

```js
import { ObservableObject, type } from "can";

class ContactInfo extends ObservableObject {
  static props = {
    phoneNumber: type.maybeConvert(String)
  };
}

let info = new ContactInfo({
  phoneNumber: undefined
});

console.log(info.phoneNumber); // -> undefined

info.phoneNumber = 5553335555;
console.log(info.phoneNumber); // -> "5553335555"
```
@codepen

### Creating Models and Components

can-type is useful for creating typed properties in [can-observable-object] and [can-stache-element].

You might want to use stricter type checking for some properties or classes and looser type checking for others. The following creates properties with various properties and type methods:

```js
import { ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
    first: type.check(String), // type checking is the default behavior
    last: type.maybe(String),

    age: type.convert(Number),
    birthday: type.maybeConvert(Date)
  };
}

let fib = new Person({
  first: "Fibonacci",
  last: null,
  age: "80",
  birthday: undefined
});

console.log(fib); // ->Person{ ... }
```
@codepen

> Note: as mentioned in the comment above, type checking is the default behavior of [can-observable-object], so `first: type.check(String)` could be written as `first: String`.

When creating models with [can-rest-model] you might want to be loose in the typing of properties, especially when working with external services you do not have control over.

On the other hand, when creating ViewModels for components, such as with [can-stache-element] you might want to be stricter about how properties are passed, to prevent mistakes.

```js
import { StacheElement, type } from "can";

class Progress extends StacheElement {
  static props = {
    value: {
      type: type.check(Number),
      default: 0
    },
    max: {
      type: type.check(Number),
      default: 100
    },
    get width() {
      let w = (this.value / this.max) * 100;
      return w + '%';
    }
  };

  static view = `
    <div style="background: black;">
      <span style="background: salmon; display: inline-block; width: {{width}}">&nbsp;</span>
    </div>
  `;
}

customElements.define("custom-progress-bar", Progress);

let progress = new Progress();
progress.value = 34;

document.body.append(progress);

function increment() {
  setTimeout(() => {
    if(progress.value < 100) {
      progress.value++;
      increment();
    }
  }, 500);
}

increment();
```
@codepen

> Note: Having both `type: type.check(Number)` and `default: 0` in the same definition is redundant. Using `default: 0` will automatically set up type checking. It is shown above for clarity.

See [can-stache-element] and [can-observable-object] for more on these APIs.

## How it works

The `can-type` methods work by creating functions that are compatible with [can-reflect.convert canReflect.convert].

These functions have a [can-symbol/symbols/new] Symbol that points to a function that is responsible for creating an instance of the type. The following is an overview of how this function works:

__1. Determine if value is already the correct type__

- Maybe types (`type.maybe`, `type.maybeConvert`) will return `true` if the value is `null` or `undefined`.
- Common primitive types (`Number`, `String`, `Boolean`) will return `true` if [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) returns the correct result.
- Other types will return `true` if the value is an [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) the type.
- [can-type.typeobject TypeObjects] (or anything with a `can.isMember` Symbol) will return `true` if the `can.isMember` function returns `true`.
- Otherwise, the value is not the correct type.

__2. Handle values of another type__

If the value is not the correct type:

- `type.maybe` and `type.check` will throw an error.
- `type.convert` and `type.maybeConvert` will convert the value using [can-reflect.convert].

## Applying multiple type functions

The type functions [can-type/check], [can-type/convert], [can-type/maybe], and [can-type/maybeConvert] all return a [can-type.typeobject]. Since they also can take a TypeObject as an argument, this means you can apply multiple type functions.

For example, using [can-type/convert] and [can-type/maybe] is equivalent to using [can-type/maybeConvert]:

```js
import { Reflect, type } from "can";

const MaybeConvertString = type.convert(type.maybe(String));

console.log(2, Reflect.convert(2, MaybeConvertString)); // "2"
console.log(null, Reflect.convert(2, MaybeConvertString)); // null
```
@codepen

Another example is taking a strict type and making it a converter type by wrapping with [can-type/convert]:

```js
import { Reflect, can } from "can";

const StrictString = type.check(String);
const NonStrictString = type.convert(StrictString);

console.log("Converting: ", Reflect.convert(5, NonStrictString)); // "5"
```
@codepen

This works because the type functions all keep a reference to the underlying type and simply toggle the *strictness* of the newly created TypeObject. When [can-symbol/symbols/new] is called the strictness is checked.

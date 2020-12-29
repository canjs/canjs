@module {function} can-observable-object
@parent can-observables
@collection can-core
@group can-observable-object/object.behaviors 0 behaviors
@group can-observable-object/object.static 1 static
@group can-observable-object/object.prototype 2 prototype
@group can-observable-object/object.types 3 types
@alias can.ObservableObject
@package ../package.json
@outline 2
@templateRender true

@description Create observable objects used to manage state in explicitly defined ways.

@signature `class extends ObservableObject`

  Extending `ObservableObject` creates a new class using the class body to configure [can-observable-object/object.static.props props], methods, getters, and setters.

  ```js
  import { ObservableObject } from "can/everything";

  class Scientist extends ObservableObject {
    static props = {
      name: String,
      occupation: String
    };

    get title() {
      return `${this.name}: ${this.occupation}`;
    }
  }

  let ada = new Scientist({
    name: "Ada Lovelace",
    occupation: "Mathematician"
  });

  console.log( ada.title ); // -> "Ada Lovelace: Mathematician"
  ```
  @codepen

  Use extends to create classes for models, ViewModels, and [can-stache-element custom elements].

  @return {Constructor} An extended class that can be instantiated using `new`.

@signature `new ObservableObject([props])`

  Calling `new ObservableObject(props)` creates a new instance of ObservableObject or an extended ObservableObject. Then, `new ObservableObject(props)` assigns every property on `props` to the new instance.  If props are passed that are not defined already, those properties are set on the instance.  If the instance should be [can-observable-object/object.static.seal sealed], it is sealed.

  ```js
  import { ObservableObject } from "can/everything";

  const person = new ObservableObject( {
		first: "Justin",
		last: "Meyer"
  } );

  console.log( person ); //-> {first: "Justin", last: "Meyer"}
  ```
  @codepen

  Custom `ObservableObject` types, with special properties and behaviors, can be defined with the [extends signature](#classextendsObservableObject).

  @param {Object} [props] Properties and values to seed the map with.
  @return {can-observable-object} An instance of `ObservableObject` with the properties from _props_.

@body

## Mixed-in instance methods and properties

Instances of `ObservableObject` have all methods and properties from
[can-event-queue/map/map]:

{{#each (getChildren [can-event-queue/map/map])}}
- [{{name}}] - {{description}}{{/each}}

Example:

```js
import { ObservableObject } from "can/everything";

class MyType extends ObservableObject {
  static props = {
    prop: String
  };
}

const myInstance = new MyType( {prop: "VALUE"} );

myInstance.on( "prop", ( event, newVal, oldVal ) => {
	console.log( newVal ); //-> "VALUE"
	console.log( oldVal ); //-> "NEW VALUE"
} );

myInstance.prop = "NEW VALUE";
```
@codepen

#### Observable class fields

`ObservableObject` [class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Class_fields) are also observable:


 ```js
import { ObservableObject } from "can/everything";

class MyType extends ObservableObject {
  prop = "VALUE";
}

const myInstance = new MyType();

myInstance.on( "prop", ( event, newVal, oldVal ) => {
	console.log( newVal ); //-> "VALUE"
	console.log( oldVal ); //-> "NEW VALUE"
});

myInstance.prop = "NEW VALUE";
```

## Mixed-in type methods and properties

Extended `ObservableObject` classes have all methods and properties from
[can-event-queue/type/type]:

{{#each (getChildren [can-event-queue/type/type])}}
- [{{name}}] - {{description}}{{/each}}

Example:

```js
import { ObservableObject, Reflect as canReflect } from "can/everything";

class MyType extends ObservableObject {
  static props = {
    prop: String
  };
}

canReflect.onInstancePatches( MyType, ( instance, patches ) => {
  console.log(patches) //-> {key:"prop", type:"set", value:"VALUE"}
} );

let instance = new MyType({prop: "value"});
instance.prop = "VALUE";
```
@codepen

## Overview

`can-observable-object` is used to create easily extensible observable types with well defined behavior.

For example, a `Todo` type, with a `name` property, `completed` property, and a `toggle` method, might be defined like:

```js
import { ObservableObject } from "can/everything";

class Todo extends ObservableObject {
  static props = {
    name: String,
    completed: false // default value
  };

  toggle() {
    this.completed = !this.completed;
  }
}

const myTodo = new Todo({ name: "my first todo!" });
myTodo.toggle();
console.log( myTodo ); //-> {name: "my first todo!", completed: true}
```
@codepen

The _Object_ set on `static define` defines the properties that will be
on _instances_ of a `Todo`.  There are a lot of ways to define properties.  The
[can-observable-object/object.types.definitionObject] type lists them all.  Here, we define:

 - `name` as a property that will be type checked as a `String`.
 - `completed` as a property that will be type check as a `Boolean`
   with an initial value of `false`.

This also defines a `toggle` method that will be available on _instances_ of `Todo`.

`Todo` is a constructor function.  This means _instances_ of `Todo` can be be created by
calling `new Todo()` as follows:

```js
import { ObservableObject } from "can/everything";

class Todo extends ObservableObject {
  static props = {
    name: String,
    completed: false
  };

  toggle() {
    this.completed = !this.completed;
  }
}

const myTodo = new Todo();
myTodo.name = "Do the dishes";
console.log( myTodo.completed ); //-> false

myTodo.toggle();
console.log( myTodo.completed ); //-> true
```
@codepen
@highlight 14

## Typed properties

ObservableObject uses [can-type] to define typing rules for properties. It supports both strict typing (type checking) and loose typing (type conversion).

If a property is specified as a specific type, ObservableObject will perform type checking. This means that if the `first` property in the example below is set to any value that is not a string, an error will be thrown:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    first: String
  };
}

const person = new Person();
person.first = "Justin"; // -> 👌

person.first = false; // -> Uncaught Error: Type value 'false' is not of type String.
```
@codepen

[can-type] also supports functions like [can-type/maybe type.maybe] and [can-type/convert type.convert] for handling other typing options. In the example below, `maybeNumber` can be a number or `null` or `undefined` and `alwaysString` will be converted to a string no matter what value is passed.

```js
import { ObservableObject, type } from "can/everything";

class Obj extends ObservableObject {
  static props = {
    maybeNumber: type.maybe(Number),
    alwaysString: type.convert(String)
  };
}

const obj = new Obj();

obj.maybeNumber = 9;  // -> 👌
obj.maybeNumber = null;  // -> 👌
obj.maybeNumber = undefined;  // -> 👌
obj.maybeNumber = "not a number";  // -> Uncaught Error: Type value 'not a number' is not of type Number.

obj.alwaysString = "Hello";  // -> 👌
obj.alwaysString = 9;  // -> 👌, converted to "9"
obj.alwaysString = null;  // -> 👌, converted to "null"
obj.alwaysString = undefined;  // -> 👌, converted to "undefined"
```
@codepen

To see all the ways types can be defined, check out the [can-type can-type docs].

## Declarative properties

Arguably `can-observable-object`'s most important ability is its support of declarative properties
that functionally derive their value from other property values.  This is done by
defining [can-observable-object/define/get getter] properties like `fullName` as follows:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    first: String,
    last: String
  };

  get fullName() {
    return this.first + " " + this.last;
  }
}

const person = new Person({
	first: "Justin",
	last: "Meyer"
});

console.log(person.fullName); //-> "Justin Meyer"
```
@codepen
@highlight 9-11

This property can be bound to like any other property:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    first: String,
    last: String
  };

  get fullName() {
    return this.first + " " + this.last;
  }
}

const me = new Person({
	first: "Harry",
	last: "Potter"
});

me.on( "fullName", ( ev, newValue, oldValue ) => {
	console.log( newValue ); //-> Harry Henderson
	console.log( oldValue ); //-> Harry Potter
} );

me.last = "Henderson";
```
@codepen
@highlight 19-22

`getter` properties use [can-observation] internally.  This means that when bound,
the value of the `getter` is cached and only updates when one of its source
observables change.  For example:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    first: String,
    last: String,
  };

  get fullName() {
    console.log( "calculating fullName" );
    return this.first + " " + this.last;
  }
}

const hero = new Person( { first: "Wonder", last: "Woman" } );

hero.on( "fullName", () => {} );

console.log( hero.fullName ); // logs "calculating fullName", "Wonder Woman"

console.log( hero.fullName ); // "Wonder Woman"

hero.first = "Bionic";        // logs "calculating fullName"

hero.last = "Man";            // logs "calculating fullName"

console.log( hero.fullName ); // logs "Bionic Man"
```
@codepen

### Asynchronous properties

Properties can also be asynchronous using `async(resolve)`.  These are very useful when you have a type
that requires data from the server. For example, a ObservableObject might take a `todoId` value, and want to make a `todo` property available:

```js
import { ObservableObject, ajax } from "can/everything";

class Todo extends ObservableObject {
  static props = {
    todoId: Number,

    todo: {
      async(resolve, lastSetValue) {
        ajax( { url: "/todos/" + this.todoId } ).then( resolve );
      }
    }
  };
}
```
<!-- @codepen -->

Async props are passed a `resolve` argument when bound.  Typically in an application,
your template will automatically bind on the `todo` property.  But to use it in a test might
look like:

```js
import { ObservableObject, ajax, fixture } from "can/everything";

class TodoViewModel extends ObservableObject {
  static props = {
    todoId: Number,

    todo: {
      async(resolve, lastSetValue) {
        ajax( { url: "/todos/" + this.todoId } ).then( resolve );
      }
    }
  };
}

fixture( "GET /todos/5", () => {
  return { id: 5, name: "take out trash" };
} );

const todoVM = new TodoViewModel( { todoId: 5 } );

todoVM.on( "todo", function( ev, newVal ) {
  console.log( newVal.name ) //-> "take out trash"
} );

console.log(todoVM.todo) //-> undefined
```
@codepen

### Getter limitations

There's some functionality that a getter or an asynchronous property can not describe
declaratively.  For these situations, you can use [can-observable-object/define/set] or
even better, use [can-observable-object/define/value].

For example, consider a __state__ and __city__ locator where you pick a United States
__state__ like _Illinois_ and then a __city__ like _Chicago_.  In this example,
we want to clear the choice of __city__ whenever the __state__ changes.

This can be implemented with [can-observable-object/define/set] like:

```js
import { ObservableObject, type } from "can/everything";

class Locator extends ObservableObject {
  static props = {
    state: {
      type: String,
      set() {
        this.city = null;
      }
    },
    city: type.maybe(String)
  };
}

const locator = new Locator( {
	state: "IL",
	city: "Chicago"
} );

locator.state = "CA";
console.log( locator.city ); //-> null;
```
@codepen

The problem with this code is that it relies on side effects to manage the behavior of
`city`.  If someone wants to understand how `city` behaves, they might have to search all of the code for the Locator class.

The [can-observable-object/define/value] behavior allows you to consolidate the
behavior of a property to a single place.  For example, the following implements `Locator` with [can-observable-object/define/value]:

```js
import { ObservableObject } from "can/everything";

class Locator extends ObservableObject {
  static props = {
    state: String,

    city: {
      value({ lastSet, listenTo, resolve }) {        
        // When city is set, update `city` with the set value.
        listenTo( lastSet, resolve );

        // When state is set, set `city` to null.
        listenTo( "state", () => {
          resolve( null );
        } );

        // Initialize the value to the `set` value.
        resolve( lastSet.get() );
      }
    }
  };
}

const locator = new Locator( {
	state: "IL",
	city: "Chicago",
} );

locator.state = "CA";
console.log( locator.city ); //-> null
```
@codepen

While [functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming) (FRP) can take time to master at first, once you do, your code will be much easier to understand and
debug. The [can-observable-object/define/value] behavior supports the basics of FRP programming - the ability to listen events and changes in other properties and `resolve` the property to a new value.

## Sealed instances and strict mode

By default, `ObservableObject` instances are __not__ [can-observable-object/object.static.seal sealed].  This
means that setting properties that are not defined when the constructor is defined will be set on those instances anyway.

```js
import { ObservableObject } from "can/everything";

class MyType extends ObservableObject {
  static props = {
    myProp: String
  };
}

const myType = new MyType();

myType.otherProp = "value"; // no error thrown
```
@codepen

Setting the extended ObservableObject to be sealed will instead result in throwing an error in files that are in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode). For example:

```js
import { ObservableObject } from "can/everything";

class MyType extends ObservableObject {
  static props = {
    myProp: String
  };

  static seal = true;
}

const myType = new MyType();

try {
  myType.otherProp = "value"; // error!
} catch(err) {
  console.log(err.message);
}
```
@highlight 8
@codepen

Read the [can-define/map/map.seal] documentation for more information on this behavior.

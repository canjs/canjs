@module {function} can-define
@parent can-observables
@collection can-legacy
@description Defines observable properties and their behavior on a prototype object. This
function is not commonly used directly. [can-define/map/map]
and [can-define/list/list] are more commonly used. Types and
behaviors shared by both [can-define/map/map]
and [can-define/list/list] are documented here.
@group can-define.static 0 static
@group can-define.typedefs 1 types
@group can-define.behaviors 2 behaviors
@package ../package.json
@templateRender true

@signature `define(prototype, propDefinitions)`

  The `define` function can be used to define observable properties, type conversion, and getter/setter logic on [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain prototype objects]. The `define` function is used by [can-define/map/map] and [can-define/list/list] to
  create observables. However, `define` can be used to create observables from types that
  do not inherit from [can-define/map/map] and [can-define/list/list].  

  For more information on observables and how they are used in CanJS, please read
  the [guides/technology-overview].

  The following creates a `Greeting` type which will have observable `message`
  properties:

  ```js
  import {define, Reflect as canReflect} from "can";

  const Greeting = function( message ) {
  	this.message = message;
  };

  define( Greeting.prototype, {
  	message: { type: "string" }
  } );

  const greeting = new Greeting("Hello");

  canReflect.onKeyValue(greeting, "message", (newValue) => {
  	console.log( newValue ); //-> logs "goodbye"
  });

  greeting.message = "goodbye";
  ```
  @codepen

  @param {Object} prototype The prototype object of a constructor function or [class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class). The prototype object will have getter/setters defined on it that carry out the defined behavior.  The prototype will also contain all of [can-event-queue/map/map]'s methods.

  @param {Object<String,can-define.types.propDefinition>} propDefinitions An object of properties and their definitions. For example, a property (`propertyName`) has a [can-define.types.propDefinition] object with zero or more of the following behaviors:

  ```js
  define(Type.prototype, {
    propertyName: {
      default: function() { /* ... */ },
      Default: Constructor,
      type: function() { /* ... */ },
      Type: Constructor,
      get: function() { /* ... */ },
      value: function() { /* ... */ },
      set: function() { /* ... */ },
      serialize: function() { /* ... */ },
      identity: Boolean
    }
  })
  ```

@body


## Use

`can-define` provides a way to create custom types with observable properties.
Where [can-define/map/map] and [can-define/list/list] provide more functionality, they also make
more assumptions on the type constructor.  `can-define` can be used
to create completely customized types.


The following creates a `Person` constructor function that
will be used to create `Person` instances with observable properties:

```js
import {define} from "can";

// Define the type
const Person = function( first, last ) {
	this.first = first;
	this.last = last;
};
define( Person.prototype, {
	first: { type: "string" },
	last: { type: "string" },
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
} );

// Create an instance
const person = new Person( "Justin", "Meyer" );

console.log( person.first ); //-> "Justin"
console.log( person.last ); //-> "Meyer"
console.log( person.fullName ); //-> "Justin Meyer"

person.on( "fullName", function( ev, newVal, oldVal ) {
	console.log( newVal ); //-> "Ramiya Meyer"
	console.log( oldVal ); //-> "Justin Meyer"
} );

person.first = "Ramiya";
```
@codepen

The observable properties call [can-observation-recorder.add ObservationRecorder.add] so they can be automatically by
[can-observation] (and therefore [can-stache]).


## Mixed-in instance methods and properties

`define` adds the following methods from
[can-event-queue/map/map]:

{{#each (getChildren [can-event-queue/map/map])}}
- [{{name}}] - {{description}}{{/each}}

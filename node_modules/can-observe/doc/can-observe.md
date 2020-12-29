@module {function} can-observe
@parent can-observables
@collection can-ecosystem
@group can-observe/properties 0 Properties
@group can-observe/decorators 1 Decorators
@group can-observe/object 2 Object Behaviors
@group can-observe/array 3 Array Behaviors
@group can-observe/function 4 Function Behaviors

@description Create observable objects, arrays, and functions that work like plain
JavaScript objects, arrays, and functions.

@package ../package.json

@signature `observe(target)`

Create an observable object that acts as a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for a target object.

```js
import observe from "can-observe";
import canReflect from "can-refect";

const dog = observe( {} );

// non-plain JS object behavior exposed through
// symbols used by can-reflect
canReflect.onKeyValue( dog, "name", function( newVal ) {
	newVal; //-> 'Wilbur'
} );

dog.name = "Wilbur";
```

@param {Object|Array|Function} target The object from which an observable
instance is created. Depending on what type is passed, the proxy will behave slightly differently:

- __Object__ - An observable proxy to the `target` will be returned. All properties
  _not_ on the prototype will be observable. Any non-primitive and non-built-in property value will be converted to an observable. The __Object Behaviors__ listed in the sidebar
  are available to [can-reflect].

- __Array__ - Behaves like __Object__, but supports providing list-like
  [can-symbol/types/Patch]es to [can-symbol/symbols/onPatches].  The __Array Behaviors__
  listed in the sidebar are overwritten to generate [can-observe/can.onPatches]
  events. The __Object Behaviors__ listed in the sidebar
  are available to [can-reflect].
- __Function__ - Behaves like __Object__, but when called with `new`, makes the
  instance observable. Also, makes the return value observable if
  it is already not observable. The __Object Behaviors__ and __Function Behaviors__
  listed in the sidebar are available to [can-reflect].

@return {Proxy} A proxy for the target object.

@body

### Use Cases

`can-observe` can be used to make data observable for use with CanJS. CanJS uses observables to communicate state changes in the application. The following
creates a `dog` observable object and uses it to render a [can-stache]
template.  When `dog`'s `name` is set, the page will be updated.


```js
import observe from "can-observe";
import stache from "can-stache";

const dog = observe( {} );

const frag = stache( "<p>dog's name is {{name}}</p>" )( dog );
document.body.appendChild( frag );

dog.name = "Wilbur";

document.body; //-> <p>dog's name is Wilbur</p>
```

`can-observe`'s exported `observe` function can also be used to make observable types useful as __Models__ and __ViewModels__. However, its [can-observe.Object observe.Object] and [can-observe.Array observe.Array] properties are designed specifically for this
purpose.  [can-observe.Object observe.Object] and [can-observe.Array observe.Array] support "computed" getters. For example, once the following `fullName` property is bound, it only updates itself when one of its computed dependencies change:

```js
import observe from "can-observe";
class Person extends observe.Object {
	fullName() {
		return this.first + " " + this.last;
	}
}
```

`can-observe` allows you to create observable objects where any property added is immediately observable, including nested objects. This makes `can-observe` ideal for use-cases where the data may be dynamic, or where the more rigid approach of [can-define] is not needed.

## Make data observable

`can-observe` exports a function that takes an object, array or function, and returns an observable [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to that
object, array or function.

The following example uses `can-observe` to create an observable `superWoman`:

```js
import observe from "can-observe";

const superWoman = observe( {
	name: {
		first: "Luma",
		last: "Lynai"
	},
	hobbies: [ "justice", "soaking up rays (orange sun-only)" ],
	age: 33
} );
```

You can now add, delete, and set `superWoman`'s properties like you would a normal JavaScript object:

```js
superWoman.name.last = "Lang";
superWoman.power = "overpowered";
delete superWoman.age;
```

And you can mutate arrays and call all of their methods available to the browser:

```js
superWoman.hobbies.push( "Protecting Staryl" );
superWoman.hobbies.includes( "Justice" ); //-> true
```

All of these changes publish events observable by the rest of CanJS. For example, [can-observation]
is able create a computed value for superWoman's `fullName` like:

```js
import Observation from "can-observation";

const fullName = new Observation( function() {
	return superWoman.name.first + " " + superWoman.name.last;
} );

fullName.on( function( newVal ) {
	console.log( newVal ); // -> "Lana Lang"
} );

superWoman.name.first = "Lana";
```

If you wish to observe changes in an observable made with `observe` for yourself, either:

- Use [can-reflect]:
```js
import canReflect from "can-reflect";

canReflect.onKeyValue( superWoman, "age", function( newVal ) {
	console.log( newVal ); //-> 34
} );

superWoman.age = 34;
```
- Use [can-observe.Object] or [can-observe.Array] that include methods for binding directly on the object:
```js
const superWoman = new observe.Object( {
	name: { first: "Luma", last: "Lynai" },
	age: 33
} );
superWoman.on( "age", function( newVal ) {
	console.log( newVal ); //-> 34
} );

superWoman.age = 34;
```

Using `observe` directly isn't extremely common in larger CanJS apps that use [can-observe.Object] or [can-observe.Array] to create special types. However, it can be useful for simple apps, where a well-defined type is not needed.

For example, the following creates a simple counter application:

```js
import stache from "can-stache";
import observe from "can-observe";

const counter = observe( {
	count: 0,
	add: function() {
		this.count++;
	}
} );

const view = stache( "<button on:click='add()'>+1</button>  Count: {{count}}" );

document.body.appendChild( view( counter ) );
```

## Nested Objects

Any Object property in a `can-observe` will be replaced with a `can-observe` observed Proxy on read or write.  This allows deep path traversal in objects, with observable changes all along the way.

```js
import observe from "can-observe";

const name = { first: "Justin", last: "Meyer" };
const person = {
	name: name
};

const observed = observe( person );
observed;       // -> observed is a Proxy;
observed.name;  // -> also a Proxy
person.name;    // -> this is a plain object instead

observed.address = { city: "Chicago" };  // this gets proxified on set, so...
person.address; // -> this is a Proxy
```

## Defining Observable Types

There are several ways to use `observe` to define observable types.  If you wish to
have observable methods like `.on` and `.off` on your types, use
[can-observe.Object observe.Object] or [can-observe.Array observe.Array] to create special types.

However, `can-observe` can be used directly to create constructor functions that produce
observables in two ways:

- Calling `observe(Type)` on the constructor function or class.
- Having the constructor function or class return an `observe(instance)` wrapped instance.

### Using `observe` on constructor functions and classes.

If `observe` is called with a constructor function as follows:

```js
const Animal = observe( function Animal( name ) {
	this.name = name;
	this.calories = 100;
} );
Animal.prototype.eat = function() {
	this.calories++;
};
```

All instances of `Animal` will be observable:

```js
const sponge = new Animal( "Bob" );
canReflect.onKeyValue( sponge, "calories", function( newVal ) {
	console.log( newVal ); //-> 101
} );
sponge.eat();
```

Similarly, if `observe` is called on a `Class` function as follows:

```js
Animal = observe( class Animal {
	constructor( name ) {
		this.name = name;
		this.calories = 100;
	}
	eat() {
		this.calories++;
	}
} );
```

All instances of `Animal` will be observable:

```js
const sponge = new Animal( "Bob" );
canReflect.onKeyValue( sponge, "calories", function( newVal ) {
	console.log( newVal ); //-> 101
} );
sponge.eat();
```

> NOTE: `observe` does not change the function passed into it.  If instances of the function passed to `observe` are created, they will not be observable.

```js
class Animal {
	constructor( name ) {
		this.name = name;
		this.calories = 100;
	}
	eat() {
		this.calories++;
	}
}
const ObservableAnimal = observe( Animal );

const sponge1 = new Animal( "Bob" );           // NOT OBSERVABLE
const sponge2 = new ObservableAnimal( "Bob" ); // OBSERVABLE
```


### Returning an `observe(instance)` wrapped instance.

To make instances of an existing type observable, you can
return the `observe`-wrapped proxy from the `constructor()` function
as follows:

```js
import observe from "can-observe";

class WidgetViewModel {
	constructor( obj ) {

		// view model instances receive properties as an object on instantiation
		Object.assign( this, obj );
		return observe( this );
	}
	fixedMessage() {
		return "Hello";
	}

	// ...more static and prototype functions.
}
```

## Extending can-observe with rich property behaviors

Like [can-define.types.get#get_lastSetValue_resolve_value__ async getters], [can-define.types type coercion], [can-define-stream streams], etc from [can-define], can-observe supports a number of rich behaviors. However, rather than baking these behaviors into the library directly, can-observe provides mechanism to extend proxy-wrapped objects with custom rich behaviors.

To that end, can-observe recognizes a `can.computedPropertyDefinitions` property: an object whose values are functions which return a single-value observable; getting or setting a key on the proxy-wrapped object that matches a key in the `can.computedPropertyDefinitions` object will use those observations. The first time one of these properties is accessed, the function is run, and the observation is cached, to be used for all future use on _that instance_.

See [can-observe/defineProperty] for details about defining your own behaviors.


## Browser support

can-observe uses the Proxy feature of JavaScript to observe arbitrary properties. Proxies are available in [all modern browsers](http://caniuse.com/#feat=proxy).

A [polyfill is available](https://github.com/GoogleChrome/proxy-polyfill) that brings Proxies back to IE9, with the caveat that only existing properties on the target object can be observed. This means this code:

```js
const person = observe( { first: "", last: "" } );
```

The *first* and *last* properties are observable in older browsers, but any other property added would not be. To ensure maximum compatibility make sure to give all properties a default value.

## Use with other observables


`can-observe` can be combined with any other CanJS observable type, like [can-define] or [can-compute]. In this example we create a compute that changes when a can-observe proxy changes. Note that with computes we use [can-reflect/observe.onValue canReflect.onValue] to set up the event listener and handler.

```js
import compute from "can-compute";
import observe from "can-observe";
import canReflect from "can-reflect";

const person = observe( {
	name: new DefineMap( { first: "Justin", last: "Meyer" } ),
	age: 35
} );

const fullName = compute( function() {
	return person.name.first + " " + person.name.last;
} );

fullName.on( "change", function( ev, newVal ) {
	console.log( newVal ); // -> Chasen Le Hara
} );


person.name.first = "Chasen";
person.name.last = "Le Hara";
```

`can-observe` will __not__ convert nested property values it recognizes as:
- Primitives
- Built-ins (like `Date`)
- Other CanJS observables (like `can-define`).


## How it works


`can-observe` works by:

1. Creating _base functions_ that make objects, arrays, and functions observable using proxies in:
   [-make-object.js](http://canjs.github.io/can-observe/docs/-make-object.html), [-make-array.js](http://canjs.github.io/can-observe/docs/-make-array.html), and [-make-function.js](http://canjs.github.io/can-observe/docs/-make-function.html).
   - These proxies call [can-observation-recorder] when observables are read.  They also support [can-reflect]'s observable symbols.
2. A place that stores the observable proxies created for non-observable objects and a set that contains a list of proxies: [-observable-store.js](http://canjs.github.io/can-observe/docs/-observable-store.html)
   - This prevents duplicating observables for the same non-observable object and a means for identifying something that is already a proxied observable.
3. A `makeObserve` function that checks the type and calls the right observable function:
  [-observable-store.js](http://canjs.github.io/can-observe/docs/-make-observe.html)
   - This will be passed to all the _base functions_ so they are able to create the right observable with nested data.
4. Finally, [can-observe.js](http://canjs.github.io/can-observe/docs/-can-observe.html) points the `makeObserve` function at all
   the right __base functions__.


`can-observe.Object` and `can-observe.Array` mostly use their underlying _base function_ to setup their
behavior. The primary exception is that they support "computed" getters.  This behavior works by:

1. We make sure a `can.computedPropertyDefinitions` symbol is added to the prototype (see above for details on `can.computedPropertyDefinitions`).
2. We create definitions, which return observations derived from the getter function: [-computed-helpers.js](http://canjs.github.io/can-observe/docs/-computed-helpers.html)


<iframe width="560" height="315" src="https://www.youtube.com/embed/otTT5_zat0I" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>

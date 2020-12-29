@module {function} can-construct can-construct
@parent can-typed-data
@collection can-infrastructure
@package ../package.json

@description

Provides a way to easily use the power of prototypal inheritance
without worrying about hooking up all the particulars yourself. Use
[can-construct.extend can-construct.extend] to create an inheritable
constructor function of your own.

@signature `new Construct( ...args )`

Creates a new instance using Construct's constructor functions.

@param {*} [args] The arguments passed to the constructor.
@return {Object} The instantiated object.

@body

## Use

In the example below, `Animal` is a constructor function returned by [can-construct.extend can-construct.extend]. All instances of `Animal` will have a `speak`
method, and the `Animal` constructor has a `legs` property.

```js
import Construct from "can-construct";
const Animal = Construct.extend( {
	legs: 4
},
{
	speak: function() {
		console.log( this.sound );
	}
} );
```

An optional [can-construct::setup setup] function can be specified to handle the instantiation of the constructor function.
```js
const Animal = Construct.extend( {
	legs: 4,
	setup: function( sound ) {
		return [ sound ];
	}
},
{
	speak: function() {
		console.log( this.sound );
	}
} );
```
[can-construct::setup setup] returns {Array|undefined} If an array is returned, the array's items are passed as arguments to [can-construct::init init].

In addition [can-construct::init init] can be specified which is a method that gets called with each new instance.
```js
const Animal = Construct.extend( {
	legs: 4,
	init: function( sound ) {
		this.sound = sound;
	}
},
{
	speak: function() {
		console.log( this.sound );
	}
} );
```

For more information on deciding when to use [can-construct::setup setup] or [can-construct::init init]
see the bottom of the [can-construct::setup setup] documentation.

You can make instances of your object by calling your constructor function with the `new` keyword. When an object is created, the [can-construct::init init]
method gets called (if you supplied one):

```js
const panther = new Animal( "growl" );
panther.speak(); // "growl"
panther instanceof Animal; // true
```

## Plugins

There are plugins available to help make using `can-construct` even simpler.

-   [can-construct-super] allows you to easily call base methods by making `this._super` available in inherited methods.

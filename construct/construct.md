@constructor can.Construct
@download can/construct
@test can/construct/qunit.html
@parent canjs

`can.Construct` provides a way to easily use the power of prototypal inheritance without worrying
about hooking up all the particulars yourself. It is inspired by John Resig's 
[http://ejohn.org/blog/simple-javascript-inheritance/|Simple JavaScript Inheritance] concept.


@function can.Construct
@signature `can.Construct([name, [staticProperties,]] instanceProperties)`
@param {String} [name] the namespace and name of the constructor
@param {Object} [staticProperties] properties that will belong to the constructor
@param {Object} instanceProperties properties that will belong to instances made with the constructor
@return {function} The constructor.

In the example below, `Animal` is a constructor function. All instances of `Animal` will have a `breathe`
method, and the `Animal` constructor itself has a `legs` property.

@codestart
can.Construct('Animal', {
    legs: 4
}, {
    init: function(sound) {
        this.sound = sound;
    }
    speak: function() {
        console.log(this.sound);
    }
});
@codeend

You don't have to pass in a name. If you do, the constructor is assigned to that name globally. If not,
you'll want to make sure you save your constructor to use later:

@codestart
var Robot = can.Construct({
    beep: function() {
        console.log('Beep boop.');
    }
});
@codeend

You can make instances by calling your constructor with the `new` keyword. When you do, the [can.Construct::init|init]
method gets called (if you supplied one):

@codestart
var panther = new Animal({sound: 'growl'});
panther.speak(); // "growl"
panther instanceof Animal; // true
@codeend

This becomes much more powerful when you add inheritance.

## Inheritance

Subclasses with `can.Construct` are simple. All you need to do is call the base constructor
with the new function's static and instance properties. For example, we want our `Snake` to
be an `Animal`, but there are some differences:

@codestart
Animal('Snake', {
    legs: 0
}, {
    init: function() {
        this.sound = 'ssssss';
    },
    slither: function() {
        console.log('slithering...');
    }
});

var baslisk = new Snake();
baslisk.speak();   // "ssssss"
baslisk.slither(); // "slithering..."
baslisk instanceof Snake;  // true
baslisk instanceof Animal; // true
@codeend

Note that `Animal`'s `init` does not get called.


## Static properties and inheritance

If you pass all three arguments to can.Construct, the second one will be attached directy to the
constructor, allowing you to imitate static properties and functions. You can access these
properties through the `[can.Construct::constructor|this.constructor]` property.

Static properties can get overridden through inheritance just like instance properties. Let's see
how this works with `Animal` and `Snake`:

@codestart
can.Construct('Animal', {
    legs: 4
}, {
    init: function(sound) {
        this.sound = sound;
    }
    speak: function() {
        console.log(this.sound);
    }
});

Animal('Snake', {
    legs: 0
}, {
    init: function() {
        this.sound = 'ssssss';
    },
    slither: function() {
        console.log('slithering...');
    }
});

Animal.legs; // 4
Snake.legs; // 0
@codeend

## Plugins

There are two plugins available to help make using `can.Construct` even simpler.
* [can.Construct.super] allows you to easily call base methods by making `this._super` available in inherited methods.
* [can.Construct.proxy] helps you keep your scope straight when creating callbacks inside constructors.
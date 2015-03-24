@constructor can.Construct
@download can/construct
@test can/construct/test.html
@parent canjs
@group can.Construct.plugins plugins
@link ../docco/construct/construct.html docco

@description 

Provides a way to easily use the power of prototypal inheritance 
without worrying about hooking up all the particulars yourself. Use
[can.Construct.extend can.Construct.extend] to create an inheritable
constructor function of your own.

@body

## Use

In the example below, `Animal` is a constructor function returned by [can.Construct.extend can.Construct.extend]. All instances of `Animal` will have a `speak`
method, and the `Animal` constructor itself has a `legs` property.


    var Animal = can.Construct.extend({
        legs: 4
    }, {
        init: function(sound) {
            this.sound = sound;
        },
        speak: function() {
            console.log(this.sound);
        }
    });


You can make instances by calling your constructor with the `new` keyword. When you do, the [can.Construct::init init]
method gets called (if you supplied one):

    var panther = new Animal('growl');
    panther.speak(); // "growl"
    panther instanceof Animal; // true


## Inheritance

Creating "subclasses" with `can.Construct` is simple. All you need to do is call the base constructor
with the new function's static and instance properties. For example, we want our `Snake` to
be an `Animal`, but there are some differences:


    var Snake = Animal.extend({
        legs: 0
    }, {
        init: function() {
            Animal.prototype.init.call(this, 'ssssss');
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


## Static properties and inheritance

If you pass all three arguments to can.Construct, the second one will be attached directy to the
constructor, allowing you to imitate static properties and functions. You can access these
properties through the `[can.Construct::constructor this.constructor]` property.

Static properties can get overridden through inheritance just like instance properties. In the example below,
we override both the legs static property as well as the the init function for each instance:

@codestart
var Animal = can.Construct.extend({
    legs: 4
}, {
    init: function(sound) {
        this.sound = sound;
    },
    speak: function() {
        console.log(this.sound);
    }
});

var Snake = Animal.extend({
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
var dog = new Animal('woof');
var blackMamba = new Snake();
dog.speak(); // 'woof'
blackMamba.speak(); // 'ssssss'
@codeend

## Plugins

There are two plugins available to help make using `can.Construct` even simpler.

-   [can.Construct.super] allows you to easily call base methods by making `this._super` available in inherited methods.
-   [can.Construct.proxy] helps you keep your scope straight when creating callbacks inside constructors.
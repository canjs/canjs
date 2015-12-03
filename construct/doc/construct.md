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
method, and the `Animal` constructor has a `legs` property.


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


You can make instances of your object by calling your constructor function with the `new` keyword. When an object is created, the [can.Construct::init init]
method gets called (if you supplied one):

    var panther = new Animal('growl');
    panther.speak(); // "growl"
    panther instanceof Animal; // true

## Plugins

There are two plugins available to help make using `can.Construct` even simpler.

-   [can.Construct.super] allows you to easily call base methods by making `this._super` available in inherited methods.
-   [can.Construct.proxy] creates a static callback function that sets the value of `this` to an instance of the constructor function.
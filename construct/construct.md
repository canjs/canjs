@constructor can.Construct
@download can/construct
@test can/construct/test.html
@parent canjs
@group can.Construct.plugins plugins

@description 

Provides a way to easily use the power of prototypal inheritance 
without worrying about hooking up all the particulars yourself. Use
[can.Construct.extend can.Construct.extend] to create a inheritable
constructor function of your own.


@signature `new can.Construct([args..])`

Create a new instance of a constructor function. `new` is not
used with `can.Construct` directly. Instead, it is used with a constructor 
function returned by [can.Construct.extend can.Construct.extend]. For
example:

    Animal = can.Construct.extend({
      sayHi: function(){
        console.log("hi")
      }
    })
    var animal = new Animal()
    animal.sayHi();
    
Any arguments passed to the construction function are passed 
to [can.Construct.prototype.setup setup] and [can.Construct.prototype.init init].

@signature `can.Construct([name,] [staticProperties,] instanceProperties)`

Creates a new extended constructor function. Example:

    Animal = can.Construct({
      sayHi: function(){
        console.log("hi")
      }
    })
    
This is deprecated. In CanJS 1.2, by default, calling the constructor function
without `new` will create a `new` instance.  This behavior is controlled
by the [can.Construct.constructorExtends constructorExtends] property.

Use [can.Construct.extend can.Construct.extend] 
instead of calling the constructor to extend.

@signature `can.Construct([args...])`

Create a new instance of a constructor function if
[can.Construct.constructorExtends constructorExtends] is 
false. `can.Construct([args...])` is not used with `can.Construct`
directly. Instead it is used on constructor functions
extended from [can.Construct].

    Animal = can.Construct.extend({
       constructorExtends: false
    },{
      sayHi: function(){
        console.log("hi")
      }
    })
    var animal = Animal();


This will be the default behavior in CanJS 1.2.



@body


## Use

In the example below, `Animal` is a constructor function. All instances of `Animal` will have a `speak`
method, and the `Animal` constructor itself has a `legs` property.


    Animal = can.Construct.extend({
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


    Snake = Animal({
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
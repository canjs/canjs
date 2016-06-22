@page Constructors Constructors
@parent Tutorial 3
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - Constructors in CanJS
  - The `extend` function
  - The `init` function
- - -

Before we work with any of the objects in CanJS, it will be helpful for us to
understand [can.Construct](../docs/can.Construct.html). We won’t be working
with `can.Construct` directly. However, many of the objects in CanJS are derived from
`can.Construct`. Understanding it will make it easier for you to understand other
concepts we’re going to cover.

`can.Construct` provides a way to easily use the power of prototypal
inheritance without worrying about hooking up all the particulars
yourself. Without going into exhaustive detail, `can.Construct` contains
a few functions we’ll encounter frequently in other objects:

- Prototype
  - init
- Static
  - extend

We’ll look at the extend function first.

## The extend function
`can.Construct`’s `extend` function is used to create
“constructor functions” that inherit from the base constructor function. 
To create a constructor function of your own, call __can.Construct__ with the:

- __staticProperties__ that are attached directly to the constructor, and
- instance __prototypeProperties__.

__can.Construct__ sets up the prototype chain so subclasses can be further
extended and sub-classed as far as you like:

```
var Order = can.Construct.extend({
  init: function(){},

  customer: function() { ... },
  
  needAddress: function( account ) {
    return false;
  }
});

var CarryOutOrder = Order.extend({
  needAddress: function( account ) {
    return account.hasAddress();
  }
});
```

If only one set of properties is passed to __can.Construct__, it's assumed to
be the prototype properties.  If two sets of properties are passed, the
first argument are static properties, the second argument are prototype
properties.

```
can.Construct.extend({
  // Static properties here
}, {
  // Blank object as second parameter
});
```

This example is highlighted because calling a `can.Construct` with two parameters, 
the last of which is an empty object, is common. Also common is the mistake of
ommitting the last parameter of the call, which can lead to unexpected behavior.


## The init function

When a constructor is called with the `new` keyword, __can.Construct__ creates the instance and
calls [init](../docs/can.Construct.prototype.init.html) with
the arguments passed to `new Constructor(...)`. `init` is where initialization code
should go. Inside of the `init` function, the `this` keyword will refer to the
new object instance created by the constructor. Additionaly, `this` will contain 
the instance properties you pass to the constructor. A common thing to do in `init` 
is save the arguments passed into the constructor. An example is below:

```
var Order = can.Construct.extend({
  init: function(price, item) {
    this.price = price;
    this.item = item;
  }
});

var order = new Order(20, 'Green Eggs & Ham');
```

- - -

<span class="pull-left">[&lsaquo; Application Design](ApplicationDesign.html)</span>
<span class="pull-right">[Observables &rsaquo;](Observables.html)</span>

</div>


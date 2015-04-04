@page Constructs Constructor Functions
@parent Tutorial 0

@body  

Constructor functions are used by JavaScript to create objects with shared properties.  It's
similar in concept to a [class](http://en.wikipedia.org/wiki/Class_(computer_programming)).  Constructor
functions can be created by using
[can.Construct](../docs/can.Construct.html). Constructs are used to create
instantiable objects with shared properties and help make managing inheritance
in JavaScript easier. [Observables], [Models] and
[Controls] are based off of Constructs, so learning how they work is
fundamental to understanding CanJS.

To create a Construct of your own, call [can.Construct.extend](../docs/can.Construct.extend.html) with an object of static
properties (which will be attached directly to the constructor object) along
with an object of instance properties (which will be attached to the
constructor's prototype):

    var Todo = can.Construct.extend({}, {
    
      isSecret: function(){
        return false;
      }
	  allowedToEdit: function() {
		return ! this.isSecret();
      }
    });

    var t = new Todo();
    t.allowedToEdit(); // true

## Inheritance 

can.Construct automatically sets up the prototype chain so that
Constructs are easy to extend (similar to sub classing). To extend one 
of your Constructs, call the constructor's [extend](../docs/can.Construct.extend.html) method, passing it the same arguments that you would pass to
`can.Construct.extend`:


    // If only one argument is passed, they are considered prototype properties.
    var PrivateTodo = Todo.extend({},{
	
	  isSecret: function() {
		return true;
	  }
    });

    var p = new PrivateTodo();
    p.allowedToEdit(); // false


## Initialization 

When a constructor function is called
with `new`, can.Construct creates a new instance of that class. If you've
supplied an prototype method called
[init](../docs/can.Construct.prototype.init.html), can.Construct will
call init with `this` as the new instance and the arguments passed to the
constructor.

This helps make our Todo configurable:

```
var Todo = can.Construct.extend({
  init: function(owner) {
    this.owner = owner;
  },
  allowedToEdit: function() {
    return true;
  }
});

var t = new Todo("me");
t.owner; // 'me'
```

If you're extending a Construct, you probably want to make sure you call the
base's `init` method inside the child's `init`:

```
var PrivateTodo = can.Construct.extend({
  init: function(owner, isShared) {
    can.Construct.prototype.init.apply(this, arguments);
    this.isShared = isShared;
  },
  allowedToEdit: function(){
    return this.owner === "me" || this.isShared;
  }
});
```

If you find yourself using inheritence a lot, checkout can.Construct's [super plugin](../docs/can.Construct.super.html).

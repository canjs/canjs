@page Constructs Constructor Classes
@parent Tutorial 0

@body  

Constructor classes are CanJS's basic prototypal inheritance style
classes.  These classes can be created by using
[can.Construct](../docs/can.Construct.html). Constructs are used to create
instantiable objects with shared properties and help make managing inheritance
in JavaScript easier. [Observes], [Models] and
[Controls] are based off of Constructs, so learning how they work is
fundamental to understanding CanJS.

To create a Construct of your own, call `can.Construct.extend` with an object of static
properties (which will be attached directly to the constructor object) along
with an object of instance properties (which will be attached to the
constructor's prototype):

@codestart
var Todo = can.Construct.extend({}, {
	description: 'Something to do.',
	author: 'Unknown',
	allowedToEdit: function() {
		return true;
	}
});

var t = new Todo();

t.description; // 'Something to do.'
t.author; // 'Unknown'
t.allowedToEdit(); // true
@codeend

_Please note, that starting in CanJS 1.2 releases, you will not be able to create a class simply by using `can.Construct`, as that will instead try to create a new instance of a class._ There are a few other ways to create classes with  `can.Construct`; see
[the API](../docs) for all of the details.

## Inheritance 

can.Construct automatically sets up the prototype chain so that
Constructs are easy to subclass. To subclass one of your Constructs, call the
constructor function, passing it the same arguments that you would pass to
`can.Construct`:

@codestart
// If only one argument is passed, they are considered prototype properties.
var PrivateTodo = Todo.extend({
	description: 'Something secret!',
	allowedToEdit: function(account) {
		return account.owns(this);
	}
});

var p = new PrivateTodo();
p.author; // 'Unknown'
p.description; // 'Something secret!'
p.allowedToEdit({owns: function(){ return false; }}); // false
@codeend

## Initialization 

As you can see above, when a constructor function is called
with `new`, can.Construct creates a new instance of that class. If you've
supplied an prototype method called
[init](../docs/can.Construct.prototype.init.html), can.Construct will
initialize the class using that method along with the arguments passed to the
constructor.

This helps make our Todo a little more configurable:

@codestart
var Todo = can.Construct.extend({
	description: 'Something to do.',
	author: 'Unknown',

	init: function(options) {
		this.author = options.author || this.author;
		this.description = options.description || this.description;
	}
});

var t = new Todo({author: 'Me!'});
t.author; // 'Me!'
t.description; // 'Something to do.'
@codeend

If you're extending a Construct, you probably want to make sure you call the
base's `init` method inside the child's `init`:

@codestart
var PrivateTodo = can.Construct.extend({
	init: function(options) {
		can.Construct.prototype.init.apply(this, arguments);
	}
});
@codeend
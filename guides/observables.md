@page Observables Observables
@parent Tutorial 1

@body  

CanJS's observables - [can.Map](../docs/can.Map.html), [can.List](../docs/can.List.html), 
and [can.compute](../docs/can.compute.html) - let you make changes to data and listen
to those changes.  Observables are the subjects in 
the [observer pattern](http://en.wikipedia.org/wiki/Observer_pattern).  CanJS comes with
three forms of observables:

 - [can.Map](../docs/can.Map.html) - Used for Objects.
 - [can.List](../docs/can.List.html) - Used for Arrays.
 - [can.compute](../docs/can.compute.html) - Used for values.

can.Map and can.List are often extended to create observable types. 
[Models](../docs/can.Model.html) and [can.route](../docs/can.route.html) are
based on can.Map, and can.Component's [viewModel](../docs/can.Component.prototype.view-model.html) is a
can.Map, but observables are useful on their own too.

To create a Map, call `new can.Map(obj)`. This will give you a map
with the same properties and values as _obj_. To create a List, call `new
can.List(array)`. This will give you a List with the same elements as
_array_.

@codestart
var pagination = new can.Map({page: 1, perPage: 25, count: 1388});
pagination.attr('perPage'); // 25

var hobbies = new can.List(['programming', 'bball', 'party rocking']);
hobbies.attr(2); // 'partying'
@codeend

## Manipulating properties

The [attr](../docs/can.Map.prototype.attr.html) method is
used to read and write a property or properties from a Map or List.

@codestart
pagination.attr('perPage');     // 25
pagination.attr('perPage', 50);
pagination.attr('perPage');     // 50

pagination.attr({page: 10, lastVisited: 1});
pagination.attr(); // {page: 10, perPage: 50, count: 1388, lastVisited: 1}
@codeend

Properties can be removed from Observes with `removeAttr`, which is equivalent
to the `delete` keyword:

@codestart
pagination.removeAttr('count');
pagination.attr(); // {page: 10, perPage: 50, lastVisited: 1}
@codeend

## Listening to events

When a property on a Map is changed with `attr`, the Map will emit two
events: A _change_ event and an event with the same name as the property that
was changed. You can listen for these events by using
[bind](../docs/can.Map.prototype.bind.html):

@codestart
paginate.bind('change', function(event, attr, how, newVal, oldVal) {
	attr;   // 'perPage'
	how;    // 'set'
	newVal; // 30
	oldVal; // 50
});
paginate.bind('perPage', function(event, newVal, oldVal) {
	newVal; // 30
	oldVal; // 50
});

paginate.attr('perPage', 30);
@codeend

You can similarly stop listening to these events by using
[unbind](../docs/can.Map.prototype.unbind.html):

@codestart
var timesChanged = 0,
	changeHandler = function() { timesChanged++; },
	obs = new can.Map({value: 10});

obs.bind('change', changeHandler);
obs.attr('value', 20);
timesChanged; // 1

obs.unbind('change', changeHandler);
obs.attr('value', 30);
timesChanged; // 1
@codeend

## Iterating though a Map

If you want to iterate through the properties on a Map, use `each`:

@codestart
paginate.each(function(val, key) {
	console.log(key + ': ' + val);
});

// The console shows:
// page: 10
// perPage: 30
// lastVisited: 1
@codeend

## Extending a Map

Extending a can.Map (or can.List) lets you create custom observable 
types. The following extends can.Map to create a Paginate type that
has a `.next()` method to change its state:

    Paginate = can.Map.extend({
      limit: 100,
      offset: 0,
      count: Infinity,
      page: function() {
        return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
      },
      next: function() {
        this.attr('offset', this.attr('offset') + this.attr('limit') );
      }
    });
    
    var pageInfo = new Paginate();
    pageInfo.attr("offset") //-> 0
    
    pageInfo.next();
    
    pageInfo.attr("offset") //-> 100
    pageInfo.page()         //-> 2


## Observable Arrays

As mentioned above, CanJS also provides observable arrays with can.List.
can.List inherits from can.Map, so a List works much the same way an
Map does, with the addition of several methods useful for working with
arrays:

- [indexOf](../docs/can.List.prototype.indexOf.html), which looks for an item in a
List.
- [pop](../docs/can.List.prototype.pop.html), which removes the last item from a
List.
- [push](../docs/can.List.prototype.push.html), which adds an item to the end of a
List.
- [shift](../docs/can.List.prototype.shift.html), which removes the first item from
a List.
- [unshift](../docs/can.List.prototype.unshift.html), which adds an item to the front
of a List.
- [splice](../docs/can.List.prototype.splice.html), which removes and inserts items
anywhere in a List.

When these methods are used to modify a List, the appropriate events are
emitted. See [the API for Lists](../docs/can.List.html) for more
information on the arguments passed to those event handlers.

## Computed values

CanJS also provides a way to make values themselves observable with
[can.compute](../docs/can.compute.html). A Compute represents a dynamic value
that can be read, set, and listened to just like a Map.

### Static Computes

A simple static Compute contains a single value, and is created by calling
`can.compute(value)`. This value can be read, set, and listened to:

@codestart
// create a Compute
var age = can.compute(25),
	previousAge = 0;

// read the Compute's value
age(); // 25

// listen for changes in the Compute's value
age.bind('change', function(ev, newVal, oldVal) {
	previousAge = oldVal;
});

// set the Compute's value
age(26);

age();       // 26
previousAge; // 25
@codeend

### Composite Computes

Computes can also be used to generate a unique value based on values derived
from other observable properties. This type of compute is created by calling
`can.compute(getterFunction)`. When the observable properties that the compute is
derived from change, the value of the compute changes:

@codestart
var name = new can.Map({
	first: 'Alice',
	last: 'Liddell'
});
var fullName = can.compute(function() {
	// We use attr to read the values
	// so the compute knows what to listen to.
	return name.attr('first') + ' ' + name.attr('last');
});
var previousName = '';

fullName();   // 'Alice Liddell'

fullName.bind('change', function(ev, newVal, oldVal) {
	previousName = oldVal;
});

name.attr({
	first: 'Allison',
	last: 'Wonderland'
});

fullname();   // 'Allison Wonderland'
previousName; // 'Alice Liddell'
@codeend

Since the value of the Compute is cached any time a derived value is
changed, reading the value is fast.

### Converted Computes

Computes are also useful for creating links to properties within Observes. One
of the most frequent examples of this is when converting from one unit to
another.

@codestart
// progress ranges from 0 to 1.
var project = new can.Map({ progress: 0.3 });
var progressPercentage = can.compute(function(newVal) {
	if(newVal !== undefined) {
		// set a value
		project.attr('progress', newVal / 100);
	} else {
		// get the value
		return project.attr('progress') * 100;
	}
});

percentage();     // 30

// Setting percentage...
percentage(75);
// ...updates project.progress!
project.attr('progress'); // .75
@codeend

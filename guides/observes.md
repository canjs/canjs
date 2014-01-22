@page Observes Observable Objects
@parent Tutorial 1

@body  

Observes are an enhanced version of basic objects, adding the ability to
easily manipulate properties as well as listen for when they change. Observes
also make it easy to work with nested properties. Both
[can.Route](../docs/can.route.html) and [Models](../docs/can.Model.html) are
based on can.Observe, but Observes are also useful on their own such as for
maintaining client-side state like pagination data.

To create an Observe, call `new can.Observe(obj)`. This will give you an Observe
with the same properties and values as _obj_. can.Observe also provides
[observable arrays called Lists](../docs/can.Observe.List.html). To create a List, call `new
can.Observe.List(array)`, which will give you a List with the same elements as
_array_.

@codestart
var pagination = new can.Observe({page: 1, perPage: 25, count: 1388});
pagination.perPage; // 25

var hobbies = new can.Observe.List(['programming', 'basketball', 'partying']);
hobbies[2]; // 'partying'
@codeend

## Manipulating properties

While you can read properties from an Observe instance the normal way
(observe.property), you'll need to set the values of properties using
[attr](../docs/can.Observe.prototype.attr.html). The `attr` method can also be
used to read properties or get a basic object back from an Observe. 

It might not make sense to read properties from an Observe using `attr` when
you can read them directly, but the act of using `attr` in your
[can.view](../docs/can.view.html) templates or within Computes provides
hinting to the underlying engine that you want the template or Compute to
update itself when the values of those properties change.

@codestart
pagination.attr('perPage');     // 25
pagination.attr('perPage', 50);
pagination.perPage;             // 50

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

When a property on an Observe is changed with `attr`, the Observe will emit two
events: A _change_ event and an event with the same name as the property that
was changed. You can listen for these events by using
[bind](../docs/can.Observe.prototype.bind.html):

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
[unbind](../docs/can.Observe.prototype.unbind.html):

@codestart
var timesChanged = 0,
	changeHandler = function() { timesChanged++; },
	obs = new can.Observe({value: 10});

obs.bind('change', changeHandler);
obs.attr('value', 20);
timesChanged; // 1

obs.unbind('change', changeHandler);
obs.attr('value', 30);
timesChanged; // 1
@codeend

## Iterating though an Observe

If you want to iterate through the properties on an Observe, use `each`:

@codestart
paginate.each(function(val, key) {
	console.log(key + ': ' + val);
});

// The console shows:
// page: 10
// perPage: 30
// lastVisited: 1
@codeend

## Observable arrays

As mentioned above, CanJS also provides observable arrays with can.Observe.List.
can.Observe.List inherits from can.Observe, so a List works much the same way an
Observe does, with the addition of several methods useful for working with
arrays:

- [indexOf](../docs/can.Observe.List.prototype.indexOf.html), which looks for an item in a
List.
- [pop](../docs/can.Observe.List.prototype.pop.html), which removes the last item from a
List.
- [push](../docs/can.Observe.List.prototype.push.html), which adds an item to the end of a
List.
- [shift](../docs/can.Observe.List.prototype.shift.html), which removes the first item from
a List.
- [unshift](../docs/can.Observe.List.prototype.unshift.html), which adds an item to the front
of a List.
- [splice](../docs/can.Observe.List.prototype.splice.html), which removes and inserts items
anywhere in a List.

When these methods are used to modify a List, the appropriate events are
emitted. See [the API for Lists](../docs/can.Observe.List.html) for more
information on the arguments passed to those event handlers.

## Computed values

CanJS also provides a way to make values themselves observable with
[can.compute](../docs/can.compute.html). A Compute represents a dynamic value
that can be read, set, and listened to just like an Observe.

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
from other Observe properties. This type of Compute is created by calling
`can.compute(getterFunction)`. When the Observe properties that the Compute is
derived from change, the value of the Compute changes:

@codestart
var name = new can.Observe({
	first: 'Alice',
	last: 'Liddell'
});
var fullName = can.compute(function() {
	// We use attr to read the values so the compute knows what to listen to.
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
var project = new can.Observe({ progress: 0.3 });
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
project.progress; // .75
@codeend

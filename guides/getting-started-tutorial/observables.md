@page Observables Observables
@parent Tutorial 3
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - `can.Map`, and 
 - `can.List`
- - -

Observables are the subjects in the
[observer pattern](http://en.wikipedia.org/wiki/Observer_pattern). 
They let you create relationships between objects
where one object (or objects) listens for and responds to changes in another object. 
Most of the core objects in CanJS are observables. Understanding how to effectively
work with observables lies at the heart of understanding how to build successful 
CanJS applications.

In this section, we'll review the two observables that make up the core of most CanJS objects:

 - [`can.Map`](../docs/can.Map.html) - Used for Objects.
 - [`can.List`](../docs/can.List.html) - Used for Arrays.

`can.Map` and `can.List` are often extended to create observable types. For example,
[can.Model](../docs/can.Model.html) and [can.route](../docs/can.route.html) are
based on `can.Map`, and a `can.Component`’s [`viewModel`](../docs/can.Component.prototype.viewModel.html)
is a `can.Map`.

## Creating Instances

To create a Map, call `new can.Map(object)`. This will give you a map
with the same properties and values as the _object_ you passed in to the `can.Map` constructor. 

To create a List, call `new can.List(array)`. This will give you a List with the same elements as the
_array_ you passed into the `can.List` constructor.

```
var pagination = new can.Map({page: 1, perPage: 25, count: 1388});
pagination.attr('perPage'); // 25

var hobbies = new can.List(['programming', 'bball', 'party rocking']);
hobbies.attr(2); // 'party rocking'
```

## Manipulating properties

The [`attr`](../docs/can.Map.prototype.attr.html) method is
used to read a property from, or write a property to a `can.Map` or `can.List`.

```
var pagination = new can.Map({page: 1, perPage: 25, count: 1388});

pagination.attr('perPage');     // 25
pagination.attr('perPage', 50);
pagination.attr('perPage');     // 50

pagination.attr({page: 10, lastVisited: 1});
pagination.attr(); // {page: 10, perPage: 50, count: 1388, lastVisited: 1}
```

Properties can be removed by using [`removeAttr`](../docs/can.Map.prototype.removeAttr.html),
which is equivalent to the `delete` keyword:

```
pagination.removeAttr('count');
pagination.attr(); // {page: 10, perPage: 50, lastVisited: 1}
```

## Listening to events

When a property on a Map is changed with `attr`, the Map will emit two
events: A _change_ event and an event with the same name as the property that
was changed. You can listen for these events by using
[bind](../docs/can.Map.prototype.bind.html):

```
// In this example, the chanage to pagination's perPage attribute, 
// on line 16, is responded to by the functions listening to 
// pagination's change and perPage attributes. Note the values passed 
// in to the functions when they are called.
pagination.bind('change', function(event, attr, how, newVal, oldVal) {
	attr;   // 'perPage'
	how;    // 'set'
	newVal; // 30
	oldVal; // 50
});
pagination.bind('perPage', function(event, newVal, oldVal) {
	newVal; // 30
	oldVal; // 50
});

pagination.attr('perPage', 30);
```

You can similarly stop listening to these events by using
[`unbind`](../docs/can.Map.prototype.unbind.html):

```
var timesChanged = 0,
	changeHandler = function() { timesChanged++; },
	obs = new can.Map({value: 10});

obs.bind('change', changeHandler);
obs.attr('value', 20);
timesChanged; // 1

obs.unbind('change', changeHandler);
obs.attr('value', 30);
timesChanged; // 1
```

## Iterating though a Map

If you want to iterate through the properties on a Map, use `each`:

```
var pagination = new can.Map({page: 10, perPage: 25, count: 1388});

pagination.each(function(val, key) {
	console.log(key + ': ' + val);
});

// The console shows:
// page: 10
// perPage: 25
// count: 1388
```

## Extending a Map

Extending a `can.Map` (or `can.List`) lets you create custom observable
types. The following extends `can.Map` to create a Paginate type that
has a `.next()` method:

```
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
```

## Observable Arrays

CanJS also provides observable arrays with `can.List`.
`can.List` inherits from `can.Map`. A `can.List` works much the same way a
`can.Map` does, with the addition of methods useful for working with
arrays:

- [`indexOf`](../docs/can.List.prototype.indexOf.html), which looks for an item in a
List.
- [`pop`](../docs/can.List.prototype.pop.html), which removes the last item from a
List.
- [`push`](../docs/can.List.prototype.push.html), which adds an item to the end of a
List.
- [`shift`](../docs/can.List.prototype.shift.html), which removes the first item from
a List.
- [`unshift`](../docs/can.List.prototype.unshift.html), which adds an item to the front
of a List.
- [`splice`](../docs/can.List.prototype.splice.html), which removes and inserts items
anywhere in a List.

When these methods are used to modify a List events are
emitted that you can listen for, as well. See [the API for Lists](../docs/can.List.html) for more
information.



<span class="pull-left">[&lsaquo; Application Foundations](ApplicationFoundations.html)</span>
<span class="pull-right">[The Define Plugin &rsaquo;](TheDefinePlugin.html)</span>

</div>

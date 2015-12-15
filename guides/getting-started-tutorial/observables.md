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

In this section, we’ll review the two observables that make up the core of most CanJS objects:

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
While you can read the properties of a `can.Map` or `can.List` directly off 
of the object, to take advantage of the observable functionality you must
use the `.attr` syntax.

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

## Extending a Map

Extending a `can.Map` (or `can.List`) lets you create custom observable
types. The following extends `can.Map` to create a Paginate type that
has a `.next()` method:

```
Paginate = can.Map.extend({
  define: {
    limit: {
      value: 100
    },
    offset: {
      value: 100
    },
    count: {
      value: Infinity
    }
  },
  next: function() {
	this.attr('offset', this.attr('offset') + this.attr('limit') );
  }
});

var pageInfo = new Paginate();
pageInfo.attr("offset") //-> 0

pageInfo.next();

pageInfo.attr("offset") //-> 100
```

## Responding to changes

When a property on a Map is changed with `attr`, it will emit an event with the
name of the changed property.  You can [bind](../docs/can.Map.prototype.bind.html)
to those events and perform some action:

```
pagination.bind('page', function(event, newVal, oldVal) {
	newVal; // 11
	oldVal; // 10
	
	$("#page").text("Page: "+newVal);
});

pagination.attr('page', 11);
```

Although `bind` and its corresponding `unbind` method exist, __there's almost no
reason to ever use them!__  This is because there are better ways to perform
the common actions that would require binding to an observable.

For example, `stache` templates will automatically update when an observable changes:

```
var template = can.stache("<span id='page'>{{page}}</span>");
$("body").append(template(pagination));

document.getElementById("page").innerHTML //-> "11"

pagination.attr('page', 12);

document.getElementById("page").innerHTML //-> "12"
```

The other common use case is to create some new, derived value.  [can.compute](../docs/can.compute.html)
or [define getters](../docs/can.Map.prototype.define.get.html) lets you use functional
(and reactive) programming techniques to derive new values from source 
state. 

For example, we can create a virtual `page` observable that derives its value from the 
`offset` and `limit`:

```
var pagination = new Paginate({
  limit: 10,
  offset: 20
});

var page = can.compute(function(){
  return Math.floor(pagination.attr('offset') / 
                    pagination.attr('limit')) + 1;
});

page() //-> 3

page.bind("change", function(ev, newValue){
  newValue //-> 4
});

pagination.attr("offset",30);
```

In this example `page` will automatically be updated when either `offset` or `limit` change.


However, `page` is more commonly created as a "virtual" property of the `Paginate` Map type
using a [define getter](../docs/can.Map.prototype.define.get.html):

```
Paginate = can.Map.extend({
  define: {
    ...
    page: {
      get: function() {
	    return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
      }
    }
  },
  ...
});

var pageInfo = new Paginate({
  limit: 10,
  offset: 20,
  count: 30
});
pageInfo.attr("page") //-> 3

pageInfo.bind("page", function(ev, newVal){
  newVal //-> 4
});

pageInfo.next();
```

Using computes and define getters are very similar to using functional-reactive programming
event streams.  Given some source state, they are able to derive and combine it into new values.

Computes and define getters are easier, but less powerful than event streams.  Computes
and define getters only respond to changes in values where event streams 
are also able to respond to events. However, computes and define getters 
are eaiser to express and automatically manage subscriptions to source values.

For example, consider deriving a total for one of two menus depending on the time
of day:

```
var lunch = new can.List([
  {name: "nachos", price: 10.25},
  {name: "water", price: 0},
  {name: "taco", price: 3.25}
]);

var dinner = new can.List([
  {name: "burrito", price: 12.25},
  {name: "agua", price: 1.20}
]);

var timeOfDay = can.compute("lunch");

var total = can.compute(function(){
  var list = timeOfDay() === "lunch" ? lunch : dinner;
  var sum = 0;
  list.forEach(function(item){
    sum += item.attr("price");
  });
  return sum;
});
```

In this example, `total` will listen to not only `timeOfDay`, but
also when items are added or removed to `lunch` or `dinner`, and each item's
`price`.  Furthermore, it only listens to just what needs to be listened to. It will
listen to either `lunch` or `dinner`, but not both.

In the [next chapter](TheDefinePlugin.html) we'll expand on the use of the define plugin
and show how it can handle asyncronous derived data like AJAX requests.

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

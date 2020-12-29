@module {constructor} can-list
@inherits can-map
@download can/list
@test can/list/test.html
@parent can-observables
@collection can-legacy
@release 2.0
@package ../package.json

@group can-list.prototype 0 Prototype
@group can-list.static 1 Static

@link ../docco/list/list.html docco

Use for observable array-like objects.

@signature `new List([array])`

Create an observable array-like object.

@param {Array} [array] Items to seed the List with.

@return {can-list} An instance of `List` with the elements from _array_.

@signature `new List(deferred)`

@param {can.Deferred} deferred A deferred that resolves to an
array.  When the deferred resolves, its values will be added to the list.

@return {can-list} An initially empty `List`.  


@body

## Use

`List` is used to observe changes to an Array.  `List` extends `[can-map]`, so all the
ways that you're used to working with Maps also work here.

Use [can-list::attr attr] to read and write properties of a list:

    var hobbies = new List(["JS","Party Rocking"])
    hobbies.attr(0)        //-> "JS"
    hobbies.attr("length") //-> 2

    hobbies.attr(0,"JavaScript")

    hobbies.attr()         //-> ["JavaScript","Party Rocking"]

Just as you shouldn't set properties of an Map directly, you shouldn't change elements
of a List directly. Always use `attr` to set the elements of a List, or use [can-list::push push],
[can-list::pop pop], [can-list::shift shift], [can-list::unshift unshift], or [can-list::splice splice].

Here is a tour through the forms of `List`'s `attr` that parallels the one found under [can-map.prototype.attr attr]:

```
var people = new List(['Alex', 'Bill']);

// set an element:
people.attr(0, 'Adam');
people[0] = 'Adam'; // don't do this!

// get an element:
people.attr(0); // 'Adam'
people[0]; // 'Adam'

// get all elements:
people.attr(); // ['Adam', 'Bill']

// extend the array:
people.attr(4, 'Charlie');
people.attr(); // ['Adam', 'Bill', undefined, undefined, 'Charlie']

// merge the elements:
people.attr(['Alice', 'Bob', 'Eve']);
people.attr(); // ['Alice', 'Bob', 'Eve', undefined, 'Charlie']
```

## Listening to changes

As with `Map`s, the real power of observable arrays comes from being able to
react to changes in the member elements of the array. Lists emit five types of events:

- the _change_ event fires on every change to a List.
- the _set_ event is fired when an element is set.
- the _add_ event is fired when an element is added to the List.
- the _remove_ event is fired when an element is removed from the List.
- the _length_ event is fired when the length of the List changes.

This example presents a brief concrete survey of the times these events are fired:

```
var list = new List(['Alice', 'Bob', 'Eve']);

list.bind('change', function() { console.log('An element changed.'); });
list.bind('set', function() { console.log('An element was set.'); });
list.bind('add', function() { console.log('An element was added.'); });
list.bind('remove', function() {
  console.log('An element was removed.');
});
list.bind('length', function() {
  console.log('The length of the list changed.');
});

list.attr(0, 'Alexis'); // 'An element changed.'
                        // 'An element was set.'

list.attr(3, 'Xerxes'); // 'An element changed.'
                        // 'An element was added.'
                        // 'The length of the list was changed.'

list.attr(['Adam', 'Bill']); // 'An element changed.'
                             // 'An element was set.'
                             // 'An element was changed.'
                             // 'An element was set.'

list.pop(); // 'An element changed.'
            // 'An element was removed.'
            // 'The length of the list was changed.'
```

More information about binding to these events can be found under [can-list::attr attr].

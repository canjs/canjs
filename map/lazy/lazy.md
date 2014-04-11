@constructor can.LazyMap
@inherits can.Map
@parent can.Map.plugins
@plugin can/map/lazy
@release 2.1
@test can/LazyMap/lazy/test.html

@description Create observable objects that initialize on demand.

@signature `new can.LazyLazyMap([props])`

Creates a new instance of can.LazyMap.

@param {Object} [props] Properties and values to initialize the Map with.
@return {can.LazyMap} An instance of `can.LazyMap` with the properties from _props_.

@body

Just like [can.Map], `can.LazyMap` provides a way for you to listen for and
keep track of changes to objects. When you use the getters and setters provided by `can.LazyMap`,
events are fired that you can react to. `can.LazyMap` also has support for
working with deep properties. Deep properties will only be converted if they are actually being
read or set which gives you better performance than [can.Map] when working with large nested structures
where not every nested property needs to be converted into a Map.
Observable arrays are also available with `[can.LazyList]`.

`can.LazyMap` and `can.LazyList` are API compatible with [can.Map] and [can.List].

## Limitations of Lazy Maps

Although passing all original [can.Map] and [can.List] tests, `can.LayzMap` and `can.LazyList`
currently don't work with the [can.Map.attributes], [can.Map.setter], [can.Map.delegate], [can.Map.backup]
and [can.Map.validations] plugins.

Additionallly, if all properties of a LazyMap are being read, bound or set, initialization time can be
slightly higher than with [can.Map]. The best performance improvements can be seen with large nested
object structures where only a fraction of the properties is being accessed.

## Working with LazyMaps

To create a map, use `new can.LazyMap([props])`. This will return a
copy of `props` that emits events when its properties are changed with
`[can.LazyMap.prototype.attr attr]`.

You can read the values of properties on a map directly, but you should
never set them directly. You can also read property values using `attr`.
Usually, you will want to do this when creating a `[can.compute]` or when
live-binding properties in an [can.EJS EJS] template. (If you are using
[can.Mustache Mustache], you don't need to use `attr`.)

@codestart
var aName = {a: 'Alexis'},
    map = new can.LazyMap(aName);

// Observes are copies of data:
aName === map; // false

// reading from an Observe:
map.attr();    // {a: 'Alexis'}
map.a;         // 'Alexis'
map.attr('a'); // 'Alexis'

// setting an Observe's property:
map.attr('a', 'Alice');
map.a; // Alice

// removing an Observe's property;
map.removeAttr('a');
map.attr(); // {}

// Don't do this!
map.a = 'Adam'; // wrong!
@codeend

Find out more about manipulating properties of Observes under
[can.Map.prototype.attr attr] and [can.Map.prototype.removeAttr removeAttr].

## Listening to changes

The real power of observable objects comes from being able to react to
properties being added, set, and removed. Observes emit events when
properties are changed that you can bind to.

`can.LazyMap` has two types of events that fire due to changes on an Observe:
- the _change_ event fires on every change to an Observe.
- an event named after the property name fires on every change to that property.

@codestart
var o = new can.LazyMap({});
o.bind('change', function(ev, attr, how, newVal, oldVal) {
    console.log('Something on o changed.');
});
o.bind('a', function(ev, newVal, oldVal) {
    console.log('a was changed.');
});

o.attr('a', 'Alexis'); // 'Something on o changed.'
                       // 'a was changed.'
o.attr({
    'a': 'Alice',      // 'Something on o changed.' (for a's change)
    'b': 'Bob'         // 'Something on o changed.' (for b's change)
});                    // 'a was changed.'

o.removeAttr('a');     // 'Something on o changed.'
                       // 'a was changed.'
@codeend

For more detail on how to use these events, see [can.Map.prototype.bind bind] and
[can.Map.prototype.unbind unbind]. There is also a plugin called [can.Map.delegate]
that makes binding to specific types of events easier:

@codestart
var o = new can.LazyMap({});
o.delegate('a', 'add', function(ev, newVal, oldVal) {
    console.log('a was added.');
});
o.delegate('a', 'set', function(ev, newVal, oldVal) {
    console.log('a was set.');
});
o.delegate('a', 'remove', function(ev, newVal, oldVal) {
    console.log('a was removed.');
});
o.delegate('a', 'change', function(ev, newVal, oldVal) {
    console.log('a was changed.');
});

o.attr('a', 'Alexis'); // 'a was added.'
                       // 'a was changed.'

o.attr('a', 'Alice'); // 'a was set.'
                      // 'a was changed.'


o.removeAttr('a'); // 'a was removed.'
                   // 'a was changed.'
@codeend

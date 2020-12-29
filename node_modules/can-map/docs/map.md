@module {constructor} can-map
@inherits can-construct
@parent can-observables
@collection can-legacy
@group can-map.prototype 0 prototype
@group can-map.static 1 static
@test can/map/test.html
@plugin can/map
@release 2.0
@link ../docco/map/map.html docco
@package ../package.json

@description Create observable objects.

@signature `new Map([props])`

Creates a new instance of can.Map.

@param {Object} [props] Properties and values to seed the Observe with.
@return {can.Map} An instance of `can.Map` with the properties from _props_.

@signature `Map.extend([name,] [staticProperties,] instanceProperties)`

Creates a new extended constructor function.


@body

## Use

Watch this video to see an example of creating an ATM machine using can.Map:

<iframe width="662" height="372" src="https://www.youtube.com/embed/QP9mHyxZNiI" frameborder="0" allowfullscreen></iframe>


`Map` provides a way for you to listen for and keep track of changes
to objects. When you use the getters and setters provided by `Map`,
events are fired that you can react to. `Map` also has support for
working with deep properties. Observable arrays are also available with
`[can-list]`, which is based on `Map`.

## Working with Observes

To create an Observe, use `new Map([props])`. This will return a
copy of `props` that emits events when its properties are changed with
`[can-map.prototype.attr attr]`.

You can read the values of properties on Observes directly, but you should
never set them directly. You can also read property values using `attr`.


    var aName = {a: 'Alexis'},
        map = new can.Map(aName);

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


Find out more about manipulating properties of a map under
[can.Map.prototype.attr attr] and [can.Map.prototype.removeAttr removeAttr].

## Listening to changes

The real power of maps comes from being able to react to
properties being added, set, and removed. Maps emit events when
properties are changed that you can bind to.

`Map` has two types of events that fire due to changes on a map:
- the _change_ event fires on every change to a map.
- an event named after the property name fires on every change to that property.


    var o = new Map({});
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


For more detail on how to use these events, see [can.Map.prototype.bind bind] and
[can.Map.prototype.unbind unbind]. There is also a plugin called [can.Map.delegate]
that makes binding to specific types of events easier:


    var o = new Map({});
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

## Object.prototype.watch

Due to a method available on the base Object prototype called "watch", refrain from
using properties with the same name on Gecko based browsers as there will be a
collision. [Source](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/watch)

@function can-map.prototype.attr attr
@parent can-map.prototype 2

@description Get or set properties on a Map.

@signature `map.attr()`

Gets a collection of all the properties in this `Map`.

@return {Object} an object with all the properties in this `Map`.

@signature `map.attr(key)`

Reads a property from this `Map`.

@param {String} key the property to read
@return {*} the value assigned to _key_.

@signature `map.attr(key, value)`

Assigns _value_ to a property on this `Map` called _key_.

@param {String} key the property to set
@param {*} the value to assign to _key_.
@return {can.Map} this Map, for chaining

@signature `map.attr(obj[, removeOthers])`

Assigns each value in _obj_ to a property on this `Map` named after the
corresponding key in _obj_, effectively merging _obj_ into the Map.

@param {Object} obj a collection of key-value pairs to set.
If any properties already exist on the `Map`, they will be overwritten.

@param {bool} [removeOthers=false] whether to remove keys not present in _obj_.
To remove keys without setting other keys, use `[can.Map::removeAttr removeAttr]`.

@return {can.Map} this Map, for chaining

@body
`attr` gets or sets properties on the `Map` it's called on. Here's a tour through
how all of its forms work:


    var people = new Map({});

    // set a property:
    people.attr('a', 'Alex');

    // get a property:
    people.attr('a'); // 'Alex'

    // set and merge multiple properties:
    people.attr({
        a: 'Alice',
        b: 'Bob'
    });

    // get all properties:
    people.attr(); // {a: 'Alice', b: 'Bob'}

    // set properties while removing others:
    people.attr({
        b: 'Bill',
        e: 'Eve'
    }, true);

    people.attr(); // {b: 'Bill', e: 'Eve'}


## Deep properties

`attr` can also set and read deep properties. All you have to do is specify
the property name as you normally would if you weren't using `attr`.


    var people = new Map({names: {}});

    // set a property:
    people.attr('names.a', 'Alice');

    // get a property:
    people.attr('names.a'); // 'Alice'
    people.names.attr('a'); // 'Alice'

    // get all properties:
    people.attr(); // {names: {a: 'Alice'}}


Objects that are added to Observes become Observes themselves behind the scenes,
so changes to deep properties fire events at each level, and you can bind at any
level. As this example shows, all the same events are fired no matter what level
you call `attr` at:


    var people = new Map({names: {}});

    people.bind('change', function(ev, attr, how, newVal, oldVal) {
        console.log('people change: ' + attr + ', ' + how + ', ' + newVal + ', ' + oldVal);
    });

    people.names.bind('change', function(ev, attr, how, newVal, oldVal) {
        console.log('people.names change' + attr + ', ' + how + ', ' + newVal + ', ' + oldVal);
    });

    people.bind('names', function(ev, newVal, oldVal) {
        console.log('people names: ' + newVal + ', ' + oldVal);
    });

    people.names.bind('a', function(ev, newVal, oldVal) {
        console.log('people.names a: ' + newVal + ', ' + oldVal);
    });

    people.bind('names.a', function(ev, newVal, oldVal) {
        console.log('people names.a: ' + newVal + ', ' + oldVal);
    });

    people.attr('names.a', 'Alice'); // people change: names.a, add, Alice, undefined
                                  // people.names change: a, add, Alice, undefined
                                  // people.names a: Alice, undefined
                                  // people names.a: Alice, undefined

    people.names.attr('b', 'Bob');   // people change: names.b, add, Bob, undefined
                                  // people.names change: b, add, Bob, undefined
                                  // people.names b: Bob, undefined
                                  // people names.b: Bob, undefined


## Properties with dots in their name

As shown above, `attr` enables reading and setting deep properties so special care must be taken when property names include dots (`.`).  When setting a property containing dots, `attr` looks for an existing container object in the path.  If found, it will repeat the process for the child Map and the rest of the path; if not, any remaining path (dots included) becomes the property key to be set on the container.

```
var person = new Map({
	'first.name': 'Alice',
	'second': {
		'name': 'Amy',
		'old.name': 'Andrea'
	}
});

person.attr('first.name', 'Bob'); // 'Alice' -> 'Bob'
person.attr('second.name', 'Bob'); // 'Amy' -> 'Bob'
person.attr({'second.old.name': 'Bob'}); // 'Andrea' -> 'Bob'
person.attr({'second.better.name': 'Bob'}); // 'better.name' is set to 'Bob' on `person.second`
person.attr({'third.name': 'Bob'}); // 'third.name' is set to 'Bob' on `person`

```

A property `foo` and a property `foo.bar` will be in conflict with each other; when reading `'foo.bar'` with `attr`, the full string `foo.bar` takes precedence, but when writing, `foo` takes precedence and `foo.bar` cannot be written to.  For this reason, it is inadvisable to set properties that create these conflicts.

```
var person = new Map({
	'first.name': 'Alice',
	'first': {
		'name': 'Amy'
	}
});

person.attr('first.name'); // 'Alice'
person.attr('first').attr('name'); // 'Amy'

person.attr('first.name', 'Bob'); // 'Amy' -> 'Bob'
person.attr('first').attr('name'); // 'Amy' -> 'Bob'

```



## See also

For information on the events that are fired on property changes and how
to listen for those events, see [can.Map.prototype.bind bind].

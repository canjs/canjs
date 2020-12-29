@function can-simple-map.prototype.attr attr
@parent can-simple-map.prototype

@description Get or set properties on a SimpleMap.

@signature `map.attr(key)`

Reads a property from this `SimpleMap`.

@param {String} key The property to read.
@return {*} The value assigned to _key_.

@signature `map.attr(key, value)`

Assigns _value_ to a property on this `SimpleMap` called _key_.

@param {String} key The property to set.
@param {*} value The value to assign to _key_.
@return {can.SimpleMap} This SimpleMap, for chaining.

@signature `map.attr(obj)`

Assigns each value in _obj_ to a property on this `SimpleMap` named after the
corresponding key in _obj_, effectively merging _obj_ into the SimpleMap.

@param {Object} obj A collection of key-value pairs to set.
If any properties already exist on the `SimpleMap`, they will be overwritten.

@return {can.SimpleMap} this SimpleMap, for chaining

@body

## Use

`attr` gets or sets properties on the `SimpleMap` it's called on. Here's a tour through how all of its forms work:

```
var map = new SimpleMap({ age: 29 });

// get a property:
foo.attr('age'); // 29

// set a property:
foo.attr('age', 30);
foo.attr('age'); // 30

// set and merge multiple properties:
foo.attr({
	first: 'Kevin',
	last: 'Phillips'
});
foo.attr('age'); // 30
foo.attr('first'); // 'Kevin'
foo.attr('last'); // 'Phillips'
```

When properties are changed using attr, the `SimpleMap` will emit events. Events can be listened to using [can-event.on] or [can-event.bind].

```
var map = new SimpleMap({ age: 29 });

map.on('age', function(ev, newVal, oldVal) {
	newVal; // 30
	oldVal; // 29
});

map.attr('age', 30);
```

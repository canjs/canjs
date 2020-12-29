@module {constructor} can-simple-map
@parent can-observables
@collection can-infrastructure
@group can-simple-map.prototype 0 prototype
@inherits can-construct
@description A performant live-bound map.
@package ../package.json

@signature `new SimpleMap([props])`

Creates a new instance of can.SimpleMap.

@param {Object} [props] Properties and values to seed the Observe with.
@return {can.SimpleMap} An instance of `can.SimpleMap` with the properties from _props_.

@signature `SimpleMap.extend([name,] [staticProperties,] instanceProperties)`

Creates a new extended constructor function.

@body

## Use

`SimpleMap` provides a way to create an Observable whose properties can be changed using [can-simple-map.prototype.attr attr].

```
var map = new SimpleMap({ age: 29 });

map.on('age', function(ev, newVal, oldVal) {
	newVal; // 30
	oldVal; // 29
});

foo.attr('age'); // 29

map.attr('age', 30);
```

@function can-event-queue/map/map.on on
@parent can-event-queue/map/map

@description A shorthand method for listening to event.

@signature `obj.on( event, handler [, queue] )`

Listen to when `obj` dispatches an event, a [can-reflect/observe.onKeyValue]
change, or a [can-reflect/observe.onValue] change in that order.

`.on` will use the `.addEventListener`
method on the `obj` first, before looking for the [can-symbol/symbols/onKeyValue]
and then [can-symbol/symbols/onValue] symbol.

@param {String} eventName
@param {Function} handler
@param {String} [queue]
@return {Any} The object `on` was called on.

@body

## Use

`on` binds event handlers to property changes on an observable type. When you change
a property value, a _property name_ event is fired, allowing other parts
of your application to map the changes to the object.

This event is useful for noticing changes to a specific property. `.on` works
almost identically with  [can-define], [can-simple-map], and [can-observe].

```js
const o = new DefineMap( { name: "Justin" } );
o.on( "name", function( ev, newVal, oldVal ) {
	console.log( "The value of a changed." );
} );
```

The parameters of the event handler for the _property name_ event are:

- _ev_ The event object.
- _newVal_ The value of the property after the change. `
- _oldVal_ The value of the property before the change.

Here is a concrete tour through the _property name_ event handler's arguments:

    var o = new DefineMap({a: undefined, b: undefined});
    o.on('a', function(ev, newVal, oldVal) {
        console.log(newVal + ', ' + oldVal);
    });

    o.a = 'Alexis';       // Alexis, undefined
    o.set('a', 'Adam');   // Adam, Alexis
    o.set({
        'a': 'Alice',     // Alice, Adam
        'b': 'Bob'
    });
    o.a = undefined;      // undefined, Alice

@typedef {Object} can-define.types.valueOptions ValueOptions
@parent can-define.typedefs

@option {function(Any)} resolve(value) Sets the value of this property as `value`. During a [can-queues.batch.start batch],
the last value passed to `resolve` will be used as the value.

@option {function(Any,String,Fuction,String)} listenTo(bindTarget,event,handler,queue) A function that sets up a binding that
will be automatically torn-down when the `value` property is unbound.  This `listenTo` method is very similar to the [can-event-queue/map/map.listenTo] method available on [can-define/map/map DefineMap].  It differs only that it:

- defaults bindings within the [can-queues.notifyQueue].
- calls handlers with `this` as the instance.

Examples:

```js
// Binds to the map's `name` event:
listenTo( "name", handler );

// Binds to the todos `length` event:
listenTo( todos, "length", handler );

// Binds to the `todos` `length` event in the mutate queue:
listenTo( todos, "length", handler, "mutate" );

// Binds to an `onValue` emitter:
listenTo( observable, handler ); //
```

@param {function(Any,String,Fuction,String)} stopListening(bindTarget,event,handler,queue) A function that removes bindings
registered by the `listenTo` argument.  This `stopListening` method is very similar to the [can-event-queue/map/map.stopListening] method available on [can-define/map/map DefineMap].  It differs only that it:

- defaults to unbinding within the [can-queues.notifyQueue].

Examples:

```js
// Unbind all handlers bound using `listenTo`:
stopListening();

// Unbind handlers to the map's `name` event:
stopListening( "name" );

// Unbind a specific handler on the map's `name` event
// registered in the "notify" queue.
stopListening( "name", handler );

// Unbind all handlers bound to `todos` using `listenTo`:
stopListening( todos );

// Unbind all `length` handlers bound to `todos`
// using `listenTo`:
stopListening( todos, "length" );

// Unbind all handlers to an `onValue` emitter:
stopListening( observable );
```

@option {can-simple-observable} lastSet An observable value that gets set when this
property is set.  You can read its value or listen to when its value changes to
derive the property value.  The following makes `property` behave like a
normal object property that can be get or set:

```js
{
	property: {
		value: function( prop ) {

			// Make sure the initial value is whatever was set.
			resolve( prop.lastSet.get() );

			// When the property is set, update the read value.
			listenTo( prop.lastSet, resolve );
		}
	}
}
```

@function can-queues.enqueueByQueue enqueueByQueue
@parent can-queues/methods

@description Enqueue a multiple tasks within multiple queues within a batch.

@signature `queues.enqueueByQueue( fnByQueue [, context [, args [, makeMeta [, reasonLog ]]]] )`

`enqueueByQueue` is a helper that enqueues multiple tasks within queues at one time.  It assumes
all tasks share the same `context` and `arguments`.

```js
const ran = [];

canQueues.enqueueByQueue( {
	"notify": [ function notify() {
		ran.push( "notify" );
	} ],
	"derive": [
		function derive1() {
			ran.push( "derive1" );
		},
		function derive2() {
			ran.push( "derive2" );
		}
	],
	"domUI": [ function domUI() {
		ran.push( "domUI" );
	} ],
	"mutate": [ function domUI() {
		ran.push( "mutate" );
	} ]
} );

console.log( ran ); // -> ["notify", "derive1", "derive2", "domUI", "mutate"]
```

`enqueueByQueue` uses [can-queues.batch.start] and [can-queues.batch.stop] to flush tasks only after
all tasks have been enqueued.

  @param {Object} fnByQueue An object with keys of "notify", "derive", "domUI", and/or "mutate" that have Arrays of Functions (`task`s) as a value.
  @param {Object} [context] The `this` context to call each `task` fn with.
  @param {Array} [args] The arguments to `apply` to each task fn.
  @param {function(Task,Any,Array)} [makeMeta(task,context,args)] A function that takes ( `task`, `context`, `args` ) and returns an Object that will be the `meta` argument when the task is called.  If no `makeMeta` is provided an empty
  meta object will be created.
  @param {Array} [reasonLog] A property attached to the `meta` object as `meta.reasonLog` before `task` is called.

@body

## Use

`enqueueByQueue` together with [can-key-tree] is used by many modules within CanJS to dispatch event handlers in their requested queues.  [can-key-tree] is used to organize event handlers by `key` and `queue` as follows:

```js
const observable = {
	handlers: new KeyTree( [ Object, Object, Array ] ),
	[ canSymbol.for( "can.onKeyValue" ) ]: function( key, handler, queue ) {
		this.handlers.add( [ key, queue || "mutate", handler ] );
	},
	[ canSymbol.for( "can.offKeyValue" ) ]: function( key, handler, queue ) {
		this.handlers.delete( [ key, queue || "mutate", handler ] );
	}

	// ...
};
```

When a change happens to one of the keys, `enqueueByQueue` is useful for enqueueing those event handlers:

```js
const observable = {

	// ...
	dispatch: function( key, newVal, oldVal ) {
		const fnByQueue = this.handlers.getNode( [ key ] );
		queues.enqueueByQueue( fnByQueue, this, [ newVal, oldVal ], null

			//!steal-remove-start
			/* jshint laxcomma: true */
			, [ canReflect.getName( this ) + "'s", key, "changed to", newVal ],
			/* jshint laxcomma: false */
			//!steal-remove-end
		);
	}
};
```

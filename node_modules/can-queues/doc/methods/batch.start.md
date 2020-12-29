@function can-queues.batch.start batch.start
@parent can-queues/methods

@description Begin collecting tasks before executing them.

@signature `queues.batch.start()`

`batch.start` and [can-queues.batch.stop] are used to enqueue many tasks without immediately
flushing them. Batching tasks can help improve performance.  Read on below for more information.

`batch.start` increments an internal `batchStartCounter`.  [can-queues.batch.stop] decrements
it. Once the counter is 0, the [can-queues.notifyQueue] and subsequent queues will be flushed.

```js
queues.batch.start();
queues.batch.start();
queues.notifyQueue( console.log, console, [ "notify" ] );
queues.deriveQueue( console.log, console, [ "derive" ] );
queues.mutateQueue( console.log, console, [ "mutate" ] );
queues.batch.stop();
queues.batch.stop();

// Logs:
//   notify
//   derive
//   mutate
```

@body

## Use

By enqueueing many tasks at once, it enables observables like [can-observation] and [can-compute]
to update their values a single time for multiple changes.  For example, by wrapping the changes
to the list with `batch.start` and `batch.stop` the `completeCount` property of the list only updates
once:

```js
class TodoList extends observe.Array {
	get completeCount() {
		return this.filter( ( todo ) => {
			return todo.complete === true;
		} ).length;
	}
	completeAll() {
		queues.batch.start();
		this.forEach( ( todo ) => {
			todo.complete = true;
		} );
		queues.batch.stop();
	}
}
const todos = new TodoList( [ { complete: false, complete: false } ] );

todos.on( "completeCount", function( completeCount ) {
	console.log( "completeCount is ", completeCount );
} );

todos.completeCount; //-> 0
todos.completeAll();

// Logs:
//   completeCount is 2
```

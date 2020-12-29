@function can-queues.PriorityQueue.prototype.isEnqueued isEnqueued
@parent can-queues.PriorityQueue.prototype


@description Return if a task is in the queue.

@signature `queue.isEnqueued(fn)`

Returns `boolean` true/false if the task `fn` is in the queue.

Sometimes, it's necessary for a task to be immediately invoked. For example, an observation
might depend on another observation currently in the queue. If this happens, the queued task can
be run immediately.

```js
const task = function task() {
	console.log( "taskA" );
};

priorityQueue.enqueue( task, null, [], { priority: 5 } );
priorityQueue.isEnqueued( task ); //-> true
```

  @param {function} fn The function to to test if it is in the queue.
  @return {Boolean} Return `true` or `false` if the task `fn` is in the queue.

@function can-queues.PriorityQueue.prototype.flushQueuedTask flushQueuedTask
@parent can-queues.PriorityQueue.prototype

@description Preemptively run an enqueued task.

@signature `queue.flushQueuedTask(fn)`

Sometimes, it's necessary for a task to be immediately invoked. For example, an observation
might depend on another observation currently in the queue. If this happens, the queued task can
be run immediately.

```js
const task = function task() {
	console.log( "taskA" );
};

priorityQueue.enqueue( task, null, [], { priority: 5 } );
priorityQueue.enqueue( function() {
	console.log( "taskB - start" );
	priorityQueue.flushQueuedTask( task );
	console.log( "taskB - end" );
}, null, [], { priority: 0 } );

// Logs:
//   taskB - start
//   taskA
//   taskB - end
```

  @param {function} fn The function to flush.

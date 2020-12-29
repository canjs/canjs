@function can-queues.CompletionQueue.prototype.flush flush
@parent can-queues.CompletionQueue.prototype

@description Runs tasks in the task queue.

@signature `queue.flush()`


Flushes tasks currently in the task queue.  When complete, calls the `onComplete`
callback.

If a CompletionQueue is currently flushing tasks, it prevents
additional calls to flush from running tasks.  This makes it so each task function
finishes running before others are started as demonstrated below:

 ```js
queue.enqueue( function() {
	console.log( "task 1 - start" );
	queue.flush();
	console.log( "task 1 - end" );
} );

queue.enqueue( function() {
	console.log( "task 2 - start" );
	console.log( "task 2 - end" );
} );

queue.flush();

// console.logs
//    task 1 - start
//    task 1 - end
//    task 2 - start
//    task 2 - end
```

 If the queue's tasks are currently
 being flushed, new tasks added will be run without needing to call `.flush()` again.

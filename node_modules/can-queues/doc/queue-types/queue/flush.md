@function can-queues.Queue.prototype.flush flush
@parent can-queues.Queue.prototype

@description Runs all tasks in the task queue.

@signature `queue.flush()`

Flushes tasks currently in the task queue.  When complete, calls the `onComplete`
callback.

 ```js
queue.enqueue( console.log, console, [ "say hi" ], {} );
queue.flush();

// console.logs "say hi"
```

 If the queue's tasks are currently
 being flushed, new tasks added will be run without needing to call `.flush()` again.

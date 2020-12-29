@function can-queues.Queue.prototype.enqueue enqueue
@parent can-queues.Queue.prototype

@description Enqueue a function to be called.

@signature `queue.enqueue(fn, context, args, meta)`

Enqueues the `fn` function to be called with `context` as `this` and `args` as its arguments.

```js
queue.enqueue( console.log, console, [ "say hi" ], {} );
queue.flush();

// console.logs "say hi"
```

Tasks are enqueued at the end of the queue.  If the queue's tasks are currently
being flushed, new tasks added will be run without needing to call `.flush`.

When the first task is enqueued, the `onFirstTask` callback is called.

@param {function} fn The function to be called.
@param {Any} context The `this` the function is called with.
@param {Array|Arguments} args The arguments the function is called with.
@param {Object|undefined} meta Additional information useful for debugging. [can-queues.log] will use:
  - __log__ `{Array}`: An array of values that will be passed to `console.log` when this task is enqueued or
    flushed.  By default it is `[fn.name]`.
  - __reasonLog__ `{Array}`: An array of values that could be passed to `console.log` representing why this
  task was scheduled.

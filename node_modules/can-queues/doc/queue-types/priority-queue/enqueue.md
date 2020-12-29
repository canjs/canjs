@function can-queues.PriorityQueue.prototype.enqueue enqueue
@parent can-queues.PriorityQueue.prototype

@description Enqueue a function to be called.

@signature `queue.enqueue(fn, context, args, meta)`

Enqueues the `fn` function to be called with `context` as `this` and `args` as its arguments.

```js
priorityQueue.enqueue( console.log, console, [ "world" ], { priority: 5 } );
priorityQueue.enqueue( console.log, console, [ "hello" ], { priority: 1 } );
priorityQueue.enqueue( console.log, console, [ "!" ], { priority: 7 } );

priorityQueue.flush();

// console.logs "hello"
// console.logs "world"
// console.logs "!"
```

A function can only be enqueued once.

  @param {function} fn The function to be called.
  @param {Any} context The `this` the function is called with.
  @param {Array|Arguments} args The arguments the function is called with.
  @param {Object|undefined} meta Meta information about the task.  This is where `priority` should be
    provided. It defaults to `0` (highest priority) if a priority is not given.

    `meta` also should include additional information useful for debugging. [can-queues.log] will use:
    - __log__ `{Array}`: An array of values that will be passed to `console.log` when this task is enqueued or
      flushed.  By default it is `[fn.name]`.
    - __reasonLog__ `{Array}`: An array of values that could be passed to `console.log` representing why this
    task was scheduled.

@function can-queues.batch.stop batch.stop
@parent can-queues/methods


@description Stop collecting tasks and flush the queues.

@signature `queues.batch.stop()`

[can-queues.batch.start] and [can-queues.batch.stop] are used to enqueue many tasks without immediately
flushing them. Batching tasks can help improve performance.  Read [can-queues.batch.start] for more information.

[can-queues.batch.start] increments an internal `batchStartCounter`.  [can-queues.batch.stop] decrements
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

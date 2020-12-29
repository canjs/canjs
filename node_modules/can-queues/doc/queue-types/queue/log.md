@function can-queues.Queue.prototype.log log
@parent can-queues.Queue.prototype

@description Logs the tasks

@signature `queue.log( [type] )`

 Logs tasks as they are being enqueued and flushed.

 The following:

 ```js
queue.log();
queue.enqueue( console.log, console, [ "say hi" ], {} );
queue.flush();
```

 Logs:

 <pre>
 enqueuing: log &#x25B6; { ... }
 running  : log &#x25B6; { ... }
 say hi</pre>

 @param {String|Boolean} [type=true] Specifies what to log.
  - `.log()` - Logs when tasks are enqueued and run.
  - `.log(false)` - Turn off logging.
  - `.log("flush")` - Log only flushing.
  - `.log("enqueue")` - Log on enqueuing.

@function can-queues.runAsTask runAsTask
@parent can-queues/methods

@description Return a function that when called, adds a task that can be logged by [can-queues.logStack].

@signature `queues.runAsTask( fn [, makeReasonLog] )`

  This is useful for debugging.

  ```js
  import {queues} from "can";

  var task = queues.runAsTask(function myTask(){
    queues.logStack()
  }, function(){
    return ["myTask called on", this, "with",arguments];
  });

  task();
  ```

  In production, `runAsTask` simply returns the `fn` argument.

  @param {function} fn A function that will be called by the returned function.
  @param {function} [makeReasonLog] A function that will be called with the same `this` and arguments that the returned
  function was called with.
  @return {function} A function that calls `fn`.

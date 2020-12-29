@module {function} can-queues.Queue Queue
@parent can-queues/types
@group can-queues.Queue.prototype prototype

@description A basic FIFO queue that you can `enqueue` tasks into and `flush` enqueued tasks.

@signature `new Queue(name [, callbacks])`

Creates a queue instance. 

@param {String} [name] The name of the queue used for logging.
@param {Object} [callbacks] Optional. An object containing callbacks `onFirstTask` and/or `onComplete`.
  - `onFirstTask` - is called when the first task is added to an empty queue
  - `onComplete` - is called when the queue is empty.
@return {Object} An instance of `Queue`.

@body

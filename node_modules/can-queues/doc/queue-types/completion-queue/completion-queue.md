@property {function} can-queues.CompletionQueue CompletionQueue
@parent can-queues/types
@inherits can-queues.Queue

@group can-queues.CompletionQueue.prototype prototype

@description A FIFO queue that runs each task to completion before the next task is started.

@signature `new CompletionQueue(name [, callbacks])`

Creates a completion queue instance.  `CompletionQueue` inherits from [can-queues.Queue]. It only differs
with its [can-queues.CompletionQueue.prototype.flush] method that prevents repeat `.flush` calls
from running tasks until the first `.flush` call is complete.

@param {String} [name] The name of the queue used for logging.
@param {Object} [callbacks] Optional. An object containing callbacks `onFirstTask` and/or `onComplete`.
  - `onFirstTask` - is called when the first task is added to an empty queue
  - `onComplete` - is called when the queue is empty.
@return {Object} An instance of `CompletionQueue`.

@module {function} can-queues.PriorityQueue PriorityQueue
@parent can-queues/types
@inherits can-queues.Queue
@group can-queues.PriorityQueue.prototype prototype

@description A queue that you can `enqueue` into (with priority) and `flush`.

@signature `new PriorityQueue(name [, callbacks])`

Creates a priority queue instance.

A PriorityQueue works like a [can-queues.CompletionQueue].  Except:

- PriorityQueues run tasks in order of their `meta.priority`.
- PriorityQueues only allows one instance of a given `fn` to be enqueued at one time.  


@param {String} [name] The name of the queue used for logging.
@param {Object} [callbacks] Optional. An object containing callbacks `onFirstTask` and/or `onComplete`.
  - `onFirstTask` - is called when the first task is added to an empty queue
  - `onComplete` - is called when the queue is empty.
@return {Object} An instance of `PriorityQueue`.

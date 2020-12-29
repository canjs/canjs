@property {can-queues.Queue} can-queues.notifyQueue notifyQueue
@parent can-queues/queues 0


A Queue used to tell objects that derive a value that they should be updated.

When this queue is emptied (`onComplete`), it calls `flush()` on the `deriveQueue`.

This queue will flush automatically every time an item is enqueued - unless it is in a batch.

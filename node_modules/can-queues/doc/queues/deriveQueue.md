@property {can-queues.PriorityQueue} can-queues.deriveQueue deriveQueue
@parent can-queues/queues 1


A PriorityQueue used to update values.

When this queue is emptied (`onComplete`), it calls `flush()` on the `domUIQueue`.

This queue is flushed automatically when `notifyQueue` is emptied.

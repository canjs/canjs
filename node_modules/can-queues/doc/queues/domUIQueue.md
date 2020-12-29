@property {can-queues.CompletionQueue} can-queues.domUIQueue domUIQueue
@parent can-queues/queues 2


A CompletionQueue used for updating the DOM or other UI after state has settled, but before user tasks.

When this queue is emptied (`onComplete`), it calls `flush()` on the `mutateQueue`.

This queue is flushed automatically when `deriveQueue` is emptied.

@property {can-queues.Queue} can-queues.mutateQueue mutateQueue
@parent can-queues/queues 3


A Queue used to register tasks that might update other values.

This queue is flushed automatically when `domUIQueue` is emptied.

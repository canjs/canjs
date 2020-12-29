"use strict";
var canDev = require( 'can-log/dev/dev' );
var Queue = require( './queue' );
var PriorityQueue = require( './priority-queue' );
var queueState = require( './queue-state' );
var CompletionQueue = require( "./completion-queue" );
var DomOrderQueue = require("./dom-order-queue");
var ns = require( "can-namespace" );

// How many `batch.start` - `batch.stop` calls have been made.
var batchStartCounter = 0;
// If a task was added since the last flush caused by `batch.stop`.
var addedTask = false;
// If we are flushing due to a `batch.stop`.
var isFlushing = false;

// Legacy values for the old batchNum.
var batchNum = 0;
var batchData;

// Used by `.enqueueByQueue` to know the property names that might be passed.
var queueNames = ["notify", "derive", "domUI", "dom","mutate"];
// Create all the queues so that when one is complete,
// the next queue is flushed.
var NOTIFY_QUEUE,
	DERIVE_QUEUE,
	DOM_UI_QUEUE,
	DOM_QUEUE,
	MUTATE_QUEUE;

// This is for immediate notification. This is where we teardown (remove childNodes)
// immediately.
NOTIFY_QUEUE = new Queue( "NOTIFY", {
	onComplete: function () {
		DERIVE_QUEUE.flush();
	},
	onFirstTask: function () {
		// Flush right away if we aren't in a batch.
		if ( !batchStartCounter ) {
			NOTIFY_QUEUE.flush();
		} else {
			addedTask = true;
		}
	}
});

// For observations not connected to the DOM
DERIVE_QUEUE = new PriorityQueue( "DERIVE", {
	onComplete: function () {
		DOM_QUEUE.flush();
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

// DOM_DERIVE comes next so that any prior derives have a chance
// to settle before the derives that actually affect the DOM
// are re-caculated.
// See the `Child bindings are called before the parent` can-stache test.
// All stache-related observables should update in DOM order.

// Observations that are given an element update their value here.
DOM_QUEUE = new DomOrderQueue( "DOM   " ,{
	onComplete: function () {
		DOM_UI_QUEUE.flush();
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

// The old DOM_UI queue ... we should seek to remove this.
DOM_UI_QUEUE = new CompletionQueue( "DOM_UI", {
	onComplete: function () {
		MUTATE_QUEUE.flush();
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

// Update
MUTATE_QUEUE = new Queue( "MUTATE", {
	onComplete: function () {
		queueState.lastTask = null;
		isFlushing = false;
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

var queues = {
	Queue: Queue,
	PriorityQueue: PriorityQueue,
	CompletionQueue: CompletionQueue,
	DomOrderQueue: DomOrderQueue,
	notifyQueue: NOTIFY_QUEUE,
	deriveQueue: DERIVE_QUEUE,
	domQueue: DOM_QUEUE,
	domUIQueue: DOM_UI_QUEUE,
	mutateQueue: MUTATE_QUEUE,
	batch: {
		start: function () {
			batchStartCounter++;
			if ( batchStartCounter === 1 ) {
				batchNum++;
				batchData = {number: batchNum};
			}
		},
		stop: function () {
			batchStartCounter--;
			if ( batchStartCounter === 0 ) {
				if ( addedTask ) {
					addedTask = false;
					isFlushing = true;
					NOTIFY_QUEUE.flush();
				}
			}
		},
		// Legacy method to return if we are between start and stop calls.
		isCollecting: function () {
			return batchStartCounter > 0;
		},
		// Legacy method provide a number for each batch.
		number: function () {
			return batchNum;
		},
		// Legacy method to provide batch information.
		data: function () {
			return batchData;
		}
	},
	runAsTask: function(fn, reasonLog){
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			return function(){
				queueState.lastTask = {
					fn: fn,
					context: this,
					args: arguments,
					meta: {
						reasonLog: typeof reasonLog === "function" ? reasonLog.apply(this, arguments): reasonLog,
						parentTask: queueState.lastTask,
						stack: {name: "RUN_AS"}
					}
				};
				var ret = fn.apply(this, arguments);
				queueState.lastTask = queueState.lastTask && queueState.lastTask.meta.parentTask;
				return ret;
			};
		}
		//!steal-remove-end
		return fn;
	},
	enqueueByQueue: function enqueueByQueue ( fnByQueue, context, args, makeMeta, reasonLog ) {
		if ( fnByQueue ) {
			queues.batch.start();
			// For each queue, check if there are tasks for it.
			queueNames.forEach( function ( queueName ) {
				var name = queueName + "Queue";
				var QUEUE = queues[name];
				var tasks = fnByQueue[queueName];
				if ( tasks !== undefined ) {
					// For each task function, setup the meta and enqueue it.
					tasks.forEach( function ( fn ) {
						var meta = makeMeta != null ? makeMeta( fn, context, args ) : {};
						meta.reasonLog = reasonLog;
						QUEUE.enqueue( fn, context, args, meta );
					});
				}
			});
			queues.batch.stop();
		}
	},
	lastTask: function(){
		return queueState.lastTask;
	},
	// Currently an internal method that provides the task stack.
	// Returns an array with the first task as the first item.
	stack: function (task) {
		var current = task || queueState.lastTask;
		var stack = [];
		while ( current ) {
			stack.unshift( current );
			// Queue.prototype._logEnqueue ensures
			// that the `parentTask` is always set.
			current = current.meta.parentTask;
		}
		return stack;
	},
	logStack: function (task) {
		var stack = this.stack(task);
		stack.forEach( function ( task, i ) {
			var meta = task.meta;
			if( i === 0 && meta && meta.reasonLog) {
				canDev.log.apply( canDev, meta.reasonLog);
			}
			var log = meta && meta.log ? meta.log : [task.fn.name, task];
			canDev.log.apply( canDev, [task.meta.stack.name + " ran task:"].concat( log ));
		});
	},
	// A method that is not used.  It should return the number of tasks
	// remaining, but doesn't seem to actually work.
	taskCount: function () {
		return NOTIFY_QUEUE.tasks.length + DERIVE_QUEUE.tasks.length + DOM_UI_QUEUE.tasks.length + MUTATE_QUEUE.tasks.length;
	},
	// A shortcut for flushign the notify queue.  `batch.start` and `batch.stop` should be
	// used instead.
	flush: function () {
		NOTIFY_QUEUE.flush();
	},
	log: function () {
		NOTIFY_QUEUE.log.apply( NOTIFY_QUEUE, arguments );
		DERIVE_QUEUE.log.apply( DERIVE_QUEUE, arguments );
		DOM_UI_QUEUE.log.apply( DOM_UI_QUEUE, arguments );
		DOM_QUEUE.log.apply( DOM_QUEUE, arguments );
		MUTATE_QUEUE.log.apply( MUTATE_QUEUE, arguments );
	}
};

if ( ns.queues ) {
	throw new Error( "You can't have two versions of can-queues, check your dependencies" );
} else {
	module.exports = ns.queues = queues;
}

"use strict";
var Queue = require( "./queue" );

var PriorityQueue = function () {
	Queue.apply( this, arguments );
	// A map of a task's function to the task for that function.
	// This is so we can prevent duplicate functions from being enqueued
	// and so `flushQueuedTask` can find the task and run it.
	this.taskMap = new Map();
	// An "array-of-arrays"-ish data structure that stores
	// each task organized by its priority.  Each object in this list
	// looks like `{tasks: [...], index: 0}` where:
	// - `tasks` - the tasks for a particular priority.
	// - `index` - the index of the task waiting to be prioritized.
	this.taskContainersByPriority = [];

	// The index within `taskContainersByPriority` of the first `taskContainer`
	// which has tasks that have not been run.
	this.curPriorityIndex = Infinity;
	// The index within `taskContainersByPriority` of the last `taskContainer`
	// which has tasks that have not been run.
	this.curPriorityMax = 0;

	this.isFlushing = false;

	// Manage the number of tasks remaining to keep
	// this lookup fast.
	this.tasksRemaining = 0;
};
PriorityQueue.prototype = Object.create( Queue.prototype );
PriorityQueue.prototype.constructor = PriorityQueue;

PriorityQueue.prototype.enqueue = function ( fn, context, args, meta ) {
	// Only allow the enqueing of a given function once.
	if ( !this.taskMap.has( fn ) ) {

		this.tasksRemaining++;

		var isFirst = this.taskContainersByPriority.length === 0;

		var task = {
			fn: fn,
			context: context,
			args: args,
			meta: meta || {}
		};

		var taskContainer = this.getTaskContainerAndUpdateRange( task );
		taskContainer.tasks.push( task );
		this.taskMap.set( fn, task );

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logEnqueue( task );
		}
		//!steal-remove-end

		if ( isFirst ) {
			this.callbacks.onFirstTask( this );
		}
	}
};

// Given a task, updates the queue's cursors so that `flush`
// will be able to run the task.
PriorityQueue.prototype.getTaskContainerAndUpdateRange = function ( task ) {
	var priority = task.meta.priority || 0;

	if ( priority < this.curPriorityIndex ) {
		this.curPriorityIndex = priority;
	}

	if ( priority > this.curPriorityMax ) {
		this.curPriorityMax = priority;
	}

	var tcByPriority = this.taskContainersByPriority;
	var taskContainer = tcByPriority[priority];
	if ( !taskContainer ) {
		taskContainer = tcByPriority[priority] = {tasks: [], index: 0};
	}
	return taskContainer;
};

PriorityQueue.prototype.flush = function () {
	// Only allow one task to run at a time.
	if ( this.isFlushing ) {
		return;
	}
	this.isFlushing = true;
	while ( true ) {
		// If the first prioritized taskContainer with tasks remaining
		// is before the last prioritized taskContainer ...
		if ( this.curPriorityIndex <= this.curPriorityMax ) {
			var taskContainer = this.taskContainersByPriority[this.curPriorityIndex];

			// If that task container actually has tasks remaining ...
			if ( taskContainer && ( taskContainer.tasks.length > taskContainer.index ) ) {

				// Run the task.
				var task = taskContainer.tasks[taskContainer.index++];
				//!steal-remove-start
				if(process.env.NODE_ENV !== 'production') {
					this._logFlush( task );
				}
				//!steal-remove-end
				this.tasksRemaining--;
				this.taskMap["delete"]( task.fn );
				task.fn.apply( task.context, task.args );

			} else {
				// Otherwise, move to the next taskContainer.
				this.curPriorityIndex++;
			}
		} else {
			// Otherwise, reset the state for the next `.flush()`.
			this.taskMap = new Map();
			this.curPriorityIndex = Infinity;
			this.curPriorityMax = 0;
			this.taskContainersByPriority = [];
			this.isFlushing = false;
			this.callbacks.onComplete( this );
			return;
		}
	}
};

PriorityQueue.prototype.isEnqueued = function ( fn ) {
	return this.taskMap.has( fn );
};

PriorityQueue.prototype.flushQueuedTask = function ( fn ) {
	var task = this.dequeue(fn);
	if(task) {
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}
		//!steal-remove-end
		task.fn.apply( task.context, task.args );
	}
};
PriorityQueue.prototype.dequeue = function(fn){
	var task = this.taskMap.get( fn );
	if ( task ) {
		var priority = task.meta.priority || 0;
		var taskContainer = this.taskContainersByPriority[priority];
		var index = taskContainer.tasks.indexOf( task, taskContainer.index );

		if ( index >= 0 ) {
			taskContainer.tasks.splice( index, 1 );
			this.tasksRemaining--;
			this.taskMap["delete"]( task.fn );
			return task;
		} else {
			console.warn("Task", fn, "has already run");
		}
	}
};

PriorityQueue.prototype.tasksRemainingCount = function () {
	return this.tasksRemaining;
};

module.exports = PriorityQueue;

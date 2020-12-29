"use strict";
var Queue = require( "./queue" );
var sortedIndexBy = require("./sorted-index-by");
var elementSort = require("./element-sort");
var canSymbol = require("can-symbol");

var canElementSymbol = canSymbol.for("can.element");

// TODO: call sortable queue and take how it should be sorted ...
function sortTasks(taskA, taskB){
	// taskA - in the document?
	// taskA - given a number?
	//
	return elementSort.sortOrder(taskA.meta.element, taskB.meta.element);
}

var DomOrderQueue = function () {
	Queue.apply( this, arguments );
	// A map of a task's function to the task for that function.
	// This is so we can prevent duplicate functions from being enqueued
	// and so `flushQueuedTask` can find the task and run it.
	this.taskMap = new Map();

	this.unsortable = [];
	this.isFlushing = false;
};
DomOrderQueue.prototype = Object.create( Queue.prototype );
DomOrderQueue.prototype.constructor = DomOrderQueue;

DomOrderQueue.prototype.enqueue = function ( fn, context, args, meta ) {
	var task;
	// Only allow the enqueing of a given function once.
	if ( !this.taskMap.has( fn ) ) {

		if(!meta) {
			meta = {};
		}
		if(!meta.element) {
			meta.element = fn[canElementSymbol];
		}

		task = {
			fn: fn,
			context: context,
			args: args,
			meta: meta
		};

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if( !meta.element ) {
				throw new Error("DomOrderQueue tasks must be created with a meta.element.");
			}
		}
		//!steal-remove-end

		this.taskMap.set( fn, task );

		var index = sortedIndexBy(sortTasks, this.tasks, task);

		this.tasks.splice(index, 0, task);

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logEnqueue( task );
		}
		//!steal-remove-end

		if ( this.tasks.length === 1 ) {
			this.callbacks.onFirstTask( this );
		}
	} else {
		// update the task with the new data
		// TODO: ideally this would key off the mutation instead of the function.
		// We could make it key off the element and function,  not just function.
		task = this.taskMap.get( fn );
		task.context = context;
		task.args = args;

		if(!meta) {
			meta = {};
		}

		if(!meta.element) {
			meta.element = fn[canElementSymbol];
		}

		task.meta = meta;

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logEnqueue( task );
		}
		//!steal-remove-end
	}
};


DomOrderQueue.prototype.flush = function () {
	// Only allow one task to run at a time.
	if ( this.isFlushing ) {
		return;
	}
	this.isFlushing = true;

	while ( this.tasks.length ) {
		var task = this.tasks.shift();
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}
		//!steal-remove-end
		this.taskMap["delete"]( task.fn );
		task.fn.apply( task.context, task.args );
	}
	this.isFlushing = false;
	this.callbacks.onComplete( this );
};

DomOrderQueue.prototype.isEnqueued = function ( fn ) {
	return this.taskMap.has( fn );
};

DomOrderQueue.prototype.flushQueuedTask = function ( fn ) {
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
DomOrderQueue.prototype.dequeue = function(fn){
	var task = this.taskMap.get( fn );
	if ( task ) {

		var index = this.tasks.indexOf(task);

		if ( index >= 0 ) {
			this.tasks.splice( index, 1 );
			this.taskMap["delete"]( task.fn );
			return task;
		} else {
			console.warn("Task", fn, "has already run");
		}
	}
};

DomOrderQueue.prototype.tasksRemainingCount = function () {
	return this.tasks.length;
};

module.exports = DomOrderQueue;

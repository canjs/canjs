"use strict";
var queueState = require("./queue-state");
var canDev = require('can-log/dev/dev');
var assign = require("can-assign");

function noOperation () {}

var Queue = function ( name, callbacks ) {
	this.callbacks = assign( {
		onFirstTask: noOperation,
		// The default behavior is to clear the lastTask state.
		// This is overwritten by `can-queues.js`.
		onComplete: function () {
			queueState.lastTask = null;
		}
	}, callbacks || {});
	this.name = name;
	this.index = 0;
	this.tasks = [];
	this._log = false;
};

Queue.prototype.constructor = Queue;

Queue.noop = noOperation;

Queue.prototype.enqueue = function ( fn, context, args, meta ) {
	var len = this.tasks.push({
		fn: fn,
		context: context,
		args: args,
		meta: meta || {}
	});
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		this._logEnqueue( this.tasks[len - 1] );
	}
	//!steal-remove-end

	if ( len === 1 ) {
		this.callbacks.onFirstTask( this );
	}
};

Queue.prototype.flush = function () {
	while ( this.index < this.tasks.length ) {
		var task = this.tasks[this.index++];
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}

		//!steal-remove-end
		task.fn.apply( task.context, task.args );
	}
	this.index = 0;
	this.tasks = [];
	this.callbacks.onComplete( this );
};

Queue.prototype.log = function () {
	this._log = arguments.length ? arguments[0] : true;
};

//The following are removed in production.
//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	Queue.prototype._logEnqueue = function ( task ) {
		// For debugging, set the parentTask to the last
		// run task.
		task.meta.parentTask = queueState.lastTask;
		// Also let the task know which stack it was run within.
		task.meta.stack = this;

		if ( this._log === true || this._log === "enqueue" ) {
			var log = task.meta.log ? task.meta.log.concat( task ) : [task.fn.name, task];
			canDev.log.apply( canDev, [this.name + " enqueuing:"].concat( log ));
		}
	};
	// `_logFlush` MUST be called by all queues prior to flushing in
	// development.
	Queue.prototype._logFlush = function ( task ) {
		if ( this._log === true || this._log === "flush" ) {
			var log = task.meta.log ? task.meta.log.concat( task ) : [task.fn.name, task];
			canDev.log.apply( canDev, [this.name + " running  :"].concat( log ));
		}
		// Update the state to mark this as the task that was run last.
		queueState.lastTask = task;
	};
}
//!steal-remove-end

module.exports = Queue;

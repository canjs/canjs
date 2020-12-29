"use strict";
var SimpleObservable = require("../can-simple-observable");
var Observation = require("can-observation");
var queues = require("can-queues");
var SettableObservable = require("../settable/settable");
var canReflect = require("can-reflect");
var ObservationRecorder = require("can-observation-recorder");
var valueEventBindings = require("can-event-queue/value/value");

// This is an observable that is like `settable`, but passed a `resolve`
// function that can resolve the value of this observable late.
function AsyncObservable(fn, context, initialValue) {
	this.resolve = this.resolve.bind(this);
	this.lastSetValue = new SimpleObservable(initialValue);
	this.handler = this.handler.bind(this);

	function observe() {
		this.resolveCalled = false;

		// set inGetter flag to avoid calling `resolve` redundantly if it is called
		// synchronously in the getter
		this.inGetter = true;
		var newVal = fn.call(
			context,
			this.lastSetValue.get(),
			this.bound === true ? this.resolve : undefined
		);
		this.inGetter = false;

		// if the getter returned a value, resolve with the value
		if (newVal !== undefined) {
			this.resolve(newVal);
		}
		// otherwise, if `resolve` was called synchronously in the getter,
		// resolve with the value passed to `resolve`
		else if (this.resolveCalled) {
			this.resolve(this._value);
		}

		// if bound, the handlers will be called by `resolve`
		// returning here would cause a duplicate event
		if (this.bound !== true) {
			return newVal;
		}
	}

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		canReflect.assignSymbols(this, {
			"can.getName": function() {
				return (
					canReflect.getName(this.constructor) +
					"<" +
					canReflect.getName(fn) +
					">"
				);
			}
		});
		Object.defineProperty(this.handler, "name", {
			value: canReflect.getName(this) + ".handler"
		});
		Object.defineProperty(observe, "name", {
			value: canReflect.getName(fn) + "::" + canReflect.getName(this.constructor)
		});
	}
	//!steal-remove-end

	this.observation = new Observation(observe, this);
}
AsyncObservable.prototype = Object.create(SettableObservable.prototype);
AsyncObservable.prototype.constructor = AsyncObservable;

AsyncObservable.prototype.handler = function(newVal) {
	if (newVal !== undefined) {
		SettableObservable.prototype.handler.apply(this, arguments);
	}
};

var peek = ObservationRecorder.ignore(canReflect.getValue.bind(canReflect));
AsyncObservable.prototype.activate = function() {
	canReflect.onValue(this.observation, this.handler, "notify");
	if (!this.resolveCalled) {
		this._value = peek(this.observation);
	}
};

AsyncObservable.prototype.resolve = function resolve(newVal) {
	this.resolveCalled = true;
	var old = this._value;
	this._value = newVal;

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		if (typeof this._log === "function") {
			this._log(old, newVal);
		}
	}
	//!steal-remove-end

	// if resolve was called synchronously from the getter, do not enqueue changes
	// the observation will handle calling resolve again if required
	if (!this.inGetter) {
		var queuesArgs = [
		this.handlers.getNode([]),
			this,
			[newVal, old],
			null
		];
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			queuesArgs = [
				this.handlers.getNode([]),
				this,
				[newVal, old],
				null
				/* jshint laxcomma: true */
				, [canReflect.getName(this), "resolved with", newVal]
				/* jshint laxcomma: false */
			];
		}
		//!steal-remove-end
		// adds callback handlers to be called w/i their respective queue.
		queues.enqueueByQueue.apply(queues, queuesArgs);
	}
};

module.exports = AsyncObservable;

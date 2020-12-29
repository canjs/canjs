"use strict";
/* global require */
// # can-observation
var namespace = require('can-namespace');
var canReflect = require('can-reflect');
var queues = require("can-queues");
var ObservationRecorder = require("can-observation-recorder");

var canSymbol = require("can-symbol");
var dev = require("can-log/dev/dev");
var valueEventBindings = require("can-event-queue/value/value");

var recorderHelpers = require("./recorder-dependency-helpers");
var temporarilyBind = require("./temporarily-bind");

var dispatchSymbol = canSymbol.for("can.dispatch");
var getChangesSymbol = canSymbol.for("can.getChangesDependencyRecord");
var getValueDependenciesSymbol = canSymbol.for("can.getValueDependencies");

// ## Observation constructor
function Observation(func, context, options){
	this.deriveQueue = queues.deriveQueue;

	this.func = func;
	this.context = context;
	this.options = options || {priority: 0, isObservable: true};
	// A flag if we are bound or not
	this.bound = false;

	// Set _value to undefined so can-view-scope & can-compute can check for it
	this._value = undefined;

	// These properties will manage what our new and old dependencies are.
	this.newDependencies = ObservationRecorder.makeDependenciesRecord();
	this.oldDependencies = null;

	// Make functions we need to pass around and maintain `this`.
	var self = this;
	this.onDependencyChange = function(newVal){
		self.dependencyChange(this, newVal);
	};
	this.update = this.update.bind(this);


	// Add debugging names.
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		this.onDependencyChange[getChangesSymbol] = function getChanges() {
			var s = new Set();
			s.add(self);
			return {
				valueDependencies: s
			};
		};
		Object.defineProperty(this.onDependencyChange, "name", {
			value: canReflect.getName(this) + ".onDependencyChange",
		});
		Object.defineProperty(this.update, "name", {
			value: canReflect.getName(this) + ".update",
		});
		this._name = canReflect.getName(this); // cached for performance
	}
	//!steal-remove-end
}

// ## Observation prototype methods

// Mixin value event bindings. This is where the following are added:
// - `.handlers` which call `onBound` and `onUnbound`
// - `.on` / `.off`
// - `can.onValue` `can.offValue`
// - `can.getWhatIChange`
valueEventBindings(Observation.prototype);

canReflect.assign(Observation.prototype, {
	// Starts observing changes and adds event listeners.
	onBound: function(){
		this.bound = true;

		// Store the old dependencies
		this.oldDependencies = this.newDependencies;
		// Start recording dependencies.
		ObservationRecorder.start(this._name);
		// Call the observation's function and update the new value.
		this._value = this.func.call(this.context);
		// Get the new dependencies.
		this.newDependencies = ObservationRecorder.stop();

		// Diff and update the bindings. On change, everything will call
		// `this.onDependencyChange`, which calls `this.dependencyChange`.
		recorderHelpers.updateObservations(this);
	},
	// This is called when any of the dependencies change.
	// It queues up an update in the `deriveQueue` to be run after all source
	// observables have had time to notify all observables that "derive" their value.
	dependencyChange: function(context, args){
		if(this.bound === true) {
			var queuesArgs = [];
			queuesArgs = [
				this.update,
				this,
				[],
				{
					priority: this.options.priority,
					element: this.options.element
				}
			];
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				queuesArgs = [
					this.update,
					this,
					[],
					{
						priority: this.options.priority,
						element: this.options.element
						/* jshint laxcomma: true */
						, log: [ canReflect.getName(this.update) ]
						/* jshint laxcomma: false */
					}
					/* jshint laxcomma: true */
					, [canReflect.getName(context), "changed"]
					/* jshint laxcomma: false */
				];
			}
			//!steal-remove-end
			// Update this observation after all `notify` tasks have been run.
			this.deriveQueue.enqueue.apply(this.deriveQueue, queuesArgs);
		}
	},
	// Called to update its value as part of the `derive` queue.
	update: function() {
		if (this.bound === true) {
			// Keep the old value.
			var oldValue = this._value;
			this.oldValue = null;
			// Re-run `this.func` and update dependency bindings.
			this.onBound();
			// If our value changed, call the `dispatch` method provided by `can-event-queue/value/value`.
			if (oldValue !== this._value) {
				this[dispatchSymbol](this._value, oldValue);
			}
		}
	},
	// Called when nothing is bound to this observation.
	// Removes all event listeners on all dependency observables.
	onUnbound: function(){
		this.bound = false;
		recorderHelpers.stopObserving(this.newDependencies, this.onDependencyChange);
		// Setup newDependencies in case someone binds again to this observable.
		this.newDependencies = ObservationRecorder.makeDependenciesRecord();
	},
	// Reads the value of the observation.
	get: function(){

		// If an external observation is tracking observables and
		// this compute can be listened to by "function" based computes ....
		if( this.options.isObservable && ObservationRecorder.isRecording() ) {

			// ... tell the tracking compute to listen to change on this observation.
			ObservationRecorder.add(this);
			// ... if we are not bound, we should bind so that
			// we don't have to re-read to get the value of this observation.
			if (this.bound === false) {
				Observation.temporarilyBind(this);
			}

		}


		if(this.bound === true ) {
			// It's possible that a child dependency of this observable might be queued
			// to change. Check all child dependencies and make sure they are up-to-date by
			// possibly running what they have registered in the derive queue.
			if(this.deriveQueue.tasksRemainingCount() > 0) {
				Observation.updateChildrenAndSelf(this);
			}

			return this._value;
		} else {
			// If we are not bound, just call the function.
			return this.func.call(this.context);
		}
	},

	hasDependencies: function(){
		var newDependencies = this.newDependencies;
		return this.bound ?
			(newDependencies.valueDependencies.size + newDependencies.keyDependencies.size) > 0  :
			undefined;
	},
	log: function() {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			var quoteString = function quoteString(x) {
				return typeof x === "string" ? JSON.stringify(x) : x;
			};
			this._log = function(previous, current) {
				dev.log(
					canReflect.getName(this),
					"\n is  ", quoteString(current),
					"\n was ", quoteString(previous)
				);
			};
		}
		//!steal-remove-end
	}
});

Object.defineProperty(Observation.prototype, "value", {
	get: function() {
		return this.get();
	}
});

var observationProto = {
	"can.getValue": Observation.prototype.get,
	"can.isValueLike": true,
	"can.isMapLike": false,
	"can.isListLike": false,
	"can.valueHasDependencies": Observation.prototype.hasDependencies,
	"can.getValueDependencies": function(){
		if (this.bound === true) {
			// Only provide `keyDependencies` and `valueDependencies` properties
			// if there's actually something there.
			var deps = this.newDependencies,
				result = {};

			if (deps.keyDependencies.size) {
				result.keyDependencies = deps.keyDependencies;
			}

			if (deps.valueDependencies.size) {
				result.valueDependencies = deps.valueDependencies;
			}

			return result;
		}
		return undefined;
	},
	"can.getPriority": function(){
		return this.options.priority;
	},
	"can.setPriority": function(priority){
		this.options.priority = priority;
	},
	"can.setElement": function(element) {
		this.options.element = element;
		this.deriveQueue = queues.domQueue || queues.deriveQueue;
	}
};

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	observationProto["can.getName"] = function() {
		return canReflect.getName(this.constructor) + "<" + canReflect.getName(this.func) + ">";
	};
}
//!steal-remove-end
canReflect.assignSymbols(Observation.prototype, observationProto);

// ## Observation.updateChildrenAndSelf
// This recursively checks if an observation's dependencies might be in the `derive` queue.
// If it is, we need to update that value so the reading of this value will be correct.
// This can happen if an observation suddenly switches to depending on something that has higher
// priority than itself.  We need to make sure that value is completely updated.
Observation.updateChildrenAndSelf = function(observation){
	// If the observable has an `update` method and it's enqueued, flush that task immediately so
	// the value is right.
	// > NOTE: This only works for `Observation` right now.  We need a way of knowing how
	// > to find what an observable might have in the `deriveQueue`.
	if(observation.update !== undefined && observation.deriveQueue.isEnqueued( observation.update ) === true) {
		// TODO: In the future, we should be able to send log information
		// to explain why this needed to be updated.
		observation.deriveQueue.flushQueuedTask(observation.update);
		return true;
	}

	// If we can get dependency values from this observable ...
	if(observation[getValueDependenciesSymbol]) {
		// ... Loop through each dependency and see if any of them (or their children) needed an update.
		var childHasChanged = false;
		var valueDependencies = observation[getValueDependenciesSymbol]().valueDependencies || [];
		valueDependencies.forEach(function(observable){
			if( Observation.updateChildrenAndSelf( observable ) === true) {
				childHasChanged = true;
			}
		});
		return childHasChanged;
	} else {
		return false;
	}
};

// ## Legacy Stuff
// Warn when `ObservationRecorder` methods are called on `Observation`.
var alias = {addAll: "addMany"};
["add","addAll","ignore","trap","trapsCount","isRecording"].forEach(function(methodName){
	Observation[methodName] = function(){
		var name = alias[methodName] ? alias[methodName] : methodName;
		console.warn("can-observation: Call "+name+"() on can-observation-recorder.");
		return ObservationRecorder[name].apply(this, arguments);
	};
});
Observation.prototype.start = function(){
	console.warn("can-observation: Use .on and .off to bind.");
	return this.onBound();
};
Observation.prototype.stop = function(){
	console.warn("can-observation: Use .on and .off to bind.");
	return this.onUnbound();
};

// ### temporarilyBind
// Will bind an observable value temporarily.  This should be part of queues probably.
Observation.temporarilyBind = temporarilyBind;


module.exports = namespace.Observation = Observation;

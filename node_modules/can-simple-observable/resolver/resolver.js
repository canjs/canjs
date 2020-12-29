"use strict";
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var ObservationRecorder = require("can-observation-recorder");
var Observation = require("can-observation");
var queues = require("can-queues");
var mapEventBindings = require("can-event-queue/map/map");
var SettableObservable = require("../settable/settable");
var SimpleObservable = require("../can-simple-observable");

var getChangesSymbol = canSymbol.for("can.getChangesDependencyRecord");
var metaSymbol = canSymbol.for("can.meta");

function ResolverObservable(resolver, context, initialValue, options) {
	// we don't want reads leaking out.  We should be binding to all of this ourselves.
	this.resolver = ObservationRecorder.ignore(resolver);
	this.context = context;
	this._valueOptions = {
		resolve: this.resolve.bind(this),
		listenTo: this.listenTo.bind(this),
		stopListening: this.stopListening.bind(this),
		lastSet: new SimpleObservable(initialValue)
	};

	this.update = this.update.bind(this);

	this.contextHandlers = new WeakMap();
	this.teardown = null;
	// a place holder for remembering where we bind
	this.binder = {};
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		canReflect.assignSymbols(this, {
			"can.getName": function() {
				return (
					canReflect.getName(this.constructor) +
					"<" +
					canReflect.getName(resolver) +
					">"
				);
			}
		});
		Object.defineProperty(this.update, "name", {
			value: canReflect.getName(this) + ".update"
		});

		canReflect.assignSymbols(this._valueOptions.lastSet, {
			"can.getName": function() {
				return (
					canReflect.getName(this.constructor)  +"::lastSet"+
					"<" +
					canReflect.getName(resolver) +
					">"
				);
			}
		});
	}
	//!steal-remove-end

	this[metaSymbol] = canReflect.assignMap({}, options);
}
ResolverObservable.prototype = Object.create(SettableObservable.prototype);

function deleteHandler(bindTarget, event, queue, handler){
	mapEventBindings.off.call(bindTarget, event, handler, queue);
}

canReflect.assignMap(ResolverObservable.prototype, {
	constructor: ResolverObservable,
	listenTo: function(bindTarget, event, handler, queueName) {
		//Object.defineProperty(this.handler, "name", {
		//	value: canReflect.getName(this) + ".handler"
		//});
		if(canReflect.isPrimitive(bindTarget)) {
			handler = event;
			event = bindTarget;
			bindTarget = this.context;
		}
		if(typeof event === "function") {
			handler = event;
			event = undefined;
		}

		var resolverInstance = this;

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if(!handler.name) {
				Object.defineProperty(handler, "name", {
					value:
						(bindTarget ?
							 canReflect.getName(bindTarget) : "")+
						 (event ? ".on('"+event+"',handler)" : ".on(handler)")+
						 "::"+canReflect.getName(this)
				});
			}
		}
		//!steal-remove-end

		var contextHandler = handler.bind(this.context);
		contextHandler[getChangesSymbol] = function getChangesDependencyRecord() {
			var s = new Set();
			s.add(resolverInstance);
			return {
				valueDependencies: s
			};
		};

		this.contextHandlers.set(handler, contextHandler);
		mapEventBindings.listenTo.call(this.binder, bindTarget, event, contextHandler, queueName || "notify");
	},
	stopListening: function(){

		var meta = this.binder[canSymbol.for("can.meta")];
		var listenHandlers = meta && meta.listenHandlers;
		if(listenHandlers) {
			var keys = mapEventBindings.stopListeningArgumentsToKeys.call({context: this.context, defaultQueue: "notify"});

			listenHandlers.delete(keys, deleteHandler);
		}
		return this;
	},
	resolve: function(newVal) {
		this._value = newVal;
		// if we are setting up the initial binding and we get a resolved value
		// do not emit events for it.

		if(this.isBinding) {
			this.lastValue = this._value;
			return newVal;
		}

		if(this._value !== this.lastValue) {
			var enqueueMeta  = {};

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				/* jshint laxcomma: true */
				enqueueMeta = {
					log: [canReflect.getName(this.update)],
					reasonLog: [canReflect.getName(this), "resolved with", newVal]
				};
				/* jshint laxcomma: false */
			}
			//!steal-remove-end

			queues.batch.start();
			queues.deriveQueue.enqueue(
				this.update,
				this,
				[],
				enqueueMeta
			);
			queues.batch.stop();
		}
		return newVal;
	},
	update: function(){

		if(this.lastValue !== this._value) {

			var old = this.lastValue;
			this.lastValue = this._value;
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				if (typeof this._log === "function") {
					this._log(old, this._value);
				}
			}
			//!steal-remove-end

			// adds callback handlers to be called w/i their respective queue.
			queues.enqueueByQueue(
				this.handlers.getNode([]),
				this,
				[this._value, old]
			);
		}
	},
	activate: function() {
		this.isBinding = true;
		this.teardown = this.resolver.call(this.context, this._valueOptions);
		this.isBinding = false;
	},
	onUnbound: function() {
		this.bound = false;
		mapEventBindings.stopListening.call(this.binder);
		if(this.teardown != null) {
			this.teardown();
			this.teardown = null;
		}
	},
	set: function(value) {
		this._valueOptions.lastSet.set(value);

		/*if (newVal !== this.lastSetValue.get()) {
			this.lastSetValue.set(newVal);
		}*/
	},
	get: function() {
		if (ObservationRecorder.isRecording()) {
			ObservationRecorder.add(this);
			if (!this.bound) {
				this.onBound();
			}
		}

		if (this.bound === true) {
			return this._value;
		} else {
			if (this[metaSymbol].resetUnboundValueInGet) {
				this._value = undefined;
			}

			var handler = function(){};
			this.on(handler);
			var val = this._value;
			this.off(handler);
			return val;
		}
	},
	hasDependencies: function hasDependencies() {
		var hasDependencies = false;

		if (this.bound) {
			var meta = this.binder[metaSymbol];
			var listenHandlers = meta && meta.listenHandlers;
			hasDependencies = !!listenHandlers.size();
		}

		return hasDependencies;
	},
	getValueDependencies: function getValueDependencies() {
		if (this.bound) {
			var meta = this.binder[canSymbol.for("can.meta")];
			var listenHandlers = meta && meta.listenHandlers;

			var keyDeps = new Map();
			var valueDeps = new Set();

			if (listenHandlers) {
				canReflect.each(listenHandlers.root, function(events, obj) {
					canReflect.each(events, function(queues, eventName) {
						if (eventName === undefined) {
							valueDeps.add(obj);
						} else {
							var entry = keyDeps.get(obj);
							if (!entry) {
								entry = new Set();
								keyDeps.set(obj, entry);
							}
							entry.add(eventName);
						}
					});
				});

				if (valueDeps.size || keyDeps.size) {
					var result = {};

					if (keyDeps.size) {
						result.keyDependencies = keyDeps;
					}
					if (valueDeps.size) {
						result.valueDependencies = valueDeps;
					}

					return result;
				}
			}
		}
	}
});

canReflect.assignSymbols(ResolverObservable.prototype, {
	"can.getValue": ResolverObservable.prototype.get,
	"can.setValue": ResolverObservable.prototype.set,
	"can.isMapLike": false,
	"can.getPriority": function() {
		// TODO: the priority should come from any underlying values
		return this.priority || 0;
	},
	"can.setPriority": function(newPriority) {
		this.priority = newPriority;
	},
	"can.valueHasDependencies": ResolverObservable.prototype.hasDependencies,
	"can.getValueDependencies": ResolverObservable.prototype.getValueDependencies
});


module.exports = ResolverObservable;

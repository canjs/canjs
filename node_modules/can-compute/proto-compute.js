"use strict";
// # can/compute/proto_compute (aka can.Compute)
//
// Allows the creation of observablue values. This
// is a prototype based version of [can.compute](compute.html).
//
// can.Computes come in different flavors:
//
// - [Getter / Setter functional computes](#setup-getter-setter-functional-computes).
// - [Property computes](#setup-property-computes).
// - [Setter computes](#setup-setter-computes).
// - [Async computes](#setup-async-computes).
// - [Settings computes](#setup-settings-computes).
// - [Simple value computes](#setup-simple-value-computes).
//
//
// can.Computes have public `.get`, `.set`, `.on`, and `.off` methods that call
// internal methods that are configured differently depending on what flavor of
// compute is being created.  Those methods are:
//
// - `_on(updater)` - Called the first time the compute is bound. This should bind to
//    any source observables.  When any of the source observables have changed, it should call
//    `updater(newVal, oldVal, batchNum)`.
//
// - `_off(updater)` - Called when the compute has no more event handlers.  This should unbind to any source observables.
// - `_get` - Called to get the current value of the compute.
// - `_set` - Called to set the value of the compute.
//
//
//
// Other internal flags and values:
// - `value` - the cached value
// - `_setUpdates` - if calling `_set` will have updated the cached value itself so `_get` does not need to be called.
// - `_canObserve` - if this compute can be observed.
// - `hasDependencies` - if this compute has source observable values.
var Observation = require('can-observation');
var ObservationRecorder = require("can-observation-recorder");
var eventQueue = require("can-event-queue/map/map");
var observeReader = require("can-stache-key");
var getObject = require('can-key/get/get');

var assign = require("can-assign");
var canReflect = require("can-reflect");
var singleReference = require("can-single-reference");

// ## can.Compute
// Checks the arguments and calls different setup methods.
var Compute = function(getterSetter, context, eventName, bindOnce) {
	var args = [];

	for(var i = 0, arglen = arguments.length; i < arglen; i++) {
		args[i] = arguments[i];
	}

	var contextType = typeof args[1];

	if (typeof args[0] === 'function') {
		// Getter/Setter functional computes.
		// `new can.Compute(function(){ ... })`
		this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
	} else if (args[1] !== undefined) {
		if (contextType === 'string' || contextType === 'number') {
			// Property computes.
			// `new can.Compute(object, propertyName[, eventName])`
			var isListLike = canReflect.isObservableLike(args[0]) && canReflect.isListLike(args[0]);
			var isMapLike = canReflect.isObservableLike(args[0]) && canReflect.isMapLike(args[0]);
			if(isMapLike || isListLike) {
				var map = args[0];
				var propertyName = args[1];
				var mapGetterSetter = function(newValue){
					if(arguments.length) {
						observeReader.set(map,propertyName, newValue);
					} else {
						// forces length to be read
						if(isListLike) {
							observeReader.get(map,"length");
						}
						return observeReader.get(map,""+propertyName);
					}
				};
				this._setupGetterSetterFn(mapGetterSetter, args[1], args[2], args[3]);
			} else {
				this._setupProperty(args[0], args[1], args[2]);
			}

		} else if(contextType === 'function') {
			// Setter computes.
			// `new can.Compute(initialValue, function(newValue){ ... })`
			this._setupSetter(args[0], args[1], args[2]);
		} else {

			if(args[1] && args[1].fn) {
				// Async computes.
				this._setupAsyncCompute(args[0], args[1]);
			} else {
				// Settings computes.
				//`new can.Compute(initialValue, {on, off, get, set})`
				this._setupSettings(args[0], args[1]);
			}

		}
	} else {
		// Simple value computes.
		// `new can.Compute(initialValue)`
		this._setupSimpleValue(args[0]);
	}

	this._args = args;
	this._primaryDepth = 0;

	this.isComputed = true;

};

// ## Helpers

// ## updateOnChange
// A helper to trigger an event when a value changes
var updateOnChange = function(compute, newValue, oldValue, batchNum){

	var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
	// Only trigger event when value has changed
	if (valueChanged) {
		compute.dispatch({type: "change", batchNum: batchNum}, [
			newValue,
			oldValue
		]);
	}
};

// ### setupComputeHandlers
// A helper that creates an `_on` and `_off` function that
// will bind on source observables and update the value of the compute.
var setupComputeHandlers = function(compute, func, context) {
	var observation = new Observation(func, context, compute);
	var updater = compute.updater.bind(compute);
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		Object.defineProperty(updater,"name",{
			value: canReflect.getName(compute) + ".updater",
		});
	}
	//!steal-remove-end
	compute.observation = observation;
	return {
		// Call `onchanged` when any source observables change.
		_on: function() {
			canReflect.onValue( observation, updater,"notify");
			if (observation.hasOwnProperty("_value")) {// can-observation 4.1+
				compute.value = observation._value;
			} else {// can-observation < 4.1
				compute.value = observation.value;
			}
		},
		// Unbind `onchanged` from all source observables.
		_off: function() {
			canReflect.offValue( observation, updater,"notify");
		},
		getDepth: function() {
			return observation.getDepth();
		}
	};
};
eventQueue(Compute.prototype);
assign(Compute.prototype, {
	setPrimaryDepth: function(depth) {
		this._primaryDepth = depth;
	},

	// ## Setup getter / setter functional computes
	// Uses the function as both a getter and setter.
	_setupGetterSetterFn: function(getterSetter, context, eventName) {
		this._set = context ? getterSetter.bind(context) : getterSetter;
		this._get = context ? getterSetter.bind(context) : getterSetter;
		this._canObserve = eventName === false ? false : true;
		// The helper provides the on and off methods that use `getValueAndBind`.
		var handlers = setupComputeHandlers(this, getterSetter, context || this);

		assign(this, handlers);
	},
	// ## Setup property computes
	// Listen to a property changing on an object.
	_setupProperty: function(target, propertyName, eventName) {
		var self = this,
			handler;


		// This is objects that can be bound to with can.bind.
		handler = function () {
			self.updater(self._get(), self.value);
		};
		this._get = function() {
			return getObject(target, propertyName);
		};
		this._set = function(value) {
			// allow setting properties n levels deep, if separated with dot syntax
			var properties = propertyName.split("."),
				leafPropertyName = properties.pop();

			if(properties.length) {
				var targetProperty = getObject(target, properties.join('.'));
				targetProperty[leafPropertyName] = value;
			} else {
				target[propertyName] = value;
			}
		};

		this._on = function(update) {
			eventQueue.on.call(target, eventName || propertyName, handler);
			// Set the cached value
			this.value = this._get();
		};
		this._off = function() {
			return eventQueue.off.call( target, eventName || propertyName, handler);
		};
	},
	// ## Setup Setter Computes
	// Only a setter function is specified.
	_setupSetter: function(initialValue, setter, eventName) {
		this.value = initialValue;
		this._set = setter;
		assign(this, eventName);
	},
	// ## Setup settings computes
	// Use whatever `on`, `off`, `get`, `set` the users provided
	// as the internal methods.
	_setupSettings: function(initialValue, settings) {

		this.value = initialValue;

		this._set = settings.set || this._set;
		this._get = settings.get || this._get;

		// This allows updater to be called without any arguments.
		// selfUpdater flag can be set by things that want to call updater themselves.
		if(!settings.__selfUpdater) {
			var self = this,
				oldUpdater = this.updater;
			this.updater = function() {
				oldUpdater.call(self, self._get(), self.value);
			};
		}


		this._on = settings.on ? settings.on : this._on;
		this._off = settings.off ? settings.off : this._off;
	},
	// ## Setup async computes
	// This is a special, non-documented form of a compute
	// rhat can asynchronously update its value.
	_setupAsyncCompute: function(initialValue, settings){
		var self = this;
		// This is the async getter function.  Depending on how many arguments the function takes,
		// we setup bindings differently.
		var getter = settings.fn;
		var bindings;

		this.value = initialValue;

		// This compute will call update with the new value itself.
		this._setUpdates = true;

		// An "async" compute has a `lastSetValue` that represents
		// the last value `compute.set` was called with.
		// The following creates `lastSetValue` as a can.Compute so when
		//  `lastSetValue` is changed, the `getter` can see that change
		// and automatically update itself.
		this.lastSetValue = new Compute(initialValue);

		// Wires up setting this compute to set `lastSetValue`.
		// If the new value matches the last setValue, do nothing.
		this._set = function(newVal){
			if(newVal === self.lastSetValue.get()) {
				return this.value;
			}

			return self.lastSetValue.set(newVal);
		};

		// Wire up the get to pass the lastNewValue
		this._get = function() {
			return getter.call(settings.context, self.lastSetValue.get() );
		};

		if(getter.length === 0) {
			// If it takes no arguments, it should behave just like a Getter compute.
			bindings = setupComputeHandlers(this, getter, settings.context);
		} else if(getter.length === 1) {
			// If it has a single argument, pass it the last setValue.
			bindings = setupComputeHandlers(this, function() {
				return getter.call(settings.context, self.lastSetValue.get() );
			}, settings);

		} else {
			// If the function takes 2 arguments, the second argument is a function
			// that should update the value of the compute (`setValue`). To make this we need
			// the "normal" updater function because we are about to overwrite it.
			var oldUpdater = this.updater,
				resolve = ObservationRecorder.ignore(function(newVal) {
					oldUpdater.call(self, newVal, self.value);
				});

			// Because `setupComputeHandlers` calls `updater` internally with its
			// observation._value as `oldValue` and that might not be up to date,
			// we overwrite updater to always use self.value.
			this.updater = function(newVal) {
				oldUpdater.call(self, newVal, self.value);
			};


			bindings = setupComputeHandlers(this, function() {
				// Call getter, and get new value
				var res = getter.call(settings.context, self.lastSetValue.get(), resolve);
				// If undefined is returned, don't update the value.
				return res !== undefined ? res : this.value;
			}, this);
		}

		assign(this, bindings);
	},
	// ## Setup simple value computes
	// Uses the default `_get`, `_set` behaviors.
	_setupSimpleValue: function(initialValue) {
		this.value = initialValue;
	},
	// ## _bindsetup
	// When a compute is first bound, call the internal `this._on` method.
	// `can.__notObserve` makes sure if `_on` is listening to any observables,
	// they will not be observed by any outer compute.
	_eventSetup: ObservationRecorder.ignore(function () {
		this.bound = true;
		this._on(this.updater);
	}),
	// ## _bindteardown
	// When a compute has no other bindings, call the internal `this._off` method.
	_eventTeardown: function () {
		this._off(this.updater);
		this.bound = false;
	},

	// ## clone
	// Copies this compute, but for a different context.
	// This is mostly used for computes on a map's prototype.
	clone: function(context) {
		if(context && typeof this._args[0] === 'function') {
			this._args[1] = context;
		} else if(context) {
			this._args[2] = context;
		}

		return new Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
	},
	// ## _on and _off
	// Default _on and _off do nothing.
	_on: function(){},
	_off: function(){},
	// ## get
	// Returns the cached value if `bound`, otherwise, returns
	// the _get value.
	get: function() {
		// If an external compute is tracking observables and
		// this compute can be listened to by "function" based computes ....
		var recordingObservation = ObservationRecorder.isRecording();
		if(recordingObservation && this._canObserve !== false) {

			// ... tell the tracking compute to listen to change on this computed.
			ObservationRecorder.add(this, 'change');
			// ... if we are not bound, we should bind so that
			// we don't have to re-read to get the value of this compute.
			if (!this.bound) {
				Compute.temporarilyBind(this);
			}
		}
		// If computed is bound, use the cached value.
		if (this.bound) {
			// if it has dependencies ... it should do some stuff ...
			if(this.observation) {
				return this.observation.get();
			} else {
				return this.value;
			}
		} else {
			return this._get();
		}
	},
	// ## _get
	// Returns the cached value.
	_get: function() {
		return this.value;
	},
	// ## set
	// Sets the value of the compute.
	// Depending on the type of the compute and what `_set` returns, it might need to call `_get` after
	// `_set` to get the final value.
	set: function(newVal) {

		var old = this.value;

		// Setter may return the value if setter
		// is for a value maintained exclusively by this compute.
		var setVal = this._set(newVal, old);

		// If the setter updated this.value, just return that.
		if(this._setUpdates) {
			return this.value;
		}

		// If the computed function has dependencies,
		// we should call the getter.
		if (this.hasDependencies) {
			return this._get();
		}

		// Setting may not fire a change event, in which case
		// the value must be read
		this.updater(setVal === undefined ? this._get() : setVal, old);

		return this.value;
	},
	// ## _set
	// Updates the cached value.
	_set: function(newVal) {
		return this.value = newVal;
	},
	// ## updater
	// Updates the cached value and fires an event if the value has changed.
	updater: function(newVal, oldVal, batchNum) {
		this.value = newVal;
		var observation = this.observation;
		if (observation) {
			// it's possible the observation doesn't actually
			// have any dependencies
			if (observation.hasOwnProperty("_value")) {// can-observation 4.1+
				observation._value = newVal;
			} else {// can-observation < 4.1
				observation.value = newVal;
			}
		}
		updateOnChange(this, newVal, oldVal, batchNum);
	},
	// ## toFunction
	// Returns a proxy form of this compute.
	toFunction: function() {
		return this._computeFn.bind( this);
	},
	_computeFn: function(newVal) {
		if(arguments.length) {
			return this.set(newVal);
		}

		return this.get();
	}
});

Compute.prototype.on = Compute.prototype.bind = Compute.prototype.addEventListener;
Compute.prototype.off = Compute.prototype.unbind = Compute.prototype.removeEventListener;

var hasDependencies = function hasDependencies() {
	return this.observation && this.observation.hasDependencies();
};
Object.defineProperty(Compute.prototype, "hasDependencies", {
	get: hasDependencies
});

// ### temporarilyBind
// Binds computes for a moment to cache their value and prevent re-calculating it.
Compute.temporarilyBind = Observation.temporarilyBind;

// ### async
// A simple helper that makes an async compute a bit easier.
Compute.async = function(initialValue, asyncComputer, context){
	return new Compute(initialValue, {
		fn: asyncComputer,
		context: context
	});
};

// ### truthy
// Wraps a compute with another compute that only changes when
// the wrapped compute's `truthiness` changes.
Compute.truthy = function(compute) {
	return new Compute(function() {
		var res = compute.get();
		if(typeof res === 'function') {
			res = res.get();
		}
		return !!res;
	});
};

canReflect.assignSymbols(Compute.prototype, {
	"can.isValueLike": true,
	"can.isMapLike": false,
	"can.isListLike": false,
	"can.setValue": Compute.prototype.set,
	"can.getValue": Compute.prototype.get,
	"can.valueHasDependencies": hasDependencies,
	"can.onValue": function onValue(handler, queue) {
		function translationHandler(ev, newValue, oldValue) {
			handler(newValue, oldValue);
		}
		singleReference.set(handler, this, translationHandler);
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			Object.defineProperty(translationHandler, "name", {
				value: canReflect.getName(handler) + "::onValue"
			});
		}
		//!steal-remove-end
		this.addEventListener("change", translationHandler, queue);
	},
	"can.offValue": function offValue(handler, queue) {
		this.removeEventListener(
			"change",
			singleReference.getAndDelete(handler, this),
			queue
		);
	},
	"can.getValueDependencies": function getValueDependencies() {
		var ret;

		if (this.observation) {
			ret = {
				valueDependencies: new Set([this.observation])
			};
		}

		return ret;
	}
});

module.exports = exports = Compute;

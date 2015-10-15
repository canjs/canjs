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
steal('can/util', 'can/util/bind', 'can/compute/read.js','can/compute/get_value_and_bind.js','can/util/batch', function (can, bind, read, getValueAndBind) {

	// ## can.Compute
	// Checks the arguments and calls different setup methods.
	can.Compute = function(getterSetter, context, eventName, bindOnce) {
		var args = [];

		for(var i = 0, arglen = arguments.length; i < arglen; i++) {
			args[i] = arguments[i];
		}

		var contextType = typeof args[1];

		if (typeof args[0] === 'function') {
			// Getter/Setter functional computes.  
			// `new can.Compute(function(){ ... })`
			this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
		} else if (args[1]) {
			if (contextType === 'string') {
				// Property computes.  
				// `new can.Compute(object, propertyName[, eventName])`
				this._setupProperty(args[0], args[1], args[2]);
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

		this.isComputed = true;
		can.cid(this, 'compute');
	};

	can.simpleExtend(can.Compute.prototype, {
		// ## Setup getter / setter functional computes
		// Uses the function as both a getter and setter.
		_setupGetterSetterFn: function(getterSetter, context, eventName) {
			this._set = context ? can.proxy(getterSetter, context) : getterSetter;
			this._get = context ? can.proxy(getterSetter, context) : getterSetter;
			this._canObserve = eventName === false ? false : true;
			// The helper provides the on and off methods that use `getValueAndBind`.
			var handlers = setupComputeHandlers(this, getterSetter, context || this);
			this._on = handlers.on;
			this._off = handlers.off;
			
		},
		// ## Setup property computes
		// Listen to a property changing on an object.
		_setupProperty: function(target, propertyName, eventName) {
			var isObserve = can.isMapLike( target ),
				self = this,
				handler;

			// If a `can.Map`, setup to read  and write to that property.
			if(isObserve) {
				// We should pass the batchNum if there is one.
				handler = function(ev, newVal,oldVal) {
					self.updater(newVal, oldVal, ev.batchNum);
				};
				this.hasDependencies = true;
				this._get = function() {
					return target.attr(propertyName);
				};
				this._set = function(val) {
					target.attr(propertyName, val);
				};
			} else {
				// This is objects that can be bound to with can.bind.
				handler = function () {
					self.updater(self._get(), self.value);
				};
				this._get = function() {
					return can.getObject(propertyName, [target]);
				};
				this._set = function(value) {
					// allow setting properties n levels deep, if separated with dot syntax
					var properties = propertyName.split("."),
						leafPropertyName = properties.pop(),
						targetProperty = can.getObject(properties.join('.'), [target]);
					targetProperty[leafPropertyName] = value;
				};
			}
			this._on = function(update) {
				can.bind.call(target, eventName || propertyName, handler);
				// Set the cached value
				this.value = this._get();
			};
			this._off = function() {
				return can.unbind.call( target, eventName || propertyName, handler);
			};
		},
		// ## Setup Setter Computes
		// Only a setter function is specified.
		_setupSetter: function(initialValue, setter, eventName) {
			this.value = initialValue;
			this._set = setter;
			can.simpleExtend(this, eventName);
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
			this.value = initialValue;
			
			// This compute will call update with the new value itself.
			this._setUpdates = true;
			
			// An "async" compute has a `lastSetValue` that represents
			// the last value `compute.set` was called with.
			// The following creates `lastSetValue` as a can.Compute so when 
			//  `lastSetValue` is changed, the `getter` can see that change
			// and automatically update itself.
			this.lastSetValue = new can.Compute(initialValue);
			
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
			
			// This is the async getter function.  Depending on how many arguments the function takes,
			// we setup bindings differently.  
			var getter = settings.fn,
				bindings;
			
			
			
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
					setValue = function(newVal) {
						oldUpdater.call(self, newVal, self.value);
					};
				
				// Because `setupComputeHandlers` calls `updater` internally with its
				// readInfo.value as `oldValue` and that might not be up to date, 
				// we overwrite updater to always use self.value.
				this.updater = function(newVal) {
					oldUpdater.call(self, newVal, self.value);
				};
				
				
				bindings = setupComputeHandlers(this, function() {
					// Call getter, and get new value
					var res = getter.call(settings.context, self.lastSetValue.get(), setValue);
					// If undefined is returned, don't update the value.
					return res !== undefined ? res : this.value;
				}, this);
			}

			this._on = bindings.on;
			this._off = bindings.off;
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
		_bindsetup: can.__notObserve(function () {
			this.bound = true;
			this._on(this.updater);
		}),
		// ## _bindteardown
		// When a compute has no other bindings, call the internal `this._off` method.
		_bindteardown: function () {
			this._off(this.updater);
			this.bound = false;
		},
		// ## bind and unbind
		// A bind and unbind that calls `_bindsetup` and `_bindteardown`.
		bind: can.bindAndSetup,
		unbind: can.unbindAndTeardown,

		// ## clone
		// Copies this compute, but for a different context.
		// This is mostly used for computes on a map's prototype.
		clone: function(context) {
			if(context && typeof this._args[0] === 'function') {
				this._args[1] = context;
			} else if(context) {
				this._args[2] = context;
			}

			return new can.Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
		},
		// ## _on and _off
		// Default _on and _off do nothing.
		_on: can.k,
		_off: can.k,
		// ## get
		// Returns the cached value if `bound`, otherwise, returns
		// the _get value.
		get: function() {
			// If an external compute is tracking observables and
			// this compute can be listened to by "function" based computes ....
			if(can.__isRecordingObserves() && this._canObserve !== false) {

				// ... tell the tracking compute to listen to change on this computed.
				can.__observe(this, 'change');
				// ... if we are not bound, we should bind so that
				// we don't have to re-read to get the value of this compute.
				if (!this.bound) {
					can.Compute.temporarilyBind(this);
				}
			}
			// If computed is bound, use the cached value.
			if (this.bound) {
				return this.value;
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
			if (setVal === undefined) {
				this.value = this._get();
			} else {
				this.value = setVal;
			}
			// Fire the change
			updateOnChange(this, this.value, old);
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
			updateOnChange(this, newVal, oldVal, batchNum);
		},
		// ## toFunction
		// Returns a proxy form of this compute.
		toFunction: function() {
			return can.proxy(this._computeFn, this);
		},
		_computeFn: function(newVal) {
			if(arguments.length) {
				return this.set(newVal);
			}

			return this.get();
		}
	});
	
	// ## Helpers
	
	// ## updateOnChange
	// A helper to trigger an event when a value changes
	var updateOnChange = function(compute, newValue, oldValue, batchNum){
		// Only trigger event when value has changed
		if (newValue !== oldValue) {
			can.batch.trigger(compute, {type: "change", batchNum: batchNum}, [
				newValue,
				oldValue
			]);
		}
	};

	// ### setupComputeHandlers
	// A helper that creates an `_on` and `_off` function that
	// will bind on source observables and update the value of the compute.
	var setupComputeHandlers = function(compute, func, context) {

		// The last observeInfo object returned by getValueAndBind.
		var readInfo = new getValueAndBind.ObservedInfo(func, context,
			// A function that gets called whenever any observed observables change.
			function(ev){
				// Only update if we have finished processing all prior events,
				// the compute is being listened to,
				// and the batchNum has changed.
				
				// It's possible that something we are listening to changed before we even get readInfo
				if (readInfo.ready &&
					compute.bound &&
					(ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
						
					// Keep the old value.
					var oldValue = readInfo.value;
					// Get the new value and register this event handler to any new observables.
					getValueAndBind(readInfo);
					// Update the compute with the new value.
					compute.updater(readInfo.value, oldValue, ev.batchNum);
					batchNum = ev.batchNum;
				}
			}),
			// The last batch number seen.
			batchNum;
			
		return {
			// Call `onchanged` when any source observables change.
			on: function(){
				getValueAndBind(readInfo);
				compute.value = readInfo.value;
				compute.hasDependencies = !can.isEmptyObject(readInfo.newObserved);
			},
			// Unbind `onchanged` from all source observables.
			off: function(){
				getValueAndBind.unbindReadInfo(readInfo);
			}
		};
	};
	

	// ### temporarilyBind
	// Binds computes for a moment to cache their value and prevent re-calculating it.
	can.Compute.temporarilyBind = function (compute) {
		var computeInstance = compute.computeInstance || compute;
		computeInstance.bind('change', can.k);
		if (!computes) {
			computes = [];
			setTimeout(unbindComputes, 10);
		}
		computes.push(computeInstance);
	};
	
	// A list of temporarily bound computes
	var computes,
		// Unbinds all temporarily bound computes.
		unbindComputes = function () {
			for (var i = 0, len = computes.length; i < len; i++) {
				computes[i].unbind('change', can.k);
			}
			computes = null;
		};

	// ### async
	// A simple helper that makes an async compute a bit easier.
	can.Compute.async = function(initialValue, asyncComputer, context){
		return new can.Compute(initialValue, {
			fn: asyncComputer,
			context: context
		});
	};

	
	// ### truthy
	// Wraps a compute with another compute that only changes when 
	// the wrapped compute's `truthiness` changes.
	can.Compute.truthy = function(compute) {
		return new can.Compute(function() {
			var res = compute.get();
			if(typeof res === 'function') {
				res = res.get();
			}
			return !!res;
		});
	};
	
	// ### compatability
	// Setting methods that should not be around in 3.0.
	can.Compute.read = read;
	can.Compute.set = read.write;

	return can.Compute;
});
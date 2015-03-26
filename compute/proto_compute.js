steal('can/util', 'can/util/bind', 'can/compute/read.js','can/util/batch', function (can, bind, read) {
	var stack = [];

	can.__read = function (func, self) {
		stack.push({});

		var value = func.call(self);

		return {
			value: value,
			observed: stack.pop()
		};
	};

	can.__reading = function (obj, event) {
		if (stack.length) {
			stack[stack.length-1][obj._cid + '|' + event] = {
				obj: obj,
				event: event + ""
			};
		}
	};

	can.__clearReading = function () {
		if (stack.length) {
			var ret = stack[stack.length-1];
			stack[stack.length-1] = {};
			return ret;
		}
	};

	can.__setReading = function (o) {
		if (stack.length) {
			stack[stack.length-1] = o;
		}
	};

	can.__addReading = function(o){
		if (stack.length) {
			can.simpleExtend(stack[stack.length-1], o);
		}
	};

	var getValueAndBind = function (func, context, oldObserved, onchanged) {
		// Call the function, get the value as well as the observed objects and events
		var info = can.__read(func, context),
			// The objects-event pairs that must be bound to
			newObserveSet = info.observed;
		// Go through what needs to be observed.
		bindNewSet(oldObserved, newObserveSet, onchanged);
		unbindOldSet(oldObserved, onchanged);
		// set ready only after all events that might be caused by a change
		can.bind.call(info,"ready", function(){
			info.ready = true;
		});
		can.batch.trigger(info,"ready");
		
		return info;
	};

	// This will not be optimized.
	var bindNewSet = function(oldObserved, newObserveSet, onchanged){
		for(var name in newObserveSet ) {
			bindOrPreventUnbinding(oldObserved, newObserveSet, name, onchanged);
		}
	};

	// This will be optimized.
	var bindOrPreventUnbinding = function(oldObserved, newObserveSet, name, onchanged){
		if( oldObserved[name] ) {
			delete oldObserved[name];
		} else {
			var obEv = newObserveSet[name];
			obEv.obj.bind(obEv.event, onchanged);
		}
	};

	var unbindOldSet = function(oldObserved, onchanged){
		for (var name in oldObserved) {
			var obEv = oldObserved[name];
			obEv.obj.unbind(obEv.event, onchanged);
		}
	};

	var updateOnChange = function(compute, newValue, oldValue, batchNum){
		// Only trigger event when value has changed
		if (newValue !== oldValue) {
			can.batch.trigger(compute, batchNum ? {type: "change", batchNum: batchNum} : 'change', [
				newValue,
				oldValue
			]);
		}
	};

	var setupComputeHandlersOn = function() {
		this.readInfo = getValueAndBind(this._getterSetter, this._context, {}, this.onchanged);

		this.setCached(this.readInfo.value);
		this.hasDependencies = !can.isEmptyObject(this.readInfo.observed);
	};

	var setupComputeHandlersOff = function() {
		for (var name in this.readInfo.observed) {
			var ob = this.readInfo.observed[name];
			ob.obj.unbind(ob.event, this.onchanged);
		}
	};

	var setupComputeHandlers = function(compute, func, context) {
		var readInfo,
			onchanged,
			batchNum;

		return {
			// Set up handler for when the compute changes
			on: function(){
				var self = this;
				if(!onchanged) {
					onchanged = function(ev){
						if (readInfo.ready && compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
							// Keep the old value
							var oldValue = readInfo.value;
							// Get the new value
							readInfo = getValueAndBind(func, context, readInfo.observed, onchanged);
							// Call the updater with old and new values
							self.updater(readInfo.value, oldValue, ev.batchNum);
							batchNum = batchNum = ev.batchNum;
						}
					};
				}

				readInfo = getValueAndBind(func, context, {}, onchanged);

				compute.setCached(readInfo.value);
				compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
			},
			// Remove handler for the compute
			off: function(updater){
				for (var name in readInfo.observed) {
					var ob = readInfo.observed[name];
					ob.obj.unbind(ob.event, onchanged);
				}
			}
		};
	};

	var setupSingleBindComputeHandlers = function(compute, func, context) {
		var readInfo,
			oldValue,
			onchanged,
			batchNum;
		
		return {
			// Set up handler for when the compute changes
			on: function(updater){
				if(!onchanged) {
					onchanged = function(ev){
						if (readInfo.ready && compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
							// Get the new value
							var reads = can.__clearReading();
							var newValue = func.call(context);
							can.__setReading(reads);
							// Call the updater with old and new values
							updater.call(compute, newValue, oldValue, ev.batchNum);
							oldValue = newValue;
							batchNum = batchNum = ev.batchNum;
						}
					};
				}

				readInfo = getValueAndBind(func, context, {}, onchanged);
				oldValue = readInfo.value;

				compute.setCached(readInfo.value);
				compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
			},
			// Remove handler for the compute
			off: function(updater){
				for (var name in readInfo.observed) {
					var ob = readInfo.observed[name];
					ob.obj.unbind(ob.event, onchanged);
				}
			}
		};
	};


	// Instead of calculating whether anything is listening every time,
	// use a function to do nothing (which may be overwritten)
	var k = function () {};

	var updater = function(newVal, oldVal, batchNum) {
		this.setCached(newVal);
		updateOnChange(this, newVal, oldVal, batchNum);
	},

	createAsyncAltUpdater = function(context, oldUpdater) {
		return function() {
			oldUpdater(context._get(), context.value);
		};
	},

	asyncGet = function(fn, context, lastSetValue) {
		return function() {
			return fn.call(context, lastSetValue.get());
		};
	},

	asyncUpdater = function(context, oldUpdater) {
		return function(newVal) {
			if(newVal !== undefined) {
				oldUpdater(newVal, context.value);
			}
		};
	};

	can.Compute = function(getterSetter, context, eventName, bindOnce) {
		var args = [];

		for(var i = 0, arglen = arguments.length; i < arglen; i++) {
			args[i] = arguments[i];
		}

		var contextType = typeof args[1];

		if (typeof args[0] === 'function') {
			this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
		} else if (args[1]) {
			if (contextType === 'string') {
				// `can.compute(object, propertyName[, eventName])`
				this._setupContextString(args[0], args[1], args[2]);
			} else if(contextType === 'function') {
				// `can.compute(initialValue, setter)`
				this._setupContextFunction(args[0], args[1], args[2]);
			} else {
				//`new can.Compute(initialValue, {})`
				if(args[1] && args[1].fn) {
					this._setupAsyncCompute(args[0], args[1]);
				} else {
					this._setupContextSettings(args[0], args[1]);
				}

			}
		} else {
			// `can.compute(initialValue)`
			this._setupInitialValue(args[0]);
		}

		this._args = args;

		this.isComputed = true;
		can.cid(this, 'compute');
	};

	can.simpleExtend(can.Compute.prototype, {
		//TODO: verify "this" is the instance of a compute
		_bindsetup: function () {
			this.bound = true;
			// Set up live-binding
			// While binding, this should not count as a read
			var oldReading = can.__clearReading();
			this._on(this.updater);
			// Restore "Observed" for reading
			can.__setReading(oldReading);
		},

		_bindteardown: function () {
			this._off(this.updater);
			this.bound = false;
		},

		bind: can.bindAndSetup,
		unbind: can.unbindAndTeardown,

		clone: function(context) {
			if(context && typeof this._args[0] === 'function') {
				this._args[1] = context;
			} else if(context) {
				this._args[2] = context;
			}

			return new can.Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
		},

		_on: k,
		_off: k,

		get: function() {
			// Another compute may bind to this `computed`
			if(stack.length && this._canReadForChangeEvent !== false) {

				// Tell the compute to listen to change on this computed
				// Use `can.__reading` to allow other compute to listen
				// for a change on this `computed`
				can.__reading(this, 'change');
				// We are going to bind on this compute.
				// If we are not bound, we should bind so that
				// we don't have to re-read to get the value of this compute.
				if (!this.bound) {
					can.Compute.temporarilyBind(this);
				}
			}
			// If computed is bound, use the cached value
			if (this.bound) {
				return this.value;
			} else {
				return this._get();
			}
		},

		_get: function() {
			return this.value;
		},

		set: function(newVal) {
			// Save a reference to the old value
			var old = this.value;
			// Setter may return the value if setter
			// is for a value maintained exclusively by this compute.
			var setVal = this._set(newVal, old);
			

			
			// If the computed function has dependencies,
			// return the current value
			if (this.hasDependencies) {
				// If set can update the value,
				// just return the updated value.
				if(this._setUpdates) {
					return this.value;
				}
				
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

		_set: function(newVal) {
			return this.value = newVal;
		},

		setCached: function(newVal) {
			this.value = newVal;
		},

		updater: updater,

		_computeFn: function(newVal) {
			if(arguments.length) {
				return this.set(newVal);
			}

			return this.get();
		},

		toFunction: function() {
			return can.proxy(this._computeFn, this);
		},

		_setupGetterSetterFn: function(getterSetter, context, eventName, bindOnce) {
			this._set = can.proxy(getterSetter, context);
			this._get = can.proxy(getterSetter, context);
			this._canReadForChangeEvent = eventName === false ? false : true;

			this._getterSetter = getterSetter;
			this._context = context;

			var handlers;
			if(bindOnce) {
				handlers = setupSingleBindComputeHandlers(this, getterSetter, context || this);
				this._on = handlers.on;
				this._off = handlers.off;
			}
			else {
				var self = this;
				this.onchanged = function(ev) {
					if (self.bound && self.readInfo.ready && (ev.batchNum === undefined || ev.batchNum !== self.batchNum)) {
						// Keep the old value
						var oldValue = self.readInfo.value;
						// Get the new value
						self.readInfo = getValueAndBind(getterSetter, context, self.readInfo.observed, self.onchanged);
						// Call the updater with old and new values
						self.updater(self.readInfo.value, oldValue, ev.batchNum);
						self.batchNum = ev.batchNum;
					}
				};
				this._on = setupComputeHandlersOn;
				this._off = setupComputeHandlersOff;
			}
		},

		_setupContextString: function(target, propertyName, eventName) {
			var isObserve = target instanceof can.Map,
			handler;
			this.updater = can.proxy(this.updater, this);

			if(isObserve) {
				this.hasDependencies = true;
				this._get = function() {
					return target.attr(propertyName);
				};
				this._set = function(val) {
					target.attr(propertyName, val);
				};
				this._on = function(update) {
					handler = function(ev, newVal,oldVal) {
						update(newVal, oldVal, ev.batchNum);
					};

					target.bind(eventName || propertyName, handler);
					// Set the cached value
					this.value = can.__read(this._get).value;
				};
				this._off = function() {
					return target.unbind(eventName || propertyName, handler);
				};
			} else {
				this._get = can.proxy(this._get, target);
				this._set = can.proxy(this._set, target);
			}
		},

		_setupContextFunction: function(initialValue, setter, eventName) {
			this.value = initialValue;
			this._set = setter;
			can.simpleExtend(this, eventName);
		},

		_setupContextSettings: function(initialValue, settings) {
			
			this.value = initialValue;
			var oldUpdater = can.proxy(this.updater, this);
			
			this._set = settings.set ? can.proxy(settings.set, settings) : this._set;
			this._get = settings.get ? can.proxy(settings.get, settings) : this._get;

			// This is a "hack" to allow async computes.
			this.updater = createAsyncAltUpdater(this, oldUpdater);
			
			this._on = settings.on ? settings.on : this._on;
			this._off = settings.off ? settings.off : this._off;
		},
		_setupAsyncCompute: function(initialValue, settings){
			
			this.value = initialValue;
			
			var oldUpdater = can.proxy(this.updater, this),
				self = this,
				fn = settings.fn,
				data;
			
			this.updater = oldUpdater;
			
			var lastSetValue = new can.Compute(initialValue);
			// expose this compute so it can be read
			this.lastSetValue = lastSetValue;
			this._setUpdates = true;
			this._set = function(newVal){
				if(newVal === lastSetValue.get()) {
					return this.value;
				}

				// this is the value passed to the fn
				lastSetValue.set(newVal);
			};

			// make sure get is called with the newVal, but not setter
			this._get = asyncGet(fn, settings.context, lastSetValue);
			// Check the number of arguments the 
			// async function takes.
			if(fn.length === 0) {
				// if it takes no arguments, it is calculated from other things.
				data = setupComputeHandlers(this, fn, settings.context);
			} else if(fn.length === 1) {
				// If it has a single argument, pass it the current value
				// or the value from define.set.
				data = setupComputeHandlers(this, function() {
					return fn.call(settings.context, lastSetValue.get() );
				}, settings);
			} else {
				// The updater function passed to on so that if called with
				// a single, non undefined value, works.
				this.updater = asyncUpdater(this, oldUpdater);
				
				// Finally, pass the function so it can decide the final value.
				data = setupComputeHandlers(this, function() {
					// Call fn, and get new value
					var res = fn.call(settings.context, lastSetValue.get(), function(newVal) {
						oldUpdater(newVal, self.value);
					});
					// If undefined is returned, don't update the value.
					return res !== undefined ? res : this.value;
				}, settings);
			}

			this._on = data.on;
			this._off = data.off;
		},
		_setupInitialValue: function(initialValue) {
			this.value = initialValue;
		}
	});

	// A list of temporarily bound computes
	var computes, unbindComputes = function () {
		for (var i = 0, len = computes.length; i < len; i++) {
			computes[i].unbind('change', k);
		}
		computes = null;
	};

	// Binds computes for a moment to retain their value and prevent caching
	can.Compute.temporarilyBind = function (compute) {
		compute.bind('change', k);
		if (!computes) {
			computes = [];
			setTimeout(unbindComputes, 10);
		}
		computes.push(compute);
	};

	can.Compute.async = function(initialValue, asyncComputer, context){
		return new can.Compute(initialValue, {
			fn: asyncComputer,
			context: context
		});
	};

	can.Compute.read = read;
	
	can.Compute.truthy = function(compute) {
		return new can.Compute(function() {
			var res = compute.get();
			if(typeof res === 'function') {
				res = res.get();
			}
			return !!res;
		});
	};
	
	can.Compute.set = function(parent, key, value) {
		if(can.isMapLike(parent)) {
			return parent.attr(key, value);
		}

		if(parent[key] && parent[key].isComputed) {
			return parent[key](value);
		}

		if(typeof parent === 'object') {
			parent[key] = value;
		}
	};

	return can.Compute;
});

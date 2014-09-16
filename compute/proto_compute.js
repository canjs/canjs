steal('can/util', 'can/util/bind', 'can/util/batch', function (can, bind) {
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

	var setupComputeHandlersOnChanged = function(ev) {
		if (this.bound && (ev.batchNum === undefined || ev.batchNum !== this.batchNum) ) {
			// Keep the old value
			var oldValue = this.readInfo.value;
			// Get the new value
			this.readInfo = getValueAndBind(this._getterSetter, this._context, this.readInfo.observed, this.onchanged);
			// Call the updater with old and new values
			this.updater(this.readInfo.value, oldValue, ev.batchNum);
			this.batchNum = ev.batchNum;
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
						if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
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
						if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
							// Get the new value
							var reads = can.__clearReading();
							var newValue = func.call(context);
							can.__setReading(reads);
							// Call the updater with old and new values
							updater(newValue, oldValue, ev.batchNum);
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

	var isObserve = function (obj) {
		return obj instanceof can.Map || obj && obj.__get;
	},
	// Instead of calculating whether anything is listening every time,
	// use a function to do nothing (which may be overwritten)
	k = function () {};

	var observeSet = function(newValue) {
		this._getterSetter.attr(this._context, newValue);
	},

	observeGet = function() {
		this._getterSetter.attr(this._context);
	},

	observeOn = function(update) {
		this._handler = function(ev, newVal,oldVal) {
			update(newVal, oldVal, ev.batchNum);
		};
		this._getterSetter.bind(this._eventName || this._context, handler);
		// Set the cached value
		value = can.__read(this._get()).value;
	},

	observeOff = function() {
		return this._getterSetter.unbind(this._eventName || this._context, this._handler);
	},

	updater = function(newVal, oldVal, batchNum) {
		this.setCached(newVal);
		updateOnChange(this, newVal, oldVal, batchNum);
	},

	contextUpdater = function(context) {
		return can.proxy(updater, context);
	},

	asyncAltUpdater = function() {
		var newVal = this.get();
		this._asyncUpdater(newVal, this._oldVal);
	},

	createAsyncAltUpdater = function(context, oldUpdater) {
		return function() {
			oldUpdater(context.get(), context.value);
		}
	},

	asyncGet = function(fn, context) {
		return function() {
			return fn.call(context, context.value);
		}
	},

	asyncUpdater = function(context, oldUpdater) {
		return function(newVal) {
			if(newVal !== undefined) {
				oldUpdater(newVal, context.value);
			}
		}
	};

	can.Compute = function(getterSetter, context, eventName, bindOnce) {
		this.args = [];

		this._getterSetter = getterSetter;
		this._context = context;
		this._eventName = eventName;
		this._bindOnce = bindOnce;

		var contextType = typeof this._context;

		if (typeof this._getterSetter === 'function') {
			this._mode = 'getterSetterFn';
			this._set = getterSetter;
			this._get = getterSetter;
			this.canReadForChangeEvent = eventName === false ? false : true;

			var handlers;
			if(bindOnce) {
				handlers = setupSingleBindComputeHandlers(this, getterSetter, context || this);
				this.on = handlers.on;
				this.off = handlers.off;
			}
			else {
				this.onchanged = can.proxy(setupComputeHandlersOnChanged, this);
				this.on = setupComputeHandlersOn;
				this.off = setupComputeHandlersOff;
			}
		} else if (this._context) {
			if (contextType === 'string') {
				var isObserve = getterSetter instanceof can.Map;
				this._mode = isObserve ? 'contextStringDeps' : 'contextString';
				this._get = observeGet;

				if(isObserve) {
					this.hasDependencies = true;
					this._set = observeSet;
					this.on = observeOn;
					this.off = observeOff;
				}
			} else if(contextType === 'function') {
				// `can.compute(initialValue, setter)`
				this._mode = 'contextFn';
				this.value = getterSetter;
				this._set = context;
				// this._context = eventName;
				can.simpleExtend(this, eventName);
			} else {
				this._mode = 'context';
				this.value = getterSetter;
				//TODO: separate this
				// this._context = context.context || context;

				this.updater = contextUpdater(this);
				// can.simpleExtend(this, context.context || context);

				this._set = context.set || this._set;
				this._get = context.get || this._get;

				// This is a "hack" to allow async computes.
				if(context.fn) {
					var fn = context.fn,
						data;
					// make sure get is called with the newVal, but not setter
					this.get = asyncGet(fn, this);
					// Check the number of arguments the 
					// async function takes.
					if(fn.length === 0) {
						data = setupComputeHandlers(this, fn, context);
					} else if(fn.length === 1) {
						var self = this;
						data = setupComputeHandlers(this, function() {
							//TODO: holding onto a reference...good/bad?
							return fn.call(context, self.value);
						}, context);
					} else {
						var oldUpdater = this.updater;
						this.updater = asyncUpdater(this, oldUpdater);
						data = setupComputeHandlers(this, function() {
							var res = fn.call(context, this.value, function(newVal) {
								oldUpdater(newVal, this.value);
							});
							// If undefined is returned, don't update the value.
							return res !== undefined ? res : this.value;
						}, context);
					}

					this.on = data.on;
					this.off = data.off;
				} else {
					//TODO: This condition is wrong as it overrides this.updater for context objects, non-async
					// this.updater = createAsyncAltUpdater(this, this.updater);
				}

				this.on = context.on ? context.on : this.on;
				this.off = context.off ? context.off : this.off;
			}
		} else {
			// `can.compute(initialValue)`
			this.value = getterSetter;
			//TODO: this._context should probably be optional
			// this._context = this;
		}

		for(var i = 0, arglen = arguments.length; i < arglen; i++) {
			this.args[i] = arguments[i];
		}

		this.isComputed = true;
		can.cid(this, 'compute');
	}

	can.simpleExtend(can.Compute.prototype, {
		//TODO: verify "this" is the instance of a compute
		_bindsetup: function () {
			this.bound = true;
			// Set up live-binding
			// While binding, this should not count as a read
			var oldReading = can.__clearReading();
			//TODO: on to _on
			this.on(this.updater);
			// Restore "Observed" for reading
			can.__setReading(oldReading);
		},

		_bindteardown: function () {
			this.off(this.updater);
			this.bound = false;
		},

		bind: can.bindAndSetup,
		unbind: can.unbindAndTeardown,

		clone: function(context) {
			if(context) {
				//TODO: arguments are backwards from original compute...check this
				if(this._mode === 'getterSetterFn') {
					this.args[1] = context;
				} else {
					this.args[2] = context;
				}
			}

			//TODO: A better way to write this
			return new can.Compute(this.args[0], this.args[1], this.args[2], this.args[3]);
		},

		on: k,
		off: k,

		get: function() {
			// Another compute may bind to this `computed`
			if(stack.length && this.canReadForChangeEvent !== false) {

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
				//TODO: do we need to pass context?
				// return this._get.call(this._context);
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
			// TODO:
			// var setVal = this._set.call(this._context, newVal, old);
			var setVal = this._set(newVal, old);
			// If the computed function has dependencies,
			// return the current value
			if (this.hasDependencies) {
				//TODO:
				// return this._get.call(this._context);
				return this._get();
			}
			// Setting may not fire a change event, in which case
			// the value must be read
			if (setVal === undefined) {
				//TODO:
				// this.value = this._get.call(this._context);
				this.value = this._get();
			} else {
				this.value = setVal;
			}
			// Fire the change
			updateOnChange(this, this.value, old);
			return this.value;
		},

		_set: function(newVal) {
			this.value = newVal;
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

	return can.Compute;
});

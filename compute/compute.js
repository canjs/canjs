steal('can/util', 'can/util/bind', 'can/util/batch', function (can, bind) {

	// # can.compute
	
	// ## Reading Helpers
	//
	// The following methods are used to call a function and know which observable events 
	// to listen to for changes. This is done by having every observable 
	// method that reads a value "broadcast" the corresponding 
	// event by calling `can.__reading(obserable, event)`. 
	// 
	// ### Observed
	//
	// An "Observed" is an Object of observable objects and events that
	// need to be listened to to know when to check a function for updates.
	// It looks like 
	//
	//     { 
	//       "map1|first": {obs: map, event: "first"},
	//       "map1|last" : {obs: map, event: "last"}
	//     }
	// 
	// Each pair is mapped so no duplicates will be listed. 
	//
	// ### State
	// 
	// `can.__read` can call a function that ends up calling `can.__read` again.  For example,
	// a compute can read another compute.
	// To make sure we know each compute's "Observed" values, maintain a stack of
	// each `__read` call's Observed valeus.
	var stack = [];

	can.__readStack = stack;
	// Calls a function given a context and returns
	// the return value of the function and the observable properties and events
	// that were read. Example: `{value: 100, observed: Observed}`
	can.__read = function (func, self) {

		// Add an object that `can.__read` will write to.
		stack.push({});

		var value = func.call(self);

		return {
			value: value,
			observed: stack.pop()
		};
	};

	// When an observable value is read, it should call `can.__reading` to 
	// indicate which object and event should be listened to.
	can.__reading = function (obj, event) {
		// Add the observe and attr that was read
		// to `observed`
		if (stack.length) {
			stack[stack.length-1][obj._cid + '|' + event] = {
				obj: obj,
				event: event + ""
			};
		}

	};
	// Clears and returns the current observables.
	can.__clearReading = function () {
		if (stack.length) {
			var ret = stack[stack.length-1];
			stack[stack.length-1] = {};
			return ret;
		}
	};
	// Specifies reading values.
	can.__setReading = function (o) {
		if (stack.length) {
			stack[stack.length-1] = o;
		}
	};

	// Calls a function, and using it's "Observed", sets up bindings to call
	// `onchanged` when those events are triggered.
	// - func - the function to call.
	// - context - the `this` of the function.
	// - oldObserved - An object that contains what has been bound to
	// - onchanged - what to call when any change has happened
	var getValueAndBind = function (func, context, oldObserved, onchanged) {
		// Call the function, get the value and the observeds.
		var info = can.__read(func, context),
			// What needs to beound to.
			newObserveSet = info.observed,
			// A flag that is used to figure out if we are already observing on an event.
			obEv,
			name;
		
		// Go through what needs to be observed.
		for( name in newObserveSet ) {
			
			if( oldObserved[name] ) {
				// If name has already been observed, remove from
				// `oldObserved` to prevent event from being unbound later.
				delete oldObserved[name];
			} else {
				// If this has not been observed, listen to it.
				obEv = newObserveSet[name];
				obEv.obj.bind(obEv.event, onchanged);
			}
		}

		// Iterate through oldObserved, looking for observe/attributes
		// that are no longer being bound and unbind them.
		for ( name in oldObserved) {
			obEv = oldObserved[name];
			obEv.obj.unbind(obEv.event, onchanged);
		}
		
		return info;
	};
	
	var updateOnChange = function(compute, newValue, oldValue, batchNum){
		//console.log("update",compute._cid, newValue, oldValue)
		if (newValue !== oldValue) {
			can.batch.trigger(compute, batchNum ? {type: "change", batchNum: batchNum} : 'change', [
				newValue,
				oldValue
			]);
		}
	};
	
	var setupComputeHandlers = function(compute, func, context, setCachedValue) {
		
		var readInfo,
			onchanged,
			batchNum;
		
		return {
			on: function(updater){
				if(!onchanged) {
					onchanged = function(ev){
						if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
							// store the old value
							var oldValue = readInfo.value;
								
							// get the new value
							readInfo = getValueAndBind(func, context, readInfo.observed, onchanged);

							updater(readInfo.value, oldValue, ev.batchNum);
						
							batchNum = batchNum = ev.batchNum;
						}
					};
				}
				
				readInfo = getValueAndBind(func, context, {}, onchanged);
				
				setCachedValue(readInfo.value);
				
				compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
			},
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
		k = function () {};
	// if no one is listening ... we can not calculate every time
	can.compute = function (getterSetter, context, eventName) {
		
		if (getterSetter && getterSetter.isComputed) {
			return getterSetter;
		}
		// the computed object
		var computed,
			// The following functions are overwritten depending on how compute() is called
			// a method to setup listening
			on = k,
			// a method to teardown listening
			off = k,
			// the current cached value (only valid if bound = true)
			value,
			// how to read the value
			get = function () {
				return value;
			},
			// sets the value
			set = function (newVal) {
				value = newVal;
			},
			setCached = set,
			// save for clone
			args = can.makeArray(arguments),
			updater = function (newValue, oldValue, batchNum) {
				setCached(newValue);
				updateOnChange(computed, newValue,oldValue, batchNum);
			},
			// the form of the arguments
			form;
		computed = function (newVal) {
			// setting ...
			if (arguments.length) {
				// save a reference to the old value
				var old = value;
				// setter may return a value if
				// setter is for a value maintained exclusively by this compute
				var setVal = set.call(context, newVal, old);
				// if this has dependencies return the current value
				if (computed.hasDependencies) {
					return get.call(context);
				}
				if (setVal === undefined) {
					// it's possible, like with the DOM, setting does not
					// fire a change event, so we must read
					value = get.call(context);
				} else {
					value = setVal;
				}
				// fire the change
				updateOnChange(computed, value, old);
				return value;
			} else {
				// Another compute wants to bind to this compute
				if (stack.length && computed.canReadForChangeEvent !== false) {

					// Tell the compute to listen to change on this computed
					can.__reading(computed, 'change');
					// We are going to bind on this compute.
					// If we are not bound, we should bind so that
					// we don't have to re-read to get the value of this compute.
					if (!computed.bound) {
						can.compute.temporarilyBind(computed);
					}
				}
				// if we are bound, use the cached value
				if (computed.bound) {
					return value;
				} else {
					return get.call(context);
				}
			}
		};
		if (typeof getterSetter === 'function') {
			set = getterSetter;
			get = getterSetter;
			computed.canReadForChangeEvent = eventName === false ? false : true;
			
			var handlers = setupComputeHandlers(computed, getterSetter, context || this, setCached);
			on = handlers.on;
			off = handlers.off;
			
		} else if (context) {
			if (typeof context === 'string') {
				// `can.compute(obj, "propertyName", [eventName])`
				var propertyName = context,
					isObserve = getterSetter instanceof can.Map;
				if (isObserve) {
					computed.hasDependencies = true;
				}
				get = function () {
					if (isObserve) {
						return getterSetter.attr(propertyName);
					} else {
						return getterSetter[propertyName];
					}
				};
				set = function (newValue) {
					if (isObserve) {
						getterSetter.attr(propertyName, newValue);
					} else {
						getterSetter[propertyName] = newValue;
					}
				};
				var handler;
				on = function (update) {
					handler = function () {
						update(get(), value);
					};
					can.bind.call(getterSetter, eventName || propertyName, handler);
					// use can.__read because
					// we should not be indicating that some parent
					// reads this property if it happens to be binding on it
					value = can.__read(get)
						.value;
				};
				off = function () {
					can.unbind.call(getterSetter, eventName || propertyName, handler);
				};
			} else {
				// `can.compute(initialValue, setter)`
				if (typeof context === 'function') {
					value = getterSetter;
					set = context;
					context = eventName;
					form = 'setter';
				} else {
					// `can.compute(initialValue,{get:, set:, on:, off:})`
					value = getterSetter;
					var options = context,
						oldUpdater = updater;
						
					updater = function(){
						var newVal = get.call(context);
						oldUpdater(newVal, value);
					};
					get = options.get || get;
					set = options.set || set;
					on = options.on || on;
					off = options.off || off;
				}
			}
		} else {
			// `can.compute(5)`
			value = getterSetter;
		}
		can.cid(computed, 'compute');
		return can.simpleExtend(computed, {
			/**
			 * @property {Boolean} can.computed.isComputed compute.isComputed
			 * @parent can.compute
			 * Whether the value of the compute has been computed yet.
			 */
			isComputed: true,
			_bindsetup: function () {
				this.bound = true;
				// setup live-binding
				// while binding, this does not count as a read
				var oldReading = can.__clearReading();
				on.call(this, updater);
				can.__setReading(oldReading);
			},
			_bindteardown: function () {
				off.call(this, updater);
				this.bound = false;
			},
			/**
			 * @function can.computed.bind compute.bind
			 * @parent can.compute
			 * @description Bind an event handler to a compute.
			 * @signature `compute.bind(eventType, handler)`
			 * @param {String} eventType The event to bind this handler to.
			 * The only event type that computes emit is _change_.
			 * @param {function({Object},{*},{*})} handler The handler to call when the event happens.
			 * The handler should have three parameters:
			 *
			 * - _event_ is the event object.
			 * - _newVal_ is the newly-computed value of the compute.
			 * - _oldVal_ is the value of the compute before it changed.
			 *
			 * `bind` lets you listen to a compute to know when it changes. It works just like
			 * can.Map's `[can.Map.prototype.bind bind]`:
			 * @codestart
			 * var tally = can.compute(0);
			 * tally.bind('change', function(ev, newVal, oldVal) {
			 *     console.log('The tally is now at ' + newVal + '.');
			 * });
			 *
			 * tally(tally() + 5); // The log reads:
			 *                     // 'The tally is now at 5.'
			 * @codeend
			 */
			bind: can.bindAndSetup,
			/**
			 * @function computed.unbind compute.unbind
			 * @parent can.compute
			 * @description Unbind an event handler from a compute.
			 * @signature `compute.unbind(eventType[, handler])`
			 * @param {String} eventType The type of event to unbind.
			 * The only event type available for computes is _change_.
			 * @param {function} [handler] If given, the handler to unbind.
			 * If _handler_ is not supplied, all handlers bound to _eventType_
			 * will be removed.
			 */
			unbind: can.unbindAndTeardown,
			clone: function (context) {
				if (context) {
					if (form === 'setter') {
						args[2] = context;
					} else {
						args[1] = context;
					}
				}
				return can.compute.apply(can, args);
			}
		});
	};
	// a list of temporarily bound computes
	var computes, unbindComputes = function () {
			for (var i = 0, len = computes.length; i < len; i++) {
				computes[i].unbind('change', k);
			}
			computes = null;
		};
	// Binds computes for a moment to retain their value and prevent caching
	can.compute.temporarilyBind = function (compute) {
		compute.bind('change', k);
		if (!computes) {
			computes = [];
			setTimeout(unbindComputes, 10);
		}
		computes.push(compute);
	};
	
	can.compute.truthy = function (compute) {
		return can.compute(function () {
			var res = compute();
			if (typeof res === 'function') {
				res = res();
			}
			return !!res;
		});
	};
	// {map: new can.Map({first: "Justin"})}, ["map","first"]
	can.compute.read = function (parent, reads, options) {
		options = options || {};
		// `cur` is the current value.
		var cur = parent,
			type,
			// `prev` is the object we are reading from.
			prev,
			// `foundObs` did we find an observable.
			foundObs;
		for (var i = 0, readLength = reads.length; i < readLength; i++) {
			// Update what we are reading from.
			prev = cur;
			// Read from the compute. We can't read a property yet.
			if (prev && prev.isComputed) {
				if (options.foundObservable) {
					options.foundObservable(prev, i);
				}
				prev = prev();
			}
			// Look to read a property from something.
			if (isObserve(prev)) {
				if (!foundObs && options.foundObservable) {
					options.foundObservable(prev, i);
				}
				foundObs = 1;
				// is it a method on the prototype?
				if (typeof prev[reads[i]] === 'function' && prev.constructor.prototype[reads[i]] === prev[reads[i]]) {
					// call that method
					if (options.returnObserveMethods) {
						cur = cur[reads[i]];
					} else if (reads[i] === 'constructor' && prev instanceof can.Construct) {
						cur = prev[reads[i]];
					} else {
						cur = prev[reads[i]].apply(prev, options.args || []);
					}
				} else {
					// use attr to get that value
					cur = cur.attr(reads[i]);
				}
			} else {
				// just do the dot operator
				cur = prev[reads[i]];
			}
			// If it's a compute, get the compute's value
			// unless we are at the end of the 
			if (cur && cur.isComputed && (!options.isArgument && i < readLength - 1)) {
				if (!foundObs && options.foundObservable) {
					options.foundObservable(prev, i + 1);
				}
				cur = cur();
			}
			type = typeof cur;
			// if there are properties left to read, and we don't have an object, early exit
			if (i < reads.length - 1 && (cur === null || type !== 'function' && type !== 'object')) {
				if (options.earlyExit) {
					options.earlyExit(prev, i, cur);
				}
				// return undefined so we know this isn't the right value
				return {
					value: undefined,
					parent: prev
				};
			}
		}
		// handle an ending function
		if (typeof cur === 'function') {
			if (options.isArgument) {
				if (!cur.isComputed && options.proxyMethods !== false) {
					cur = can.proxy(cur, prev);
				}
			} else {
				if (cur.isComputed && !foundObs && options.foundObservable) {
					options.foundObservable(cur, i);
				}
				cur = cur.call(prev);
			}
		}
		// if we don't have a value, exit early.
		if (cur === undefined) {
			if (options.earlyExit) {
				options.earlyExit(prev, i - 1);
			}
		}
		return {
			value: cur,
			parent: prev
		};

	};

	return can.compute;
});

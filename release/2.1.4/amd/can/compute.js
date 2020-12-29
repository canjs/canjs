/*!
 * CanJS - 2.1.4
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Fri, 21 Nov 2014 22:25:48 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/util/bind", "can/util/batch"], function (can, bind) {

	// ## Reading Helpers
	//
	// The following methods are used to call a function that relies on
	// observable data and to track the observable events which should 
	// be listened to when changes occur.
	// To do this, [`can.__reading(observable, event)`](#can-__reading) is called to
	// "broadcast" the corresponding event on each read.
	// 
	// ### Observed
	//
	// An "Observed" is an object of observable objects and events that
	// a function relies on. These objects and events must be listened to
	// in order to determine when to check a function for updates.
	// This looks like the following:
	//
	//     { 
	//       "map1|first": {obj: map, event: "first"},
	//       "map1|last" : {obj: map, event: "last"}
	//     }
	// 
	// Each object-event pair is mapped so no duplicates will be listed.

	// ### State
	// 
	// `can.__read` may call a function that calls `can.__read` again. For
	// example, a compute can read another compute. To track each compute's
	// `Observed` object (containing observable objects and events), we maintain
	// a stack of Observed values for each call to `__read`.
	var stack = [];

	// ### can.__read
	//
	// With a given function and context, calls the function
	// and returns the resulting value of the function as well
	// as the observable properties and events that were read.
	can.__read = function (func, self) {

		// Add an object that `can.__read` will write to.
		stack.push({});

		var value = func.call(self);

		// Example return value:
		// `{value: 100, observed: Observed}`
		return {
			value: value,
			observed: stack.pop()
		};
	};

	// ### can.__reading
	//
	// When an observable value is read, it must call `can.__reading` to 
	// broadcast which object and event should be listened to.
	can.__reading = function (obj, event) {
		// Add the observable object and the event
		// that was read to the `Observed` object on
		// the stack.
		if (stack.length) {
			stack[stack.length-1][obj._cid + '|' + event] = {
				obj: obj,
				event: event + ""
			};
		}

	};

	// ### can.__clearReading
	//
	// Clears and returns the current observables.
	// This can be used to access a value without 
	// it being handled as a regular `read`.
	can.__clearReading = function () {
		if (stack.length) {
			var ret = stack[stack.length-1];
			stack[stack.length-1] = {};
			return ret;
		}
	};
	// Specifies current observables.
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

	// ## Section Name

	// ### getValueAndBind
	//
	// Calls a function and sets up bindings to call `onchanged`
	// when events from its "Observed" object are triggered.
	// Removes bindings from `oldObserved` that are no longer needed.
	// - func - the function to call.
	// - context - the `this` of the function.
	// - oldObserved - an object that contains what has already been bound to
	// - onchanged - the function to call when any change occurs
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
			// After binding is set up, values
			// in `oldObserved` will be unbound. So if a name
			// has already be observed, remove from `oldObserved`
			// to prevent this.
			delete oldObserved[name];
		} else {
			// If current name has not been observed, listen to it.
			var obEv = newObserveSet[name];
			obEv.obj.bind(obEv.event, onchanged);
		}
	};
	// Iterate through oldObserved, looking for observe/attributes
	// that are no longer being bound and unbind them.
	var unbindOldSet = function(oldObserved, onchanged){
		for (var name in oldObserved) {
			var obEv = oldObserved[name];
			obEv.obj.unbind(obEv.event, onchanged);
		}
	};
	
	// ### updateOnChange
	//
	// Fires a change event when a compute's value changes
	var updateOnChange = function(compute, newValue, oldValue, batchNum){
		// Only trigger event when value has changed
		if (newValue !== oldValue) {
			can.batch.trigger(compute, batchNum ? {type: "change", batchNum: batchNum} : 'change', [
				newValue,
				oldValue
			]);
		}
	};
	
	// ###setupComputeHandlers
	//
	// Sets up handlers for a compute.
	// - compute - the compute to set up handlers for
	// - func - the getter/setter function for the compute
	// - context - the `this` for the compute
	// - setCachedValue - function for setting cached value
	//
	// Returns an object with `on` and `off` functions.
	var setupComputeHandlers = function(compute, func, context, setCachedValue) {
		var readInfo,
			onchanged,
			batchNum;
		
		return {
			// Set up handler for when the compute changes
			on: function(updater){
				if(!onchanged) {
					onchanged = function(ev){
						if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
							// Keep the old value
							var oldValue = readInfo.value;
								
							// Get the new value
							readInfo = getValueAndBind(func, context, readInfo.observed, onchanged);

							// Call the updater with old and new values
							updater(readInfo.value, oldValue, ev.batchNum);
						
							batchNum = batchNum = ev.batchNum;
						}
					};
				}
				
				readInfo = getValueAndBind(func, context, {}, onchanged);
				
				setCachedValue(readInfo.value);
				
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
	var setupSingleBindComputeHandlers = function(compute, func, context, setCachedValue) {
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
				
				setCachedValue(readInfo.value);
				
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

	// ###isObserve
	//
	// Checks if an object is observable
	var isObserve = function (obj) {
		return obj instanceof can.Map || obj && obj.__get;
	},
	// Instead of calculating whether anything is listening every time,
	// use a function to do nothing (which may be overwritten)
		k = function () {};

	// ## Creating a can.compute
	//
	// A `can.compute` can be created by
	// - [Specifying the getterSeter function](#specifying-gettersetter-function)
	// - [Observing a property of an object](#observing-a-property-of-an-object)
	// - [Specifying an initial value and a setter function](#specifying-an-initial-value-and-a-setter)
	// - [Specifying an initial value and how to read, update, and listen to changes](#specifying-an-initial-value-and-a-settings-object)
	// - [Simply specifying an initial value](#specifying-only-a-value)
	can.compute = function (getterSetter, context, eventName, bindOnce) {
	// ### Setting up
		// Do nothing if getterSetter is already a compute
		if (getterSetter && getterSetter.isComputed) {
			return getterSetter;
		}
		// The computed object
		var computed,
			// The following functions are overwritten depending on how compute() is called
			// A method to set up listening
			on = k,
			// A method to teardown listening
			off = k,
			// Current cached value (valid only when bound is true)
			value,
			// How the value is read by default
			get = function () {
				return value;
			},
			// How the value is set by default
			set = function (newVal) {
				value = newVal;
			},
			setCached = set,
			// Save arguments for cloning
			args = [],
			// updater for when value is changed
			updater = function (newValue, oldValue, batchNum) {
				setCached(newValue);
				updateOnChange(computed, newValue,oldValue, batchNum);
			},
			// the form of the arguments
			form;
			
			
		// convert arguments to args to make V8 Happy
		for(var i = 0, arglen = arguments.length; i< arglen; i++){
			args[i] = arguments[i];
		}
		
		computed = function (newVal) {
			// If the computed function is called with arguments,
			// a value should be set
			if (arguments.length) {
				// Save a reference to the old value
				var old = value;
				// Setter may return the value if setter
				// is for a value maintained exclusively by this compute.
				var setVal = set.call(context, newVal, old);
				// If the computed function has dependencies,
				// return the current value
				if (computed.hasDependencies) {
					return get.call(context);
				}
				// Setting may not fire a change event, in which case
				// the value must be read
				if (setVal === undefined) {
					value = get.call(context);
				} else {
					value = setVal;
				}
				// Fire the change
				updateOnChange(computed, value, old);
				return value;
			} else {
				// Another compute may bind to this `computed`
				if (stack.length && computed.canReadForChangeEvent !== false) {

					// Tell the compute to listen to change on this computed
					// Use `can.__reading` to allow other compute to listen
					// for a change on this `computed`
					can.__reading(computed, 'change');
					// We are going to bind on this compute.
					// If we are not bound, we should bind so that
					// we don't have to re-read to get the value of this compute.
					if (!computed.bound) {
						can.compute.temporarilyBind(computed);
					}
				}
				// If computed is bound, use the cached value
				if (computed.bound) {
					return value;
				} else {
					return get.call(context);
				}
			}
		};
		// ###Specifying getterSetter function
		//
		// If `can.compute` is [called with a getterSetter function](http://canjs.com/docs/can.compute.html#sig_can_compute_getterSetter__context__),
		// override set and get
		if (typeof getterSetter === 'function') {
			// `can.compute(getterSetter, [context])`
			set = getterSetter;
			get = getterSetter;
			computed.canReadForChangeEvent = eventName === false ? false : true;
			
			var handlers = bindOnce ?
				setupSingleBindComputeHandlers(computed, getterSetter, context || this, setCached) :
				setupComputeHandlers(computed, getterSetter, context || this, setCached);
			on = handlers.on;
			off = handlers.off;
		
		// ###Observing a property of an object
		//
		// If `can.compute` is called with an 
		// [object, property name, and optional event name](http://canjs.com/docs/can.compute.html#sig_can_compute_object_propertyName__eventName__),
		// create a compute from a property of an object. This allows the
		// creation of a compute on objects that can be listened to with [`can.bind`](http://canjs.com/docs/can.bind.html)
		} else if (context) {
			if (typeof context === 'string') {
				// `can.compute(obj, "propertyName", [eventName])`
				var propertyName = context,
					isObserve = getterSetter instanceof can.Map;
				if (isObserve) {
					computed.hasDependencies = true;
					var handler;
					get = function(){
						return getterSetter.attr(propertyName);
					};
					set = function(newValue){
						getterSetter.attr(propertyName, newValue);
					};
					on = function(update){
						handler = function(ev, newVal,oldVal){
							update(newVal,oldVal, ev.batchNum);
						};
						getterSetter.bind( eventName || propertyName, handler);
						// Set the cached value
						value = can.__read(get).value;
					};
					off = function(update){
						getterSetter.unbind( eventName || propertyName, handler);
					};
				} else {
					get = function(){
						return getterSetter[propertyName];
					};
					set = function(newValue){
						getterSetter[propertyName] = newValue;
					};
					
					on = function(update){
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
					off = function(update){
						can.unbind.call(getterSetter, eventName || propertyName, handler);
					};
				}
			// ###Specifying an initial value and a setter
			//
			// If `can.compute` is called with an [initial value and a setter function](http://canjs.com/docs/can.compute.html#sig_can_compute_initialValue_setter_newVal_oldVal__),
			// a compute that can adjust incoming values is set up.
			} else {
				// `can.compute(initialValue, setter)`
				if (typeof context === 'function') {
					
					value = getterSetter;
					set = context;
					context = eventName;
					form = 'setter';
                    // ###Specifying an initial value and a settings object
                    //
                    // If `can.compute` is called with an [initial value and optionally a settings object](http://canjs.com/docs/can.compute.html#sig_can_compute_initialValue__settings__),
                    // a can.compute is created that can optionally specify how to read,
                    // update, and listen to changes in dependent values. This form of
                    // can.compute can be used to derive a compute that derives its
                    // value from any source
				} else {
					// `can.compute(initialValue,{get:, set:, on:, off:})`
					
					
					value = getterSetter;
					var options = context,
						oldUpdater = updater;
						
					context = options.context || options;
					get = options.get || get;
					set = options.set || function(){
						return value;
					};
					// This is a "hack" to allow async computes.
					if(options.fn) {
						var fn = options.fn,
							data;
						// make sure get is called with the newVal, but not setter
						get = function(){
							return fn.call(context, value);
						};
						// Check the number of arguments the 
						// async function takes.
						if(fn.length === 0) {
							
							data = setupComputeHandlers(computed, fn, context, setCached);

						} else if(fn.length === 1){
							data = setupComputeHandlers(computed, function(){
								return fn.call(context, value);
							}, context, setCached);
						} else {
							updater = function(newVal){
								if(newVal !== undefined) {
									oldUpdater(newVal, value);
								}
							};
							data = setupComputeHandlers(computed, function(){
								var res = fn.call(context, value, function(newVal){
									oldUpdater(newVal, value);
								});
								// If undefined is returned, don't update the value.
								return res !== undefined ? res : value;
							}, context, setCached);
						}
						
							
						on = data.on;
						off = data.off;
					} else {
						updater = function(){
							var newVal = get.call(context);
							oldUpdater(newVal, value);
						};
					}
					
					on = options.on || on;
					off = options.off || off;
				}
			}
		// ###Specifying only a value
		//
		// If can.compute is called with an initialValue only,
		// reads to this value can be observed.
		} else {
			// `can.compute(initialValue)`
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
				// Set up live-binding
				// While binding, this should not count as a read
				var oldReading = can.__clearReading();
				on.call(this, updater);
				// Restore "Observed" for reading
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
	// A list of temporarily bound computes
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
	
	// Whether a compute is truthy
	can.compute.truthy = function (compute) {
		return can.compute(function () {
			var res = compute();
			if (typeof res === 'function') {
				res = res();
			}
			return !!res;
		});
	};
	can.compute.async = function(initialValue, asyncComputer, context){
		return can.compute(initialValue, {
			fn: asyncComputer,
			context: context
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
				prev = cur = prev();
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
					} else if ( (reads[i] === 'constructor' && prev instanceof can.Construct) ||
						(prev[reads[i]].prototype instanceof can.Construct)) {
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
				if(cur == null) {
					cur = undefined;
				} else {
					cur = prev[reads[i]];
				}
				
			}
			type = typeof cur;
			// If it's a compute, get the compute's value
			// unless we are at the end of the 
			if (cur && cur.isComputed && (!options.isArgument && i < readLength - 1)) {
				if (!foundObs && options.foundObservable) {
					options.foundObservable(prev, i + 1);
				}
				cur = cur();
			}
			// If it's an anonymous function, execute as requested
			else if (i < reads.length - 1 && type === 'function' && options.executeAnonymousFunctions && !(can.Construct && cur.prototype instanceof can.Construct)) {
				cur = cur();
			}
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
		// unless it is a can.Construct-derived constructor
		if (typeof cur === 'function' && !(can.Construct && cur.prototype instanceof can.Construct) && !(can.route && cur === can.route)) {
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

	can.compute.set = function(parent, key, value) {
		if(isObserve(parent)) {
			return parent.attr(key, value);
		}

		if(parent[key] && parent[key].isComputed) {
			return parent[key](value);
		}

		if(typeof parent === 'object') {
			parent[key] = value;
		}
	};

	return can.compute;
});
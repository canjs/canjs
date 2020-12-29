/*!
 * CanJS - 1.1.6
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 05 Jun 2013 18:02:51 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/util/bind"], function(can, bind) {
	
	// returns the
    // - observes and attr methods are called by func
	// - the value returned by func
	// ex: `{value: 100, observed: [{obs: o, attr: "completed"}]}`
	var getValueAndObserved = function(func, self){
		
		var oldReading;
		if (can.Observe) {
			// Set a callback on can.Observe to know
			// when an attr is read.
			// Keep a reference to the old reader
			// if there is one.  This is used
			// for nested live binding.
			oldReading = can.Observe.__reading;
			can.Observe.__reading = function(obj, attr){
				// Add the observe and attr that was read
				// to `observed`
				observed.push({
					obj: obj,
					attr: attr+""
				});
			};
		}
		
		var observed = [],
			// Call the "wrapping" function to get the value. `observed`
			// will have the observe/attribute pairs that were read.
			value = func.call(self);

		// Set back so we are no longer reading.
		if(can.Observe){
			can.Observe.__reading = oldReading;
		}
		return {
			value : value,
			observed : observed
		};
	},
		// Calls `callback(newVal, oldVal)` everytime an observed property
		// called within `getterSetter` is changed and creates a new result of `getterSetter`.
		// Also returns an object that can teardown all event handlers.
		computeBinder = function(getterSetter, context, callback, computeState){
			// track what we are observing
			var observing = {},
				// a flag indicating if this observe/attr pair is already bound
				matched = true,
				// the data to return 
				data = {
					// we will maintain the value while live-binding is taking place
					value : undefined,
					// a teardown method that stops listening
					teardown: function(){
						for ( var name in observing ) {
							var ob = observing[name];
							ob.observe.obj.unbind(ob.observe.attr, onchanged);
							delete observing[name];
						}
					}
				},
				batchNum;
			
			// when a property value is changed
			var onchanged = function(ev){
				// If the compute is no longer bound (because the same change event led to an unbind)
				// then do not call getValueAndBind, or we will leak bindings.
				if ( computeState && !computeState.bound ) {
					return;
				}
				if(ev.batchNum === undefined || ev.batchNum !== batchNum) {
					// store the old value
					var oldValue = data.value,
						// get the new value
						newvalue = getValueAndBind();

					// update the value reference (in case someone reads)
					data.value = newvalue;
					// if a change happened
					if ( newvalue !== oldValue ) {
						callback(newvalue, oldValue);
					}
					batchNum = batchNum = ev.batchNum;
				}
				
				
			};
			
			// gets the value returned by `getterSetter` and also binds to any attributes
			// read by the call
			var getValueAndBind = function(){
				var info = getValueAndObserved( getterSetter, context ),
					newObserveSet = info.observed;
				
				var value = info.value;
				matched = !matched;
				
				// go through every attribute read by this observe
				can.each(newObserveSet, function(ob){
					// if the observe/attribute pair is being observed
					if(observing[ob.obj._cid+"|"+ob.attr]){
						// mark at as observed
						observing[ob.obj._cid+"|"+ob.attr].matched = matched;
					} else {
						// otherwise, set the observe/attribute on oldObserved, marking it as being observed
						observing[ob.obj._cid+"|"+ob.attr] = {
							matched: matched,
							observe: ob
						};
						ob.obj.bind(ob.attr, onchanged);
					}
				});
				
				// Iterate through oldObserved, looking for observe/attributes
				// that are no longer being bound and unbind them
				for ( var name in observing ) {
					var ob = observing[name];
					if(ob.matched !== matched){
						ob.observe.obj.unbind(ob.observe.attr, onchanged);
						delete observing[name];
					}
				}
				return value;
			};
			// set the initial value
			data.value = getValueAndBind();

			data.isListening = ! can.isEmptyObject(observing);
			return data;
		}
	
	// if no one is listening ... we can not calculate every time
	/**
	 * @page can.compute
	 * @parent canjs
	 * @group can.compute.prototype prototype
	 * @signature `can.compute(getterSetter[, context])`
	 * @param {Function} getterSetter A function that gets and optionally sets the value of the compute.
	 * When called with no parameters, _getterSetter_ should return the current value of the compute. When
	 * called with a single parameter, _getterSetter_ should arrange things so that the next read of the compute
	 * produces that value.
	 * @param {Object} [context] The context to use when evaluating the compute.
	 * @return {can.compute} A new compute.
	 *
	 * @body
	 * `can.compute` lets you make observable values. A compute is actually a function that returns
	 * the computed value, but you can also use the compute to set the value and you can use
	 * `bind` to listen to changes in the compute's return value. In this way, computes are similar
	 * to [can.Observe Observes], but they represent a single value rather than a collection of values.
	 *
	 * ## Working with computes
	 *
	 * The simplest way to use a compute is to have it store a single value, and to set it when
	 * that value needs to change:
	 *
	 * @codestart
	 * var tally = can.compute(12);
	 * tally(); // 12
	 *
	 * tally(13);
	 * tally(); // 13
	 * @codeend
	 *
	 * This is useful for making observable values, but the real power of `can.compute` reveals
	 * itself when you combine it with `[can.Observe]`. If you use a compute that derives its
	 * value from properties of an Observe, the compute will listen for changes in those
	 * properties and automatically recalculate itself, emitting a _change_ event if its value
	 * changes.
	 *
	 * As this example shows, this kind of compute rarely has need to be set directly:
	 *
	 * @codestart
	 * var person = new can.Observe({
	 *     firstName: 'Alice',
	 *     lastName: 'Liddell'
	 * });
	 *
	 * var fullName = can.compute(function() {
	 *     return person.attr('firstName') + ' ' + person.attr('lastName');
	 * });
	 * fullName.bind('change', function(ev, newVal, oldVal) {
	 *     console.log("This person's full name is now " + newVal + '.');
	 * });
	 *
	 * person.attr('firstName', 'Allison'); // The log reads:
	 *                                      // "This person's full name is now Allison Liddell."
	 * @codeend
	 *
	 * Take special notice of how the definition of the compute uses `[can.Observe.prototype.attr attr]`
	 * to read the values of the properties of `person`. This is how the compute knows to listen
	 * for changes. and is similar to the need to use `attr` when live-binding properties of Observes into
	 * `[can.EJS EJS]` templates.
	 *
	 * A specific use for bound computes like this is to provide a way to work with values of Observable
	 * properties in different units:
	 *
	 * @codestart
	 * var wall = new can.Observe({
	 *     material: 'brick',
	 *     length: 10 // in feet
	 * });
	 *
	 * var wallLengthInMeters = can.compute(function(lengthInM) {
	 *     if(lengthInM !== undefined) {
	 *         wall.attr('length', lengthInM / 3.28084);
	 *     } else {
	 *         return wall.attr('length') * 3.28084;
	 *     }
	 * });
	 *
	 * wallLengthInMeters(); // 3.048
	 *
	 * // When you set the compute...
	 * wallLengthInMeters(5);
	 * wallLengthInMeters(); // 5
	 * // ...the original Observe changes too.
	 * wall.length;          // 16.4042
	 * @codeend
	 *
	 * ## Events
	 * 
	 * When a compute's value is changed, it emits a _change_ event. You can listen for this change
	 * event by using `[can.compute.bind bind]` to bind an event handler to the compute:
	 *
	 * @codestart
	 * var tally = can.compute(0);
	 * tally.bind('change', function(ev, newVal, oldVal) {
	 *     console.log('The tally is now at ' + newVal + '.');
	 * });
	 *
	 * tally(tally() + 5); // The log reads:
	 *                     // 'The tally is now at 5.'
	 * @codeend
	 * 
	 * ## Using computes to build Controls
	 *
	 * It's a piece of cake to build a `[can.Control]` off of the value of a compute. And since computes
	 * are observable, it means that the view of that Control will update itself whenever the value
	 * of the compute updates. Here's a simple slider that works off of a compute:
	 *
	 * @codestart
	 * var project = new Observe({
	 *     name: 'A Very Important Project',
	 *     percentDone: .35
	 * });
	 * 
	 * can.Control('SimpleSlider', { }, {
	 *     init: function() {
	 *         this.element.html(can.view(this.options.view, this.options));
	 *     },
	 *     '.handle dragend': function(el, ev) {
	 *         var percent = this.calculateSliderPercent();
	 *         // set the compute's value
	 *         this.options.percentDone(percent);
	 *     },
	 *     '{percentDone} change': function(ev, newVal, oldVal) {
	 *	       // react to the percentage changing some other way
	 *         this.moveSliderTo(newVal);
	 *     }
	 *     // Implementing calculateSliderPercent and moveSliderTo
	 *     // has been left as an exercise for the reader.
	 * });
	 * 
	 * new SimpleSlider('#slider', {percentDone: project.compute('percentDone')});
	 * @codeend
	 *
	 * Now that's some delicious cake. More information on Controls can be found under `[can.Control]`.
	 * There is also a full explanation of can.Observe's `[can.Observe.prototype.compute compute]`,
	 * which is used in the last line of the example above.
	 */
	can.compute = function(getterSetter, context, eventName){
		if(getterSetter && getterSetter.isComputed){
			return getterSetter;
		}
		// stores the result of computeBinder
		var computedData,
			// how many listeners to this this compute
			bindings = 0,
			// the computed object
			computed,
			// an object that keeps track if the computed is bound
			// onchanged needs to know this. It's possible a change happens and results in
			// something that unbinds the compute, it needs to not to try to recalculate who it
			// is listening to
			computeState = { 
				bound: false,
				// true if this compute is calculated from other computes and observes
				hasDependencies: false
			},
			// The following functions are overwritten depending on how compute() is called
			// a method to setup listening
			on = function(){},
			// a method to teardown listening
			off = function(){},
			// the current cached value (only valid if bound = true)
			value,
			// how to read the value
			get = function(){
				return value
			},
			// sets the value
			set = function(newVal){
				value = newVal;
			},
			// this compute can be a dependency of other computes
			// 
			canReadForChangeEvent = true;

		computed = function(newVal){
			// setting ...
			if(arguments.length){
				// save a reference to the old value
				var old = value;

				// setter may return a value if 
				// setter is for a value maintained exclusively by this compute
				var setVal = set.call(context,newVal, old);

				// if this has dependencies return the current value
				if(computed.hasDependencies){
					return get.call(context);
				}

				if(setVal === undefined) {
					// it's possible, like with the DOM, setting does not
					// fire a change event, so we must read
					value = get.call(context);
				} else {
					value = setVal;
				}
				// fire the change
				if( old !== value){
					can.Observe.triggerBatch(computed, "change",[value, old] );
				}
				return value;
			} else {
				// Let others know to listen to changes in this compute
				if( can.Observe.__reading && canReadForChangeEvent) {
					can.Observe.__reading(computed,'change');
				}
				// if we are bound, use the cached value
				if( computeState.bound ) {
					return value;
				} else {
					return get.call(context);
				}
			}
		}
		if(typeof getterSetter === "function"){
			set = getterSetter;
			get = getterSetter;
			canReadForChangeEvent = eventName === false ? false : true;
			computed.hasDependencies = false;
			on = function(update){
				computedData = computeBinder(getterSetter, context || this, update, computeState);
				computed.hasDependencies = computedData.isListening
				value = computedData.value;
			}
			off = function(){
				computedData.teardown();
			}
		} else if(context) {
			
			if(typeof context == "string"){
				// `can.compute(obj, "propertyName", [eventName])`
				
				var propertyName = context,
					isObserve = getterSetter instanceof can.Observe;
				if(isObserve){
					computed.hasDependencies = true;
				}
				get = function(){
					if(isObserve){
						return getterSetter.attr(propertyName);
					} else {
						return getterSetter[propertyName];
					}
				}
				set = function(newValue){
					if(isObserve){
						getterSetter.attr(propertyName, newValue)
					} else {
						getterSetter[propertyName] = newValue;
					}
				}
				var handler;
				on = function(update){
					handler = function(){
						update(get(), value)
					};
					can.bind.call(getterSetter, eventName || propertyName,handler)
					
					// use getValueAndObserved because
					// we should not be indicating that some parent
					// reads this property if it happens to be binding on it
					value = getValueAndObserved(get).value
				}
				off = function(){
					can.unbind.call(getterSetter, eventName || propertyName,handler)
				}

			} else {
				// `can.compute(initialValue, setter)`
				if(typeof context === "function"){
					value = getterSetter;
					set = context;
				} else {
					// `can.compute(initialValue,{get:, set:, on:, off:})`
					value = getterSetter;
					var options = context;
					get = options.get || get;
					set = options.set ||set;
					on = options.on || on;
					off = options.off || off;
				}

			}


			

		} else {
			// `can.compute(5)`
			value = getterSetter;
		}
		/**
		 * @property can.compute.isComputed isComputed
		 * @parent can.compute.prototype
		 * Whether the value of the compute has been computed yet.
		 */
		computed.isComputed = true;
		
		can.cid(computed,"compute")

		var updater= function(newValue, oldValue){
			value = newValue;
			// might need a way to look up new and oldVal
			can.Observe.triggerBatch(computed, "change",[newValue, oldValue])
		}

		return can.extend(computed,{
			_bindsetup: function(){
				computeState.bound = true;
				// setup live-binding
				on.call(this, updater)
			},
			_bindteardown: function(){
				off.call(this,updater)
				computeState.bound = false;
			},
			/**
			 * @function can.compute.bind bind
			 * @parent can.compute.prototype
			 * @description Bind an event handler to a compute.
			 * @signature `bind(eventType, handler)`
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
			 * can.Observe's `[can.Observe.prototype.bind bind]`:
			 @codestart
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
			 * @function can.compute.unbind unbind
			 * @parent can.compute.prototype
			 * @description Unbind an event handler from a compute.
			 * @signature `unbind(eventType[, handler])`
			 * @param {String} eventType The type of event to unbind.
			 * The only event type available for computes is _change_.
			 * @param {function} [handler] If given, the handler to unbind.
			 * If _handler_ is not supplied, all handlers bound to _eventType_
			 * will be removed.
			 */
			unbind: can.unbindAndTeardown
		});
	};
	can.compute.binder = computeBinder;
	return can.compute;
});
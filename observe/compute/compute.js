steal('can/util', 'can/util/bind', function(can, bind) {
	
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
	 * @class can.compute
	 * @parent can.util
	 * 
	 * `can.compute( getterSetter, [context] ) -> compute` returns a computed method that represents 
	 * some value.  A `compute` can can be:
	 * 
	 *  - __read__ - by calling the method like `compute()`
	 *  - __updated__ - by passing a new value like `compute( "new value" )`
	 *  - __listened__ to for changes - like `compute.bind( "change", handler )`
	 * 
	 * The value maintained by a `compute` can represent:
	 * 
	 *  - A __static__ JavaScript object or value like `{foo : 'bar'}` or `true`.
	 *  - A __composite__ value of one or more [can.Observe] property values.
	 *  - A __converted value__ derived from another value.
	 * 
	 * Computes are an abstraction for some value that can be changed. [can.Control]s that 
	 * accept computes (or convert params to computes) can be easily hooked up to 
	 * any data source and be live widgets (widgets that update themselves when data changes).
	 * 
	 * ## Static values
	 * 
	 * `can.compute([value])` creates a `computed` with some value.  For example:
	 * 
	 *     // create a compute
	 *     var age = can.compute(29);
	 * 
	 *     // read the value
	 *     console.log("my age is currently", age());
	 * 
	 *     // listen to changes in age
	 *     age.bind("change", function(ev, newVal, oldVal){
	 *       console.log("my age changed from",oldVal,"to",newVal)
	 *     })
	 *     // update the age
	 *     age(30);
	 * 
	 * Notice that you can __read__, __update__, 
	 * and __listen__ to changes in any single value.
	 * 
	 * _NOTE: [can.Observe] is similar to compute, but used for objects with multiple properties._
	 * 
	 * ## Composite values
	 * 
	 * Computes can represent a composite value of one 
	 * or more `can.Observe` properties.  The following
	 * creates a fullName compute that is the `person`
	 * observe's first and last name:
	 * 
	 *     var person = new can.Observe({
	 *       first : "Justin",
	 *       last : "Meyer"
	 *     });
	 *     var fullName = can.compute(function(){
	 *       return person.attr("first") +" "+ person.attr("last")
	 *     })
	 * 
	 * Read from fullName like:
	 * 
	 *     fullName() //-> "Justin Meyer"
	 * 
	 * Listen to changes in fullName like:
	 * 
	 *     fullName.bind("change", function(ev, newVal, oldVal){
	 *     
	 *     })
	 * 
	 * When an event handler is bound to fullName it starts
	 * caching the computes value so additional reads are faster!
	 * 
	 * ### Computes with prototype functions
	 * 
	 * To make a compute of an object's prototype method,
	 * pass the method and the context the function should be called with
	 * to `can.compute`:
	 * 
	 *     var Person = can.Construct({
	 *       fullName: function(){
	 *         return this.attr('first')+' '+this.attr('last')
	 *       }
	 *     });
	 * 
	 * 	var josh = new Person({ first: "Josh",  last: "Dean" }),
	 * 	
	 * 		fullName = can.compute(josh.fullName, josh);
	 * 
	 * ## Converted values
	 * 
	 * `can.compute( getterSetter( [newVal] ) )` can be used to convert one observe's value into
	 * another value.  For example, a `PercentDone` widget might accept
	 * a compute that needs to have values from `0` to `100`, but your project's
	 * progress is given between `0` and `1`. Pass that widget a compute!
	 * 
	 *     var project = new can.Observe({
	 *       progress :  0.5
	 *     });
	 *     var percentage = can.compute(function(newVal){
	 *       // are we setting?
	 *       if(newVal !=== undefined){
	 *         project.attr("progress", newVal / 100)  
	 *       } else {
	 *         return project.attr("progress") * 100;  
	 *       }
	 *     })
	 * 
	 *     // We can read from percentage.
	 *     percentage() //-> 50
	 * 
	 *     // Write to percentage,
	 *     percentage(75)
	 *     // but it updates project!
	 *     project.attr('progress') //-> 0.75
	 * 
	 *     // pass it to PercentDone
	 *     new PercentDone({
	 *       val : percentage
	 *     })
	 * 
	 * 
	 * ## Using computes in building controls.
	 * 
	 * The following sudo-code slider cross binds to the 
	 * percent compute. When the drag ends, it updates the
	 * percent compute.  If the compute changes, it updates
	 * the slider's position:  
	 * 
	 *     // A sudo-slider
	 *     var Slider = can.Control({
	 *       ".slider dragend": function(){
	 * 	    var percent = this.calculatePercent();
	 * 	    this.options.percent(percent)
	 * 	  },
	 * 	  "{percent} change": function(value, ev, newVal){
	 * 	    // update position of slider to newVal
	 * 	  },
	 * 	  calculatePercent: function(){
	 * 	    // check .slider's position and return a percent
	 * 	  }
	 * 	});
	 * 	
	 * 	new Slider("#slider", {percent: percent});
	 * 
	 * Widgets that listen to data changes and automatically update 
	 * themselves kick ass. It's what the V in MVC is all about.  
	 * 
	 * However, some enironments don't have observeable data. In an ideal
	 * world, you'd like to make your widgets still useful to them.
	 * 
	 * `can.compute` lets you have your cake and eat it too. Simply convert
	 * all options to compute.  Provide methods to update the compute
	 * values and listen to changes in computes.  Lets see how that
	 * looks with `PercentDone`:
	 * 
	 *     var PercentDone = can.Control({
	 *       init : function(){
	 *         this.options.val = can.compute(this.options.val)
	 *         // rebind event handlers
	 *         this.on();
	 *         this.updateContent();
	 *       },
	 *       val: function(value){
	 * 	       return this.options.val(value)
	 *       },
	 *       "{val} change" : "updateContent",
	 *       updateContent : function(){
	 *         this.element.html(this.options.val())
	 *       }
	 *     })
	 * 
	 * 
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
				// Let others konw to listen to changes in this compute
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
				}
				off = function(){
					can.unbind.call(getterSetter, eventName || propertyName,handler)
				}
				value = get();

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
		 * @attribute isComputed
		 * 
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
			 * @function bind
			 * `compute.bind("change", handler(event, newVal, oldVal))`
			 */
			bind: can.bindAndSetup,
			/**
			 * @function unbind
			 * `compute.unbind("change", handler(event, newVal, oldVal))`
			 */
			unbind: can.unbindAndTeardown
		});
	};
	can.compute.binder = computeBinder;
	return can.compute;
})

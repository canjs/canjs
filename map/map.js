// # can/map/map.js (aka can.Map)
// `can.Map` provides the observable pattern for JavaScript objects.
// It also provides a number of 
steal('can/util', 'can/util/bind','./bubble.js', './map_helpers.js','can/construct', 'can/util/batch', function (can, bind, bubble, mapHelpers) {
	
	/**
	 * @add can.Map
	 */
	// Extend [can.Construct](../construct/construct.html) to make inherting a `can.Map` easier.
	var Map = can.Map = can.Construct.extend(
		/**
		 * @static
		 */
		// ## Static Properties and Methods
		{
		// ### setup
		// Called when a Map constructor is defined/extended to
		// perform any initialization behavior for the new constructor
		// function.
		setup: function () {

			can.Construct.setup.apply(this, arguments);
			
			// A cached list of computed properties on the prototype.
			this._computedPropertyNames = [];

			// Do not run if we are defining can.Map.
			if (can.Map) {
				
				// Provide warnings if can.Map is used incorrectly.
				//!steal-remove-start
				if(this.prototype.define && !mapHelpers.define) {
					can.dev.warn("can/map/define is not included, yet there is a define property "+
						"used. You may want to add this plugin.");
				}
				if(this.define && !mapHelpers.define) {
					can.dev.warn("The define property should be on the map's prototype properties, "+
						"not the static properies. Also, can/map/define is not included.");
				}
				//!steal-remove-end
				
				// Create a placeholder for default values.
				if (!this.defaults) {
					this.defaults = {};
				}
				
				
				// Go through everything on the prototype.  If it's a primitive,
				// treat it as a default value.  If it's a compute, identify it so
				// it can be setup as a computed property.
				for (var prop in this.prototype) {
					if (
						prop !== "define" &&
						prop !== "constructor" &&
						(
							typeof this.prototype[prop] !== "function" ||
							this.prototype[prop].prototype instanceof can.Construct
						)
					) {
						this.defaults[prop] = this.prototype[prop];
					} else if (this.prototype[prop].isComputed) {
						this._computedPropertyNames.push(prop);
					}
				}
				
				// If define is a function, call it with this can.Map
				if(mapHelpers.define) {
					mapHelpers.define(this);
				}
			}
			
			// If we inherit from can.Map, but not can.List, make sure any lists are the correct type.
			if (can.List && !(this.prototype instanceof can.List)) {
				this.List = Map.List.extend({
					Map: this
				}, {});
			}

		},
		// ### shortName
		// Tells `can.Construct` to show this as a `Map` in the debugger.
		shortName: "Map",
		// Reference to bubbling helpers.
		// Given an eventName, determine if bubbling should be setup.
		_bubbleRule: function(eventName) {
			return (eventName === "change" || eventName.indexOf(".") >= 0 ) ?
				["change"] :
				[];
		},
		// Adds an event to this Map.
		bind: can.bindAndSetup,
		on: can.bindAndSetup,
		// Removes an event from this Map.
		unbind: can.unbindAndTeardown,
		off: can.unbindAndTeardown,
		// Name of the id field. Used in can.Model.
		id: "id",
		
		keys: function (map) {
			var keys = [];
			can.__observe(map, '__keys');
			for (var keyName in map._data) {
				keys.push(keyName);
			}
			return keys;
		}
	},
	/**
	 * @prototype
	 */
	// ## Prototype Properties and Methods
	{
		// ### setup
		// 
		setup: function (obj) {
			
			if(obj instanceof can.Map){
				obj = obj.serialize();
			}

			// `_data` is where we keep the properties.
			this._data = {};

			// The namespace this `object` uses to listen to events.
			can.cid(this, ".map");
			
			this._setupComputedProperties();
			
			var defaultValues = this._setupDefaults(obj);
			
			var teardownMapping = obj && mapHelpers.addToMap(obj, this);

			var data = can.extend(can.extend(true, {}, defaultValues), obj);

			this.attr(data);

			if (teardownMapping) {
				teardownMapping();
			}
		},
		// ### _setupComputes
		// Sets up computed properties on a Map. 
		// Stores information for each computed property on
		//  `this._computedAttrs` that looks like:
		// 
		// ```
		// {
		//   // the number of bindings on this property
		//   count: 1,       
		//   // a handler that forwards events on the compute
		//   // to the map instance
		//   handler: handler,
		//   compute: compute  // the compute
		// }	
		// ```
		_setupComputedProperties: function () {
			this._computedAttrs = {};
			
			var computes = this.constructor._computedPropertyNames;

			for (var i = 0, len = computes.length; i < len; i++) {
				setupComputeAttr(this, this._computedAttrs, computes[i]);
			}
		},
		// ### _setupDefaults
		// Returns the default values for the instance.
		_setupDefaults: function(){
			return this.constructor.defaults || {};
		},
		// ### _bindsetup and _bindteardown
		// Placeholders for bind setup and teardown.
		_bindsetup: function(){},
		_bindteardown: function(){},
		// ### _triggerChange
		// A helper function used to trigger events on this map.
		// 
		_triggerChange: function (attr, how, newVal, oldVal) {
			// so this change can bubble ... a bubbling change triggers the
			// _changes trigger
			if(bubble.isBubbling(this, "change")) {
				can.batch.trigger(this, {
					type: "change",
					target: this
				}, [attr, how, newVal, oldVal]);
				can.batch.trigger(this, {
					type: attr,
					target: this
				}, [newVal, oldVal]);
			} else {
				can.batch.trigger(this, {
					type: attr,
					target: this
				}, [newVal, oldVal]);
			}

			if(how === "remove" || how === "add") {
				can.batch.trigger(this, {
					type: "__keys",
					target: this
				});
			}
		},
		// Iterator that does not trigger live binding.
		_each: function (callback) {
			var data = this.__get();
			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					callback(data[prop], prop);
				}
			}
		},

		attr: function (attr, val) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a `number` or a `string`.
			var type = typeof attr;
			if (type !== "string" && type !== "number") {
				return this._attrs(attr, val);
			// If we are getting a value.
			} else if (arguments.length === 1) {
				return this._get(attr);
			} else {
				// Otherwise we are setting.
				this._set(attr, val);
				return this;
			}
		},

		each: function () {
			return can.each.apply(undefined, [this].concat(can.makeArray(arguments)));
		},

		removeAttr: function (attr) {
			// If this is List.
			var isList = can.List && this instanceof can.List,
				// Convert the `attr` into parts (if nested).
				parts = mapHelpers.attrParts(attr),
				// The actual property to remove.
				prop = parts.shift(),
				// The current value.
				current = isList ? this[prop] : this._data[prop];

			// If we have more parts, call `removeAttr` on that part.
			if (parts.length && current) {
				return current.removeAttr(parts);
			} else {

				// If attr does not have a `.`
				if (typeof attr === 'string' && !!~attr.indexOf('.')) {
					prop = attr;
				}

				this._remove(prop, current);
				return current;
			}
		},
		// Remove a property.
		_remove: function(prop, current){
			if (prop in this._data) {
				// Delete the property from `_data` and the Map
				// as long as it isn't part of the Map's prototype.
				delete this._data[prop];
				if (!(prop in this.constructor.prototype)) {
					delete this[prop];
				}
				// Let others now this property has been removed.
				this._triggerChange(prop, "remove", undefined, current);

			}
		},
		// Reads a property from the `object`.
		_get: function (attr) {
			attr = ""+attr;
			var dotIndex = attr.indexOf('.');


			// Handles the case of a key having a `.` in its name
			// Otherwise we have to dig deeper into the Map to get the value.
			if( dotIndex >= 0 ) {
				// Attempt to get the value
				var value = this.__get(attr);
				// For keys with a `.` in them, value will be defined
				if (value !== undefined) {
					return value;
				}
				var first = attr.substr(0, dotIndex),
					second = attr.substr(dotIndex+1);
				can.__observe(this, first);
				var current = this.__get( first );
				
				return current && current._get ?  current._get(second) : undefined;
			} else {
				can.__observe(this, attr);
				return this.__get( attr );
			}
		},
		// Reads a property directly if an `attr` is provided, otherwise
		// returns the "real" data object itself.
		__get: function (attr) {
			if (attr) {
				// If property is a compute return the result, otherwise get the value directly
				var computedAttr = this._computedAttrs[attr];
				if (computedAttr) {
					return computedAttr.compute();
				} else {
					return this._data[attr];
				}
			// If not property is provided, return entire `_data` object
			} else {
				return this._data;
			}
		},
		// converts the value into an observable if needed
		__type: function(value, prop){
			// If we are getting an object.
			if (!( value instanceof can.Map) && mapHelpers.canMakeObserve(value)  ) {

				var cached = mapHelpers.getMapFromObject(value);
				if(cached) {
					return cached;
				}
				if( can.isArray(value) ) {
					var List = can.List;
					return new List(value);
				} else {
					var Map = this.constructor.Map || can.Map;
					return new Map(value);
				}
			}
			return value;
		},
		// Sets `attr` prop as value on this object where.
		// `attr` - Is a string of properties or an array  of property values.
		// `value` - The raw value to set.
		_set: function (attr, value, keepKey) {
			attr = ""+attr;
			var dotIndex = attr.indexOf('.'),
				current;
			if(!keepKey && dotIndex >= 0){
				var first = attr.substr(0, dotIndex),
					second = attr.substr(dotIndex+1);

				current =  this._initializing ? undefined : this.__get( first );

				if( can.isMapLike(current) ) {
					current._set(second, value);
				} else {
					throw "can.Map: Object does not exist";
				}
			} else {
				if (this.__convert) {
					//Convert if there is a converter
					value = this.__convert(attr, value);
				}
				current = this._initializing ? undefined : this.__get( attr );
				this.__set(attr, this.__type(value, attr), current);
			}
		},
		__set: function (prop, value, current) {
			// TODO: Check if value is object and transform.
			// Don't do anything if the value isn't changing.
			if (value !== current) {
				// Check if we are adding this for the first time --
				// if we are, we need to create an `add` event.
				var changeType = current !== undefined || this.__get()
					.hasOwnProperty(prop) ? "set" : "add";

				// Set the value on `_data` and hook it up to send event.
				this.___set(prop, bubble.set(this, prop, value, current) );

				// `batchTrigger` the change event.
				if(!this._computedAttrs[prop]) {
					this._triggerChange(prop, changeType, value, current);
				}
				

				// If we can stop listening to our old value, do it.
				if (current) {
					bubble.teardownFromParent(this, current);
				}
			}

		},
		// Directly sets a property on this `object`.
		___set: function (prop, val) {
			var computedAttr = this._computedAttrs[prop];
			if ( computedAttr ) {
				computedAttr.compute(val);
			} else {
				this._data[prop] = val;
			}
			// Add property directly for easy writing.
			// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
			if ( typeof this.constructor.prototype[prop] !== 'function' && !computedAttr ) {
				this[prop] = val;
			}
		},
		one: can.one,
		bind: function (eventName, handler) {
			var computedBinding = this._computedAttrs && this._computedAttrs[eventName];
			if (computedBinding) {
				// The first time we bind to this computed property we
				// initialize `count` and `batchTrigger` the change event.
				if (!computedBinding.count) {
					computedBinding.count = 1;
					var self = this;
					computedBinding.handler = function (ev, newVal, oldVal) {
						can.batch.trigger(self, {
							type: eventName,
							batchNum: ev.batchNum,
							target: self
						}, [newVal, oldVal]);
					};
					computedBinding.compute.bind("change", computedBinding.handler);
				} else {
					// Increment number of things listening to this computed property.
					computedBinding.count++;
				}

			}
			// The first time we bind to this Map, `_bindsetup` will
			// be called to setup child event bubbling.
			bubble.bind(this, eventName);
			return can.bindAndSetup.apply(this, arguments);

		},

		unbind: function (eventName, handler) {
			var computedBinding = this._computedAttrs && this._computedAttrs[eventName];
			if (computedBinding) {
				// If there is only one listener, we unbind the change event handler
				// and clean it up since no one is listening to this property any more.
				if (computedBinding.count === 1) {
					computedBinding.count = 0;
					computedBinding.compute.unbind("change", computedBinding.handler);
					delete computedBinding.handler;
				} else {
					// Decrement number of things listening to this computed property
					computedBinding.count--;
				}

			}
			bubble.unbind(this, eventName);
			return can.unbindAndTeardown.apply(this, arguments);

		},

		serialize: function () {
			return mapHelpers.serialize(this, 'serialize', {});
		},
		/**
		 * @hide
		 * Set multiple properties on the observable
		 * @param {Object} props
		 * @param {Boolean} remove true if you should remove properties that are not in props
		 */
		_attrs: function (props, remove) {
			if (props === undefined) {
				return mapHelpers.serialize(this, 'attr', {});
			}

			props = can.simpleExtend({}, props);
			var prop,
				self = this,
				newVal;

			// Batch all of the change events until we are done.
			can.batch.start();
			// Merge current properties with the new ones.
			this.each(function (curVal, prop) {
				// You can not have a _cid property; abort.
				if (prop === "_cid") {
					return;
				}
				newVal = props[prop];

				// If we are merging, remove the property if it has no value.
				if (newVal === undefined) {
					if (remove) {
						self.removeAttr(prop);
					}
					return;
				}

				// Run converter if there is one
				if (self.__convert) {
					newVal = self.__convert(prop, newVal);
				}
				
				// If we're dealing with models, we want to call _set to let converters run.
				if ( can.isMapLike(newVal) ) {

					self.__set(prop, self.__type(newVal, prop), curVal);
					// If its an object, let attr merge.
				} else if ( can.isMapLike(curVal) && mapHelpers.canMakeObserve(newVal) ) {
					curVal.attr(newVal, remove);
					// Otherwise just set.
				} else if (curVal !== newVal) {
					self.__set(prop, self.__type(newVal, prop), curVal);
				}

				delete props[prop];
			});
			// Add remaining props.
			for (prop in props) {
				// Ignore _cid.
				if (prop !== "_cid") {
					newVal = props[prop];
					this._set(prop, newVal, true);
				}

			}
			can.batch.stop();
			return this;
		},

		compute: function (prop) {
			// If the property is a function, use it as the getter/setter
			// otherwise, create a new compute that returns the value of a property on `this`
			if (can.isFunction(this.constructor.prototype[prop])) {
				return can.compute(this[prop], this);
			} else {
				var reads = prop.split("."),
					last = reads.length - 1,
					options = {
						args: []
					};
				return can.compute(function (newVal) {
					if (arguments.length) {
						can.compute.read(this, reads.slice(0, last))
							.value.attr(reads[last], newVal);
					} else {
						return can.compute.read(this, reads, options)
							.value;
					}
				}, this);
			}

		}
	});

	// Setup on/off aliases
	Map.prototype.on = Map.prototype.bind;
	Map.prototype.off = Map.prototype.unbind;

	var setupComputeAttr = function(map, computedAttrs, attrName){
		computedAttrs[attrName] = {
			count: 0,
			// Make the context of the compute the current Map
			compute: map[attrName].clone(map),
			handler: function (ev, newVal, oldVal) {
				can.batch.trigger(map, {
					type: attrName,
					batchNum: ev.batchNum,
					target: map
				}, [newVal, oldVal]);
			}
		};
	};


	return Map;
});

// # can/map/map.js
// `can.Map` provides the observable pattern for JavaScript Objects.






steal('can/util', 'can/util/bind','./bubble.js', 'can/construct', 'can/util/batch', function (can, bind, bubble) {
	// ## Helpers

	// A temporary map of Maps that have been made from plain JS objects.
	var madeMap = null;
	// Clears out map of converted objects.
	var teardownMap = function () {
		for (var cid in madeMap) {
			if (madeMap[cid].added) {
				delete madeMap[cid].obj._cid;
			}
		}
		madeMap = null;
	};
	// Retrieves a Map instance from an Object.
	var getMapFromObject = function (obj) {
		return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
	};
	// A temporary map of Maps
	var serializeMap = null;


	/**
	 * @add can.Map
	 */
	//
	var Map = can.Map = can.Construct.extend({
			/**
			 * @static
			 */
			setup: function () {

				can.Construct.setup.apply(this, arguments);

				// Do not run if we are defining can.Map.
				if (can.Map) {
					if (!this.defaults) {
						this.defaults = {};
					}
					// Builds a list of compute and non-compute properties in this Object's prototype.
					this._computes = [];

					for (var prop in this.prototype) {
						// Non-functions are regular defaults.
						if (prop !== "define" && typeof this.prototype[prop] !== "function") {
							this.defaults[prop] = this.prototype[prop];
						// Functions with an `isComputed` property are computes.
						} else if (this.prototype[prop].isComputed) {
							this._computes.push(prop);
						}
					}
					this.helpers.define(this);
				}
				// If we inherit from can.Map, but not can.List, make sure any lists are the correct type.
				if (can.List && !(this.prototype instanceof can.List)) {
					this.List = Map.List.extend({
						Map: this
					}, {});
				}

			},
			// Reference to bubbling helpers.
			_bubble: bubble,
			// Given an eventName, determine if bubbling should be setup.
			_bubbleRule: function(eventName) {
				return (eventName === "change" || eventName.indexOf(".") >= 0 ) && "change";
			},
			// List of computes on the Map's prototype.
			_computes: [],
			// Adds an event to this Map.
			bind: can.bindAndSetup,
			on: can.bindAndSetup,
			// Removes an event from this Map.
			unbind: can.unbindAndTeardown,
			off: can.unbindAndTeardown,
			// Name of the id field. Used in can.Model.
			id: "id",
			// ## Internal helpers
			helpers: {
				// ### can.Map.helpers.define
				// Stub function for the define plugin.
				define: function(){},
				/**
				 * @hide
				 * Parses attribute name into its parts
				 * @param {String|Array} attr attribute name
				 * @param {Boolean} keepKey whether to keep the key intact
				 * @return {Array} attribute parts
				 */
				// ### can.Map.helpers.attrParts
				// Parses attribute name into its parts.
				attrParts: function (attr, keepKey) {
					//Keep key intact
					if (keepKey) {
						return [attr];
					}
					// Split key on '.'
					return can.isArray(attr) ? attr : ("" + attr)
						.split(".");
				},
				/**
				 * @hide
				 * Tracks Map instances created from JS Objects
				 * @param {Object} obj original Object
				 * @param {can.Map} instance the can.Map instance
				 * @return {Function} function to clear out object mapping
				 */
				// ### can.Map.helpers.addToMap
				// Tracks Map instances created from JS Objects
				addToMap: function (obj, instance) {
					var teardown;
					// Setup a fresh mapping if `madeMap` is missing.
					if (!madeMap) {
						teardown = teardownMap;
						madeMap = {};
					}
					// Record if Object has a `_cid` before adding one.
					var hasCid = obj._cid;
					var cid = can.cid(obj);

					// Only update if there already isn't one already.
					if (!madeMap[cid]) {

						madeMap[cid] = {
							obj: obj,
							instance: instance,
							added: !hasCid
						};
					}
					return teardown;
				},
				/**
				 * @hide
				 * Determines if `obj` is observable
				 * @param {Object} obj Object to check
				 * @return {Boolean} whether `obj` is an observable
				 */
				// ### can.Map.helpers.isObservable
				// Determines if `obj` is observable.
				isObservable: function(obj){
					return obj instanceof can.Map || (obj && obj === can.route);
				},
				/**
				 * @hide
				 * Determines if `obj` can be made into an observable
				 * @param {Object} obj Object to check
				 * @return {Boolean} whether `obj` can be made into an observable
				 */
				// ### can.Map.helpers.canMakeObserve
				// Determines if an object can be made into an observable.
				canMakeObserve: function (obj) {
					return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj) );
				},
				/**
				 * @hide
				 * Serializes a Map or Map.List
				 * @param {can.Map|can.List} map The observable.
				 * @param {String} how To serialize using `attr` or `serialize`.
				 * @param {String} where Object or Array to put properties in.
				 * @return {Object|Array} serialized Map or List data.
				 */
				// ### can.Map.helpers.serialize
				// Serializes a Map or Map.List
				serialize: function (map, how, where) {
					var cid = can.cid(map),
						firstSerialize = false;
					if(!serializeMap) {
						firstSerialize = true;
						// Serialize might call .attr() so we need to keep different map 
						serializeMap = {
							attr: {},
							serialize: {}
						};
					}
					serializeMap[how][cid] = where;
					// Go through each property.
					map.each(function (val, name) {
						// If the value is an `object`, and has an `attrs` or `serialize` function.
						var result,
							isObservable =  Map.helpers.isObservable(val),
							serialized = isObservable && serializeMap[how][can.cid(val)];
						if( serialized ) {
							result = serialized;
						} else {
							if(how === "serialize") {
								result = Map.helpers._serialize(map, name, val);
							} else {
								result = Map.helpers._getValue(map, name, val, how);
							}
						}
						// this is probably removable
						if(result !== undefined){
							where[name] = result;
						}
					});

					can.__reading(map, '__keys');
					if(firstSerialize) {
						serializeMap = null;
					}
					return where;
				},
				_serialize: function(map, name, val){
					return Map.helpers._getValue(map, name, val, "serialize");
				},
				_getValue: function(map, name, val, how){
					if( Map.helpers.isObservable(val) ) {
						return val[how]();
					} else {
						return val;
					}
				}
			},
			/**
			 * @hide
			 * Returns list of keys in a Map
			 * @param {can.Map} map
			 * @returns {Array}
			 */
			keys: function (map) {
				var keys = [];
				can.__reading(map, '__keys');
				for (var keyName in map._data) {
					keys.push(keyName);
				}
				return keys;
			}
		},
		/**
		 * @prototype
		 */
		{
			setup: function (obj) {
				// `_data` is where we keep the properties.
				this._data = {};
				/**
				 * @property {String} can.Map.prototype._cid
				 * @hide
				 *
				 * A globally unique ID for this `can.Map` instance.
				 */
				// The namespace this `object` uses to listen to events.
				can.cid(this, ".map");
				// Sets all `attrs`.
				this._init = 1;
				// It's handy if we pass this to comptues, because computes can have a default value.
				var defaultValues = this._setupDefaults();
				this._setupComputes(defaultValues);
				var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);

				var data = can.extend(can.extend(true, {}, defaultValues), obj);

				this.attr(data);

				if (teardownMapping) {
					teardownMapping();
				}

				// `batchTrigger` change events.
				this.bind('change', can.proxy(this._changes, this));

				delete this._init;
			},
			// Sets up computed properties on a Map.
			_setupComputes: function () {
				var computes = this.constructor._computes;
				this._computedBindings = {};

				for (var i = 0, len = computes.length, prop; i < len; i++) {
					prop = computes[i];
					// Make the context of the compute the current Map
					this[prop] = this[prop].clone(this);
					// Keep track of computed properties
					this._computedBindings[prop] = {
						count: 0
					};
				}
			},
			_setupDefaults: function(){
				return this.constructor.defaults || {};
			},
			// Setup child bindings.
			_bindsetup: function(){},
			// Teardown child bindings.
			_bindteardown: function(){},
			// `change`event handler.
			_changes: function (ev, attr, how, newVal, oldVal) {
				// when a change happens, create the named event.
				can.batch.trigger(this, {
					type: attr,
					batchNum: ev.batchNum
				}, [newVal, oldVal]);

				if(how === "remove" || how === "add") {
					can.batch.trigger(this, {
						type: "__keys",
						batchNum: ev.batchNum
					});
				}
			},
			// Trigger a change event.
			_triggerChange: function (attr, how, newVal, oldVal) {
				can.batch.trigger(this, "change", can.makeArray(arguments));
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
					// Let people know we are reading.
					can.__reading(this, attr);
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
					parts = can.Map.helpers.attrParts(attr),
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
				var value;
				// Handles the case of a key having a `.` in its name
				if (typeof attr === 'string' && !! ~attr.indexOf('.')) {
					// Attempt to get the value
					value = this.__get(attr);
					// For keys with a `.` in them, value will be defined
					if (value !== undefined) {
						return value;
					}
				}

				// Otherwise we have to dig deeper into the Map to get the value.
				// First, break up the attr (`"foo.bar"`) into parts like `["foo","bar"]`.
				var parts = can.Map.helpers.attrParts(attr),
					// Then get the value of the first attr name (`"foo"`).
					current = this.__get(parts.shift());
				// If there are other attributes to read...
				return parts.length ?
				// and current has a value...
				current ?
				// then lookup the remaining attrs on current
				current._get(parts) :
				// or if there's no current, return undefined.
				undefined :
				// If there are no more parts, return current.
				current;
			},
			// Reads a property directly if an `attr` is provided, otherwise
			// returns the "real" data object itself.
			__get: function (attr) {
				if (attr) {
					// If property is a compute return the result, otherwise get the value directly
					if (this._computedBindings[attr]) {
						return this[attr]();
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
				if (!( value instanceof can.Map) && can.Map.helpers.canMakeObserve(value)  ) {

					var cached = getMapFromObject(value);
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
				// Convert `attr` to attr parts (if it isn't already).
				var parts = can.Map.helpers.attrParts(attr, keepKey),
					// The immediate prop we are setting.
					prop = parts.shift(),
					// We only need to get the current value if we are not in init.
					current = this._init ? undefined : this.__get(prop);

				if ( parts.length && Map.helpers.isObservable(current) ) {
					// If we have an `object` and remaining parts that `object` should set it.
					current._set(parts, value);
				} else if (!parts.length) {
					// We're in "real" set territory.
					if (this.__convert) {
						//Convert if there is a converter
						value = this.__convert(prop, value);
					}
					this.__set(prop, this.__type(value, prop), current);
				} else {
					throw "can.Map: Object does not exist";
				}
			},
			__set: function (prop, value, current) {
				// TODO: Check if value is object and transform.
				// Don't do anything if the value isn't changing.
				if (value !== current) {
					// Check if we are adding this for the first time --
					// if we are, we need to create an `add` event.
					var changeType = this.__get()
						.hasOwnProperty(prop) ? "set" : "add";

					// Set the value on `_data` and hook it up to send event.
					this.___set(prop, this.constructor._bubble.set(this, prop, value, current) );

					// `batchTrigger` the change event.
					this._triggerChange(prop, changeType, value, current);

					// If we can stop listening to our old value, do it.
					if (current) {
						this.constructor._bubble.teardownFromParent(this, current);
					}
				}

			},
			// Directly sets a property on this `object`.
			___set: function (prop, val) {
				if ( this._computedBindings[prop] ) {
					this[prop](val);
				} else {
					this._data[prop] = val;
				}
				// Add property directly for easy writing.
				// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
				if (!can.isFunction(this.constructor.prototype[prop]) && !this._computedBindings[prop] ) {
					this[prop] = val;
				}
			},

			bind: function (eventName, handler) {
				var computedBinding = this._computedBindings && this._computedBindings[eventName];
				if (computedBinding) {
					// The first time we bind to this computed property we
					// initialize `count` and `batchTrigger` the change event.
					if (!computedBinding.count) {
						computedBinding.count = 1;
						var self = this;
						computedBinding.handler = function (ev, newVal, oldVal) {
							can.batch.trigger(self, {
								type: eventName,
								batchNum: ev.batchNum
							}, [newVal, oldVal]);
						};
						this[eventName].bind("change", computedBinding.handler);
					} else {
						// Increment number of things listening to this computed property.
						computedBinding.count++;
					}

				}
				// The first time we bind to this Map, `_bindsetup` will
				// be called to setup child event bubbling.
				this.constructor._bubble.bind(this, eventName);
				return can.bindAndSetup.apply(this, arguments);

			},

			unbind: function (eventName, handler) {
				var computedBinding = this._computedBindings && this._computedBindings[eventName];
				if (computedBinding) {
					// If there is only one listener, we unbind the change event handler
					// and clean it up since no one is listening to this property any more.
					if (computedBinding.count === 1) {
						computedBinding.count = 0;
						this[eventName].unbind("change", computedBinding.handler);
						delete computedBinding.handler;
					} else {
						// Decrement number of things listening to this computed property
						computedBinding.count--;
					}

				}
				this.constructor._bubble.unbind(this, eventName);
				return can.unbindAndTeardown.apply(this, arguments);

			},

			serialize: function () {
				return can.Map.helpers.serialize(this, 'serialize', {});
			},
			/**
			 * @hide
			 * Set multiple properties on the observable
			 * @param {Object} props
			 * @param {Boolean} remove true if you should remove properties that are not in props
			 */
			_attrs: function (props, remove) {
				if (props === undefined) {
					return Map.helpers.serialize(this, 'attr', {});
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
					if ( Map.helpers.isObservable( newVal ) ) {

						self.__set(prop, self.__type(newVal, prop), curVal);
						// If its an object, let attr merge.
					} else if (Map.helpers.isObservable(curVal) && Map.helpers.canMakeObserve(newVal) ) {
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

	return Map;
});

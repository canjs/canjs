// # can/map.js
//
// can.Map provides the observable pattern for JavaScript Objects.

steal('can/util', 'can/util/bind', 'can/construct', 'can/util/batch', function (can, bind) {

	// ##Helpers
	// Make parent listen to a child's change events
	var bindToChildAndBubbleToParent = function (child, prop, parent) {
		can.listenTo.call(parent, child, "change", function ( /* ev, attr */ ) {
			var args = can.makeArray(arguments),
				ev = args.shift();
			//Make attr name relative to the parent
			args[0] = (prop === "*" ? [parent.indexOf(child), args[0]] : [prop, args[0]])
				.join(".");

			// track objects dispatched on this map
			ev.triggeredNS = ev.triggeredNS || {};

			// if it has already been dispatched; exit
			if (ev.triggeredNS[parent._cid]) {
				return;
			}

			ev.triggeredNS[parent._cid] = true;
			// send change event with modified attr to parent
			can.trigger(parent, ev, args);
		});
	};
	// Setup child binding and event bubbling to parent
	var makeBindSetup = function (wildcard) {
		return function () {
			var parent = this;
			this._each(function (child, prop) {
				// If child can be bound
				if (child && child.bind) {
					// Setup child to parent bubbling
					bindToChildAndBubbleToParent(child, wildcard || prop, parent);
				}
			});
		};
	};
	// A temporary map of Maps that have already been made from plain JS objects
	var madeMap = null;
	// Clears out map of converted objects
	var teardownMap = function () {
		for (var cid in madeMap) {
			if (madeMap[cid].added) {
				delete madeMap[cid].obj._cid;
			}
		}
		madeMap = null;
	};
	// Retrieves a Map instance from an Object
	var getMapFromObject = function (obj) {
		return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
	};

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

				// Do not run if we are defining can.Map
				if (can.Map) {
					if (!this.defaults) {
						this.defaults = {};
					}
					// Builds a list of compute and non-compute properties in this Object's prototype
					this._computes = [];
					for (var prop in this.prototype) {
						// Non-functions are regular defaults
						if (typeof this.prototype[prop] !== "function") {
							this.defaults[prop] = this.prototype[prop];
						// functions with an isComputed property are computes
						} else if (this.prototype[prop].isComputed) {
							this._computes.push(prop);
						}
					}
				}

				// if we inerit from can.Map, but not can.List
				if (can.List && !(this.prototype instanceof can.List)) {
					// Make sure any lists are the correct type
					this.List = Map.List({
						Map: this
					}, {});
				}

			},
			// List of computes on the Object's prototype
			_computes: [],
			// Adds an event to this Object
			bind: can.bindAndSetup,
			on: can.bindAndSetup,
			// Removes an event from this Object
			unbind: can.unbindAndTeardown,
			off: can.unbindAndTeardown,
			// Name of the id field. Used in can.Model.
			id: "id",
			// Internal helpers
			helpers: {
				/**
				 * @hide
				 * Parses attribute name into its parts
				 * @param {String|Array} attr attribute name
				 * @param {Boolean} keepKey whether to keep the key intact
				 * @return {Array} attribute parts
				 */
				 // ## can.Map.helpers.attrParts
				 // Parses attribute name into its parts
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
				 // ## can.Map.helpers.addToMap
				 // Tracks Map instances created from JS Objects
				addToMap: function (obj, instance) {
					var teardown;
					// Setup a fresh mapping if `madeMap` is missing
					if (!madeMap) {
						teardown = teardownMap;
						madeMap = {};
					}
					// Record if Object has a `_cid` before adding one
					var hasCid = obj._cid;
					var cid = can.cid(obj);

					// Only update if there already isn't one already
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
				 * Determines if `obj` can be made into an observable
				 * @param {Object} obj Object to check
				 * @return {Boolean} whether `obj` can be made into an observable
				 */
				 // ## can.Map.helpers.canMakeObserve
				 // Determines if an object can be made into an observable
				canMakeObserve: function (obj) {
					return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj) || (obj instanceof can.Map));
				},
				/**
				 * @hide
				 * Removes child event bubbling from parent
				 * @param {Array} items children to stop listening to
				 * @param {can.Map|can.List} parent parent observable
				 * @return {Array}
				 */
				 // ## can.Map.helpers.unhookup
				 // Removes child event bubbling from parent
				unhookup: function (items, parent) {
					return can.each(items, function (item) {
						if (item && item.unbind) {
							can.stopListening.call(parent, item, "change");
						}
					});
				},
				/**
				 * @hide
				 * Listens to changes on `child` and "bubbles" the event up.
				 * `child` is turned into a can.Map or can.List.
				 * @param {Object} child the object to listen for changes on.
				 * @param {String} prop The name of the property to listen to.
				 * @param {can.Map} parent The parent object of prop.
				 * @param {Function} Ob The Map constructor
				 * @param {Function} List the List constructor
				 * @return {can.Map|can.List} The child Map or List
				 */
				 // ## can.Map.helpers.unhookup
				 // Adds child event bubbling to parent
				hookupBubble: function (child, prop, parent, Ob, List) {
					Ob = Ob || Map;
					List = List || can.List;
					prop = typeof prop === 'function' ? prop() : prop;

					// If it's an `array` make a list, otherwise a child.
					if (child instanceof Map) {
						// We have a Map; make sure we are not listening to this already.
						// It's only listening if it has bindings already.
						if (parent._bindings) {
							Map.helpers.unhookup([child], parent);
						}
					} else if (can.isArray(child)) {
						// Create a new List
						child = getMapFromObject(child) || new List(child);
					} else {
						// Create a new child Map
						child = getMapFromObject(child) || new Ob(child);
					}

					// Only listen if something is listening to you
					if (parent._bindings) {
						// Listen to all changes and `batchTrigger` upwards.
						bindToChildAndBubbleToParent(child, prop, parent);
					}

					return child;
				},
				/**
				 * @hide
				 * Serializes a Map or Map.List
				 * @param {can.Map|can.List} map The observable.
				 * @param {String} how To serialize using `attr` or `serialize`.
				 * @param {String} where Object or Array to put properties in.
				 * @return {Object|Array} serialized Map or List data.
				 */
				 // ## can.Map.helpers.serialize
				 // Serializes a Map or Map.List
				serialize: function (map, how, where) {
					// Go through each property.
					map.each(function (val, name) {
						// If the value is an `object`, and has an `attrs` or `serialize` function.
						where[name] = Map.helpers.canMakeObserve(val) && can.isFunction(val[how]) ?
						// Call `attrs` or `serialize` to get the original data back.
						val[how]() :
						// Otherwise return the value.
						val;

						can.__reading(map, name);
					});

					// Let others know the number of keys have changed
					can.__reading(map, '__keys');

					return where;
				},
				makeBindSetup: makeBindSetup
			},
			/**
			 * @hide
			 * Returns list of keys in a Map
			 * @param {can.Map} map
			 * @returns {Array}
			 */
			keys: function (map) {
				var keys = [];
				// Let others know the number of keys have changed
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
				// Setup computed attributes
				this._setupComputes();
				var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);
				// Setup default attribute values
				var data = can.extend(can.extend(true, {}, this.constructor.defaults || {}), obj);
				this.attr(data);

				if (teardownMapping) {
					teardownMapping();
				}

				this.bind('change', can.proxy(this._changes, this));

				delete this._init;
			},
			// Sets up computed properties on a Map
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
			// Setup child bindings
			_bindsetup: makeBindSetup(),
			// Teardown child bindings
			_bindteardown: function () {
				var self = this;
				this._each(function (child) {
					Map.helpers.unhookup([child], self);
				});
			},
			// `change`event handler
			_changes: function (ev, attr, how, newVal, oldVal) {
				// when a change happens, forward the event
				can.batch.trigger(this, {
					type: attr,
					batchNum: ev.batchNum
				}, [newVal, oldVal]);
			},
			// Trigger a change event
			_triggerChange: function (attr, how, newVal, oldVal) {
				can.batch.trigger(this, "change", can.makeArray(arguments));
			},
			// Iterator that does not trigger live binding
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
				can.__reading(this, '__keys');
				return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)));
			},
			removeAttr: function (attr) {
				// If this is List or not
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
					if (!!~attr.indexOf('.')) {
						prop = attr;
					}
					if (isList) {
						// Use splice on a list
						this.splice(prop, 1);
					} else if (prop in this._data) {
						//Otherwise delete the data from `_data`
						delete this._data[prop];
						// Create the event.
						if (!(prop in this.constructor.prototype)) {
							delete this[prop];
						}
						// Let others know the number of keys have changed
						can.batch.trigger(this, "__keys");
						// Let others now this property has been removed
						this._triggerChange(prop, "remove", undefined, current);

					}
					return current;
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
				// Otherwise we have to dig deeper into the Map to get the value

				// break up the attr (`"foo.bar"`) into parts like `["foo","bar"]`
				var parts = can.Map.helpers.attrParts(attr),
					// get the value of the first attr name (`"foo"`)
					current = this.__get(parts.shift());
				// if there are other attributes to read
				return parts.length ?
				// and current has a value
				current ?
				// lookup the remaining attrs on current
				current._get(parts) :
				// or if there's no current, return undefined
				undefined :
				// if there are no more parts, return current
				current;
			},
			// Reads a property directly if an `attr` is provided, otherwise
			// returns the "real" data object itself.
			__get: function (attr) {
				if (attr) {
					// If it is a compute return the result
					if (this[attr] && this[attr].isComputed && can.isFunction(this.constructor.prototype[attr])) {
						return this[attr]();
					// Otherwise get the value directly
					} else {
						return this._data[attr];
					}
				// Return entire data object
				} else {
					return this._data;
				}
			},
			// Sets `attr` prop as value on this object where.
			// `attr` - Is a string of properties or an array  of property values.
			// `value` - The raw value to set.
			_set: function (attr, value, keepKey) {
				// Convert `attr` to attr parts (if it isn't already).
				var parts = can.Map.helpers.attrParts(attr, keepKey),
					// The immediate prop we are setting.
					prop = parts.shift(),
					// The current value.
					current = this.__get(prop);

				// If we have an `object` and remaining parts.
				if ( parts.length && Map.helpers.canMakeObserve(current) ) {
					// That `object` should set it (this might need to call attr).
					current._set(parts, value);
				} else if (!parts.length) {
					// We're in "real" set territory.
					if (this.__convert) {
						//Convert if there is a converter
						value = this.__convert(prop, value);
					}
					this.__set(prop, value, current);
				} else {
					throw "can.Map: Object does not exist";
				}
			},
			__set: function (prop, value, current) {
				// TODO: Check if value is object and transform
				// are we changing the value.
				if (value !== current) {
					// Check if we are adding this for the first time --
					// if we are, we need to create an `add` event.
					var changeType = this.__get()
						.hasOwnProperty(prop) ? "set" : "add";

					// Set the value on data.
					this.___set(prop,

						// If we are getting an object.
						Map.helpers.canMakeObserve(value) ?

						// Hook it up to send event.
						Map.helpers.hookupBubble(value, prop, this) :
						// Value is normal.
						value);

					if (changeType === "add") {
						// If there is no current value, let others know that
						// the the number of keys have changed

						can.batch.trigger(this, "__keys", undefined);

					}
					// `batchTrigger` the change event.
					this._triggerChange(prop, changeType, value, current);

					// If we can stop listening to our old value, do it.
					if (current) {
						Map.helpers.unhookup([current], this);
					}
				}

			},
			// Directly sets a property on this `object`.
			___set: function (prop, val) {

				// Handle computed properties
				if (this[prop] && this[prop].isComputed && can.isFunction(this.constructor.prototype[prop])) {
					this[prop](val);
				}

				this._data[prop] = val;
				// Add property directly for easy writing.
				// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
				if (!(can.isFunction(this.constructor.prototype[prop]))) {
					this[prop] = val;
				}
			},
			bind: function (eventName, handler) {
				var computedBinding = this._computedBindings && this._computedBindings[eventName];
				if (computedBinding) {
					// If this is the first time binding to this computed property
					if (!computedBinding.count) {
						// Initialize the count
						computedBinding.count = 1;
						var self = this;
						// `batchTrigger` the change event
						computedBinding.handler = function (ev, newVal, oldVal) {
							can.batch.trigger(self, {
								type: eventName,
								batchNum: ev.batchNum
							}, [newVal, oldVal]);
						};
						this[eventName].bind("change", computedBinding.handler);
					} else {
						// Increment number of things listening to this computed property
						computedBinding.count++;
					}

				}
				return can.bindAndSetup.apply(this, arguments);

			},
			unbind: function (eventName, handler) {
				var computedBinding = this._computedBindings && this._computedBindings[eventName];
				if (computedBinding) {
					// If there is only one other listener
					if (computedBinding.count === 1) {
						computedBinding.count = 0;
						// Stop listening to the `change` event
						this[eventName].unbind("change", computedBinding.handler);
						// Cleanup the event handler
						delete computedBinding.handler;
					} else {
						// Decrement number of things listening to this computed property
						computedBinding.count--;
					}
				}
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

				// Batch all of the change events until we are done
				can.batch.start();
				// Merge current properties with the new ones
				this.each(function (curVal, prop) {
					// you can not have a _cid property; abort
					if (prop === "_cid") {
						return;
					}
					newVal = props[prop];

					// If we are merging
					if (newVal === undefined) {
						if (remove) {
							// Remove the property if it has no value
							self.removeAttr(prop);
						}
						return;
					}

					// Run converter if there is one
					if (self.__convert) {
						newVal = self.__convert(prop, newVal);
					}

					// if we're dealing with models, want to call _set to let converter run
					if (newVal instanceof can.Map) {
						self.__set(prop, newVal, curVal);
						// if its an object, let attr merge
					} else if (Map.helpers.canMakeObserve(curVal) && Map.helpers.canMakeObserve(newVal) && curVal.attr) {
						curVal.attr(newVal, remove);
						// otherwise just set
					} else if (curVal !== newVal) {
						self.__set(prop, newVal, curVal);
					}

					delete props[prop];
				});
				// Add remaining props.
				for (prop in props) {
					// Ignore _cid
					if (prop !== "_cid") {
						newVal = props[prop];
						this._set(prop, newVal, true);
					}

				}
				can.batch.stop();
				return this;
			},
			compute: function (prop) {
				// If the property is a function
				if (can.isFunction(this.constructor.prototype[prop])) {
					// Use it as the getter/setter
					return can.compute(this[prop], this);
				} else {
					// Otherwise, create a new compute that returns the value of a property on this
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

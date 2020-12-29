// # can/map/map.js (aka can.Map)
// `can.Map` provides the observable pattern for JavaScript objects. It
// provides an `attr` and `removeAttr` method that can be used to get/set and
// remove properties and nested properties by calling a "pipeline" of protected
// methods:
//
// - `_get`, `_set`, `_remove` - handle nested properties.
// - `__get`, `__set`, `__remove` - handle triggering events.
// - `___get`, `___set`, `___remove` - read / write / remove raw values.
//
// When `attr` gets or sets multiple properties it calls `_getAttrs` or `_setAttrs`.
//
// [bubble.js](bubble.html) - Handles bubbling of child events to parent events.
// [map_helpers.js](map_helpers.html) - Assorted helpers for handling cycles during serialization or
// instantition of objects.
steal('can/util', 'can/util/bind','./bubble.js', './map_helpers.js','can/construct', 'can/util/batch', 'can/compute/get_value_and_bind.js', function (can, bind, bubble, mapHelpers) {

	// properties that can't be observed on ... no matter what
	var unobservable = {
		"constructor": true
	};

	// Extend [can.Construct](../construct/construct.html) to make inheriting a `can.Map` easier.
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
			setup: function (baseMap) {

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
						"not the static properties. Also, can/map/define is not included.");
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
						mapHelpers.define(this, baseMap.prototype.define);
					}
				}

				// If we inherit from can.Map, but not can.List, create a can.List that
				// creates instances of this Map type.
				if (can.List && !(this.prototype instanceof can.List)) {
					this.List = Map.List.extend({
						Map: this
					}, {});
				}

			},
			// ### shortName
			// Tells `can.Construct` to show instance as `Map` in the debugger.
			shortName: "Map",

			// ### _bubbleRule
			// Returns which events to setup bubbling on for a given bound event.
			// By default, only bubbles "change" events if someone listens to a
			// "change" event or a nested event like "foo.bar".
			_bubbleRule: function(eventName) {
				return (eventName === "change" || eventName.indexOf(".") >= 0 ) ?
					["change"] :
					[];
			},

			// ### bind,  unbind
			// Listen to events on the Map constructor.  These
			// are here mostly for can.Model.
			bind: can.bindAndSetup,
			unbind: can.unbindAndTeardown,

			// ### id
			// Name of the id field. Used in can.Model.
			id: "id",

			// ### keys
			// An observable way to get the keys from a map.
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
			// Initializes the map instance's behavior.
			setup: function (obj) {

				if(obj instanceof can.Map){
					obj = obj.serialize();
				}

				// Where we keep the values of the compute.
				this._data = {};

				// The namespace this `object` uses to listen to events.
				can.cid(this, ".map");

				this._setupComputedProperties();

				var teardownMapping = obj && mapHelpers.addToMap(obj, this);

				var defaultValues = this._setupDefaults(obj);
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
					var attrName = computes[i];
					mapHelpers.addComputedAttr(this, attrName, this[attrName].clone(this));
				}
			},

			// ### _setupDefaults
			// Returns the default values for the instance.
			_setupDefaults: function(){
				return this.constructor.defaults || {};
			},

			// ### attr
			// The primary get/set interface for can.Map.
			// Calls `_get`, `_set` or `_attrs` depending on
			// how it is called.
			attr: function (attr, val) {
				var type = typeof attr;
				if(attr === undefined) {
					return this._getAttrs();
				} else if (type !== "string" && type !== "number") {
					// Get or set multiple attributes.
					return this._setAttrs(attr, val);
				}
				else if (arguments.length === 1) {
					// Get a single attribute.
					return this._get(attr+"");
				} else {
					// Set an attribute.
					this._set(attr+"", val);
					return this;
				}
			},

			// ### _get
			// Handles reading nested properties like "foo.bar" by
			// getting the value of "foo" and recursively
			// calling `_get` for the value of "bar".
			// To read the actual values, `_get` calls
			// `___get`.
			_get: function (attr) {
				var dotIndex = attr.indexOf('.');

				if( dotIndex >= 0 ) {

					// Attempt to get the value anyway in case
					// somone wrote `new can.Map({"foo.bar": 1})`.
					var value = this.___get(attr);
					if (value !== undefined) {
						can.__observe(this, attr);
						return value;
					}

					var first = attr.substr(0, dotIndex),
						second = attr.substr(dotIndex+1);

					var current = this.__get( first );

					return current && current._get ?  current._get(second) : undefined;
				} else {
					return this.__get( attr );
				}
			},

			// ### __get
			// Signals `can.compute` that an observable
			// property is being read.
			__get: function(attr){
				if(!unobservable[attr] && !this._computedAttrs[attr]) {
					can.__observe(this, attr);
				}
				return this.___get( attr );
			},

			// ### ___get
			// When called with an argument, returns the value of this property. If that
			// property is represented by a computed attribute, return the value of that compute.
			// If no argument is provided, return the raw data.
			___get: function (attr) {
				if (attr !== undefined) {
					var computedAttr = this._computedAttrs[attr];
					if (computedAttr && computedAttr.compute) {
						// return computedAttr.compute();
						return computedAttr.compute();
					} else {
						return this._data.hasOwnProperty(attr) ? this._data[attr] : undefined;
					}
				} else {
					return this._data;
				}
			},

			// ### _set
			// Handles setting nested properties by finding the
			// nested observable and recursively calling `_set` on it. Eventually,
			// it calls `__set` with the `__type` converted value to set
			// and the current value.  The current value is passed for two reasons:
			//  - so `__set` can trigger an event if the value has changed.
			//  - for advanced setting behavior that define.set can do.
			//
			// If the map is initializing, the current value does not need to be
			// read because no change events are dispatched anyway.
			_set: function (attr, value, keepKey) {

				var dotIndex = attr.indexOf('.'),
					current;

				if(dotIndex >= 0 && !keepKey){
					var first = attr.substr(0, dotIndex),
						second = attr.substr(dotIndex+1);

					current =  this.__inSetup ? undefined : this.___get( first );

					if( can.isMapLike(current) ) {
						current._set(second, value);
					} else {
						throw new Error("can.Map: Object does not exist");
					}

				} else {
					current = this.__inSetup ? undefined : this.___get( attr );

					// //Convert if there is a converter.  Remove in 3.0.
					if (this.__convert) {
						value = this.__convert(attr, value);
					}

					this.__set(attr, this.__type(value, attr), current);
				}
			},

			// ## __type
			// Converts set values to another type.  By default,
			// this converts Objects to can.Maps and Arrays to
			// can.Lists.
			// This also makes it so if a plain JavaScript object
			// has already been converted to a list or map, that same
			// list or map instance is used.
			__type: function(value, prop){

				if (typeof value === "object" && !( value instanceof can.Map) && mapHelpers.canMakeObserve(value)  ) {

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

			// ## __set
			// Handles firing events if the value has changed and
			// works with the `bubble` helpers to setup bubbling.
			// Calls `___set` to do the actual setting.
			__set: function (prop, value, current) {

				if (value !== current) {
					var computedAttr = this._computedAttrs[prop];

					// Dispatch an "add" event if adding a new property.
					var changeType = computedAttr || current !== undefined || this.___get()
						.hasOwnProperty(prop) ? "set" : "add";

					// Set the value on `_data` and set up bubbling.
					this.___set(prop, typeof value === "object" ? bubble.set(this, prop, value, current) : value );

					// Computed properties change events are already forwarded except if
					// no one is listening to them.
					if(!computedAttr || !computedAttr.count) {
						this._triggerChange(prop, changeType, value, current);
					}


					// Stop bubbling old nested maps.
					if (typeof current === "object") {
						bubble.teardownFromParent(this, current);
					}
				}
			},

			// ### ___set
			// Directly saves the set value as a property on `_data`
			// or sets the computed attribute.
			___set: function (prop, val) {
				var computedAttr = this._computedAttrs[prop];
				if ( computedAttr && computedAttr.compute ) {
					computedAttr.compute(val);
				} else {
					this._data[prop] = val;
				}

				// Adds the property directly to the map instance. But first,
				// checks that it's not overwriting a method. This should be removed
				// in 3.0.
				if ( typeof this.constructor.prototype[prop] !== 'function' && !computedAttr ) {
					this[prop] = val;
				}
			},

			removeAttr: function (attr) {
				return this._remove(attr);
			},

			// ### _remove
			// Handles removing nested observes.
			_remove: function(attr){
				// If this is List.
				var parts = mapHelpers.attrParts(attr),
				// The actual property to remove.
					prop = parts.shift(),
				// The current value.
					current = this.___get(prop);

				// If we have more parts, call `removeAttr` on that part.
				if (parts.length && current) {
					return current.removeAttr(parts);
				} else {

					// If attr does not have a `.`
					if (typeof attr === 'string' && !!~attr.indexOf('.')) {
						prop = attr;
					}

					this.__remove(prop, current);
					return current;
				}
			},

			// ### __remove
			// Handles triggering an event if a property could be removed.
			__remove: function(prop, current){
				if (prop in this._data) {
					this.___remove(prop);
					// Let others now this property has been removed.
					this._triggerChange(prop, "remove", undefined, current);
				}
			},

			// ### ___remove
			// Deletes a property from `_data` and the map instance.
			___remove: function(prop){
				delete this._data[prop];
				if (!(prop in this.constructor.prototype)) {
					delete this[prop];
				}
			},

			// ### ___serialize
			// Serializes a property.  Uses map helpers to
			// recursively serialize nested observables.
			___serialize: function(name, val){
				return mapHelpers.getValue(this, name, val, "serialize");
			},

			// ### _getAttrs
			// Returns the values of all attributes as a plain JavaScript object.
			_getAttrs: function(){
				return mapHelpers.serialize(this, 'attr', {});
			},
			// ### _setAttrs
			// Sets multiple properties on this object at once.
			// First, goes through all current properties and either merges
			// or removes old properties.
			// Then it goes through the remaining ones to be added and sets those properties.
			_setAttrs: function (props, remove) {
				props = can.simpleExtend({}, props);
				var prop,
					self = this,
					newVal;

				// Batch all of the change events until we are done.
				can.batch.start();
				// Merge current properties with the new ones.
				this._each(function (curVal, prop) {
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

					// Run converter if there is one. Remove in 3.0.
					if (self.__convert) {
						newVal = self.__convert( prop, newVal );
					}

					if ( can.isMapLike(curVal) && mapHelpers.canMakeObserve(newVal) ) {
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

			serialize: function () {
				return mapHelpers.serialize(this, 'serialize', {});
			},


			// ### _triggerChange
			// A helper function used to trigger events on this map.
			// If the map is bubbling, this will fire a change event.
			// Otherwise, it only fires a "named" event. Triggers a
			// "__keys" event if a property has been added or removed.
			_triggerChange: function (attr, how, newVal, oldVal, batchNum) {

				if(bubble.isBubbling(this, "change")) {
					can.batch.trigger(this, {
						type: "change",
						target: this,
						batchNum: batchNum
					}, [attr, how, newVal, oldVal]);

				}

				can.batch.trigger(this, {
					type: attr,
					target: this,
					batchNum: batchNum
				}, [newVal, oldVal]);

				if(how === "remove" || how === "add") {
					can.batch.trigger(this, {
						type: "__keys",
						target: this,
						batchNum: batchNum
					});
				}
			},

			// ### _bindsetup and _bindteardown
			// Placeholders for bind setup and teardown.
			_bindsetup: function(){},
			_bindteardown: function(){},

			// ### one
			// Listens once to an event.
			one: can.one,

			// ### bind
			// Listens to an event on a map.
			// If the event is a  computed property,
			// listen to the compute and forward its events
			// to this map.
			bind: function (eventName, handler) {

				var computedBinding = this._computedAttrs && this._computedAttrs[eventName];
				if (computedBinding && computedBinding.compute) {
					if (!computedBinding.count) {
						computedBinding.count = 1;
						computedBinding.compute.bind("change", computedBinding.handler);
					} else {
						computedBinding.count++;
					}

				}

				// Sets up bubbling if needed.
				bubble.bind(this, eventName);

				return can.bindAndSetup.apply(this, arguments);
			},

			// ### unbind
			// Stops listening to an event.
			// If this is the last listener of a computed property,
			// stop forwarding events of the computed property to this map.
			unbind: function (eventName, handler) {
				var computedBinding = this._computedAttrs && this._computedAttrs[eventName];
				if (computedBinding) {
					if (computedBinding.count === 1) {
						computedBinding.count = 0;
						computedBinding.compute.unbind("change", computedBinding.handler);
					} else {
						computedBinding.count--;
					}

				}

				// Teardown bubbling if needed.
				bubble.unbind(this, eventName);
				return can.unbindAndTeardown.apply(this, arguments);

			},

			// ### compute
			// Creates a compute that represents a value on this map. If the property is a function
			// on the prototype, a "function" compute wil be created.
			// Otherwise, a compute will be created that reads the observable attributes.
			compute: function (prop) {

				if (can.isFunction(this.constructor.prototype[prop])) {

					return can.compute(this[prop], this);
				} else {

					var reads = can.compute.read.reads(prop),
						last = reads.length - 1;

					return can.compute(function (newVal) {
						if (arguments.length) {
							can.compute.read(this, reads.slice(0, last))
								.value.attr(reads[last].key, newVal);
						} else {
							return can.compute.read(this, reads, {
								args: []
							}).value;
						}
					}, this);
				}

			},

			// ### each
			// loops through all the key-value pairs on this map.
			each: function () {
				return can.each.apply(undefined, [this].concat(can.makeArray(arguments)));
			},

			// ### _each
			// Iterator that does not trigger live binding.
			_each: function (callback) {
				var data = this.___get();
				for (var prop in data) {
					if (data.hasOwnProperty(prop)) {
						callback(data[prop], prop);
					}
				}
			},

			dispatch: can.dispatch
		});

	// ### etc
	// Setup on/off aliases
	Map.prototype.on = Map.prototype.bind;
	Map.prototype.off = Map.prototype.unbind;
	Map.on = Map.bind;
	Map.off = Map.unbind;

	return Map;
});

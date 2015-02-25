steal('can/util', 'can/observe', function (can) {

	var getPropDefineBehavior = function(behavior, prop, define) {
		var propBehavior;
		if(define) {
			propBehavior = define[prop] ? define[prop] : define["*"];
			return propBehavior && propBehavior[behavior];
		}
	};

	can.Map.helpers.define = function (Map) {
		var define = Map.prototype.define;
		//!steal-remove-start
		if(Map.define){
			can.dev.warn("The define property should be on the map's prototype properties, "+
				"not the static properies.");
		}
		//!steal-remove-end
		Map.defaultGenerators = {};
		for (var prop in define) {
			if ("value" in define[prop]) {
				if (typeof define[prop].value === "function") {
					Map.defaultGenerators[prop] = define[prop].value;
				} else {
					Map.defaults[prop] = define[prop].value;
				}
			}
			if (typeof define[prop].Value === "function") {
				(function (Constructor) {
					Map.defaultGenerators[prop] = function () {
						return new Constructor();
					};
				})(define[prop].Value);
			}
		}
	};


	var oldSetupDefaults = can.Map.prototype._setupDefaults;
	can.Map.prototype._setupDefaults = function (obj) {
		var defaults = oldSetupDefaults.call(this),
			propsCommittedToAttr = {},
			Map = this.constructor,
			originalGet = this._get;

		// Temporarily overwrite this._get with a version that commits defaults to
		// this.attr() as they are used in other generated defaults. Because
		// calling this.attr() for each individual default would be expensive.
		this._get = function (originalProp) {

			// If a this.attr() was called using dot syntax (e.g number.0),
			// disregard everything after the "." until we call the
			// original this._get().
			prop = (originalProp.indexOf('.') !== -1 ?
				originalProp.substr(0, originalProp.indexOf('.')) :
				prop);

			// If this property has a default and we haven't yet committed it to
			// this.attr()
			if ((prop in defaults) && ! (prop in propsCommittedToAttr)) {

				// Commit the property's default so that it can be read in
				// other defaultGenerators.
				this.attr(prop, defaults[prop]);

				// Make note so that we don't commit this property again.
				propsCommittedToAttr[prop] = true;
			}

			return originalGet.apply(this, arguments);
		};

		for (var prop in Map.defaultGenerators) {
			// Only call the prop's value method if the property wasn't provided
			// during instantiation.
			if (! obj || ! (prop in obj)) {
				defaults[prop] = Map.defaultGenerators[prop].call(this);
			}
		}

		// Replace original this.attr
		this._get = originalGet;

		return defaults;
	};


	var proto = can.Map.prototype,
		__set = proto.__set;
	proto.__set = function (prop, value, current, success, error) {
		//!steal-remove-start
		var asyncTimer;
		//!steal-remove-end

		// check if there's a setter
		var errorCallback = function (errors) {
				//!steal-remove-start
				clearTimeout(asyncTimer);
				//!steal-remove-end

				var stub = error && error.call(self, errors);
				// if 'validations' is on the page it will trigger
				// the error itself and we dont want to trigger
				// the event twice. :)
				if (stub !== false) {
					can.trigger(self, 'error', [
						prop,
						errors
					], true);
				}
				return false;
			},
			self = this,
			setter = getPropDefineBehavior("set", prop, this.define),
			getter = getPropDefineBehavior("get", prop, this.define);


		// if we have a setter
		if (setter) {
			// call the setter, if returned value is undefined,
			// this means the setter is async so we
			// do not call update property and return right away
			can.batch.start();
			var setterCalled = false,

				setValue = setter.call(this, value, function (value) {
					__set.call(self, prop, value, current, success, errorCallback);
					setterCalled = true;
					//!steal-remove-start
					clearTimeout(asyncTimer);
					//!steal-remove-end
				}, errorCallback);
			if (getter) {
				// if there's a getter we do nothing
				can.batch.stop();
				return;
			}
			// if it took a setter and returned nothing, don't set the value
			else if (setValue === undefined && !setterCalled && setter.length >= 2) {
				//!steal-remove-start
				asyncTimer = setTimeout(function () {
					can.dev.warn('can/map/setter.js: Setter "' + prop + '" did not return a value or call the setter callback.');
				}, can.dev.warnTimeout);
				//!steal-remove-end
				can.batch.stop();
				return;
			} else {
				if (!setterCalled) {
					__set.call(self, prop,
						// if no arguments, we are side-effects only
						setter.length === 0 && setValue === undefined ? value : setValue,
						current,
						success,
						errorCallback);
				}
				can.batch.stop();
				return this;
			}

		} else {
			__set.call(self, prop, value, current, success, errorCallback);
		}

		return this;
	};

	var ___set = proto.___set;
	proto.___set = function (prop, val) {
		var type = getPropDefineBehavior("type", prop, this.define);

		// If this property's "type" is not "compute", set the value as always
		if (type !== 'compute' || ! val.isComputed) {
			return ___set.apply(this, arguments);
		}

		// If this property's "type" is "compute", treat the compute like
		// a can.Map does on setup
		//   1) Save the compute so that it can be written to in the original
		//      ___set
		this[prop] = val;
		//   2) Track the number of uses
		this._trackCompute(prop);

		return ___set.call(this, prop, val());
	};

	var converters = {
		'date': function (str) {
			var type = typeof str;
			if (type === 'string') {
				str = Date.parse(str);
				return isNaN(str) ? null : new Date(str);
			} else if (type === 'number') {
				return new Date(str);
			} else {
				return str;
			}
		},
		'number': function (val) {
			return +(val);
		},
		'boolean': function (val) {
			if (val === 'false' || val === '0' || !val) {
				return false;
			}
			return true;
		},
		/**
		 * Implements HTML-style boolean logic for attribute strings, where
		 * any string, including "", is truthy.
		 */
		'htmlbool': function(val) {
			return typeof val === "string" || !!val;
		},
		'*': function (val) {
			return val;
		},
		'string': function (val) {
			return '' + val;
		},
		'compute': function (val, prop) {

			// If the value is a compute, don't do any convertion
			if (val.isComputed) {
				return val;

			// If a function was passed, return a compute that uses
			// that function and set `this` as the context
			} else if (can.isFunction(val)) {
				return can.compute(val, this);

			// If a value was passed that isn't a compute or a function...
			} else if (! val.isComputed) {

				// ...and the current value IS a compute, don't convert the
				// value. It will be passed to the compute later in ___set
				if (this[prop] && this[prop].isComputed) {
					return val;

				// Convert the value to a compute
				} else {
					return can.compute(val);
				}
			}
		}
	};

	// the old type sets up bubbling
	var oldType = proto.__type;
	proto.__type = function (value, prop) {
		var type = getPropDefineBehavior("type", prop, this.define),
			Type = getPropDefineBehavior("Type", prop, this.define),
			newValue = value;

		if (typeof type === "string") {
			type = converters[type];
		}

		if (type || Type) {
			// If there's a type, convert it.
			if (type) {
				newValue = type.call(this, newValue, prop);
			}
			// If there's a Type create a new instance of it
			if (Type && !(newValue instanceof Type)) {
				newValue = new Type(newValue);
			}
			// If the newValue is a Map, we need to hook it up
			return newValue;

		}
		// If we pass in a object with define
		else if(can.isPlainObject(newValue) && newValue.define) {
			newValue = can.Map.extend(newValue);
			newValue = new newValue();
		}
		return oldType.call(this, newValue, prop);
	};

	var oldRemove = proto._remove;
	proto._remove = function (prop, current) {
		var remove = getPropDefineBehavior("remove", prop, this.define),
			res;
		if (remove) {
			can.batch.start();
			res = remove.call(this, current);

			if (res === false) {
				can.batch.stop();
				return;
			} else {

				res = oldRemove.call(this, prop, current);
				can.batch.stop();
				return res;
			}
		}
		return oldRemove.call(this, prop, current);
	};

	var oldSetupComputes = proto._setupComputes;
	proto._setupComputes = function (defaultsValues) {
		oldSetupComputes.apply(this, arguments);
		for (var attr in this.define) {
			var def = this.define[attr],
				get = def.get;
			if (get) {
				this[attr] = can.compute.async(defaultsValues[attr], get, this);
				this._computedBindings[attr] = {
					count: 0
				};
			}
		}
	};
	// Overwrite the invidual property serializer b/c we will overwrite it.
	var oldSingleSerialize = can.Map.helpers._serialize;
	can.Map.helpers._serialize = function(map, name, val){
		return serializeProp(map, name, val);
	};
	// If the map has a define serializer for the given attr, run it.
	var serializeProp = function(map, attr, val) {
		var serializer = attr === "*" ? false : getPropDefineBehavior("serialize", attr, map.define);
		if(serializer === undefined) {
			return oldSingleSerialize.apply(this, arguments);
		} else if(serializer !== false){
			return typeof serializer === "function" ? serializer.call(map, val, attr): oldSingleSerialize.apply(this, arguments);
		}
	};
	
	// Overwrite serialize to add in any missing define serialized properties.
	var oldSerialize = proto.serialize;
	proto.serialize = function (property) {
		var serialized = oldSerialize.apply(this, arguments);
		if(property){
			return serialized;
		}
		// add in properties not already serialized
		
		var serializer,
			val;
		// Go through each property.
		for(var attr in this.define){
			// if it's not already defined
			if(!(attr in serialized)) {
				// check there is a serializer so we aren't doing extra work on serializer:false
				serializer = this.define && this.define[attr] && this.define[attr].serialize;
				if(serializer) {
					val = serializeProp(this, attr, this.attr(attr));
					if(val !== undefined) {
						serialized[attr] = val;
					}
				}
			}
		}
		return serialized;
	};

	return can.Map;
});

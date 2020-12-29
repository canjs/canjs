"use strict";

var dev = require('can-log/dev/dev');
var extend = require('can-assign');
var mapEventsMixin = require('can-event-queue/map/map');
var queues = require('can-queues');
var mapHelpers = require('can-map/map-helpers');
var CanMap = require('can-map');
var compute = require('can-compute');
var canReflect = require('can-reflect');
var ObservationRecorder = require('can-observation-recorder');
var Resolver = require("can-simple-observable/resolver/resolver");
var canSymbol = require('can-symbol');

require('can-list');

var define = {}; // jshint ignore:line
var inSetupSymbol = canSymbol.for("can.initializing");

var hasDefaultForSerialize = function(defaultDefinition) {
	return (
		typeof defaultDefinition === "object" &&
		"serialize" in defaultDefinition
	);
};

var getDefaultForSerialize = function(defaultDefinition) {
	var shouldSerialize = true;

	if (hasDefaultForSerialize(defaultDefinition)) {
		shouldSerialize = !!defaultDefinition.serialize;
	}

	return shouldSerialize;
};

var keysForDefinition = function(definitions) {
	var keys = [];
	var defaultDefinition = definitions && definitions["*"];
	for (var prop in definitions) {
		var definition = definitions[prop];
		var shouldSerialize = getDefaultForSerialize(defaultDefinition);
		// allow property definitions to override default behavior
		if (typeof definition === "object" && "serialize" in definition) {
			shouldSerialize = !!definition.serialize;
		} else if (
			typeof definition === "object" &&
			!hasDefaultForSerialize(defaultDefinition)
		) {
			shouldSerialize = !definition.get;
		}
		if (shouldSerialize) {
			keys.push(prop);
		}
	}
	return keys;
};

var getPropDefineBehavior = function(behavior, attr, define) {
	var prop, defaultProp;

	if (define) {
		prop = define[attr];
		defaultProp = define['*'];

		if (prop && prop[behavior] !== undefined) {
			return prop[behavior];
		} else if (defaultProp && defaultProp[behavior] !== undefined) {
			return defaultProp[behavior];
		}
	}
};

// This is called when the Map is defined
mapHelpers.define = function(Map, baseDefine) {
	var definitions = Map.prototype.define;

	if (baseDefine) {
		var defines = {};
		mapHelpers.twoLevelDeepExtend(defines, baseDefine);
		mapHelpers.twoLevelDeepExtend(defines, definitions);
		extend(definitions, defines);
	}
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		if (Map.define) {
			dev.warn("The define property should be on the map's prototype properties, " +
				"not the static properties.");
		}
	}
	//!steal-remove-end
	Map.defaultGenerators = {};
	for (var prop in definitions) {
		var type = definitions[prop].type;
		if (typeof type === "string") {
			if (typeof define.types[type] === "object") {
				delete definitions[prop].type;
				extend(definitions[prop], define.types[type]);
			}
		}
		if ("value" in definitions[prop]) {
			if (typeof definitions[prop].value === "function") {
				Map.defaultGenerators[prop] = definitions[prop].value;
			} else {
				Map.defaults[prop] = definitions[prop].value;
			}
		}
		if (typeof definitions[prop].Value === "function") {
			(function(Constructor) {
				Map.defaultGenerators[prop] = function() {
					return new Constructor();
				};
			})(definitions[prop].Value);
		}
	}
};

var oldSetupDefaults = CanMap.prototype._setupDefaults;
CanMap.prototype._setupDefaults = function(obj) {
	var defaults = extend({},oldSetupDefaults.call(this)),
		propsCommittedToAttr = {},
		Map = this.constructor,
		originalGet = this._get;

	// Overwrite this._get with a version that commits defaults to
	// this.attr() as needed. Because calling this.attr() for each
	// individual default would be expensive.
	this._get = function(originalProp) {
		// If a this.attr() was called using dot syntax (e.g number.0),
		// disregard everything after the "." until we call the
		// original this._get().
		var prop = (originalProp.indexOf('.') !== -1 ?
			originalProp.substr(0, originalProp.indexOf('.')) :
			originalProp);

		// If this property has a default and we haven't yet committed it to
		// this.attr()
		if ((prop in defaults) && !(prop in propsCommittedToAttr)) {

			// Commit the property's default so that it can be read in
			// other defaultGenerators.
			this.attr(prop, defaults[prop]);

			// Make not so that we don't commit this property again.
			propsCommittedToAttr[prop] = true;
		}

		return originalGet.apply(this, arguments);
	};

	for (var prop in Map.defaultGenerators) {
		// Only call the prop's value method if the property wasn't provided
		// during instantiation.
		if (!obj || !(prop in obj)) {
			defaults[prop] = Map.defaultGenerators[prop].call(this);
		}
	}

	// delete this._get which will default to the one on the prototype.
	delete this._get;

	return defaults;
};


var proto = CanMap.prototype,
	oldSet = proto.__set;
proto.__set = function(prop, value, current, success, error) {
	//!steal-remove-start
	var asyncTimer;
	//!steal-remove-end

	var self = this;

	// check if there's a setter
	var errorCallback = function(errors) {
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				clearTimeout(asyncTimer);
			}
			//!steal-remove-end

			var stub = error && error.call(self, errors);
			// if 'validations' is on the page it will trigger
			// the error itself and we dont want to trigger
			// the event twice. :)
			if (stub !== false) {
				mapEventsMixin.dispatch.call(self, 'error', [ prop, errors ], true);
			}
			return false;
		},
		setter = getPropDefineBehavior("set", prop, this.define),
		getter = getPropDefineBehavior("get", prop, this.define);


	// if we have a setter
	if (setter) {
		// call the setter, if returned value is undefined,
		// this means the setter is async so we
		// do not call update property and return right away
		queues.batch.start();
		var setterCalled = false,

			setValue = setter.call(this, value, function(value) {
				if (getter) {
					self[prop](value);
				} else {
					oldSet.call(self, prop, value, current, success, errorCallback);
				}

				setterCalled = true;
				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					clearTimeout(asyncTimer);
				}
				//!steal-remove-end
			}, errorCallback, getter ? this._computedAttrs[prop].compute.computeInstance.lastSetValue.get() : current);
		if (getter) {
			// if there's a getter we don't call old set
			// instead we call the getter's compute with the new value
			if (setValue !== undefined && !setterCalled && setter.length >= 1) {
				this._computedAttrs[prop].compute(setValue);
			}

			queues.batch.stop();
			return;
		}
		// if it took a setter and returned nothing, don't set the value
		else if (setValue === undefined && !setterCalled && setter.length > 1) {
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				asyncTimer = setTimeout(function() {
					dev.warn('can/map/define: Setter "' + prop + '" did not return a value or call the setter callback.');
				}, dev.warnTimeout);
			}
			//!steal-remove-end
			queues.batch.stop();
			return;
		} else {
			if (!setterCalled) {
				oldSet.call(self, prop,
					// if no arguments, we are side-effects only
					setter.length === 0 && setValue === undefined ? value : setValue,
					current,
					success,
					errorCallback);
			}
			queues.batch.stop();
			return this;
		}

	} else {
		oldSet.call(self, prop, value, current, success, errorCallback);
	}

	return this;
};

define.types = {
	'date': function(str) {
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
	'number': function(val) {
		if (val == null) {
			return val;
		}
		return +(val);
	},
	'boolean': function(val) {
		if(val == null) {
			return val;
		}
		if (val === 'false' || val === '0' || !val) {
			return false;
		}
		return true;
	},
	'htmlbool': function(val) {
		return typeof val === "string" || !!val;
	},
	'*': function(val) {
		return val;
	},
	'string': function(val) {
		if (val == null) {
			return val;
		}
		return '' + val;
	},
	'compute': {
		set: function(newValue, setVal, setErr, oldValue) {
			if (newValue && newValue.isComputed) {
				return newValue;
			}
			if (oldValue && oldValue.isComputed) {
				oldValue(newValue);
				return oldValue;
			}
			return newValue;
		},
		get: function(value) {
			return value && value.isComputed ? value() : value;
		}
	}
};

// the old type sets up bubbling
var oldType = proto.__type;
proto.__type = function(value, prop) {
	var type = getPropDefineBehavior("type", prop, this.define),
		Type = getPropDefineBehavior("Type", prop, this.define),
		newValue = value;

	if (typeof type === "string") {
		type = define.types[type];
	}

	if (type || Type) {
		// If there's a type, convert it.
		if (type) {
			newValue = type.call(this, newValue, prop);
		}
		// If there's a Type and newValue is non-null create a new instance of it
		if (Type && newValue != null && !(newValue instanceof Type)) {
			newValue = new Type(newValue);
		}
		// If the newValue is a Map, we need to hook it up
		return newValue;

	}
	// If we pass in a object with define
	else if (canReflect.isPlainObject(newValue) && newValue.define) {
		newValue = CanMap.extend(newValue);
		newValue = new newValue();
	}
	return oldType.call(this, newValue, prop);
};

var oldRemove = proto.__remove;
proto.__remove = function(prop, current) {
	var remove = getPropDefineBehavior("remove", prop, this.define),
		res;
	if (remove) {
		queues.batch.start();
		res = remove.call(this, current);

		if (res === false) {
			queues.batch.stop();
			return;
		} else {

			res = oldRemove.call(this, prop, current);
			queues.batch.stop();
			return res;
		}
	}
	return oldRemove.call(this, prop, current);
};

var oldSetupComputes = proto._setupComputedProperties;
proto._setupComputedProperties = function() {
	oldSetupComputes.apply(this, arguments);
	for (var attr in this.define) {
		var def = this.define[attr],
			get = def.get;
		if (get) {
			mapHelpers.addComputedAttr(this, attr, compute.async(undefined, get, this));
		}
		if (def.resolver) {
			mapHelpers.addComputedAttr(this, attr, new Resolver(def.resolver, this, def.value ) );
		}
	}
};
// Overwrite the invidual property serializer b/c we will overwrite it.
var oldSingleSerialize = proto.___serialize;
// If the map has a define serializer for the given attr, run it.
var serializeProp = function(map, attr, val) {
	var serializer = attr === "*" ? false : getPropDefineBehavior("serialize", attr, map.define);
	if (serializer === undefined) {
		return oldSingleSerialize.call(map, attr, val);
	} else if (serializer !== false) {
		return typeof serializer === "function" ? serializer.call(map, val, attr) : oldSingleSerialize.call(map, attr, val);
	}
};

proto.___serialize = function(name, val) {
	return serializeProp(this, name, val);
};

// Overwrite serialize to add in any missing define serialized properties.
var oldSerialize = proto.serialize;
proto.serialize = function(property) {
	var serialized = oldSerialize.apply(this, arguments);
	if (property) {
		return serialized;
	}
	// add in properties not already serialized

	var serializer,
		val;
	// Go through each property.
	for (var attr in this.define) {
		// if it's not already defined
		if (!(attr in serialized)) {
			// check there is a serializer so we aren't doing extra work on serializer:false
			// also check for a wildcard serializer
			serializer = this.define && (this.define[attr] && this.define[attr].serialize || this.define['*'] && this.define['*'].serialize);
			if (serializer) {
				val = serializeProp(this, attr, this.attr(attr));
				if (val !== undefined) {
					serialized[attr] = val;
				}
			}
		}
	}
	return serialized;
};

canReflect.assignSymbols(proto, {
	"can.hasKey": function(key) {
		var defined = this.define && key in this.define;
		var dataExists = this._data && key in this._data;
		var propExists = key in this;
		return defined || dataExists || propExists;
	},

	"can.getOwnEnumerableKeys": function() {
		if (!this[inSetupSymbol]) {
			ObservationRecorder.add(this, '__keys');
		}

		var definedKeys = keysForDefinition(this.define);
		var dataKeys = Object.keys(this._data);
		var shouldSerialize = getDefaultForSerialize(this.define && this.define["*"]);

		var enumerable = this.constructor.enumerable;
		dataKeys = dataKeys.filter(function(key) {
			return enumerable ?
				shouldSerialize && enumerable[key] !== false :
				shouldSerialize;
		});

		var i, newKey;
		for(i=0; i<dataKeys.length; i++) {
			newKey = dataKeys[i];
			// add keys that are in _data, but are not in `define`
			// keys in `define` are in `definedKeys` based on their `serialize` prop
			if (definedKeys.indexOf(newKey) < 0 && (!this.define || !this.define[newKey])) {
				definedKeys.push(dataKeys[i]);
			}
		}

		return definedKeys;
	}
});

module.exports = define;

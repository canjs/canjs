var canKey = require("can-key");
var canReflect = require("can-reflect");
var canLog = require("can-log");

function makeCompat(Type, enableWarning) {
	var proto = Type.prototype;
	var isDefined = typeof proto.attr === "function";

	if(isDefined) {
		return Type;
	}

	// Whether we should be warning when this is used.
	var warnOnUse = enableWarning === true;

	proto.attr = function(key, value) {
		if(warnOnUse) {
			canLog.warn("can-map-compat is intended for migrating away from can-map. Remove all uses of .attr() to remove this warning.");
		}

		var type = typeof key;
		var argsLen = arguments.length;

		// map.attr()
		if(argsLen === 0) {
			return canReflect.unwrap(this);
		}
		// map.attr({ key: val })
		else if(type !== "string" && type !== "number") {
			// Remove others
			if(value === true) {
				canReflect.updateDeep(this, key);
			} else {
				canReflect.assignDeep(this, key);
			}
			return this;
		}
		// map.attr(key)
		else if(argsLen === 1) {
			return canKey.get(this, key);
		}
		// map.attr(key, val)
		else {
			canKey.set(this, key, value);
			return this;
		}
	};

	proto.removeAttr = function(key) {
		var val = canReflect.getKeyValue(this, key);
		canReflect.deleteKeyValue(this, key);
		return val;
	};

	return Type;
}

exports = module.exports = function(Type) {
	return makeCompat(Type, true);
};

exports.makeCompat = makeCompat;

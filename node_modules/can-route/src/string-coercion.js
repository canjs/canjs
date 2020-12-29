var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

// # String Coercion Helper Functions

// ## stringify
// Converts an object, array, Map or List to a string.
// It attempts the following flow to convert to a string:
// if `obj` is an object:
//   - call `.serialize` on `obj`, if available
//   - shallow copy `obj` using `.slice` or `can-reflect.assign`
//   - convert each proprety to a string recursively
// else
//   - call `.toString` on `obj`, if available.
function stringify(obj) {
	if (obj && typeof obj === "object") {
		if ("serialize" in obj) {
			obj = obj.serialize();

		// Get array from array-like or shallow-copy object.
		} else if (typeof obj.slice === "function") {
			obj = obj.slice();
		} else {
			canReflect.assign({}, obj);
		}

		// Convert each object property or array item into a string.
		canReflect.eachKey(obj, function(val, prop) {
			obj[prop] = stringify(val);
		});

	// If `obj` supports `.toString` call it.
	} else if (obj !== undefined && obj !== null && (typeof obj.toString === "function" )) {
		obj = obj.toString();
	}

	return obj;
}

// ## stringCoercingMapDecorator
// Coercies the arguments of `can-map.attr` to strings.
// everything in the backing Map is a string
// add type coercion during Map setter to coerce all values to strings so unexpected conflicts don't happen.
// https://github.com/canjs/canjs/issues/2206
// A proposal to change this behavior is currently open:
// https://github.com/canjs/can-route/issues/125
function stringCoercingMapDecorator(map) {
	var decoratorSymbol = canSymbol.for("can.route.stringCoercingMapDecorator");

	if (!map.attr[decoratorSymbol]) {
		var attrUndecoratedFunction = map.attr;

		map.attr = function(key) {

			var serializable = typeof key === "string" &&
				(this.define === undefined || this.define[key] === undefined || !!this.define[key].serialize),
				args;

			if (serializable) { // if setting non-str non-num attr
				args = stringify(Array.apply(null, arguments));
			} else {
				args = arguments;
			}

			return attrUndecoratedFunction.apply(this, args);
		};

		canReflect.setKeyValue(map.attr, decoratorSymbol, true);
	}

	return map;
}

exports.stringCoercingMapDecorator = stringCoercingMapDecorator;
exports.stringify = stringify;

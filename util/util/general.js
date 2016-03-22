/* general lang-helper functions */
var can = require('can/util/can');
var each = require('can/util/array/each');
var makeArray = require('can/util/array/makeArray');
var isArrayLike = require('can/util/array/isArrayLike');

function likeArray(obj) {
	return typeof obj.length === 'number';
}

function isObject(value) {
  var type = typeof value;
  return !!value && (type === 'object' || type === 'function');
}

function flatten(array) {
	return array.length > 0 ? Array.prototype.concat.apply([], array) : array;
}

var core_trim = String.prototype.trim;
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
var trim = core_trim && !core_trim.call('\uFEFF\xA0') ?
	function(text) {
		return text == null ? '' : core_trim.call(text);
	} :
	// Otherwise use our own trimming functionality
	function(text) {
		return text == null ? '' : (text + '')
			.replace(rtrim, '');
	};

function isArray(arr) {
	if (Array.isArray) {
		return Array.isArray(arr);
	}
	return Object.prototype.toString.call(arr) === "[object Array]";
}

function inArray(value, arry, fromIndex) {
	return arry == null ? -1 : Array.prototype.indexOf.call(arry, value, fromIndex);
}

function map(elements, callback) {
	var values = [],
		putValue = function(val, index) {
			var value = callback(val, index);
			if (value != null) {
				values.push(value);
			}
		};
	if (likeArray(elements)) {
		for (var i = 0, l = elements.length; i < l; i++) {
			putValue(elements[i], i);
		}
	} else {
		for (var key in elements) {
			putValue(elements[key], key);
		}
	}
	return flatten(values);
}

function extend() {
	/*jshint maxdepth:6 */
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== "object" && !can.isFunction(target)) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if (length === i) {
		target = this;
		--i;
	}

	for (; i < length; i++) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (can.isPlainObject(copy) || (copyIsArray = can.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && can.isArray(src) ? src : [];

					} else {
						clone = src && can.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = can.extend(deep, clone, copy);

					// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
}

function isEmptyObject(obj) {
	var name;
	for (name in obj) {
		return false;
	}
	return true;
}

function param(object) {
	var pairs = [],
		add = function (key, value) {
			pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
		};
	for (var name in object) {
		buildParam(name, object[name], add);
	}
	return pairs.join('&')
		.replace(/%20/g, '+');
}

function buildParam(prefix, obj, add) {
	if (isArray(obj)) {
		for (var i = 0, l = obj.length; i < l; ++i) {
			add(prefix + '[]', obj[i]);
		}
	} else if ( isObject(obj) ) {
		for (var name in obj) {
			buildParam(prefix + '[' + name + ']', obj[name], add);
		}
	} else {
		add(prefix, obj);
	}
}

function proxy(cb, that) {
	return function() {
		return cb.apply(that, arguments);
	};
}

var isFunction = (function() {
	if (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') {
		return function(value) {
			return Object.prototype.toString.call(value) === '[object Function]';
		};
	}
	return function(value) {
		return typeof value === 'function';
	};
}());

module.exports = {
	each: each,
	extend: extend,
	inArray: inArray,
	isArray: isArray,
	isArrayLike: isArrayLike,
	isEmptyObject: isEmptyObject,
	isFunction: isFunction,
	makeArray: makeArray,
	map: map,
	param: param,
	proxy: proxy,
	trim: trim,
};

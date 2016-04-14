/* general lang-helper functions */
var each = require('can/util/array/each');
var makeArray = require('can/util/array/makeArray');
var isArrayLike = require('can/util/array/isArrayLike');
var isArray = require('can/util/array/isArray');
var isFunction = require('can/util/isFunction');
var proxy = require('can/util/proxy');
var extend = require('can/util/extend');

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

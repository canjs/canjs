steal('can/util/can.js', 'can/util/attr', 'can/util/array/each.js', 'can/util/array/makeArray.js', function(can, attr) {

	var core_trim = String.prototype.trim;
	var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

	function likeArray(obj) {
		return typeof obj.length == 'number';
	}

	function flatten(array) {
		return array.length > 0 ? Array.prototype.concat.apply([], array) : array
	}

	can.isFunction = (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function')
		? function (value) {
		return Object.prototype.toString.call(value) === '[object Function]';
	}
		: function (value) {
		return typeof value === 'function';
	};

	can.trim = core_trim && !core_trim.call('\uFEFF\xA0') ?
		function (text) {
			return text == null ? '' : core_trim.call(text);
		} :
		// Otherwise use our own trimming functionality
		function (text) {
			return text == null ? '' : ( text + '' ).replace(rtrim, '');
		};

	// This extend() function is ruthlessly and shamelessly stolen from
	// jQuery 1.8.2:, lines 291-353.
	can.extend = function () {
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
			if ((options = arguments[ i ]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && ( can.isPlainObject(copy) || (copyIsArray = can.isArray(copy)) )) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && can.isArray(src) ? src : [];

						} else {
							clone = src && can.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = can.extend(deep, clone, copy);

						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	can.map = function (elements, callback) {
		var value, values = [],
			i, key;
		if (likeArray(elements)) for (i = 0; i < elements.length; i++) {
			value = callback(elements[i], i);
			if (value != null) values.push(value)
		} else for (key in elements) {
			value = callback(elements[key], key);
			if (value != null) values.push(value)
		}
		return flatten(values);
	};

	can.attr = attr;

	return can;

});
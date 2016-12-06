/*!
 * CanJS - 1.1.6
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 05 Jun 2013 18:02:51 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/can"], function (can) {
	can.each = function (elements, callback, context) {
		var i = 0, key;
		if (elements) {
			if (typeof elements.length === 'number' && elements.pop) {
				if ( elements.attr ) {
					elements.attr('length');
				}
				for (key = elements.length; i < key; i++) {
					if (callback.call(context || elements[i], elements[i], i, elements) === false) {
						break;
					}
				}
			} else if(elements.hasOwnProperty) {
				for (key in elements) {
					if(elements.hasOwnProperty(key)) {
						if (callback.call(context || elements[key], elements[key], key, elements) === false) {
							break;
						}
					}
				}
			}
		}
		return elements;
	};

	return can;
});
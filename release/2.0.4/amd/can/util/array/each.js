/*!
 * CanJS - 2.0.4
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Mon, 23 Dec 2013 19:49:14 GMT
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
			} 
			else if(elements.hasOwnProperty) {
				if(can.Map && elements instanceof can.Map) {
					can.__reading && can.__reading(elements, '__keys');
					elements = elements.__get()
				}
				
				
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
/* jshint maxdepth:7*/
var isArrayLike = require('can/util/array/isArrayLike');

function each(elements, callback, context) {
	var i = 0,
		key,
		len,
		item;
	if (elements) {
		if ( isArrayLike(elements) ) {
			if(can.List && elements instanceof can.List ) {
				for (len = elements.attr("length"); i < len; i++) {
					item = elements.attr(i);
					if (callback.call(context || item, item, i, elements) === false) {
						break;
					}
				}
			} else {
				for (len = elements.length; i < len; i++) {
					item = elements[i];
					if (callback.call(context || item, item, i, elements) === false) {
						break;
					}
				}
			}

		} else if (typeof elements === "object") {

			if (can.Map && elements instanceof can.Map || elements === can.route) {
				var keys = can.Map.keys(elements);
				for(i =0, len = keys.length; i < len; i++) {
					key = keys[i];
					item = elements.attr(key);
					if (callback.call(context || item, item, key, elements) === false) {
						break;
					}
				}
			} else {
				for (key in elements) {
					if (Object.prototype.hasOwnProperty.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
						break;
					}
				}
			}

		}
	}
	return elements;
}

module.exports = each;

steal(function () {
	can.each = function (elements, callback, context) {
		var i = 0,
		    key;
		if (elements) {
			if (typeof elements.length == 'number' && elements.pop) {
				elements.attr && elements.attr('length');
				for (var len = elements.length; i < len; i++) {
					if (callback.call(context || elements[i], elements[i], i, elements) === false) {
						break;
					}
				}
			} else {
				for (key in elements) {
					if (callback.call(context || elements[i], elements[key], key, elements) === false) {
						break;
					}
				}
			}
		}
		return elements;
	}
});

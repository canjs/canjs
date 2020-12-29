"use strict";
var digitTest = /^\d+$/,
	keyBreaker = /([^\[\]]+)|(\[\])/g,
	paramTest = /([^?#]*)(#.*)?$/,
	prep = function (str) {
		return decodeURIComponent(str.replace(/\+/g, ' '));
	};

module.exports = function (params) {
	var data = {}, pairs;

	var processPairAt = function(i) {
		var pair = pairs[i],
			parts = pair.split('='),
			key = prep(parts.shift()),
			value = prep(parts.join('=')),
			current = data,
			lastPart;

		if (key) {
			parts = key.match(keyBreaker);
			for (var j = 0, l = parts.length - 1; j < l; j++) {
				if (!current[parts[j]]) {
					// If what we are pointing to looks like an `array`
					current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] === '[]' ? [] : {};
				}
				current = current[parts[j]];
			}
			lastPart = parts.pop();
			if (lastPart === '[]') {
				current.push(value);
			} else {
				current[lastPart] = value;
			}
		}
	};

	if (params && paramTest.test(params)) {
		pairs = params.split('&');
		for(var i = 0, len = pairs.length; i < len; i++) {
			processPairAt(i);
		}
	}

	return data;
};

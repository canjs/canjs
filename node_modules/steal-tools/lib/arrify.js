var isArray = require("lodash/isArray");

/**
 * Converts a value to an array
 * @param {*} value - The value to convert
 * @return {Array}
 */
module.exports = function arrify(value) {
	if (value == null) {
		return [];
	}

	return isArray(value) ? value : [value];
};

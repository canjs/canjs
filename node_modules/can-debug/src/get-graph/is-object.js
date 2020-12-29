"use strict";
module.exports = function isObject(value) {
	return value != null && typeof value === "object";
};

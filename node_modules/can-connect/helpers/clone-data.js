"use strict";
var canReflect = require("can-reflect");

module.exports = function(data) {
	return Array.isArray(data) ? data.slice(0) : canReflect.assignDeep({}, data);
};

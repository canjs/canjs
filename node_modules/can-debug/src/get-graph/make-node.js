"use strict";
var canReflect = require("can-reflect");

module.exports = function makeNode(obj, key) {
	var gotKey = arguments.length === 2;

	var node = {
		obj: obj,
		name: canReflect.getName(obj),
		value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
	};

	if (gotKey) {
		node.key = key;
	}

	return node;
};

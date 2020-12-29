"use strict";
var canReflect = require("can-reflect");

var quoteString = function quoteString(x) {
	return typeof x === "string" ? JSON.stringify(x) : x;
};

module.exports = function log(data) {
	var node = data.node;
	var nameParts = [node.name, "key" in node ? "." + node.key : ""];

	console.group(nameParts.join(""));
	console.log("value  ", quoteString(node.value));
	console.log("object ", node.obj);

	if (data.derive.length) {
		console.group("DERIVED FROM");
		canReflect.eachIndex(data.derive, log);
		console.groupEnd();
	}

	if (data.mutations.length) {
		console.group("MUTATED BY");
		canReflect.eachIndex(data.mutations, log);
		console.groupEnd();
	}

	if (data.twoWay.length) {
		console.group("TWO WAY");
		canReflect.eachIndex(data.twoWay, log);
		console.groupEnd();
	}

	console.groupEnd();
};

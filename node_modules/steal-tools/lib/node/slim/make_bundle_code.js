var endsWith = require("lodash/endsWith");
var getNodeSource = require("../source").node;

module.exports = function(target, bundle) {
	var nodes = bundle.nodes
		.map(function(node) {
			var code = getNodeSource(node).code.toString();
			return endsWith(code, ";") ? code.substring(0, code.length - 1) : code;
		})
		.join(",");

	var b = `[${bundle.uniqueId}, ${nodes}]`;
	var g = target === "web" ? "window" : "self";

	return target === "node" ?
		`module.exports = ${b};` :
		`(__steal_bundles__ = ${g}.__steal_bundles__ || []).push(${b});`;
};

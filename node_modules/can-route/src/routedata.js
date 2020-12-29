var canSymbol = require("can-symbol");
var ObservableObject = require("can-observable-object");
var stringify = require("./string-coercion").stringify;

var Stringify = {};
Stringify[canSymbol.for("can.new")] = function(value) {
	return stringify(value);
};
Stringify[canSymbol.for("can.isMember")] = function(value) {
	return typeof value === "string";
};

class RouteData extends ObservableObject {
	static get propertyDefaults() {
		return {
			type: Stringify
		};
	}
}

module.exports = RouteData;

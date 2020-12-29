var canSymbol = require('can-symbol');

var mapSupported = (function() {
	if (typeof Map !== "undefined" && typeof Map.prototype.keys === "function") {
		var myMap = new Map();
		return myMap.toString() === '[object Map]';
	}

	return false;
}());

var setSupported = (function() {
	if (typeof Set !== "undefined") {
		var mySet = new Set();
		return mySet.toString() === '[object Set]' && canSymbol.iterator in mySet;
	}

	return false;
}());

var helpers = {
	mapSupported: mapSupported,
	setSupported: setSupported	
};

module.exports = helpers;

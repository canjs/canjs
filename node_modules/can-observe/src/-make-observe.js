"use strict";
var getGlobal = require("can-globals/global/global");
var canReflect = require("can-reflect");
var observables = require("./-observable-store");
var helpers = require("./-helpers");

var makeObserve = {
	observe: function(value) {
		if (canReflect.isPrimitive(value)) {
			return value;
		}
		var observable = observables.proxiedObjects.get(value);
		if (observable) {
			return observable;
		}
		if (observables.proxies.has(value)) {
			return value;
		}
		if (helpers.isBuiltInButNotArrayOrPlainObjectOrElement(value)) {
			return value;
		}
		if (typeof value === "function") {
			observable = makeObserve.function(value);
		} else if (helpers.inheritsFromArray(value)) {
			observable = makeObserve.array(value);
		} else if (value instanceof getGlobal().Element) {
			observable = makeObserve.prototype(value);
		} else {
			observable = makeObserve.object(value);
		}
		observables.proxiedObjects.set(value, observable);
		observables.proxies.add(observable);
		return observable;
	},
	// Set to a function that converts non-observable
	// objects to observable objects
	"object": null,
	// Set to a function that converts non-observable
	// arrays to observable arrays
	"array": null,
	// Set to a function that converts non-observable
	// functions to observable functions
	"function": null
};

module.exports = makeObserve;

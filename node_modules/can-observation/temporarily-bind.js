"use strict";
var canReflect = require("can-reflect");

var temporarilyBoundNoOperation = function(){};
// A list of temporarily bound computes
var observables;
// Unbinds all temporarily bound computes.
var unbindTemporarilyBoundValue = function () {
	for (var i = 0, len = observables.length; i < len; i++) {
		canReflect.offValue(observables[i], temporarilyBoundNoOperation);
	}
	observables = null;
};

// ### temporarilyBind
// Binds computes for a moment to cache their value and prevent re-calculating it.
function temporarilyBind(compute) {
	var computeInstance = compute.computeInstance || compute;
	canReflect.onValue(computeInstance, temporarilyBoundNoOperation);
	if (!observables) {
		observables = [];
		setTimeout(unbindTemporarilyBoundValue, 10);
	}
	observables.push(computeInstance);
}

module.exports = temporarilyBind;

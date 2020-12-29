"use strict";
var canReflect = require("can-reflect");
var Observation = require("can-observation");
var SettableObservable = require("../settable/settable");
var valueEventBindings = require("can-event-queue/value/value");
var canSymbol = require("can-symbol");

var setElementSymbol = canSymbol.for("can.setElement");

// SetterObservable's call a function when set. Their getter is backed up by an
// observation.
function SetterObservable(getter, setter) {
	this.setter = setter;
	this.observation = new Observation(getter);
	this.handler = this.handler.bind(this);

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		canReflect.assignSymbols(this, {
			"can.getName": function() {
				return (
					canReflect.getName(this.constructor) +
					"<" +
					canReflect.getName(getter) +
					">"
				);
			}
		});
		Object.defineProperty(this.handler, "name", {
			value: canReflect.getName(this) + ".handler"
		});
	}
	//!steal-remove-end
}

SetterObservable.prototype = Object.create(SettableObservable.prototype);
SetterObservable.prototype.constructor = SetterObservable;
SetterObservable.prototype.set = function(newVal) {
	this.setter(newVal);
};
SetterObservable.prototype.hasDependencies = function() {
	return canReflect.valueHasDependencies(this.observation);
};
canReflect.assignSymbols(SetterObservable.prototype, {
	"can.setValue": SetterObservable.prototype.set,
	"can.valueHasDependencies": SetterObservable.prototype.hasDependencies,
	"can.setElement": function(el) {
		this.observation[setElementSymbol](el);
	}
});

module.exports = SetterObservable;

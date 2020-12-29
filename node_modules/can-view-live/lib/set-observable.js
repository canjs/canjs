"use strict";
var SimpleObservable = require("can-simple-observable");
var canReflect = require("can-reflect");

function SetObservable(initialValue, setter) {
	this.setter = setter;

	SimpleObservable.call(this, initialValue);
}

SetObservable.prototype = Object.create(SimpleObservable.prototype);
SetObservable.prototype.constructor = SetObservable;
SetObservable.prototype.set = function(newVal) {
	this.setter(newVal);
};


canReflect.assignSymbols(SetObservable.prototype, {
	"can.setValue": SetObservable.prototype.set
});

module.exports = SetObservable;

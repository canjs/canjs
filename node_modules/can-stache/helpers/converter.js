"use strict";
var SetIdentifier = require("../src/set-identifier");
var canReflect = require("can-reflect");

function makeConverter(getterSetter){
	getterSetter = getterSetter || {};
	return function(newVal, source) {
		var args = canReflect.toArray(arguments);
		if(newVal instanceof SetIdentifier) {
			return typeof getterSetter.set === "function" ?
				getterSetter.set.apply(this, [newVal.value].concat(args.slice(1))) :
				source(newVal.value);
		} else {
			return typeof getterSetter.get === "function" ?
				getterSetter.get.apply(this, args) :
				args[0];
		}
	};
}

module.exports = makeConverter;

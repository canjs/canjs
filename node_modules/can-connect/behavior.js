"use strict";
var behaviorsMap = {};

function behavior(name, behavior){
	if(typeof name !== "string") {
		behavior = name;
		name = undefined;
	}
	var behaviorMixin = function(base){
		// basically Object.create
		var Behavior = function(){};
		Object.defineProperty(Behavior,"name",{
			value: name,
			configurable: true
		});
		Behavior.prototype = base;
		var newBehavior = new Behavior();
		// allows behaviors to be a simple object, not always a function
		var res = typeof behavior === "function" ? behavior.apply(newBehavior, arguments) : behavior;
		for(var prop in res) {
			if(res.hasOwnProperty(prop)) {
				Object.defineProperty(newBehavior, prop, Object.getOwnPropertyDescriptor(res, prop));
			} else {
				// we only copy values from up the proto chain
				newBehavior[prop] = res[prop];
			}
		}
		newBehavior.__behaviorName = name;
		return newBehavior;
	};
	if(name) {
		behaviorMixin.behaviorName = name;
		behaviorsMap[name] = behaviorMixin;
	}
	behaviorMixin.isBehavior = true;
	return behaviorMixin;
}
behavior.map = behaviorsMap;
module.exports = behavior;

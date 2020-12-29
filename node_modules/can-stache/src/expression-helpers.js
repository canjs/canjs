"use strict";
var Arg = require("../expressions/arg");
var Literal = require("../expressions/literal");

var canReflect = require("can-reflect");
var stacheKey = require("can-stache-key");
var Observation = require("can-observation");
var ObservationRecorder = require("can-observation-recorder");
var makeComputeLike = require("can-view-scope/make-compute-like");
var SetterObservable = require("can-simple-observable/setter/setter");

// ## Helpers

function getObservableValue_fromDynamicKey_fromObservable(key, root, helperOptions, readOptions) {
	// This needs to return something similar to a ScopeKeyData with intialValue and parentHasKey
	var getKeys = function(){
		return stacheKey.reads(("" + canReflect.getValue(key)).replace(/\./g, "\\."));
	};
	var parentHasKey;
	var computeValue = new SetterObservable(function getDynamicKey() {
		var readData = stacheKey.read( canReflect.getValue(root) , getKeys());
		parentHasKey = readData.parentHasKey;
		return readData.value;
	}, function setDynamicKey(newVal){
		stacheKey.write(canReflect.getValue(root), getKeys(), newVal);
	});
	// This prevents lazy evalutaion
	Observation.temporarilyBind(computeValue);

	// peek so no observable that might call getObservableValue_fromDynamicKey_fromObservable will re-evaluate if computeValue changes.
	computeValue.initialValue = ObservationRecorder.peekValue(computeValue);
	computeValue.parentHasKey = parentHasKey;
	// Todo:
	// 1. We should warn here if `initialValue` is undefined.  We can expose the warning function
	//    in can-view-scope and call it here.
	// 2. We should make this lazy if possible.  We can do that by making getter/setters for
	//    initialValue and parentHasKey (and possibly @@can.valueHasDependencies)
	return computeValue;
}

// If not a Literal or an Arg, convert to an arg for caching.
function convertToArgExpression(expr) {
	if(!(expr instanceof Arg) && !(expr instanceof Literal)) {
		return new Arg(expr);
	} else {
		return expr;
	}
}

function toComputeOrValue(value) {
	// convert to non observable value
	if(canReflect.isObservableLike(value)) {
		// we only want to do this for things that `should` have dependencies, but dont.
		if(canReflect.isValueLike(value) && canReflect.valueHasDependencies(value) === false) {
			return canReflect.getValue(value);
		}
		// if compute data
		if(value.compute) {
			return value.compute;
		} else {
			return makeComputeLike(value);
		}
	}
	return value;
}

// try to make it a compute no matter what.  This is useful for
// ~ operator.
function toCompute(value) {
	if(value) {

		if(value.isComputed) {
			return value;
		}
		if(value.compute) {
			return value.compute;
		} else {
			return makeComputeLike(value);
		}
	}
	return value;
}

module.exports = {
	getObservableValue_fromDynamicKey_fromObservable: getObservableValue_fromDynamicKey_fromObservable,
	convertToArgExpression: convertToArgExpression,
	toComputeOrValue: toComputeOrValue,
	toCompute: toCompute
};

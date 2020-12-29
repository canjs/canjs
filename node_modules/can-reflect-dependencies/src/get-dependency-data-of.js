"use strict";
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var isFunction = require("./is-function");
var canAssign = require("can-assign");

var getWhatIChangeSymbol = canSymbol.for("can.getWhatIChange");
var getKeyDependenciesSymbol = canSymbol.for("can.getKeyDependencies");
var getValueDependenciesSymbol = canSymbol.for("can.getValueDependencies");

var getKeyDependencies = function getKeyDependencies(obj, key) {
	if (isFunction(obj[getKeyDependenciesSymbol])) {
		return canReflect.getKeyDependencies(obj, key);
	}
};

var getValueDependencies = function getValueDependencies(obj) {
	if (isFunction(obj[getValueDependenciesSymbol])) {
		return canReflect.getValueDependencies(obj);
	}
};

var getMutatedKeyDependencies =
	function getMutatedKeyDependencies(mutatedByMap, obj, key) {
		var root = mutatedByMap.get(obj);
		var dependencyRecord;

		if (root && root.mutateDependenciesForKey.has(key)) {
			dependencyRecord = root.mutateDependenciesForKey.get(key);
		}

		return dependencyRecord;
	};

var getMutatedValueDependencies =
	function getMutatedValueDependencies( mutatedByMap, obj) {
		var result;
		var root = mutatedByMap.get(obj);

		if (root) {
			var	dependencyRecord = root.mutateDependenciesForValue;

			if (dependencyRecord.keyDependencies.size) {
				result = result || {};
				result.keyDependencies = dependencyRecord.keyDependencies;
			}

			if (dependencyRecord.valueDependencies.size) {
				result = result || {};
				result.valueDependencies = dependencyRecord.valueDependencies;
			}
		}

		return result;
	};

var getWhatIChange = function getWhatIChange(obj, key) {
	if (isFunction(obj[getWhatIChangeSymbol])) {
		var gotKey = arguments.length === 2;

		return gotKey ?
			canReflect.getWhatIChange(obj, key) :
			canReflect.getWhatIChange(obj);
	}
};

var isEmptyRecord = function isEmptyRecord(record) {
	return (
		record == null ||
		!Object.keys(record).length ||
		(record.keyDependencies && !record.keyDependencies.size) &&
		(record.valueDependencies && !record.valueDependencies.size)
	);
};

var getWhatChangesMe = function getWhatChangesMe(mutatedByMap, obj, key) {
	var gotKey = arguments.length === 3;

	var mutate = gotKey ?
		getMutatedKeyDependencies(mutatedByMap, obj, key) :
		getMutatedValueDependencies(mutatedByMap, obj);

	var derive = gotKey ?
		getKeyDependencies(obj, key) :
		getValueDependencies(obj);

	if (!isEmptyRecord(mutate) || !isEmptyRecord(derive)) {
		return canAssign(
			canAssign(
				{},
				mutate ? { mutate: mutate } : null
			),
			derive ? { derive: derive } : null
		);
	}
};

module.exports = function(mutatedByMap) {
	return function getDependencyDataOf(obj, key) {
		var gotKey = arguments.length === 2;

		var whatChangesMe = gotKey ?
			getWhatChangesMe(mutatedByMap, obj, key) :
			getWhatChangesMe(mutatedByMap, obj);

		var whatIChange = gotKey ? getWhatIChange(obj, key) : getWhatIChange(obj);

		if (whatChangesMe || whatIChange) {
			return canAssign(
				canAssign(
					{},
					whatIChange ? { whatIChange: whatIChange } : null
				),
				whatChangesMe ? { whatChangesMe: whatChangesMe } : null
			);
		}
	};
};

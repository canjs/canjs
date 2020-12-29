"use strict";
var canReflect = require("can-reflect");

// DependencyRecord :: { keyDependencies: Map, valueDependencies: Set }
var makeDependencyRecord = function makeDependencyRecord() {
	return {
		keyDependencies: new Map(),
		valueDependencies: new Set()
	};
};

var makeRootRecord = function makeRootRecord() {
	return {
		// holds mutated key dependencies of a key-value like object, e.g:
		// if person.first is mutated by other observable, this map will have a
		// key `first` (the mutated property) mapped to a DependencyRecord
		mutateDependenciesForKey: new Map(),

		// holds mutated value dependencies of value-like objects
		mutateDependenciesForValue: makeDependencyRecord()
	};
};

module.exports = function(mutatedByMap) {
	return function addMutatedBy(mutated, key, mutator) {
		var gotKey = arguments.length === 3;

		// normalize arguments
		if (arguments.length === 2) {
			mutator = key;
			key = undefined;
		}

		// normalize mutator when shorthand is used
		if (!mutator.keyDependencies && !mutator.valueDependencies) {
			var s = new Set();
			s.add(mutator);
			mutator = { valueDependencies:s };
		}

		// retrieve root record from the state map or create a new one
		var root = mutatedByMap.get(mutated);
		if (!root) {
			root = makeRootRecord();
			mutatedByMap.set(mutated, root);
		}

		// create a [key] DependencyRecord if [key] was provided
		// and Record does not already exist
		if (gotKey && !root.mutateDependenciesForKey.get(key)) {
			root.mutateDependenciesForKey.set(key, makeDependencyRecord());
		}

		// retrieve DependencyRecord
		var dependencyRecord = gotKey ?
			root.mutateDependenciesForKey.get(key) :
			root.mutateDependenciesForValue;

		if (mutator.valueDependencies) {
			canReflect.addValues(
				dependencyRecord.valueDependencies,
				mutator.valueDependencies
			);
		}

		if (mutator.keyDependencies) {
			canReflect.each(mutator.keyDependencies, function(keysSet, obj) {
				var entry = dependencyRecord.keyDependencies.get(obj);

				if (!entry) {
					entry = new Set();
					dependencyRecord.keyDependencies.set(obj, entry);
				}

				canReflect.addValues(entry, keysSet);
			});
		}
	};
};

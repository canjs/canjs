"use strict";
var canReflect = require("can-reflect");

module.exports = function(mutatedByMap) {
	return function deleteMutatedBy(mutated, key, mutator) {
		var gotKey = arguments.length === 3;
		var root = mutatedByMap.get(mutated);

		// normalize arguments
		if (arguments.length === 2) {
			mutator = key;
			key = undefined;
		}

		// normalize mutator when shorthand is used
		if (!mutator.keyDependencies && !mutator.valueDependencies) {
			var s = new Set();
			s.add(mutator);
			mutator = { valueDependencies: s };
		}

		var dependencyRecord = gotKey ?
			root.mutateDependenciesForKey.get(key) :
			root.mutateDependenciesForValue;

		if (mutator.valueDependencies) {
			canReflect.removeValues(
				dependencyRecord.valueDependencies,
				mutator.valueDependencies
			);
		}

		if (mutator.keyDependencies) {
			canReflect.each(mutator.keyDependencies, function(keysSet, obj) {
				var entry = dependencyRecord.keyDependencies.get(obj);

				if (entry) {
					canReflect.removeValues(entry, keysSet);
					if (!entry.size) {
						dependencyRecord.keyDependencies.delete(obj);
					}
				}
			});
		}
	};
};

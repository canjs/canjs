"use strict";
var canReflect = require("can-reflect");

var mergeValueDependencies = function mergeValueDependencies(obj, source) {
	var sourceValueDeps = source.valueDependencies;

	if (sourceValueDeps) {
		var destValueDeps = obj.valueDependencies;

		// make sure there is a valueDependencies Set
		// in the [obj] dependency record
		if (!destValueDeps) {
			destValueDeps = new Set();
			obj.valueDependencies = destValueDeps;
		}

		canReflect.eachIndex(sourceValueDeps, function(dep) {
			destValueDeps.add(dep);
		});
	}
};

var mergeKeyDependencies = function mergeKeyDependencies(obj, source) {
	var sourcekeyDeps = source.keyDependencies;

	if (sourcekeyDeps) {
		var destKeyDeps = obj.keyDependencies;

		// make sure there is a keyDependencies Map
		// in the [obj] dependency record
		if (!destKeyDeps) {
			destKeyDeps = new Map();
			obj.keyDependencies = destKeyDeps;
		}

		canReflect.eachKey(sourcekeyDeps, function(keys, obj) {
			var entry = destKeyDeps.get(obj);

			if (!entry) {
				entry = new Set();
				destKeyDeps.set(obj, entry);
			}

			canReflect.eachIndex(keys, function(key) {
				entry.add(key);
			});
		});
	}
};

// Merges the key and value dependencies of the source object into the
// destination object
module.exports = function mergeDependencyRecords(object, source) {
	mergeKeyDependencies(object, source);
	mergeValueDependencies(object, source);
	return object;
};

"use strict";
var addMutatedBy = require("./src/add-mutated-by");
var deleteMutatedBy = require("./src/delete-mutated-by");
var getDependencyDataOf = require("./src/get-dependency-data-of");

// mutatedByMap :: WeakMap<obj, {
//	mutateDependenciesForKey:   Map<key, DependencyRecord>,
//	mutateDependenciesForValue: DependencyRecord
// }>
var mutatedByMap = new WeakMap();

module.exports = {
	// Track mutations between observable as dependencies
	// addMutatedBy(obs, obs2);
	// addMutatedBy(obs, key, obs2);
	// addMutatedBy(obs, { valueDependencies: Set, keyDependencies: Map })
	// addMutatedBy(obs, key, { valueDependencies: Set, keyDependencies: Map })
	addMutatedBy: addMutatedBy(mutatedByMap),

	// Call this method with the same arguments as `addMutatedBy`
	// to unregister the mutation dependency
	deleteMutatedBy: deleteMutatedBy(mutatedByMap),

	// Returns an object with the dependecies of the given argument
	//	{
	//		whatIChange: { mutate: DependencyRecord, derive: DependencyRecord },
	//		whatChangesMe: { mutate: DependencyRecord, derive: DependencyRecord }
	//	}
	getDependencyDataOf: getDependencyDataOf(mutatedByMap)
};

"use strict";
// # Recorder Dependency Helpers
// This exposes two helpers:
// - `updateObservations` - binds and unbinds a diff of two observation records
//   (see can-observation-recorder for details on this data type).
// - `stopObserving` - unbinds an observation record.
var canReflect = require("can-reflect");



// ## Helpers
// The following helpers all use `this` to pass additional arguments. This
// is for performance reasons as it avoids creating new functions.

function addNewKeyDependenciesIfNotInOld(event) {
    // Expects `this` to have:
    // - `.observable` - the observable we might be binding to.
    // - `.oldEventSet` - the bound keys on the old dependency record for `observable`.
    // - `.onDependencyChange` - the handler we will call back when the key is changed.
    // If there wasn't any keys, or when we tried to delete we couldn't because the key
    // wasn't in the set, start binding.
    if(this.oldEventSet === undefined || this.oldEventSet["delete"](event) === false) {
        canReflect.onKeyValue(this.observable, event, this.onDependencyChange,"notify");
    }
}

// ### addObservablesNewKeyDependenciesIfNotInOld
// For each event in the `eventSet` of new observables,
// setup a binding (or delete the key).
function addObservablesNewKeyDependenciesIfNotInOld(eventSet, observable){
    eventSet.forEach(addNewKeyDependenciesIfNotInOld, {
        onDependencyChange: this.onDependencyChange,
        observable: observable,
        oldEventSet: this.oldDependencies.keyDependencies.get(observable)
    });
}

function removeKeyDependencies(event) {
    canReflect.offKeyValue(this.observable, event, this.onDependencyChange,"notify");
}

function removeObservablesKeyDependencies(oldEventSet, observable){
    oldEventSet.forEach(removeKeyDependencies, {onDependencyChange: this.onDependencyChange, observable: observable});
}

function addValueDependencies(observable) {
    // If we were unable to delete the key in the old set, setup a binding.
    if(this.oldDependencies.valueDependencies.delete(observable) === false) {
        canReflect.onValue(observable, this.onDependencyChange,"notify");
    }
}
function removeValueDependencies(observable) {
    canReflect.offValue(observable, this.onDependencyChange,"notify");
}


module.exports = {
    // ## updateObservations
    //
    // Binds `observationData.onDependencyChange` to dependencies in `observationData.newDependencies` that are not currently in
    // `observationData.oldDependencies`.  Anything in `observationData.oldDependencies`
    // left over is unbound.
    //
    // The algorthim works by:
    // 1. Loop through the `new` dependencies, checking if an equivalent is in the `old` bindings.
    //    - If there is an equivalent binding, delete that dependency from `old`.
    //    - If there is __not__ an equivalent binding, setup a binding from that dependency to `.onDependencyChange`.
    // 2. Loop through the remaining `old` dependencies, teardown bindings.
    //
    // For performance, this method mutates the values in `.oldDependencies`.
    updateObservations: function(observationData){
        observationData.newDependencies.keyDependencies.forEach(addObservablesNewKeyDependenciesIfNotInOld, observationData);
        observationData.oldDependencies.keyDependencies.forEach(removeObservablesKeyDependencies, observationData);
        observationData.newDependencies.valueDependencies.forEach(addValueDependencies, observationData);
        observationData.oldDependencies.valueDependencies.forEach(removeValueDependencies, observationData);
    },
    stopObserving: function(observationReciever, onDependencyChange){
        observationReciever.keyDependencies.forEach(removeObservablesKeyDependencies, {onDependencyChange: onDependencyChange});
        observationReciever.valueDependencies.forEach(removeValueDependencies, {onDependencyChange: onDependencyChange});
    }
};

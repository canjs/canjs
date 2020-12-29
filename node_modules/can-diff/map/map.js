'use strict';

var canReflect = require('can-reflect');

function defaultIdentity(a, b){
	return a === b;
}


/**
 * @module {function} can-diff/map/map
 * @parent can-diff
 *
 * @description Return a difference of two maps or objects.
 *
 * @signature `diffMap(oldObject, newObject)`
 *
 * Find the differences between two objects, based on properties and values.
 *
 * ```js
 * var diffObject = require("can-diff/map/map");
 *
 * diffMap({a: 1, b: 2}, {b: 3, c: 4})) // ->
 *   [{key: "a", type: "remove"},
 *    {key: "b", type: "set": value: 3},
 *    {key: "c", type: "add", "value": 4}]
 * ```
 *
 * @param {Object} oldObject The object to diff from.
 * @param {Object} newObject The object to diff to.
 * @return {Array} An array of object-[can-symbol/types/Patch patch] objects
 *
 * The object-patch object format has the following keys:
 * - **type**:  the type of operation on this property: add, remove, or set
 * - **key**:   the mutated property on the new object
 * - **value**: the new value (if type is "add" or "set")
 *
 */
module.exports = function(oldObject, newObject){
	var oldObjectClone,
		patches = [];

	// clone oldObject so properties can be deleted
	oldObjectClone = canReflect.assignMap({}, oldObject);

    canReflect.eachKey(newObject, function(value, newProp){
        // look for added properties
        if (!oldObject || !oldObject.hasOwnProperty(newProp)) {
            patches.push({
                key: newProp,
                type: 'add',
                value: value
            });
        // look for changed properties
        } else if (newObject[newProp] !== oldObject[newProp]) {
            patches.push({
                key: newProp,
                type: 'set',
                value: value
            });
        }

        // delete properties found in newObject
        // so we can find removed properties
        delete oldObjectClone[newProp];
    });

	// loop over removed properties
	for (var oldProp in oldObjectClone) {
		patches.push({
			key: oldProp,
			type: 'delete'
		});
	}

	return patches;
};

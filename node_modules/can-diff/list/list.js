'use strict';

var canReflect = require("can-reflect");

var slice = [].slice;
// a b c
// a b c d
// [[2,0, d]]


function defaultIdentity(a, b){
    return a === b;
}

function makeIdentityFromMapSchema(typeSchema) {
    if(typeSchema.identity && typeSchema.identity.length) {
        return function identityCheck(a, b) {
            var aId = canReflect.getIdentity(a, typeSchema),
                bId = canReflect.getIdentity(b, typeSchema);
            return aId === bId;
        };
    } else {
        return defaultIdentity;
    }
}

function makeIdentityFromListSchema(listSchema) {
    return listSchema.values != null ?
        makeIdentityFromMapSchema( canReflect.getSchema(listSchema.values) ) :
        defaultIdentity;
}

function makeIdentity(oldList, oldListLength) {
    var listSchema = canReflect.getSchema(oldList),
        typeSchema;
    if(listSchema != null) {
        if(listSchema.values != null) {
            typeSchema = canReflect.getSchema(listSchema.values);
        } else {
            return defaultIdentity;
        }
    }
    if(typeSchema == null && oldListLength > 0) {
        typeSchema = canReflect.getSchema( canReflect.getKeyValue(oldList, 0) );
    }
    if(typeSchema) {
        return makeIdentityFromMapSchema(typeSchema);
    } else {
        return defaultIdentity;
    }
}



function reverseDiff(oldDiffStopIndex, newDiffStopIndex, oldList, newList, identity) {
	var oldIndex = oldList.length - 1,
		newIndex =  newList.length - 1;

	while( oldIndex > oldDiffStopIndex && newIndex > newDiffStopIndex) {
		var oldItem = oldList[oldIndex],
			newItem = newList[newIndex];

		if( identity( oldItem, newItem, oldIndex ) ) {
			oldIndex--;
			newIndex--;
			continue;
		} else {
			// use newIndex because it reflects any deletions
			return [{
                type: "splice",
				index: newDiffStopIndex,
			 	deleteCount: (oldIndex-oldDiffStopIndex+1),
			 	insert: slice.call(newList, newDiffStopIndex,newIndex+1)
			}];
		}
	}
	// if we've reached of either the new or old list
	// we simply return
	return [{
        type: "splice",
		index: newDiffStopIndex,
		deleteCount: (oldIndex-oldDiffStopIndex+1),
		insert: slice.call(newList, newDiffStopIndex,newIndex+1)
	}];

}

/**
 * @module {function} can-diff/list/list
 * @parent can-diff
 *
 * @description Return a difference of two lists.
 *
 * @signature `diffList( oldList, newList, [identity] )`
 *
 * Compares two lists and produces a sequence of patches that can be applied to make `oldList` take
 * the shape of `newList`.
 *
 * ```js
 * var diffList = require("can-diff/list/list");
 *
 * console.log(diff([1], [1, 2])); // -> [{type: "splice", index: 1, deleteCount: 0, insert: [2]}]
 * console.log(diff([1, 2], [1])); // -> [{type: "splice", index: 1, deleteCount: 1, insert: []}]
 *
 * // with an optional identity function:
 * diffList(
 *     [{id:1},{id:2}],
 *     [{id:1},{id:3}],
 *     (a,b) => a.id === b.id
 * ); // -> [{type: "splice", index: 1, deleteCount: 1, insert: [{id:3}]}]
 * ```
 *
 * The patch algorithm is linear with respect to the length of the lists and therefore does not produce a
 * [perfect edit distance](https://en.wikipedia.org/wiki/Edit_distance) (which would be at least quadratic).
 *
 * It is designed to work with most common list change scenarios, when items are inserted or removed
 * to a list (as opposed to moved with in the last).
 *
 * For example, it is able to produce the following patches:
 *
 * ```js
 * diffList(
 *     ["a","b","c","d"],
 *     ["a","b","X","Y","c","d"]
 * ); // -> [{type: "splice", index: 2, deleteCount: 0, insert: ["X","Y"]}]
 * ```
 *
 * @param  {ArrayLike} oldList The source array or list to diff from.
 * @param  {ArrayLike} newList The array or list to diff to.
 * @param  {function|can-reflect.getSchema} schemaOrIdentity An optional identity function or a schema with
 * an identity property for comparing elements.  If a `schemaOrIdentity` is not provided, the schema of
 * the `oldList` will be used.  If a schema can not be found, items a default identity function will be created
 * that checks if the two values are strictly equal `===`.
 * @return {Array} An array of [can-symbol/types/Patch] objects representing the differences
 *
 * Returns the difference between two ArrayLike objects (that have nonnegative
 * integer keys and the `length` property) as an array of patch objects.
 *
 * A patch object returned by this function has the following properties:
 * - **type**: the type of patch (`"splice"`).
 * - **index**:  the index of newList where the patch begins
 * - **deleteCount**: the number of items deleted from that index in newList
 * - **insert**: an Array of items newly inserted at that index in newList
 *
 * Patches should be applied in the order they are returned.
 */

module.exports = function(oldList, newList, schemaOrIdentity){
    var oldIndex = 0,
		newIndex =  0,
		oldLength = canReflect.size( oldList ),
		newLength = canReflect.size( newList ),
		patches = [];

    var schemaType = typeof schemaOrIdentity,
        identity;
    if(schemaType === "function") {
        identity = schemaOrIdentity;
    } else if(schemaOrIdentity != null) {
        if(schemaOrIdentity.type === "map") {
            identity = makeIdentityFromMapSchema(schemaOrIdentity);
        } else {
            identity = makeIdentityFromListSchema(schemaOrIdentity);
        }
    } else {
        identity = makeIdentity(oldList, oldLength);
    }



	while(oldIndex < oldLength && newIndex < newLength) {
		var oldItem = oldList[oldIndex],
			newItem = newList[newIndex];

		if( identity( oldItem, newItem, oldIndex ) ) {
			oldIndex++;
			newIndex++;
			continue;
		}
		// look for single insert, does the next newList item equal the current oldList.
		// 1 2 3
		// 1 2 4 3
		if(  newIndex+1 < newLength && identity( oldItem, newList[newIndex+1], oldIndex ) ) {
			patches.push({index: newIndex, deleteCount: 0, insert: [ newList[newIndex] ], type: "splice"});
			oldIndex++;
			newIndex += 2;
			continue;
		}
		// look for single removal, does the next item in the oldList equal the current newList item.
		// 1 2 3
		// 1 3
		else if( oldIndex+1 < oldLength  && identity( oldList[oldIndex+1], newItem, oldIndex+1 ) ) {
			patches.push({index: newIndex, deleteCount: 1, insert: [], type: "splice"});
			oldIndex += 2;
			newIndex++;
			continue;
		}
		// just clean up the rest and exit
		// 1 2 3
		// 1 2 5 6 7
		else {
			// iterate backwards to `newIndex`
			// "a", "b", "c", "d", "e"
			// "a", "x", "y", "z", "e"
			// -> {}
			patches.push.apply(patches, reverseDiff(oldIndex, newIndex , oldList, newList, identity) );


			return patches;
		}
	}
	if( (newIndex === newLength) && (oldIndex === oldLength) ) {
		return patches;
	}
	// a b
	// a b c d e
	patches.push(
				{type: "splice", index: newIndex,
				 deleteCount: oldLength-oldIndex,
				 insert: slice.call(newList, newIndex) } );

	return patches;
};




// a b c
// a d e b c

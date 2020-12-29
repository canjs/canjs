"use strict";
var diffMap = require("../map/map"),
    diffList = require("../list/list"),
    canReflect = require("can-reflect");

function shouldCheckSet(patch, destVal, sourceVal) {
    return patch.type === "set" && destVal && sourceVal &&
        typeof destVal === "object" &&
        typeof sourceVal === "object";
}

function makeIdentityFromMapSchema(typeSchema) {
    if(typeSchema.identity && typeSchema.identity.length) {
        return function identityCheck(a, b) {
            var aId = canReflect.getIdentity(a, typeSchema),
                bId = canReflect.getIdentity(b, typeSchema);
            return aId === bId;
        };
    }
}

function makeDiffListIdentityComparison(oldList, newList, parentKey, nestedPatches) {
    var listSchema = canReflect.getSchema(oldList),
        typeSchema,
        identityCheckFromSchema,
        oldListLength = canReflect.size( oldList );
    if(listSchema != null) {
        if(listSchema.values != null) {
            typeSchema = canReflect.getSchema(listSchema.values);
        }
    }
    if(typeSchema == null && oldListLength > 0) {
        typeSchema = canReflect.getSchema( canReflect.getKeyValue(oldList, 0) );
    }
    if(typeSchema) {
        identityCheckFromSchema = makeIdentityFromMapSchema(typeSchema);
    }


    return function(a, b, aIndex) {
        if(canReflect.isPrimitive(a)) {
            return a === b;
        }
        if(canReflect.isPrimitive(b)) {
            return a === b;
        }
        if(identityCheckFromSchema) {
            if(identityCheckFromSchema(a, b)) {
                var patches = diffDeep(a, b, parentKey ? parentKey+"."+aIndex : ""+aIndex);
                nestedPatches.push.apply(nestedPatches, patches);
                return true;
            }
        }
        return diffDeep(a, b).length === 0;
    };
}

function diffDeep(dest, source, parentKey){

    if (dest && canReflect.isMoreListLikeThanMapLike(dest)) {
        var nestedPatches = [],
            diffingIdentity = makeDiffListIdentityComparison(dest, source, parentKey, nestedPatches);

        var primaryPatches = diffList(dest, source, diffingIdentity).map(function(patch){
            if(parentKey) {
                patch.key = parentKey;
            }
            return patch;
        });

		return nestedPatches.concat(primaryPatches);
	} else {
        parentKey = parentKey ? parentKey+".": "";
		var patches = diffMap(dest, source);
        // any sets we are going to recurse within
        var finalPatches = [];
        patches.forEach(function(patch){
            var key = patch.key;

            patch.key = parentKey + patch.key;
            var destVal = dest && canReflect.getKeyValue(dest, key),
                sourceVal = source && canReflect.getKeyValue(source, key);
            if(shouldCheckSet(patch, destVal, sourceVal)) {

                var deepPatches = diffDeep(destVal, sourceVal, patch.key);
                finalPatches.push.apply(finalPatches, deepPatches);
            } else {
                finalPatches.push(patch);
            }
        });
        return finalPatches;
	}
}

module.exports = diffDeep;

// # can-query-logic/set.js
// This file defines the set mechanics of types.
// It provides ways for types to define how to perform
// `union`, `difference`, `intersection` operations.
//
// It also derives other operators (`isEqual`, `isSubset`, etc) from these
// core operators.
//
// `.memberOf` is a property that defines if a value is within the set. It's
// currently a different thing.

var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");


// This is what we are defining
var set;

// ## HELPERS =========
//
// Used to make sure an object serializes to itself.
// This makes sure the empty object won't try to clone itself.
var addSerializeToThis = function(obj) {
	return canReflect.assignSymbols(obj, {
		"can.serialize": function() {
			return this;
		}
	});
};

// Reverses the arguments of a function.
function reverseArgs(fn) {
	return function(first, second) {
		return fn.call(this, second, first);
	};
}

// This symbol is put on constructor functions to track the comparator operators
// available to that type.
var setComparisonsSymbol = canSymbol.for("can.setComparisons");

// Adds comparators to a type. They are stored like:
// Type[@can.setComparisons] = Map({
//    [type1]: Map({[type2]: {union, different, intersection}})
// })
//
// Why do we need the outer object?
function addComparators(type1, type2, comparators) {
	var comparisons = type1[setComparisonsSymbol];
	if (!type1[setComparisonsSymbol]) {
		comparisons = type1[setComparisonsSymbol] = new Map();
	}
	var subMap = comparisons.get(type1);

	if (!subMap) {
		subMap = new Map();
		comparisons.set(type1, subMap);
	}
	var existingComparators = subMap.get(type2);
	if (existingComparators) {
		for (var prop in comparators) {
			if (existingComparators.hasOwnProperty(prop)) {
				console.warn("Overwriting " + type1.name + " " + prop + " " + type2.name + " comparitor");
			}
			existingComparators[prop] = comparators[prop];
		}
	} else {
		subMap.set(type2, comparators);
	}
}


// This type is used for primitives in JS, but it can be used for
// any value that should only === itself.
function Identity() {}

var typeMap = {
	"number": Identity,
	"string": Identity,
	"undefined": Identity,
	"boolean": Identity
};

// `get.intersection`, etc is used to look within the types
// maps and get the right comparator operators.
var get = {};
/*
var algebraSymbol = {
    "intersection": "∩",
    "union": "∪",
    "difference": "\\"
};
*/

["intersection", "difference", "union"].forEach(function(prop) {
	get[prop] = function(forwardComparators, value1, value2) {

		if (value2 === set.UNIVERSAL) {
			if (prop === "intersection") {
				return value1;
			}
			if (prop === "union") {
				return set.UNIVERSAL;
			}
			if (prop === "difference") {
				return set.EMPTY;
			}
		}
		if (value1 === set.UNIVERSAL) {
			if (prop === "intersection") {
				return value1;
			}
			if (prop === "union") {
				return set.UNIVERSAL;
			}
		}

		if (forwardComparators && forwardComparators[prop]) {
			var result = forwardComparators[prop](value1, value2);
			// console.log("",/*name1,*/ value1, algebraSymbol[prop], /*name2,*/ value2,"=", result);
			if (result === undefined && forwardComparators.undefinedIsEmptySet === true) {
				return set.EMPTY;
			} else {
				return result;
			}
		} else {
			throw new Error("Unable to perform " + prop + " between " + set.getType(value1).name + " and " + set.getType(value2).name);
		}

	};
});



set = {
	// The special types

	// All values within the "universe". Other sets can equal UNIVERSAL.
	UNIVERSAL: canReflect.assignSymbols({
		name: "UNIVERSAL"
	}, {
		"can.serialize": function() {
			return this;
		},
		"can.isMember": function(){
			return true;
		}
	}),
	// Nothing
	EMPTY: canReflect.assignSymbols({
		name: "EMPTY"
	}, {
		"can.serialize": function() {
			return this;
		},
		"can.isMember": function(){
			return false;
		}
	}),
	// The set exists, but we lack the language to represent it.
	UNDEFINABLE: addSerializeToThis({
		name: "UNDEFINABLE"
	}),
	// We don't know if this exists. Intersection between two paginated sets.
	UNKNOWABLE: addSerializeToThis({
		name: "UNKNOWABLE"
	}),
	Identity: Identity,
	isSpecial: function(setA) {
		return setA === set.UNIVERSAL || setA === set.EMPTY ||
			setA === set.UNDEFINABLE || setA === set.UNKNOWABLE;
	},
	isDefinedAndHasMembers: function(setA) {
		if (setA !== set.EMPTY && setA !== set.UNDEFINABLE && setA !== set.UNKNOWABLE) {
			return !!setA;
		} else {
			return false;
		}
	},
	getType: function(value) {
		if (value === set.UNIVERSAL) {
			return set.UNIVERSAL;
		}
		if (value === set.EMPTY) {
			return set.EMPTY;
		}
		if (value === set.UNKNOWABLE) {
			return set.UNKNOWABLE;
		}
		if (value === null) {
			return Identity;
		}
		if (typeMap.hasOwnProperty(typeof value)) {
			return typeMap[typeof value];
		}
		return value.constructor;
	},
	// This tries to get two comparable values from objects.
	// In many ways this is similar to what JavaScript does if it sees
	// `new Date() > new Date()`, it tries to coerce one value into the other value.
	ownAndMemberValue: function(startOwnValue, startMemberValue) {
		// If either side has a value, then try to type-coerse.
		if (startOwnValue != null || startMemberValue != null) {
			// First try to get `.valueOf` from either side
			var ownValue = startOwnValue != null ? startOwnValue.valueOf() : startOwnValue,
				memberValue = startMemberValue != null ? startMemberValue.valueOf() : startMemberValue;

			// If we ot passed a null on either side, return extracted values
			if (startOwnValue == null || startMemberValue == null) {
				return {
					own: ownValue,
					member: memberValue
				};
			}
			// If we read the values, but they aren't the same type ...
			// we will try to convert the member to the same type as the `startOwnValue`'s type.
			// And then read `.valueOf()` from that.
			if (ownValue == null || ownValue.constructor !== memberValue.constructor) {
				memberValue = new startOwnValue.constructor(memberValue).valueOf();
			}
			return {
				own: ownValue,
				member: memberValue
			};
		}
		return {
			own: startMemberValue,
			member: startOwnValue
		};
	},
	getComparisons: function(Type1, Type2) {
		var comparisons = Type1[setComparisonsSymbol];
		if (comparisons) {
			var subMap = comparisons.get(Type1);

			if (subMap) {
				return subMap.get(Type2);
			}
		}
	},
	hasComparisons: function(Type) {
		return !!Type[setComparisonsSymbol];
	},
	defineComparison: function(type1, type2, comparators) {
		addComparators(type1, type2, comparators);
		if (type1 !== type2) {
			var reverse = {};
			for (var prop in comparators) {
				// difference can not be reversed
				if (prop !== "difference") {
					reverse[prop] = reverseArgs(comparators[prop]);
				}

			}
			addComparators(type2, type1, reverse);
		}
	},
	/**
	 * Checks if A is a subset of B.  If A is a subset of B if:
	 * - A \ B = EMPTY (A has nothing outside what's in B)
	 * - A ∩ B = defined
	 */
	isSubset: function(value1, value2) {
		// check primary direction
		if (value1 === value2) {
			return true;
		}
		var Type1 = set.getType(value1),
			Type2 = set.getType(value2);
		var forwardComparators = set.getComparisons(Type1, Type2);
		if (forwardComparators) {
			// A set is a subset, if it intersects with the set, and it has nothing
			// outside the other set.
			var intersection = get.intersection(forwardComparators, value1, value2);
			// [a, b] \ [a, b, c]
			var difference = get.difference(forwardComparators, value1, value2);
			// they intersect, but value2 has nothing value1 outside value2
			if (intersection === set.UNKNOWABLE || difference === set.UNKNOWABLE) {
				// {sort: "a", page: 0-2} E {sort: "b", page: 2-3}
				return undefined;
			} else if (intersection !== set.EMPTY && difference === set.EMPTY) {
				return true;
			} else {
				return false;
			}
		} else {
			throw new Error("Unable to perform subset comparison between " + Type1.name + " and " + Type2.name);
		}
	},
	isProperSubset: function(setA, setB) {
		return set.isSubset(setA, setB) && !set.isEqual(setA, setB);
	},
	isEqual: function(value1, value2) {
		if (value1 === set.UNKNOWABLE || value2 === set.UNKNOWABLE) {
			return set.UNKNOWABLE;
		}
		//console.group("is", value1, "==", value2);
		var isSpecial1 = set.isSpecial(value1),
			isSpecial2 = set.isSpecial(value2);

		// Both have to be specail because some other sets will be equal to UNIVERSAL without being UNIVERSAL
		if (isSpecial1 && isSpecial2) {
			return isSpecial1 === isSpecial2;
		}
		var Type1 = set.getType(value1),
			Type2 = set.getType(value2);
		if (value1 === value2) {
			return true;
		}
		var forwardComparators = set.getComparisons(Type1, Type2);
		var reverseComparators = set.getComparisons(Type2, Type1);
		if (forwardComparators && reverseComparators) {

			// Two sets are equal if there's an intersection, but not difference
			var intersection = get.intersection(forwardComparators, value1, value2);
			var difference = get.difference(forwardComparators, value1, value2);
			if (intersection !== set.EMPTY && difference === set.EMPTY) {
				var reverseIntersection = get.intersection(reverseComparators, value2, value1);
				var reverseDifference = get.difference(reverseComparators, value2, value1);
				//console.groupEnd();
				return reverseIntersection !== set.EMPTY && reverseDifference === set.EMPTY;
			} else {
				//console.groupEnd();
				return false;
			}
		} else {
			var values = set.ownAndMemberValue(value1, value2);
			if (canReflect.isPrimitive(values.own) && canReflect.isPrimitive(values.member)) {
				return values.own === values.member;
			} else {
				// try to convert ...
				throw new Error("Unable to perform equal comparison between " + Type1.name + " and " + Type2.name);
			}

		}
	},

	union: function(value1, value2) {
		if (value1 === set.UNIVERSAL || value2 === set.UNIVERSAL) {
			return set.UNIVERSAL;
		}
		if (value1 === set.EMPTY) {
			return value2;
		} else if (value2 === set.EMPTY) {
			return value1;
		}
		if (value1 === set.UNKNOWABLE || value2 === set.UNKNOWABLE) {
			return set.UNKNOWABLE;
		}
		var Type1 = set.getType(value1),
			Type2 = set.getType(value2);
		var forwardComparators = set.getComparisons(Type1, Type2);
		return get.union(forwardComparators, value1, value2);
	},

	intersection: function(value1, value2) {
		if (value1 === set.UNIVERSAL) {
			return value2;
		}
		if (value2 === set.UNIVERSAL) {
			return value1;
		}
		if (value1 === set.EMPTY || value2 === set.EMPTY) {
			return set.EMPTY;
		}
		if (value1 === set.UNKNOWABLE || value2 === set.UNKNOWABLE) {
			return set.UNKNOWABLE;
		}
		var Type1 = set.getType(value1),
			Type2 = set.getType(value2);
		var forwardComparators = set.getComparisons(Type1, Type2);
		if (forwardComparators) {
			return get.intersection(forwardComparators, value1, value2);
		} else {
			throw new Error("Unable to perform intersection comparison between " + Type1.name + " and " + Type2.name);
		}
	},
	difference: function(value1, value2) {
		if (value1 === set.EMPTY) {
			return set.EMPTY;
		}
		if (value2 === set.EMPTY) {
			return value1;
		}
		if (value1 === set.UNKNOWABLE || value2 === set.UNKNOWABLE) {
			return set.UNKNOWABLE;
		}
		var Type1 = set.getType(value1),
			Type2 = set.getType(value2);
		var forwardComparators = set.getComparisons(Type1, Type2);
		if (forwardComparators) {
			return get.difference(forwardComparators, value1, value2);
		} else {
			throw new Error("Unable to perform difference comparison between " + Type1.name + " and " + Type2.name);
		}
	},

	indexWithEqual: function(arr, value) {
		for (var i = 0, len = arr.length; i < len; i++) {
			if (set.isEqual(arr[i], value)) {
				return i;
			}
		}
		return -1;
	}

};



function identityIntersection(v1, v2) {
	return v1 === v2 ? v1 : set.EMPTY;
}

function identityDifference(v1, v2) {
	return v1 === v2 ? set.EMPTY : v1;
}

function identityUnion(v1, v2) {
	return v1 === v2 ? v1 : set.UNDEFINABLE;
}
var identityComparitor = {
	intersection: identityIntersection,
	difference: identityDifference,
	union: identityUnion
};
set.defineComparison(Identity, Identity, identityComparitor);

set.defineComparison(set.UNIVERSAL, set.UNIVERSAL, identityComparitor);

module.exports = set;

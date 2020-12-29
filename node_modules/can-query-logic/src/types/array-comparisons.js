var common = require("./comparisons-common");
var set = require("../set");
var ValuesNot = require("./values-not");

var comparisons = {
	All: function(values){
		this.values = values;
	}
};

comparisons.All.prototype.isMember = common.isMemberThatUsesTestOnValues;

var is = comparisons;

comparisons.All.test = function(allValues, recordValues) {
	return allValues.every(function(allValue) {
		return recordValues.some(function(recordValue){
			var values = set.ownAndMemberValue(allValue, recordValue);
			return values.own === values.member;
		});
	});
};

function makeThrowCannotCompare(type, left, right) {
	return function() {
		throw new Error("can-query-logic: Cannot perform " + type + " between " + left + " and " + right);
	};
}

function throwComparatorAllTypes(type1, type2) {
	return {
		union: makeThrowCannotCompare("union", type1,  type2),
		difference: makeThrowCannotCompare("difference", type1, type2),
		intersection: makeThrowCannotCompare("intersection", type1, type2)
	};
}

function throwComparatorDifference(type1, type2) {
	return {
		difference: makeThrowCannotCompare("difference", type1, type2)
	};
}

var comparators = {
	UNIVERSAL_All: {
		difference: function(universe, all) {
			return new ValuesNot(all);
		}
	},
	All_UNIVERSAL: {
		difference: function() {
			return set.EMPTY;
		}
	},
	All_All: {
		union: function(a, b) {
			return new is.Or([a, b]);
		}
	},
	In_All: throwComparatorDifference("In", "All"),
	All_In: throwComparatorAllTypes("All", "In"),
	NotIn_All: throwComparatorDifference("NotIn", "All"),
	All_NotIn: throwComparatorAllTypes("All", "NotIn"),
	GreaterThan_All: throwComparatorDifference("GreaterThan", "All"),
	All_GreaterThan: throwComparatorAllTypes("All", "GreaterThan"),
	GreaterThanEqual_All: throwComparatorDifference("GreaterThanEqual", "All"),
	All_GreaterThanEqual: throwComparatorAllTypes("All", "GreaterThanEqual"),
	LessThan_All: throwComparatorDifference("LessThan", "All"),
	All_LessThan: throwComparatorAllTypes("All", "LessThan"),
	LessThanEqual_All: throwComparatorDifference("LessThanEqual", "All"),
	All_LessThanEqual: throwComparatorAllTypes("All", "LessThanEqual"),
	All_And: throwComparatorDifference("All", "And"),
	And_All: throwComparatorAllTypes("And",	 "All"),
	All_Or: throwComparatorDifference("All", "Or"),
	Or_All: throwComparatorAllTypes("Or", "All")
};

exports.comparisons = comparisons;
exports.comparators = comparators;

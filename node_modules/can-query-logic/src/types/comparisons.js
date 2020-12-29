var set = require("../set");
var arrayUnionIntersectionDifference = require("../array-union-intersection-difference");
var common = require("./comparisons-common");
var arrayComparisons = require("./array-comparisons");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var isMemberSymbol = canSymbol.for("can.isMember");
// $ne	Matches all values that are not equal to a specified value.
// $eq	Matches values that are equal to a specified value.
//
// $gt	Matches values that are greater than a specified value.
// $gte	Matches values that are greater than or equal to a specified value.

// $lt	Matches values that are less than a specified value.
// $lte	Matches values that are less than or equal to a specified value.

// $in	Matches any of the values specified in an array.
// $nin	Matches none of the values specified in an array.

var comparisons = canReflect.assign(arrayComparisons.comparisons, {
	In: function In(values) {
		// TODO: change this to store as `Set` later.
		this.values = values;
	},
	NotIn: function NotIn(values) {
		this.values = values;
	},
	GreaterThan: function GreaterThan(value) {
		this.value = value;
	},
	GreaterThanEqual: function GreaterThanEqual(value) {
		this.value = value;
	},
	LessThan: function LessThan(value) {
		this.value = value;
	},
	LessThanEqual: function LessThanEqual(value) {
		this.value = value;
	},
	// This is used to And something like `GT(3)` n `LT(4)`.
	// These are all value comparisons.
	And: function ValueAnd(ands) {
		this.values = ands;
	},
	// This is used to OR something like `GT(4)` n `LT(3)`.
	// These are all value comparisons.
	Or: function ValueOr(ors) {
		this.values = ors;
	}
});

comparisons.Or.prototype.orValues = function() {
	return this.values;
};

comparisons.In.test = function(values, b) {
	return values.some(function(value) {
		var values = set.ownAndMemberValue(value, b);
		return values.own === values.member;
	});
};

comparisons.NotIn.test = function(values, b) {
	return !comparisons.In.test(values, b);
};
comparisons.NotIn.testValue = function(value, b) {
	return !comparisons.In.testValue(value, b);
};

function nullIsFalse(test) {
	return function(arg1, arg2) {
		if (arg1 == null || arg2 == null) {
			return false;
		} else {
			return test(arg1, arg2);
		}
	};
}

function nullIsFalseTwoIsOk(test) {
	return function(arg1, arg2) {
		if (arg1 === arg2) {
			return true;
		} else if (arg1 == null || arg2 == null) {
			return false;
		} else {
			return test(arg1, arg2);
		}
	};
}

comparisons.GreaterThan.test = nullIsFalse(function(a, b) {
	return a > b;
});
comparisons.GreaterThanEqual.test = nullIsFalseTwoIsOk(function(a, b) {
	return a >= b;
});
comparisons.LessThan.test = nullIsFalse(function(a, b) {
	return a < b;
});
comparisons.LessThanEqual.test = nullIsFalseTwoIsOk(function(a, b) {
	return a <= b;
});

function isMemberThatUsesTest(value) {
	var values = set.ownAndMemberValue(this.value, value);
	return this.constructor.test(values.member, values.own);
}
[comparisons.GreaterThan, comparisons.GreaterThanEqual, comparisons.LessThan, comparisons.LessThanEqual, comparisons.LessThan].forEach(function(Type) {
	Type.prototype.isMember = isMemberThatUsesTest;
});

[comparisons.In, comparisons.NotIn].forEach(function(Type) {
	Type.prototype.isMember = common.isMemberThatUsesTestOnValues;
});

comparisons.And.prototype.isMember = function(value) {
	return this.values.every(function(and) {
		return and.isMember(value);
	});
};
comparisons.Or.prototype.isMember = function(value) {
	return this.values.some(function(and) {
		return and.isMember(value);
	});
};
Object.keys(comparisons).forEach(function(name) {
	comparisons[name].prototype[isMemberSymbol] = comparisons[name].prototype.isMember;
});

var is = comparisons;

function makeNot(Type) {
	return {
		test: function(vA, vB) {
			return !Type.test(vA, vB);
		}
	};
}


function makeEnum(type, Type, emptyResult) {
	return function(a, b) {
		var result = arrayUnionIntersectionDifference(a.values, b.values);
		if (result[type].length) {
			return new Type(result[type]);
		} else {
			return emptyResult || set.EMPTY;
		}
	};
}

function swapArgs(fn) {
	return function(a, b) {
		return fn(b, a);
	};
}


function makeSecondValue(Type, prop) {
	return function(universe, value) {
		return new Type(value[prop || "value"]);
	};
}

function returnBiggerValue(gtA, gtB) {
	if (gtA.value < gtB.value) {
		return gtB;
	} else {
		return gtA;
	}
}

function returnSmallerValue(gtA, gtB) {
	if (gtA.value > gtB.value) {
		return gtB;
	} else {
		return gtA;
	}
}

function makeAndIf(Comparison, Type) {
	return function(ltA, ltB) {
		if (Comparison.test(ltA.value, ltB.value)) {
			return makeAnd([ltA, new Type(ltB.value)]);
		} else {
			return set.EMPTY;
		}
	};
}

function make_InIfEqual_else_andIf(Comparison, Type) {
	var elseCase = makeAndIf(Comparison, Type);
	return function(a, b) {
		if (a.value === b.value) {
			return new is.In([a.value]);
		} else {
			return elseCase(a, b);
		}
	};
}

function make_filterFirstValueAgainstSecond(Comparison, Type, defaultReturn) {
	return function(inSet, gt) {
		var values = inSet.values.filter(function(value) {
			return Comparison.test(gt, value);
		});
		return values.length ?
			new Type(values) : defaultReturn || set.EMPTY;
	};
}

var isMemberTest = {
	test: function isMemberTest(set, value) {
		return set.isMember(value);
	}
};

function isOr(value) {
	return (value instanceof is.Or);
}

function isAnd(value) {
	return (value instanceof is.And);
}

function isAndOrOr(value) {
	return isAnd(value) || isOr(value);
}


// `value` - has a test function to check values
// `with` - the type we use to combined with the "other" value.
// `combinedUsing` - If there are values, how do we stick it together with `with`

function combineFilterFirstValuesAgainstSecond(options) {
	return function(inSet, gt) {
		var values = inSet.values.filter(function(value) {
			return options.values.test(gt, value);
		});
		var range;
		if (options.complement) {
			range = set.difference(set.UNIVERSAL, gt);
		} else if (options.with) {
			range = new options.with(gt.value);
		} else {
			range = gt;
		}
		return values.length ?
			options.combinedUsing([new options.arePut(values), range]) : range;
	};
}

function makeOrUnless(Comparison, result) {
	return function(setA, setB) {
		if (Comparison.test(setA.value, setB.value)) {
			return result || set.UNIVERSAL;
		} else {
			return makeOr([setA, setB]);
		}
	};
}

function makeAndUnless(Comparison, result) {
	return function(setA, setB) {
		if (Comparison.test(setA.value, setB.value)) {
			return result || set.EMPTY;
		} else {
			return makeAnd([setA, setB]);
		}
	};
}

function makeComplementSecondArgIf(Comparison) {
	return function(setA, setB) {
		if (Comparison.test(setA.value, setB.value)) {
			return set.difference(set.UNIVERSAL, setB);
		} else {
			return setA;
		}
	};
}


function makeAnd(ands) {
	return comparisons.And ? new comparisons.And(ands) : set.UNDEFINABLE;
}

function makeOr(ors) {
	return comparisons.Or ? new comparisons.Or(ors) : set.UNDEFINABLE;
}

function combineValueWithRangeCheck(inSet, rangeSet, RangeOrEqType) {
	var gte = new RangeOrEqType(rangeSet.value);
	var leftValues = inSet.values.filter(function(value) {
		return !gte.isMember(value);
	});
	if (!leftValues.length) {
		return gte;
	}

	if (leftValues.length < inSet.values.length) {
		return makeOr([new is.In(leftValues), gte]);
	} else {
		return makeOr([inSet, rangeSet]);
	}
}

// This tries to unify In([1]) with GT(1) -> GTE(1)
function makeOrWithInAndRange(inSet, rangeSet) {
	if (rangeSet instanceof is.Or) {
		var firstResult = makeOrWithInAndRange(inSet, rangeSet.values[0]);
		if ( !(firstResult instanceof is.Or) ) {
			return set.union(firstResult, rangeSet.values[1]);
		}
		var secondResult = makeOrWithInAndRange(inSet, rangeSet.values[1]);
		if ( !(secondResult instanceof is.Or) ) {
			return set.union(secondResult, rangeSet.values[0]);
		}
		return makeOr([inSet, rangeSet]);
	} else {
		if (rangeSet instanceof is.GreaterThan) {
			return combineValueWithRangeCheck(inSet, rangeSet, is.GreaterThanEqual);
		}
		if (rangeSet instanceof is.LessThan) {
			return combineValueWithRangeCheck(inSet, rangeSet, is.LessThanEqual);
		}
		return makeOr([inSet, rangeSet]);
	}
}

var In_RANGE = {
	union: combineFilterFirstValuesAgainstSecond({
		values: makeNot(isMemberTest),
		arePut: is.In,
		combinedUsing: function(ors) {
			return makeOrWithInAndRange(ors[0], ors[1]);
		}
	}),
	intersection: make_filterFirstValueAgainstSecond(isMemberTest, is.In, set.EMPTY),
	difference: make_filterFirstValueAgainstSecond(makeNot(isMemberTest), is.In, set.EMPTY)
};
var RANGE_IN = {
	difference: swapArgs(combineFilterFirstValuesAgainstSecond({
		values: isMemberTest,
		arePut: is.NotIn,
		combinedUsing: makeAnd
	}))
};

var NotIn_RANGE = function() {
	return {
		union: make_filterFirstValueAgainstSecond(makeNot(isMemberTest), is.NotIn, set.UNIVERSAL),
		intersection: combineFilterFirstValuesAgainstSecond({
			values: isMemberTest,
			arePut: is.NotIn,
			combinedUsing: makeAnd
		}),
		difference: combineFilterFirstValuesAgainstSecond({
			values: makeNot(isMemberTest),
			arePut: is.NotIn,
			combinedUsing: makeAnd,
			complement: true
		})
	};
};
var RANGE_NotIn = {
	difference: swapArgs(make_filterFirstValueAgainstSecond(isMemberTest, is.In, set.EMPTY))
};

var RANGE_And_Union = function(gt, and) {

	var union1 = set.union(gt, and.values[0]);
	var union2 = set.union(gt, and.values[1]);

	if (!isAndOrOr(union1) && !isAndOrOr(union2)) {
		return set.intersection(union1, union2);
	} else {
		return new is.Or([gt, and]);
	}
};
var RANGE_And_Intersection = function(gt, and) {
	var and1 = and.values[0],
		and2 = and.values[1];
	var intersection1 = set.intersection(gt, and1);
	var intersection2 = set.intersection(gt, and2);
	if (intersection1 === set.EMPTY || intersection2 === set.EMPTY) {
		return set.EMPTY;
	}
	if (!isAndOrOr(intersection1)) {
		return new set.intersection(intersection1, and2);
	}

	if (!isAndOrOr(intersection2)) {
		return new set.intersection(intersection2, and1);
	} else {
		return new is.And([gt, and]);
	}

};

var RANGE_And_Difference = function(gt, and) {
	var and1 = and.values[0],
		and2 = and.values[1];
	var difference1 = set.difference(gt, and1);
	var difference2 = set.difference(gt, and2);
	if (difference1 === set.EMPTY) {
		return difference2;
	}
	if (difference2 === set.EMPTY) {
		return difference1;
	}
	return new is.Or([difference1, difference2]);
};

var And_RANGE_Difference = function(and, gt) {
	var and1 = and.values[0],
		and2 = and.values[1];
	var difference1 = set.difference(and1, gt);
	var difference2 = set.difference(and2, gt);

	return set.intersection(difference1, difference2);
};

var RANGE_Or = {
	union: function(gt, or) {
		var or1 = or.values[0],
			or2 = or.values[1];
		var union1 = set.union(gt, or1);
		if (!isAndOrOr(union1)) {
			return set.union(union1, or2);
		}
		var union2 = set.union(gt, or2);
		if (!isAndOrOr(union2)) {
			return set.union(or1, union2);
		} else {
			return new is.Or([gt, or]);
		}
	},
	intersection: function(gt, or) {
		var or1 = or.values[0],
			or2 = or.values[1];
		var intersection1 = set.intersection(gt, or1);
		var intersection2 = set.intersection(gt, or2);
		if (intersection1 === set.EMPTY) {
			return intersection2;
		}
		if (intersection2 === set.EMPTY) {
			return intersection1;
		}
		return set.union(intersection1, intersection2);
	},
	// v \ (a || b) -> (v \ a) n (v \ b)
	difference: function(gt, or) {

		var or1 = or.values[0],
			or2 = or.values[1];
		var difference1 = set.difference(gt, or1);
		var difference2 = set.difference(gt, or2);
		return set.intersection(difference1, difference2);
	}
};

var Or_RANGE = {
	// ( a || b ) \ v -> (a \ v) U (b \ v)
	difference: function(or, gt) {
		var or1 = or.values[0],
			or2 = or.values[1];
		var difference1 = set.difference(or1, gt);
		var difference2 = set.difference(or2, gt);
		return set.union(difference1, difference2);
	}
};

var comparators = canReflect.assign(arrayComparisons.comparators, {
	// In
	In_In: {
		union: makeEnum("union", is.In),
		intersection: makeEnum("intersection", is.In),
		difference: makeEnum("difference", is.In)
	},
	UNIVERSAL_In: {
		difference: makeSecondValue(is.NotIn, "values")
	},

	In_NotIn: {
		union: swapArgs(makeEnum("difference", is.NotIn, set.UNIVERSAL)),
		// what does In have on its own
		intersection: makeEnum("difference", is.In),
		difference: makeEnum("intersection", is.In)
	},
	NotIn_In: {
		difference: makeEnum("union", is.NotIn)
	},

	In_GreaterThan: In_RANGE,
	GreaterThan_In: RANGE_IN,

	In_GreaterThanEqual: In_RANGE,
	GreaterThanEqual_In: RANGE_IN,

	In_LessThan: In_RANGE,
	LessThan_In: RANGE_IN,

	In_LessThanEqual: In_RANGE,
	LessThanEqual_In: RANGE_IN,
	In_And: In_RANGE,
	And_In: RANGE_IN,

	In_Or: In_RANGE,
	Or_In: RANGE_IN,

	// NotIn ===============================
	NotIn_NotIn: {
		union: makeEnum("intersection", is.NotIn, set.UNIVERSAL),
		intersection: makeEnum("union", is.NotIn),
		difference: makeEnum("difference", is.In)
	},
	UNIVERSAL_NotIn: {
		difference: makeSecondValue(is.In, "values")
	},

	NotIn_GreaterThan: NotIn_RANGE(),
	GreaterThan_NotIn: RANGE_NotIn,

	NotIn_GreaterThanEqual: NotIn_RANGE(),
	GreaterThanEqual_NotIn: RANGE_NotIn,

	NotIn_LessThan: NotIn_RANGE(),
	LessThan_NotIn: RANGE_NotIn,

	NotIn_LessThanEqual: NotIn_RANGE(),
	LessThanEqual_NotIn: RANGE_NotIn,

	NotIn_And: NotIn_RANGE(),
	And_NotIn: RANGE_NotIn,

	NotIn_Or: NotIn_RANGE(),
	Or_NotIn: RANGE_NotIn,

	// GreaterThan ===============================
	GreaterThan_GreaterThan: {
		union: returnSmallerValue,
		intersection: returnBiggerValue,
		// {$gt:5} \ {gt: 6} -> AND( {$gt:5}, {$lte: 6} )
		difference: makeAndIf(is.LessThan, is.LessThanEqual)
	},
	UNIVERSAL_GreaterThan: {
		difference: makeSecondValue(is.LessThanEqual)
	},

	GreaterThan_GreaterThanEqual: {
		union: returnSmallerValue,
		intersection: returnBiggerValue,
		// {$gt:5} \ {gte: 6} -> AND( {$gt:5}, {$lt: 6} )
		difference: makeAndIf(is.LessThan, is.LessThan)
	},
	GreaterThanEqual_GreaterThan: {
		difference: make_InIfEqual_else_andIf(is.LessThan, is.LessThanEqual)
	},

	GreaterThan_LessThan: {
		union: (function() {
			var makeOrUnlessLessThan = makeOrUnless(is.LessThan);
			return function greaterThan_lessThan_union(a, b) {
				if ( comparisons.In.test([a.value], b.value) ) {
					return new is.NotIn([a.value]);
				} else {
					return makeOrUnlessLessThan(a, b);
				}
			};
		})(),
		intersection: makeAndUnless(is.GreaterThan),
		difference: makeComplementSecondArgIf(is.LessThan)
	},
	LessThan_GreaterThan: {
		difference: makeComplementSecondArgIf(is.GreaterThan)
	},

	GreaterThan_LessThanEqual: {
		union: makeOrUnless(is.LessThanEqual),
		intersection: makeAndUnless(is.GreaterThanEqual),
		difference: makeComplementSecondArgIf(is.LessThanEqual)
	},
	LessThanEqual_GreaterThan: {
		difference: makeComplementSecondArgIf(is.GreaterThanEqual)
	},

	GreaterThan_And: {
		union: RANGE_And_Union,
		intersection: RANGE_And_Intersection,
		difference: RANGE_And_Difference
	},
	And_GreaterThan: {
		difference: And_RANGE_Difference
	},
	GreaterThan_Or: RANGE_Or,
	Or_GreaterThan: Or_RANGE,

	// GreaterThanEqual =========
	GreaterThanEqual_GreaterThanEqual: {
		union: returnSmallerValue,
		intersection: returnBiggerValue,
		// {gte: 2} \ {gte: 3} = {gte: 2} AND {lt: 3}
		difference: makeAndIf(is.LessThan, is.LessThan)
	},
	UNIVERSAL_GreaterThanEqual: {
		difference: makeSecondValue(is.LessThan)
	},

	GreaterThanEqual_LessThan: {
		union: makeOrUnless(is.LessThanEqual),
		intersection: makeAndUnless(is.GreaterThanEqual),
		difference: makeComplementSecondArgIf(is.LessThanEqual)
	},
	LessThan_GreaterThanEqual: {
		difference: makeComplementSecondArgIf(is.GreaterThanEqual)
	},

	GreaterThanEqual_LessThanEqual: {
		union: makeOrUnless(is.LessThanEqual),
		// intersect on a number
		intersection: (function() {
			var makeAnd = makeAndUnless(is.GreaterThan);
			return function gte_lte_intersection(gte, lte) {
				var inSet = new is.In([gte.value]);
				if (inSet.isMember(lte.value)) {
					return inSet;
				} else {
					return makeAnd(gte, lte);
				}
			};
		})(),
		difference: makeComplementSecondArgIf(is.LessThanEqual)
	},
	LessThanEqual_GreaterThanEqual: {
		difference: makeComplementSecondArgIf(is.GreaterThanEqual)
	},

	GreaterThanEqual_And: {
		union: RANGE_And_Union,
		intersection: RANGE_And_Intersection,
		difference: RANGE_And_Difference
	},
	And_GreaterThanEqual: {
		difference: And_RANGE_Difference
	},
	GreaterThanEqual_Or: RANGE_Or,
	Or_GreaterThanEqual: Or_RANGE,

	// LessThan
	LessThan_LessThan: {
		union: returnBiggerValue,
		intersection: returnSmallerValue,
		difference: makeAndIf(is.GreaterThan, is.GreaterThanEqual)
	},
	UNIVERSAL_LessThan: {
		difference: makeSecondValue(is.GreaterThanEqual)
	},

	LessThan_LessThanEqual: {
		union: returnBiggerValue,
		intersection: returnSmallerValue,
		// {lt: 3} \ {lte: 2} -> {lt: 3} AND {gt: 2}
		difference: makeAndIf(is.GreaterThan, is.GreaterThan)
	},
	LessThanEqual_LessThan: {
		difference: make_InIfEqual_else_andIf(is.GreaterThanEqual, is.GreaterThanEqual)
	},

	LessThan_And: {
		union: RANGE_And_Union,
		intersection: RANGE_And_Intersection,
		difference: RANGE_And_Difference
	},
	And_LessThan: {
		difference: And_RANGE_Difference
	},
	LessThan_Or: RANGE_Or,
	Or_LessThan: Or_RANGE,

	// LessThanEqual
	LessThanEqual_LessThanEqual: {
		union: returnBiggerValue,
		intersection: returnSmallerValue,
		difference: function(lteA, lteB) {
			if (lteA.value >= lteB.value) {
				return makeAnd([lteA, new is.GreaterThan(lteB.value)]);
			} else {
				return set.EMPTY;
			}
		}
	},
	UNIVERSAL_LessThanEqual: {
		difference: makeSecondValue(is.GreaterThan)
	},

	LessThanEqual_And: {
		union: RANGE_And_Union,
		intersection: RANGE_And_Intersection,
		difference: RANGE_And_Difference
	},
	And_LessThanEqual: {
		difference: And_RANGE_Difference
	},
	LessThanEqual_Or: RANGE_Or,
	Or_LessThanEqual: Or_RANGE,

	// AND =====
	And_And: {
		// (a n b) U (c n d) => (a U c) n (b U d)?
		// union both ways ... if one is unviersal, the other is the result.
		// (a ∩ b) ∪ (c ∩ d) where Z = (a ∩ b)
		// -> Z ∪ (c ∩ d)
		// -> (Z ∪ c) ∩ (Z ∪ d)
		// -> ((a ∩ b) ∪ c) ∪ ((a ∩ b) ∪ d)
		union: function(and1, and2) {
			var union1 = set.union(and1, and2.values[0]);
			var union2 = set.union(and1, and2.values[1]);

			if (isAndOrOr(union1) || isAndOrOr(union2)) {
				// try the other direction
				union1 = set.union(and2, and1.values[0]);
				union2 = set.union(and2, and1.values[1]);
			}
			if (isAndOrOr(union1) || isAndOrOr(union2)) {
				return new is.Or([and1, and2]);
			} else {
				return set.intersection(union1, union2);
			}

			/*
			var combo1 = [
					set.union(and1.values[0], and2.values[0]),
					set.union(and1.values[1], and2.values[1])
				],
				combo2 = [
					set.union(and1.values[0], and2.values[1]),
					set.union(and1.values[1], and2.values[0])
				];
			if (combo1.every(function(aSet) {
				return set.isEqual(set.UNIVERSAL, aSet);
			})) {
				return set.intersection.apply(set, combo2);
			}
			if (combo2.every(function(aSet) {
				return set.isEqual(set.UNIVERSAL, aSet);
			})) {
				return set.intersection.apply(set, combo1);
			}
			return new is.Or([and1, and2]);*/
		},

		intersection: function(and1, and2) {
			var intersection1 = set.intersection(and1.values[0], and2.values[0]);
			var intersection2 = set.intersection(and1.values[1], and2.values[1]);

			if (!isAndOrOr(intersection1) || !isAndOrOr(intersection2)) {
				return set.intersection(intersection1, intersection2);
			}
			intersection1 = set.intersection(and1.values[0], and2.values[1]);
			intersection2 = set.intersection(and1.values[1], and2.values[0]);

			if (!isAndOrOr(intersection1) || !isAndOrOr(intersection2)) {
				return set.intersection(intersection1, intersection2);
			} else {
				return new is.And([and1, and2]);
			}
		},
		// (a ∩ b) \ (c ∩ d) where Z = (a ∩ b)
		// -> Z \ (c ∩ d)
		// -> (Z \ c) ∪ (Z \ d)
		// -> ((a ∩ b) \ c) ∪ ((a ∩ b) \ d)
		difference: (function() {

			return function(and1, and2) {
				var d1 = set.difference(and1, and2.values[0]);
				var d2 = set.difference(and1, and2.values[1]);
				return set.union(d1, d2);
			};
			/*
			function getDiffIfPartnerIsEmptyAndOtherComboNotDisjoint(inOrderDiffs, reverseOrderDiffs, diffedAnd) {
				var diff;
				if (inOrderDiffs[0] === set.EMPTY) {
					diff = inOrderDiffs[1];
				}
				if (inOrderDiffs[1] === set.EMPTY) {
					diff = inOrderDiffs[0];
				}
				if (diff) {
					// check if a diff equals itself (and therefor is disjoint)

					if (set.isEqual(diffedAnd.values[0], reverseOrderDiffs[0] ) ) {
						// is disjoint
						return diffedAnd;
					}
					if ( set.isEqual(diffedAnd.values[1], reverseOrderDiffs[1] ) ) {
						return diffedAnd;
					}
					return diff;
				}
			}
			return function(and1, and2) {
				var inOrderDiffs = [
						set.difference(and1.values[0], and2.values[0]),
						set.difference(and1.values[1], and2.values[1])
					],
					reverseOrderDiffs = [
						set.difference(and1.values[0], and2.values[1]),
						set.difference(and1.values[1], and2.values[0])
					];

				var diff = getDiffIfPartnerIsEmptyAndOtherComboNotDisjoint(inOrderDiffs, reverseOrderDiffs, and1);
				if (diff) {
					return diff;
				}
				diff = getDiffIfPartnerIsEmptyAndOtherComboNotDisjoint(reverseOrderDiffs, inOrderDiffs, and1);
				if (diff) {
					return diff;
				} else {
					// if one is a double And ... that's the outer \\ inner
					if (isAndOrOr(inOrderDiffs[0]) && isAndOrOr(inOrderDiffs[1])) {
						return new is.Or([inOrderDiffs[0], inOrderDiffs[1]]);
					} else if ( isAndOrOr(reverseOrderDiffs[0]) && isAndOrOr(reverseOrderDiffs[1]) ) {
						return new is.Or([reverseOrderDiffs[0], reverseOrderDiffs[1]]);
					}
					return set.UNKNOWABLE;
				}
			};*/
		})()
	},
	And_Or: {
		// (a ∩ b) ∪ (c u d) where Z = (c u d)
		// -> Z u (a ∩ b)
		// -> (Z u a) ∩ (Z u b)
		// -> ((c u d) u a) ∩ ((c u d) u b)
		union: function(and, or) {
			var aUnion = set.union(and.values[0], or);
			var bUnion = set.union(and.values[1], or);

			if (!isAndOrOr(aUnion) || !isAndOrOr(bUnion)) {
				return set.intersection(aUnion, bUnion);
			}

			return new is.Or([and, or]);
		},
		// (a ∩ b) ∩ (c u d) where Z = (a ∩ b)
		// -> Z ∩ (c u d)
		// -> (Z ∩ c) u (Z ∩ d)
		// -> (a ∩ b ∩ c) u (a ∩ b ∩ d)
		intersection: function(and, or) {
			var aIntersection = set.intersection(and, or.values[0]);
			var bIntersection = set.intersection(and, or.values[1]);
			if (!isOr(aIntersection) && !isOr(bIntersection)) {
				return set.union(aIntersection, bIntersection);
			}
			return new is.And([and, or]);
		},
		// (a ∩ b) \ (c u d) where Z = (a ∩ b)
		// -> Z \ (c u d)
		// -> (Z \ c) ∩ (Z \ d)
		// -> ((a ∩ b) \ c) ∩ ((a ∩ b) \ d)
		difference: function(and, or) {
			var aDiff = set.difference(and, or.values[0]);
			var bDiff = set.difference(and, or.values[1]);
			return set.intersection(aDiff, bDiff);
		}
	},
	Or_And: {
		// (a ∪ b) \ (c ∩ d) where Z = (a ∪ b)
		// -> Z \ (c ∩ d)
		// -> (Z \ c) ∪ (Z \ d)
		// -> ((a ∪ b) \ c) ∪ ((a ∪ b) \ d)
		difference: function(or, and) {
			var aDiff = set.difference(or, and.values[0]);
			var bDiff = set.difference(or, and.values[1]);
			return set.union(aDiff, bDiff);
		}
	},
	UNIVERSAL_And: {
		difference: function(universe, and) {
			var inverseFirst = set.difference(universe, and.values[0]),
				inverseSecond = set.difference(universe, and.values[1]);
			return set.union(inverseFirst, inverseSecond);
		}
	},
	Or_Or: {
		// (a ∪ b) ∪ (c ∪ d)
		union: function(or1, or2) {
			var union1 = set.union(or1.values[0], or2.values[0]);
			var union2 = set.union(or1.values[1], or2.values[1]);

			if (!isAndOrOr(union1) || !isAndOrOr(union2)) {
				return set.union(union1, union2);
			}
			union1 = set.union(or1.values[0], or2.values[1]);
			union2 = set.union(or1.values[1], or2.values[0]);

			if (!isAndOrOr(union1) || !isAndOrOr(union2)) {
				return set.union(union1, union2);
			} else {
				return new is.Or([or1, or2]);
			}
		},
		// (a ∪ b) ∩ (c ∪ d) where Z = (a ∪ b)
		// -> Z ∩ (c ∪ d)
		// -> (Z ∩ c) ∪ (Z ∪ d)
		// -> ((a ∪ b) ∩ c) ∪ ((a ∪ b) ∩ d)
		intersection: function(or1, or2) {
			var c = or2.values[0],
				d = or2.values[1];

			var intersection1 = set.intersection(or1, c);
			var intersection2 = set.intersection(or1, d);

			if (!isOr(intersection1) || !isOr(intersection2)) {
				return set.union(intersection1, intersection2);
			}
			intersection1 = set.union(or2, or1.values[0]);
			intersection2 = set.union(or2, or1.values[1]);

			if (!isOr(intersection1) || !isOr(intersection2)) {
				return set.union(intersection1, intersection2);
			} else {
				return new is.Or([or1, or2]);
			}
		},
		// (a ∪ b) \ (c ∪ d) where Z = (a ∪ b)
		// -> Z \ (c ∪ d)
		// -> (Z \ c) ∩ (Z \ d)
		// -> ((a ∪ b) \ c) ∩ ((a ∪ b) \ d)
		difference: function(or1, or2) {
			var d1 = set.difference(or1, or2.values[0]);
			var d2 = set.difference(or1, or2.values[1]);
			return set.intersection(d1, d2);
		}
	},
	UNIVERSAL_Or: {
		difference: function(universe, or) {
			var inverseFirst = set.difference(universe, or.values[0]),
				inverseSecond = set.difference(universe, or.values[1]);
			return set.intersection(inverseFirst, inverseSecond);
		}
	}
});

// Registers all the comparisons above
var names = Object.keys(comparisons);
names.forEach(function(name1, i) {
	if (!comparators[name1 + "_" + name1]) {
		console.warn("no " + name1 + "_" + name1);
	} else {
		set.defineComparison(comparisons[name1], comparisons[name1], comparators[name1 + "_" + name1]);
	}

	if (!comparators["UNIVERSAL_" + name1]) {
		console.warn("no UNIVERSAL_" + name1);
	} else {
		set.defineComparison(set.UNIVERSAL, comparisons[name1], comparators["UNIVERSAL_" + name1]);
	}

	for (var j = i + 1; j < names.length; j++) {
		var name2 = names[j];
		if (!comparators[name1 + "_" + name2]) {
			console.warn("no " + name1 + "_" + name2);
		} else {
			set.defineComparison(comparisons[name1], comparisons[name2], comparators[name1 + "_" + name2]);
		}
		if (!comparators[name2 + "_" + name1]) {
			console.warn("no " + name2 + "_" + name1);
		} else {
			set.defineComparison(comparisons[name2], comparisons[name1], comparators[name2 + "_" + name1]);
		}
	}
});

module.exports = comparisons;

var set = require("../set");
var is = require("./comparisons");
var canReflect = require("can-reflect");
var schemaHelpers = require("../schema-helpers");
var canSymbol = require("can-symbol");

var comparisonSetTypeSymbol = canSymbol.for("can.ComparisonSetType");
var isMemberSymbol = canSymbol.for("can.isMember");

// This helper function seperates out sets that relate to the "maybe" values
// like `null` or `undefined`. For example, if `rangeToBeSplit`
// is `In([null, 3])`, it will produce `{enum: In([null]), range: In(3)}`
function splitByRangeAndEnum(maybeUniverse, rangeToBeSplit) {
	var enumSet;

	// If it's an AND
	if (rangeToBeSplit instanceof is.And) {
		// recursively split each value
		var sets = rangeToBeSplit.values.map(function(setInAnd) {
			return splitByRangeAndEnum(maybeUniverse, setInAnd);
		});
		// take the intersections
		return sets.reduce(function(last, maybe) {
			return {
				range: set.intersection(last.range, maybe.range),
				enum: set.intersection(last.enum, maybe.enum)
			};
		}, {
			range: set.UNIVERSAL,
			enum: maybeUniverse
		});

	} else if (rangeToBeSplit instanceof is.In) {

		var shouldBeInValues = rangeToBeSplit.values.filter(function(value) {
			return maybeUniverse.isMember(value);
		});
		if (shouldBeInValues.length) {
			var valuesCopy = rangeToBeSplit.values.slice(0);
			canReflect.removeValues(valuesCopy, shouldBeInValues);

			return {
				enum: new is.In(shouldBeInValues),
				range: valuesCopy.length ? new is.In(valuesCopy) : set.EMPTY
			};
		} else {
			return {
				enum: set.EMPTY,
				range: rangeToBeSplit
			};
		}
	} else if (rangeToBeSplit instanceof is.NotIn) {

		// Gets the 'maybe' values in the range
		enumSet = set.intersection(maybeUniverse, rangeToBeSplit);

		// We should remove all the values within $in matching an in values.
		var rangeValues = rangeToBeSplit.values.filter(function(value) {
			return !maybeUniverse.isMember(value);
		});
		return {
			range: rangeValues.length ? new is.NotIn(rangeValues) : set.UNIVERSAL,
			enum: enumSet
		};
	} else {
		return {
			enum: set.EMPTY,
			range: rangeToBeSplit
		};
	}
}

// Builds a type for ranged values plus some other enum values.
// This is great for 'maybe' values. For example, it might be a string OR `null` OR `undefined`
// `makeMaybe([null, undefined])`
function makeMaybe(inValues, makeChildType) {


	var maybeUniverse = new is.In(inValues);

	function Maybe(values) {

		// Maybe has two sub-sets:
		// - `.range` - Selects the non-enum values. Ex: `GreaterThan(3)`
		// - `.enum` - Selects the enum values. This is ALWAYS an `In`. Ex: `In([null])`.
		// Maybe is effectively an OR with these two properties.
		var result = splitByRangeAndEnum(maybeUniverse, values.range);
		this.range = result.range || set.EMPTY;
		if (values.enum) {
			if (result.enum !== set.EMPTY) {
				this.enum = set.union(result.enum, values.enum);
			} else {
				this.enum = values.enum;
			}
		} else {
			this.enum = result.enum;
		}
		if(this.enum === set.EMPTY && this.range === set.EMPTY) {
			return set.EMPTY;
		}
	}
	Maybe.prototype.orValues = function() {
		var values = [];
		if( this.range !== set.EMPTY ) {
			values.push(this.range);
		}
		if( this.enum !== set.EMPTY ) {
			values.push(this.enum);
		}
		return values;
	};
	Maybe.prototype[isMemberSymbol] = function isMember() {
		var rangeIsMember = this.range[isMemberSymbol] || this.range.isMember,
			enumIsMember = this.enum[isMemberSymbol] || this.enum.isMember;
		return rangeIsMember.apply(this.range, arguments) || enumIsMember.apply(this.enum, arguments);
	};



	set.defineComparison(Maybe, Maybe, {
		union: function(maybeA, maybeB) {
			var enumSet = set.union(maybeA.enum, maybeB.enum);
			var range = set.union(maybeA.range, maybeB.range);

			return new Maybe({
				enum: enumSet,
				range: range
			});
		},
		difference: function(maybeA, maybeB) {
			var enumSet = set.difference(maybeA.enum, maybeB.enum);
			var range = set.difference(maybeA.range, maybeB.range);

			return new Maybe({
				enum: enumSet,
				range: range
			});
		},
		intersection: function(maybeA, maybeB) {
			var enumSet = set.intersection(maybeA.enum, maybeB.enum);
			var range = set.intersection(maybeA.range, maybeB.range);

			return new Maybe({
				enum: enumSet,
				range: range
			});
		}
	});
	Maybe.inValues = inValues;

	set.defineComparison(set.UNIVERSAL, Maybe, {
		difference: function(universe, maybe) {
			var primary,
				secondary;

			if (maybe.range === set.UNIVERSAL) {
				// there is only the enum
				return new Maybe({
					range: maybe.range,
					enum: set.difference(maybeUniverse, maybe.enum)
				});
			}
			// there is only a primary
			if (maybe.enum === set.EMPTY) {
				var rangeSet = set.difference(set.UNIVERSAL, maybe.range);
				var notPresent = set.difference(maybeUniverse, maybe.range);
				// make sure they are included
				var enumSet = set.difference(notPresent, rangeSet);


				return new Maybe({
					range: rangeSet,
					enum: enumSet
				});
				// check enum things that aren't included in primary

			} else {
				primary = set.difference(universe, maybe.range);
				secondary = set.difference(maybeUniverse, maybe.enum);
			}
			return new Maybe({
				enum: secondary,
				range: primary
			});
		}
	});
	makeChildType = makeChildType || function(v) {
		return v;
	};

	Maybe.hydrate = function(value, childHydrate) {
		return new Maybe({
			range: childHydrate(value, makeChildType)
		});
	};

	return Maybe;
}



makeMaybe.canMakeMaybeSetType = function(Type) {
	var schema = canReflect.getSchema(Type);
	if (schema && schema.type === "Or") {
		var categories = schemaHelpers.categorizeOrValues(schema.values);

		return categories.valueOfTypes.length === 1 &&
			(categories.valueOfTypes.length + categories.primitives.length === schema.values.length);
	}
	return false;
};

// Given an __Or__ type like:
// ```
// var MaybeString = {
//   "can.new"(val){ ... },
// 	 "can.getSchema"(){ return  { type: "Or", values: [String, undefined, null] }
// });
// ```
//
// This creates two types:
// - `Value` - A value type used for what's within `GreaterThan`, etc.
// - `Maybe` - A SetType for this property. It will have `GreaterThan` within its
//            `{enum, range}` sub values.
//
// This creates the outer `SetType` and the innermost `Value` type while the Comparisons
// are used inbetween.
//
// The `MaybeString` could probably be directly used to hydrate values to what they should be.
makeMaybe.makeMaybeSetTypes = function(Type) {
	var schema = canReflect.getSchema(Type);
	var categories = schemaHelpers.categorizeOrValues(schema.values);
	var ComparisonSetType;

	// No need to build the comparison type if we are given it.
	if (Type[comparisonSetTypeSymbol]) {
		ComparisonSetType = Type[comparisonSetTypeSymbol];
	} else {

		ComparisonSetType = function(value) {
			this.value = canReflect.new(Type, value);
		};
		ComparisonSetType.prototype.valueOf = function() {
			return this.value;
		};
		canReflect.assignSymbols(ComparisonSetType.prototype, {
			"can.serialize": function() {
				return this.value;
			}
		});
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			Object.defineProperty(ComparisonSetType, "name", {
				value: "Or[" + categories.valueOfTypes[0].name + "," + categories.primitives.map(String).join(" ") + "]"
			});
		}
		//!steal-remove-end
	}

	return {
		Maybe: makeMaybe(categories.primitives, function hydrateMaybesValueType(value) {
			return new ComparisonSetType(value);
		}),
		ComparisonSetType: ComparisonSetType
	};
};


module.exports = makeMaybe;

var set = require("../set");
var arrayUnionIntersectionDifference = require("../array-union-intersection-difference");
var schemaHelpers = require("../schema-helpers");

var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var setTypeSymbol = canSymbol.for("can.SetType"),
	isMemberSymbol = canSymbol.for("can.isMember"),
	newSymbol = canSymbol.for("can.new");

function makeEnumSetType(allValues, hydrate) {
	function Enum(values) {
		var arr = Array.isArray(values) ? values : [values];
		this.values = hydrate ? arr.map(hydrate) : arr;
	}
	canReflect.assignSymbols(Enum.prototype, {
		"can.serialize": function() {
			return this.values.length === 1 ? this.values[0] : this.values;
		}
	});

	Enum.prototype[isMemberSymbol] = function(value) {
		return this.values.some(function(val) {
			return set.isEqual(val, value);
		});
	};

	Enum.UNIVERSAL = new Enum(allValues);

	var difference = function(enum1, enum2) {
		var result = arrayUnionIntersectionDifference(enum1.values, enum2.values);
		if (result.difference.length) {
			return new Enum(result.difference);
		} else {
			return set.EMPTY;
		}
	};

	set.defineComparison(Enum, Enum, {
		union: function(enum1, enum2) {
			var result = arrayUnionIntersectionDifference(enum1.values, enum2.values);
			if (result.union.length) {
				return new Enum(result.union);
			} else {
				return set.EMPTY;
			}
		},
		intersection: function(enum1, enum2) {
			var result = arrayUnionIntersectionDifference(enum1.values, enum2.values);
			if (result.intersection.length) {
				return new Enum(result.intersection);
			} else {
				return set.EMPTY;
			}
		},
		difference: difference
	});

	set.defineComparison(Enum, set.UNIVERSAL, {
		difference: function(enumA) {
			return difference(enumA, {
				values: allValues.slice(0)
			});
		}
	});

	set.defineComparison(set.UNIVERSAL, Enum, {
		difference: function(universe, enumB) {
			return difference({
				values: allValues.slice(0)
			}, enumB);
		}
	});

	return Enum;
}

function makeEnum(Type, allValues, hydrate) {

	var Enum = makeEnumSetType(allValues, hydrate);

	Type[setTypeSymbol] = Enum;
	Type[isMemberSymbol] = function(value) {
		return allValues.some(function(val) {
			return set.isEqual(val, value);
		});
	};

	return Enum;
}

makeEnum.canMakeEnumSetType = function(Type) {
	var schema = canReflect.getSchema(Type);
	if (schema && schema.type === "Or") {
		var categories = schemaHelpers.categorizeOrValues(schema.values);
		return categories.primitives.length === schema.values.length;
	}
	return false;
};

makeEnum.makeEnumSetType = function(Type) {
	var schema = canReflect.getSchema(Type);
	var categories = schemaHelpers.categorizeOrValues(schema.values);
	var hydrate = Type[newSymbol] ? Type[newSymbol].bind(Type) : undefined;
	return makeEnumSetType(categories.primitives, hydrate);
};

module.exports = makeEnum;

var is = require("../types/comparisons");
var Serializer = require("../serializer");
var canReflect = require("can-reflect");
var ValuesNot = require("../types/values-not");

function makeNew(Constructor) {
	return function(value) {
		return new Constructor(value);
	};
}
var hydrateMap = {};
function addHydrateFrom(key, hydrate) {
	hydrateMap[key] = function(value, unknownHydrator) {
		return hydrate( unknownHydrator ? unknownHydrator(value[key]) : value[key]);
	};
	Object.defineProperty(hydrateMap[key], "name", {
		value: "hydrate "+key,
		writable: true
	});
}

function addHydrateFromValues(key, hydrate) {
	hydrateMap[key] = function(value, unknownHydrator) {
		var clones = value[key];
		if(unknownHydrator) {
			clones = clones.map(function(value) {
				return unknownHydrator(value);
			});
		}
		return hydrate( clones );
	};
	Object.defineProperty(hydrateMap[key], "name", {
		value: "hydrate "+key,
		writable: true
	});
}

// https://docs.mongodb.com/manual/reference/operator/query-comparison/
addHydrateFrom("$eq", function(value) {
	return new is.In([value]);
});
addHydrateFrom("$ne", function(value) {
	return new is.NotIn([value]);
});

addHydrateFrom("$gt", makeNew(is.GreaterThan));
addHydrateFrom("$gte", makeNew(is.GreaterThanEqual));
addHydrateFromValues("$in", makeNew(is.In));
addHydrateFrom("$lt", makeNew(is.LessThan));
addHydrateFrom("$lte", makeNew(is.LessThanEqual));

addHydrateFromValues("$all", makeNew(is.All));

// This is a mapping of types to their opposite. The $not hydrator
// uses this to create a more specific type, since they are logical opposites.
var oppositeTypeMap = {
	LessThan: { Type: is.GreaterThanEqual, prop: "value" },
	LessThanEqual: { Type: is.GreaterThan, prop: "value" },
	GreaterThan: { Type: is.LessThanEqual, prop: "value" },
	GreaterThanEqual: { Type: is.LessThan, prop: "value" },
	In: { Type: is.NotIn, prop: "values" },
	NotIn: { Type: is.In, prop: "values" }
};

hydrateMap.$not = function(value, unknownHydrator) {
	// Many nots can be hydrated to their opposite.
	var hydratedValue = hydrateValue(value.$not, unknownHydrator);
	var typeName = hydratedValue.constructor.name || hydratedValue.constructor.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];

	if(oppositeTypeMap[typeName]) {
		var options = oppositeTypeMap[typeName];
		var OppositeConstructor = options.Type;
		var prop = options.prop;

		return new OppositeConstructor(hydratedValue[prop]);
	}

	return new ValuesNot(hydratedValue);
};

addHydrateFromValues("$nin", makeNew(is.NotIn));


var serializer = new Serializer([
	[is.In,function(isIn, serialize) {
		return isIn.values.length === 1 ?
			serialize(isIn.values[0]) :
			{$in: isIn.values.map(serialize)};
	}],
	[is.NotIn,function(notIn, serialize) {
		return notIn.values.length === 1 ?
			{$ne: serialize(notIn.values[0])} : {$nin: notIn.values.map(serialize)};
	}],
	[is.GreaterThan, function(gt, serialize) { return {$gt: serialize(gt.value) }; }],
	[is.GreaterThanEqual, function(gte, serialize) { return {$gte: serialize(gte.value) }; }],
	[is.LessThan, function(lt, serialize) { return {$lt: serialize(lt.value) }; }],
	[is.LessThanEqual, function(lt, serialize) { return {$lte: serialize(lt.value) }; }],
	[is.And, function(and, serialize) {
		var obj = {};
		and.values.forEach(function(clause) {
			canReflect.assignMap(obj, serialize(clause) );
		});
		return obj;
	}],
	[is.All, function(all, serialize) {
		return {
			$all: serialize(all.values)
		};
	}]
	/*[is.Or, function(or, serialize) {
		return {
			$or: or.values.map(function(value) {
				return serialize(value, serialize);
			})
		};
	}]*/
]);

function hydrateValue(value, hydrateUnknown) {
	if(!hydrateUnknown) {
		hydrateUnknown = function() {
			throw new Error("can-query-logic doesn't recognize operator: "+JSON.stringify(value));
		};
	}
	if(Array.isArray(value)) {
		return new is.In(value.map(function(value) {
			return hydrateUnknown(value);
		}));
	}
	else if(value && typeof value === "object") {
		var keys = Object.keys(value);
		var allKeysAreComparisons = keys.every(function(key) {
			return hydrateMap[key];
		});
		if(allKeysAreComparisons) {
			var andClauses = keys.map(function(key) {
				var part = {};
				part[key] = value[key];
				var hydrator = hydrateMap[key];
				return hydrator(part, hydrateUnknown);
			});
			if(andClauses.length > 1) {
				return new is.And(andClauses);
			} else {
				return andClauses[0];
			}
		} else {
			return hydrateUnknown(value);
		}
	} else {
		return new is.In([hydrateUnknown(value)]);
	}
}

module.exports = {
	// value - something from a query, for example {$in: [1,2]}
	hydrate: hydrateValue,
	serializer: serializer
};

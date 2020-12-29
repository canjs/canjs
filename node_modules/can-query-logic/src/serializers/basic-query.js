var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var BasicQuery = require("../types/basic-query");
var set = require("../set");
var comparisonsConverter = require("../serializers/comparisons");
var Serializer = require("../serializer");
var is = require("../types/comparisons");
var makeMaybe = require("../types/make-maybe");
var makeEnum = require("../types/make-enum");
var logDev = require("can-log/dev/dev");
var helpers = require("../helpers");

var setTypeSymbol = canSymbol.for("can.SetType");
var schemaSymbol = canSymbol.for("can.getSchema");

var defaultQuery = new BasicQuery({});


function getSchemaProperties(value) {
	var constructor = value.constructor;
	if (constructor && constructor[schemaSymbol]) {
		var schema = constructor[schemaSymbol]();
		return schema.keys || {};
	} else {
		return {};
	}
}

function hydrateFilter(values, schemaProperties, hydrateUnknown) {
	var valuesIsObject = values && typeof values === "object";
	if (valuesIsObject && ("$or" in values)) {
		return hydrateOrs(values.$or, schemaProperties, hydrateUnknown);
	} else if(valuesIsObject && ("$and" in values)) {
		return hydrateAnds(values.$and, schemaProperties, hydrateUnknown);
	} else {
		return hydrateAndValues(values, schemaProperties, hydrateUnknown);
	}
}

var setTypeMap = new WeakMap();

// This is used to hydrate a value directly within a `filter`'s And.
function hydrateAndValue(value, prop, SchemaType, hydrateChild) {
	// The `SchemaType` is the type of value on `instances` of
	// the schema. `Instances` values are different from `Set` values.
	if (SchemaType) {
		// If there's a `SetType`, we will use that
		var SetType = SchemaType[setTypeSymbol];
		if (SetType) {
			/// If it exposes a hydrate, this means it can use the current hydrator to
			// hydrate its children.
			// I'm not sure why it's not taking the `unknown` hydrator instead.
			if (SetType.hydrate) {
				return SetType.hydrate(value, comparisonsConverter.hydrate);
			}
			// If the SetType implemented `union`, `intersection`, `difference`
			// We can create instances of it directly.
			else if (set.hasComparisons(SetType)) {
				// Todo ... canReflect.new
				return new SetType(value);
			}
			// If the SetType did not implement the comparison methods,
			// it's probably just a "Value" comparison type. We will hydrate
			// as a comparison converter, but create an instance of this `"Value"`
			// comparison type within the comparison converter.
			else {
				// inner types
				return comparisonsConverter.hydrate(value, function(value) {
					return new SetType(value);
				});
			}

		} else {
			// There is a `SchemaType`, but it doesn't have a `SetType`.
			// Can we create the SetType from the `SchemaType`?
			if (makeEnum.canMakeEnumSetType(SchemaType)) {
				if (!setTypeMap.has(SchemaType)) {
					setTypeMap.set(SchemaType, makeEnum.makeEnumSetType(SchemaType));
				}
				SetType = setTypeMap.get(SchemaType);
				return new SetType(value);
			}
			// It could also have a `ComparisonSetType` which are the values
			// within the Maybe type.
			else if (makeMaybe.canMakeMaybeSetType(SchemaType)) {
				if (!setTypeMap.has(SchemaType)) {
					setTypeMap.set(SchemaType, makeMaybe.makeMaybeSetTypes(SchemaType));
				}
				SetType = setTypeMap.get(SchemaType).Maybe;
				return SetType.hydrate(value, comparisonsConverter.hydrate);
			}
			// We can't create the `SetType`, so lets hydrate with the default behavior.
			else {
				return comparisonsConverter.hydrate(value, hydrateChild);
			}
		}
	} else {
		// HERE {$gt: 1} -> new is.GreaterThan(1)
		return comparisonsConverter.hydrate(value, hydrateChild);
	}
}

function hydrateAndValues(values, schemaProperties, hydrateUnknown) {
	schemaProperties = schemaProperties || {};

	function hydrateChild(value) {
		if (value) {
			if (Array.isArray(value)) {
				return value.map(hydrateUnknown);
			} else if (canReflect.isPlainObject(value)) {
				// lets try to get the schema ...
				return hydrateAndValues(value, getSchemaProperties(value));
			}
		}
		if (hydrateUnknown) {
			return hydrateUnknown(value);
		} else {
			return value;
		}
	}
	var clone = {};
	canReflect.eachKey(values, function(value, prop) {
		clone[prop] = hydrateAndValue(value, prop, schemaProperties[prop], hydrateChild);
	});

	return new BasicQuery.KeysAnd(clone);

}
// This tries to combine a bunch of OR-ed ANDS into a single AND.
// Example: [{name: "j", age: 3},{name: "j", age: 4}] //-> {name: "j", age: in[3,4]}
function combineAnds(ands) {
	var firstKeys = Object.keys(ands[0].values);
	var keys = {};

	var keysCompare = new is.In(firstKeys);

	firstKeys.map(function(key) {
		keys[key] = [];
	});

	var sameKeys = ands.every(function(and) {
		// have to have the same keys
		if (!set.isEqual(keysCompare, new is.In(Object.keys(and.values)))) {
			return false;
		}
		canReflect.eachKey(and.values, function(value, key) {
			keys[key].push(value);
		});
		return true;
	});
	if (!sameKeys) {
		return;
	}
	// now try to union everything and see if it simplifies ...
	var unequalKeys = [];
	firstKeys.forEach(function(key) {
		var isEqual = keys[key].reduce(function(newSet, lastSetOrFalse) {
			if (lastSetOrFalse === false) {
				return false;
			}
			if (lastSetOrFalse === undefined) {
				return newSet;
			}
			var res = set.isEqual(newSet, lastSetOrFalse);
			return res ? newSet : false;
		});
		if (!isEqual) {
			unequalKeys.push(key);
		}
	});

	if (unequalKeys.length !== 1) {
		return;
	}
	var unionKey = unequalKeys[0];
	// lets see if we can union that one value
	var unioned = keys[unionKey].reduce(function(cur, last) {
		return set.union(cur, last);
	}, set.EMPTY);

	var result = {};
	firstKeys.map(function(key) {
		result[key] = keys[key][0];
	});
	result[unionKey] = unioned;
	return new BasicQuery.KeysAnd(result);
}

function hydrateOrs(values, schemaProperties, hydrateUnknown) {
	var comparisons = values.map(function(value) {
		return hydrateAndValues(value, schemaProperties, hydrateUnknown);
	});
	var combined = combineAnds(comparisons);
	if (combined) {
		return combined;
	}
	return new BasicQuery.Or(comparisons);
}

function hydrateAnds(values, schemaProperties, hydrateUnknown) {
	var comparisons = values.map(function(value) {
		return hydrateAndValues(value, schemaProperties, hydrateUnknown);
	});
	return new BasicQuery.And(comparisons);
}

function recursivelyAddOrs(ors, value, serializer, key){
    value.orValues().forEach(function(orValue){
        if(typeof orValue.orValues === "function") {
            recursivelyAddOrs(ors, orValue, serializer, key);
        } else {
            var result = {};
            result[key] = serializer(orValue);
            ors.push( result );
        }
    });
}

module.exports = function(schema) {

	var id = schema.identity && schema.identity[0];
	var keys = schema.keys;

	var serializeMap = [
		[BasicQuery.Or, function(or, serializer) {
			return or.values.map(function(value) {
				return serializer(value);
			});
		}],
		[BasicQuery.And, function(and, serializer) {
			return { $and: and.values.map(function(value) {
				return serializer(value);
			}) };
		}],
		[BasicQuery.Not, function(nots, serializer) {
			return { $not: serializer(nots.value) };
		}],
		// this destructures ANDs with OR-like clauses
		[BasicQuery.KeysAnd, function(and, serializer) {
			var ors = [];
			var result = {};
			canReflect.eachKey(and.values, function(value, key) {
				// is value universal ... if not, we don't need to add anything

				if (typeof value.orValues === "function") {
					recursivelyAddOrs(ors, value, serializer, key);
				} else {
					result[key] = serializer(value);
				}
			});

			if (ors.length) {
				if (ors.length === 1) {
					return ors[0];
				} else {
					return {
						$or: ors.map(function(orPart) {
							return canReflect.assign(canReflect.serialize(result), orPart);
						})
					};
				}
			} else {
				return result;
			}

		}],
		[BasicQuery.RecordRange, function(range) {
			return {
				start: range.start,
				end: range.end
			};
		}],
		[BasicQuery, function(basicQuery, childSerializer) {

			var filter = set.isEqual(basicQuery.filter, set.UNIVERSAL) ? {} : childSerializer(basicQuery.filter);

			var res = {};
			if (canReflect.size(filter) !== 0) {
				res.filter = filter;
			}

			if (!set.isEqual(basicQuery.page, defaultQuery.page)) {
				// we always provide the start, even if it's 0
				res.page = {
					start: basicQuery.page.start
				};
				if (basicQuery.page.end !== defaultQuery.page.end) {
					res.page.end = basicQuery.page.end;
				}
			}

			if (basicQuery.sort.key !== id) {
				res.sort = basicQuery.sort.key;
			}
			return res;

		}]
	];



	// Makes a sort type that can make a compare function using the SetType
	var Sort = BasicQuery.makeSort(schema, hydrateAndValue);
	var serializer = new Serializer(serializeMap);
	serializer.add(comparisonsConverter.serializer);

	return {
		hydrate: function(data) {

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				var AcceptedFields = makeEnum(function() {}, ["filter", "sort", "page"]);
				var diff = set.difference(new AcceptedFields(Object.keys(data)), AcceptedFields.UNIVERSAL);
				if (diff.values && diff.values.length) {
					logDev.warn(
						"can-query-logic: Ignoring keys: " + diff.values.join(", ") + "."
					);
				}
			}
			//!steal-remove-end


			var filter = canReflect.serialize(data.filter);

			// this mutates
			var filterAnd = hydrateFilter(filter, keys, helpers.valueHydrator);

			// Conver the filter arguments

			var query = {
				filter: filterAnd
			};
			if (data.page) {
				query.page = new BasicQuery.RecordRange(data.page.start, data.page.end);
			}
			if (data.sort) {
				query.sort = new Sort(data.sort);
			} else {
				query.sort = new Sort(id);
			}
			return new BasicQuery(query);
		},
		serializer: serializer
	};
};

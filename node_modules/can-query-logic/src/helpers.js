var canReflect = require("can-reflect");

// mongo puts these first https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#bson-types-comparison-order
var typeNumber = {"undefined": 0, "null": 1, "number": 3, "string": 4, "object": 5, "boolean": 6};
var getTypeNumber = function(obj) {
	var type = typeof obj;
	if(obj === null) {
		type = "null";
	}
	return typeNumber[type];
};

var typeCompare = {
	$gt: function(valueA, valueB) {
		return getTypeNumber(valueA) > getTypeNumber(valueB);
	},
	$lt: function(valueA, valueB) {
		return getTypeNumber(valueA) < getTypeNumber(valueB);
	}
};

var defaultCompare = {
	$gt: function(valueA, valueB) {
		if(valueA == null || valueB == null) {
			return typeCompare.$gt(valueA, valueB);
		}
		return valueA > valueB;
	},
	$lt: function(valueA, valueB) {
		if(valueA == null || valueB == null) {
			return typeCompare.$gt(valueA, valueB);
		}
		return valueA < valueB;
	}
};

var helpers = {

	// given two arrays of items, combines and only returns the unique ones
	uniqueConcat: function(itemsA, itemsB, getId) {
		var ids = new Set();
		return itemsA.concat(itemsB).filter(function(item) {
			var id = getId(item);
			if (!ids.has(id)) {
				ids.add(id);
				return true;
			} else {
				return false;
			}
		});
	},
	// Get the index of an item by it's identity
	// Starting from the middle of the items
	// return the index of match in the right direction
	// or in the left direction
	// otherwise return the last index
	// see getIdentityIndexByDirection
	getIdentityIndex: function(compare, items, props, startIndex, schema) {
		var identity = canReflect.getIdentity(props, schema),
			starterItem = items[startIndex];
		// check if the middle has a match
		if (compare(props, starterItem) === 0) {
			if (identity === canReflect.getIdentity(starterItem, schema)) {
				return startIndex;
			}
		}
		
		var rightResult = this.getIdentityIndexByDirection(compare, items, props, startIndex+1, 1, schema),
			leftResult;
		if(rightResult.index) {
			return rightResult.index;
		} else {
			leftResult = this.getIdentityIndexByDirection(compare, items, props, startIndex-1, -1, schema);
		}
		if(leftResult.index !== undefined) {
			return leftResult.index;
		}
		// put at the last index item that doesn't match an identity
		return rightResult.lastIndex;
	},
	// Get the index of an item by it's identity
	// for a given direction (right or left)
	// 1 for right
	// -1 for left
	getIdentityIndexByDirection: function(compare, items, props, startIndex, direction, schema) {
		var currentIndex = startIndex;
		var identity = canReflect.getIdentity(props, schema);
		while(currentIndex >= 0 && currentIndex < items.length) {
			var currentItem = items[currentIndex];
			var computed = compare(props, currentItem);
			if(computed === 0) {
				if( identity === canReflect.getIdentity(currentItem, schema)) {
					return {index: currentIndex};
				}
			} else {
				return {lastIndex: currentIndex - direction};
			}
			currentIndex = currentIndex + direction;
		}
		return {lastIndex: currentIndex - direction};
	},
	//
	getIndex: function(compare, items, props, schema) {
		if (!items || !items.length) {
			return undefined;
		}
		// check the start and the end
		if (compare(props, items[0]) === -1) {
			return 0;
		} else if (compare(props, items[items.length - 1]) === 1) {
			return items.length;
		}

		var low = 0,
			high = items.length;

		// From lodash lodash 4.6.1 <https://lodash.com/>
		// Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
		while (low < high) {
			var mid = (low + high) >>> 1,
				item = items[mid],
				computed = compare(props, item);
			if (computed === 0) {
				return this.getIdentityIndex(compare, items, props, mid, schema);
			} else if (computed === -1) {
				high = mid;
			} else {
				low = mid + 1;
			}
		}
		return high;
		// bisect by calling sortFunc
	},
	sortData: function(sortPropValue) {
		if (sortPropValue[0] === "-") {
			return {
				prop: sortPropValue.slice(1),
				desc: true
			};
		} else {
			return {
				prop: sortPropValue,
				desc: false
			};
		}
	},
	defaultCompare: defaultCompare,
	typeCompare: typeCompare,
	sorter: function(sortPropValue, sorters) {
		var data = helpers.sortData(sortPropValue);
		var compare;
		if (sorters && sorters[data.prop]) {
			compare = sorters[data.prop];
		} else {
			compare = defaultCompare;
		}
		return function(item1, item2) {
			var item1Value = canReflect.getKeyValue(item1, data.prop);
			var item2Value = canReflect.getKeyValue(item2, data.prop);
			var temp;

			if (data.desc) {
				temp = item1Value;
				item1Value = item2Value;
				item2Value = temp;
			}

			if (compare.$lt(item1Value, item2Value)) {
				return -1;
			}

			if (compare.$gt(item1Value, item2Value)) {
				return 1;
			}

			return 0;
		};
	},
	valueHydrator: function(value) {
		if (canReflect.isBuiltIn(value)) {
			return value;
		} else {
			throw new Error("can-query-logic doesn't support comparison operator: " + JSON.stringify(value));
		}
	}
};
module.exports = helpers;

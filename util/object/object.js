steal('can/util', function (can) {
	var isArray = can.isArray;
	/**
	 * @hide
	 * @page can.Object can.Object
	 * @parent can.util
	 *
	 * @body
	 * Object contains several helper methods that
	 * help compare objects.
	 *
	 * ## same
	 *
	 * Returns true if two objects are similar.
	 *
	 *     can.Object.same({foo: "bar"} , {bar: "foo"}) //-> false
	 *
	 * ## subset
	 *
	 * Returns true if an object is a set of another set.
	 *
	 *     can.Object.subset({}, {foo: "bar"} ) //-> true
	 *
	 * ## subsets
	 *
	 * Returns the subsets of an object
	 *
	 *     can.Object.subsets({userId: 20},
	 *                      [
	 *                       {userId: 20, limit: 30},
	 *                       {userId: 5},
	 *                       {}
	 *                      ])
	 *              //->    [{userId: 20, limit: 30}]
	 */
	can.Object = {};
	/**
	 * @function can.Object.same
	 * @parent can.util
	 * @description Checks if two objects are the same.
	 * @signature `can.Object.same(a, b, compares, aParent, bParent, deep)`
	 * @param {Object} a An object to compare against `b`.
	 * @param {Object} b An object to compare against `a`.
	 * @param {Object} [compares] An object that specifies how to compare properties.
	 * The keys of the `compares` object are names of properties in the objects to compare,
	 * and the values are functions that compare those properties. You can also pass `'i'`
	 * to compare values as case-insensitive strings, or `null` not to compare the properties
	 * at all.
	 * @return {{boolean}} Whether the two objects have the same properties and values.
	 *
	 * @body
	 * This function does not work with objects that create circular references.
	 *
	 * ## Examples
	 * @codestart
	 * can.Object.same({name: "Justin"}, {name: "JUSTIN"}) //-> false
	 *
	 * // ignore the name property
	 * can.Object.same({name: "Brian"}, {name: "JUSTIN"}, {name: null}) //-> true
	 *
	 * // ignore case
	 * can.Object.same({name: "Justin"}, {name: "JUSTIN"}, {name: "i"}) //-> true
	 *
	 * // deep rule
	 * can.Object.same({ person : { name: "Justin" } },
	 *     { person : { name: "JUSTIN" } },
	 *     { person : { name: "i"      } }) //-> true
	 *
	 * // supplied compare function
	 * can.Object.same({age: "Thirty"},
	 *     {age: 30},
	 *     {age: function( a, b ){
	 *     if( a == "Thirty" ) {
	 *         a = 30
	 *     }
	 *     if( b == "Thirty" ) {
	 *         b = 30
	 *     }
	 *     return a === b;
	 * }})      //-> true
	 * @codeend
	 */
	var same = can.Object.same = function (a, b, compares, aParent, bParent, deep) {
		var aType = typeof a,
			aArray = isArray(a),
			comparesType = typeof compares,
			compare;
		if (comparesType === 'string' || compares === null) {
			compares = compareMethods[compares];
			comparesType = 'function';
		}
		if (comparesType === 'function') {
			return compares(a, b, aParent, bParent);
		}
		compares = compares || {};
		if (a === null || b === null) {
			return a === b;
		}
		if (a instanceof Date || b instanceof Date) {
			return a === b;
		}
		if (deep === -1) {
			return aType === 'object' || a === b;
		}
		if (aType !== typeof b || aArray !== isArray(b)) {
			return false;
		}
		if (a === b) {
			return true;
		}
		if (aArray) {
			if (a.length !== b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				compare = compares[i] === undefined ? compares['*'] : compares[i];
				if (!same(a[i], b[i], a, b, compare)) {
					return false;
				}
			}
			return true;
		} else if (aType === 'object' || aType === 'function') {
			var bCopy = can.extend({}, b);
			for (var prop in a) {
				compare = compares[prop] === undefined ? compares['*'] : compares[prop];
				if (!same(a[prop], b[prop], compare, a, b, deep === false ? -1 : undefined)) {
					return false;
				}
				delete bCopy[prop];
			}
			// go through bCopy props ... if there is no compare .. return false
			for (prop in bCopy) {
				if (compares[prop] === undefined || !same(undefined, b[prop], compares[prop], a, b, deep === false ? -1 : undefined)) {
					return false;
				}
			}
			return true;
		}
		return false;
	};
	/**
	 * @function can.Object.subsets
	 * @parent can.util
	 * @description Returns the sets in 'sets' that are a subset of checkSet
	 * @codestart
	 * can.Object.subsets({userId: 20},
	 * [
	 *	{userId: 20, limit: 30},
	 *	{userId: 5},
	 *	{}
	 * ]) //-> [{userId: 20, limit: 30}]
	 * @codeend
	 * @signature `can.Object.subsets(checkSet, sets, compares)`
	 * @param {Object} checkSet
	 * @param {Object} sets
	 * @param {Object} compares
	 */
	can.Object.subsets = function (checkSet, sets, compares) {
		var len = sets.length,
			subsets = [];
		for (var i = 0; i < len; i++) {
			//check this subset
			var set = sets[i];
			if (can.Object.subset(checkSet, set, compares)) {
				subsets.push(set);
			}
		}
		return subsets;
	};
	/**
	 * @function can.Object.subset
	 * @parent can.util
	 * @description Compares if subset is a subset of set. Returns true if an object is a set of another set
	 * @codestart
	 * can.Object.subset({}, {foo: "bar"} ) //-> true
	 * @codeend
	 * @signature `can.Object.subset(subset, set, compares)`
	 * @param {Object} subset
	 * @param {Object} set
	 * @param {Object} compares
	 * @returns {Boolean} Whether or not subset is a subset of set
	 */
	can.Object.subset = function (subset, set, compares) {
		// go through set {type: 'folder'} and make sure every property
		// is in subset {type: 'folder', parentId :5}
		// then make sure that set has fewer properties
		// make sure we are only checking 'important' properties
		// in subset (ones that have to have a value)
		compares = compares || {};
		for (var prop in set) {
			if (!same(subset[prop], set[prop], compares[prop], subset, set)) {
				return false;
			}
		}
		return true;
	};
	var compareMethods = {
		'null': function () {
			return true;
		},
		i: function (a, b) {
			return ('' + a)
				.toLowerCase() === ('' + b)
				.toLowerCase();
		},
		eq: function(a, b) {
			return a === b;
		},
		similar: function(a, b) {
			/*jshint eqeqeq:false */
			return a == b;
		}
	};
	compareMethods.eqeq = compareMethods.similar;
	return can.Object;
});

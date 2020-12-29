"use strict";
var utils = require("../utils");
var get = require("../get/get");
var canReflect= require("can-reflect");
var deleteKey = require("../delete/delete");
/**
 * @module {function} can-key/sub/sub
 * @parent can-key
 * @hide
 *
 * Replace templated parts of a string with values.
 *
 * @signature `sub(str, data, remove)`
 *
 * `sub` is used to replace templated parts of a string with values.
 *
 * ```js
 * var sub = require("can-key/sub/sub");
 *
 * sub("foo_{bar}", {bar: "baz"}); // -> "foo_baz"
 * ```
 *
 * If `null` or `undefined` values are found, `null` is returned:
 *
 * ```js
 * sub("foo_{bar}", {}); // -> null
 * ```
 *
 * If an object value is found, the templated part of the string is replace with `""`
 * and the object is added to an array that is returned.
 *
 * ```js
 * var data = {element: div, selector: "li" }
 * var res = sub("{element} {selector} click", data);
 * res //-> [" li click", div]
 * ```
 *
 * @param {String} str   a string with {curly brace} delimited property names
 * @param {Object} data  an object from which to read properties
 * @return {String|null|Array} the supplied string with delimited properties replaced with their values
 *                       if all properties exist on the object, null otherwise
 *
 * If `remove` is true, the properties found in delimiters in `str` are removed from `data`.
 *
 *
 */
module.exports = function sub(str, data, remove) {
	var obs = [];
	str = str || '';
	obs.push(str.replace(utils.strReplacer, function (whole, inside) {
		// Convert inside to type.
		var ob = get(data, inside);

		if(remove === true) {
			deleteKey(data, inside);
		}

		if (ob === undefined || ob === null) {
			obs = null;
			return '';
		}
		// If a container, push into objs (which will return objects found).
		if (!canReflect.isPrimitive(ob) && obs) {
			obs.push(ob);
			return '';
		}
		return '' + ob;
	}));
	return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
};

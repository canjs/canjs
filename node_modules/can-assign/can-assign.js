var namespace = require("can-namespace");

/**
 * @module {function} can-assign can-assign
 * @parent can-js-utilities
 * @collection can-infrastructure
 * @signature `assign(target, source)`
 * @package ./package.json
 *
 * A simplified version of [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign), which only accepts a single source argument.
 *
 * ```js
 * var assign = require("can-assign");
 *
 * var obj = {};
 *
 * assign(obj, {
 *   foo: "bar"
 * });
 *
 * console.log(obj.foo); // -> "bar"
 * ```
 *
 * @param {Object} target The destination object. This object's properties will be mutated based on the object provided as `source`.
 * @param {Object} source The source object whose own properties will be applied to `target`.
 *
 * @return {Object} Returns the `target` argument.
 */

module.exports = namespace.assign = function (d, s) {
	for (var prop in s) {
		var desc = Object.getOwnPropertyDescriptor(d,prop);
		if(!desc || desc.writable !== false){
			d[prop] = s[prop];
		}
	}
	return d;
};

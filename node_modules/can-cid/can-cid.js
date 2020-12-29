"use strict";
var namespace = require('can-namespace');
/**
 * @module {function} can-cid
 * @parent can-typed-data
 * @collection can-infrastructure
 * @package ./package.json
 * @description Utility for getting a unique identifier for an object.
 * @signature `cid(object, optionalObjectType)`
 *
 * Get a unique identifier for the object, optionally prefixed by a type name.
 *
 * Once set, the unique identifier does not change, even if the type name
 * changes on subsequent calls.
 *
 * ```js
 * var cid = require("can-cid");
 * var x = {};
 * var y = {};
 *
 * console.log(cid(x, "demo")); // -> "demo1"
 * console.log(cid(x, "prod")); // -> "demo1"
 * console.log(cid(y));         // -> "2"
 * ```
 *
 * @param {Object} object The object to uniquely identify.
 * @param {String} name   An optional type name with which to prefix the identifier
 *
 * @return {String} Returns the unique identifier
 */
var _cid = 0;
// DOM nodes shouldn't all use the same property
var domExpando = "can" + new Date();
var cid = function (object, name) {
	var propertyName = object.nodeName ? domExpando : "_cid";

	if (!object[propertyName]) {
		_cid++;
		object[propertyName] = (name || '') + _cid;
	}
	return object[propertyName];
};
cid.domExpando = domExpando;
cid.get = function(object){
	var type = typeof object;
	var isObject = type !== null && (type === "object" || type === "function");
	return isObject ? cid(object) : (type + ":" + object);
};

if (namespace.cid) {
	throw new Error("You can't have two versions of can-cid, check your dependencies");
} else {
	module.exports = namespace.cid = cid;
}

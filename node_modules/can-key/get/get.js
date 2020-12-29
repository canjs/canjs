'use strict';
var canReflect = require("can-reflect");
var utils = require("../utils");

/**
 * @module {function} can-key/get/get
 * @parent can-key
 * @description Get properties on deep/nested objects of different types: Object, Map, [can-reflect] types, etc.
 *
 * @signature `get(obj, path)`
 * @param  {Object} obj the object to use as the root for property-based navigation
 * @param  {String} path a String of dot-separated keys, representing a path of properties
 * @return {*}       the value at the property path
 *
 * @body
 *
 * A *path* is a dot-delimited sequence of zero or more property names, such that "foo.bar" means "the property
 * 'bar' of the object at the property 'foo' of the root."  An empty path returns the object passed.
 *
 * ```js
 * var get = require("can-key");
 * console.log(get({a: {b: {c: "foo"}}}, "a.b.c")); // -> "foo"
 * console.log(get({a: {}}, "a.b.c")); // -> undefined
 * console.log(get([{a: {}}, {a: {b: "bar"}}], "a.b")); // -> "bar"
 *
 * var map = new Map();
 * map.set("first", {second: "third"});
 *
 * get(map, "first.second") //-> "third"
 * ```
 */
function get(obj, name) {
    // The parts of the name we are looking up
    // `['App','Models','Recipe']`
    var parts = utils.parts(name);

    var length = parts.length,
        current, i, container;

    if (!length) {
        return obj;
    }

    current = obj;

    // Walk current to the 2nd to last object or until there
    // is not a container.
    for (i = 0; i < length && utils.isContainer(current) && current !== null; i++) {
        container = current;
        current = canReflect.getKeyValue( container, parts[i] );
    }

    return current;
}

module.exports = get;

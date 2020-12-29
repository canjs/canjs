"use strict";

var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var utils = require("../utils");

var setValueSymbol = canSymbol.for("can.setValue");

/**
 * @module {function} can-key/set/set
 * @parent can-key
 * @description Set properties on deep/nested objects of different types: Object, Map, [can-reflect] types, etc.
 *
 * @signature `set(object, path, value)`
 * @param  {Object} object The object to use as the root for property-based navigation.
 * @param  {String} path A String of dot-separated keys, representing a path of properties.
 * @param  {*} value The new value to be set at the property path.
 * @return {*} The object passed to set (for chaining calls).
 *
 * @body
 *
 * A *path* is a dot-delimited sequence of one or more property names, such that "foo.bar" means "the property
 * 'bar' of the object at the property 'foo' of the root."
 *
 * ```js
 * import set from "can-key/set/set";
 *
 * const object = {a: {b: {c: "foo"}}};
 * set(object, "a.b.c", "bar");
 * // Now object.a.b.c === "bar"
 *
 * var map = new Map();
 * map.set("first", {second: "third"});
 *
 * set(map, "first.second", "3rd");
 * // Now map.first.second === "3rd"
 * ```
 *
 * > **Note:** an error will be thrown if one of the objects in the key path does not exist.
 */
function set(object, path, value) {
    var parts = utils.parts(path);

    var current = object;
    var length = parts.length;

    // Walk current until there is not a container
    for (var i = 0; i < length - 1; i++) {
        if (utils.isContainer(current)) {
            current = canReflect.getKeyValue(current, parts[i]);
        } else {
            break;
        }
    }

    // Set the value
    if (current) {
        canReflect.setKeyValue(current, parts[i], value);
    } else {
        throw new TypeError("Cannot set value at key path '" + path + "'");
    }

    return object;
}

module.exports = set;

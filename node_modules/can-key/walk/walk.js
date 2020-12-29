"use strict";
var canReflect = require("can-reflect");
var utils = require("../utils");


/**
 * @module {function} can-key/walk/walk
 * @parent can-key
 *
 * @signature `walk(obj, name, keyCallback(info) )`
 *
 * ```js
 * import walk from "can-key/walk/walk";
 *
 * var user = {name: {first: "Justin"}}
 * walk(user, "name.first", (keyInfo)=> {
 *   // Called 2 times.
 *   // first call:
 *   keyInfo //-> {parent: user, key: "name", value: user.name}
 *   // second call:
 *   keyInfo //-> {parent: user.name, key: "first", value: user.name.first}
 * })
 * ```
 *
 * @param {Object} obj An object to read key values from.
 * @param {String} name A string key name like "foo.bar".
 * @param {function(Object)} keyCallback(info) For every key value,
 * `keyCallback` will be called back with an `info` object containing:
 *
 * - `info.parent` - The object the property value is being read from.
 * - `info.key` - The key being read.
 * - `info.value` - The key's value.
 *
 * If `keyCallback` returns a value other than `undefined`, the next key value
 * will be read from that value.
 */
module.exports = function walk(obj, name, keyCallback){

    // The parts of the name we are looking up
    // `['App','Models','Recipe']`
    var parts = utils.parts(name);

    var length = parts.length,
        current, i, container, part;


    if (!length) {
        return;
    }

    current = obj;

    // Walk current to the 2nd to last object or until there
    // is not a container.
    for (i = 0; i < length; i++) {
        container = current;
        part = parts[i];
        current = utils.isContainer(container) && canReflect.getKeyValue( container, part );

        var result = keyCallback({
            parent:container,
            key: part,
            value: current
        }, i);
        if(result !== undefined) {
            current = result;
        }
    }
};

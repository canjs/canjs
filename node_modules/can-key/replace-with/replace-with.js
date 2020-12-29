"use strict";
var utils = require("../utils");
var get = require("../get/get");
var deleteKey = require("../delete/delete");
/**
 * @module {function} can-key/replace-with/replace-with
 * @parent can-key
 *
 * Replace the templated parts of a string with values from an object.
 *
 * @signature `replaceWith(str, data, replacer, remove)`
 *
 * ```js
 * import replaceWith from "can-key/replace-with/replace-with";
 *
 * replaceWith("foo_{bar}", {bar: "baz"}); // -> "foo_baz"
 * ```
 *
 * @param {String} str String with {curly brace} delimited property names.
 * @param {Object} data Object from which to read properties.
 * @param {function(String,*)} [replacer(key,value)] Function which returns string replacements.  Optional.
 *
 *   ```js
 *   replaceWith("foo_{bar}", {bar: "baz"}, (key, value) => {
 *     return value.toUpperCase();
 *   }); // -> "foo_BAZ"
 *   ```
 *
 *
 * @param {Boolean} shouldRemoveMatchedPaths Whether to remove properties
 * found in delimiters in `str` from `data`.
 * @return {String} the supplied string with delimited properties replaced with their values.
 *
 * @body
 *
 * ```js
 * var replaceWith = require("can-key/replace-with/replace-with");
 * var answer = replaceWith(
 *   '{.}{.}{.}{.}{.} Batman!',
 *   {},
 *   () => 'Na'
 * );
 * // => 'NaNaNaNaNa Batman!'
 * ```
 */
module.exports = function (str, data, replacer, shouldRemoveMatchedPaths) {
    return str.replace(utils.strReplacer, function (whole, path) {
        var value = get(data, path);
        if(shouldRemoveMatchedPaths) {
            deleteKey(data, path);
        }
        return replacer ? replacer(path, value) : value;
    });
};

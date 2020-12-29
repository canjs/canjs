/*can-key@1.2.0#replace-with/replace-with*/
define('can-key/replace-with/replace-with', [
    'require',
    'exports',
    'module',
    'can-key/utils',
    'can-key/get/get',
    'can-key/delete/delete'
], function (require, exports, module) {
    'use strict';
    var utils = require('can-key/utils');
    var get = require('can-key/get/get');
    var deleteKey = require('can-key/delete/delete');
    module.exports = function (str, data, replacer, shouldRemoveMatchedPaths) {
        return str.replace(utils.strReplacer, function (whole, path) {
            var value = get(data, path);
            if (shouldRemoveMatchedPaths) {
                deleteKey(data, path);
            }
            return replacer ? replacer(path, value) : value;
        });
    };
});
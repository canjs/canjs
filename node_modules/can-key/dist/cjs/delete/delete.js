/*can-key@1.2.0#delete/delete*/
define('can-key/delete/delete', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var utils = require('can-key/utils');
    module.exports = function deleteAtPath(data, path) {
        var parts = utils.parts(path);
        var current = data;
        for (var i = 0; i < parts.length - 1; i++) {
            if (current) {
                current = canReflect.getKeyValue(current, parts[i]);
            }
        }
        if (current) {
            canReflect.deleteKeyValue(current, parts[parts.length - 1]);
        }
    };
});
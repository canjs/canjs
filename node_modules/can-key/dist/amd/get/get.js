/*can-key@1.2.0#get/get*/
define('can-key/get/get', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var utils = require('can-key/utils');
    function get(obj, name) {
        var parts = utils.parts(name);
        var length = parts.length, current, i, container;
        if (!length) {
            return obj;
        }
        current = obj;
        for (i = 0; i < length && utils.isContainer(current) && current !== null; i++) {
            container = current;
            current = canReflect.getKeyValue(container, parts[i]);
        }
        return current;
    }
    module.exports = get;
});
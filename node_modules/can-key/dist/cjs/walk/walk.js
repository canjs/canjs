/*can-key@1.2.0#walk/walk*/
define('can-key/walk/walk', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var utils = require('can-key/utils');
    module.exports = function walk(obj, name, keyCallback) {
        var parts = utils.parts(name);
        var length = parts.length, current, i, container, part;
        if (!length) {
            return;
        }
        current = obj;
        for (i = 0; i < length; i++) {
            container = current;
            part = parts[i];
            current = utils.isContainer(container) && canReflect.getKeyValue(container, part);
            var result = keyCallback({
                parent: container,
                key: part,
                value: current
            }, i);
            if (result !== undefined) {
                current = result;
            }
        }
    };
});
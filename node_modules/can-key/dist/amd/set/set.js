/*can-key@1.2.0#set/set*/
define('can-key/set/set', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-symbol',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var canSymbol = require('can-symbol');
    var utils = require('can-key/utils');
    var setValueSymbol = canSymbol.for('can.setValue');
    function set(object, path, value) {
        var parts = utils.parts(path);
        var current = object;
        var length = parts.length;
        for (var i = 0; i < length - 1; i++) {
            if (utils.isContainer(current)) {
                current = canReflect.getKeyValue(current, parts[i]);
            } else {
                break;
            }
        }
        if (current) {
            canReflect.setKeyValue(current, parts[i], value);
        } else {
            throw new TypeError('Cannot set value at key path \'' + path + '\'');
        }
        return object;
    }
    module.exports = set;
});
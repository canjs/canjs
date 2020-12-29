/*can-debug@2.0.6#src/get-graph/make-node*/
define('can-debug/src/get-graph/make-node', [
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    module.exports = function makeNode(obj, key) {
        var gotKey = arguments.length === 2;
        var node = {
            obj: obj,
            name: canReflect.getName(obj),
            value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
        };
        if (gotKey) {
            node.key = key;
        }
        return node;
    };
});
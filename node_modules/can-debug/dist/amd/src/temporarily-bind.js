/*can-debug@2.0.6#src/temporarily-bind*/
define('can-debug/src/temporarily-bind', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var canSymbol = require('can-symbol');
    var canReflect = require('can-reflect');
    var onValueSymbol = canSymbol.for('can.onValue');
    var offValueSymbol = canSymbol.for('can.offValue');
    var onKeyValueSymbol = canSymbol.for('can.onKeyValue');
    var offKeyValueSymbol = canSymbol.for('can.offKeyValue');
    var noop = function noop() {
    };
    function isFunction(value) {
        return typeof value === 'function';
    }
    function withKey(obj, key, fn) {
        var result;
        if (isFunction(obj[onKeyValueSymbol])) {
            canReflect.onKeyValue(obj, key, noop);
        }
        result = fn(obj, key);
        if (isFunction(obj[offKeyValueSymbol])) {
            canReflect.offKeyValue(obj, key, noop);
        }
        return result;
    }
    function withoutKey(obj, fn) {
        var result;
        if (isFunction(obj[onValueSymbol])) {
            canReflect.onValue(obj, noop);
        }
        result = fn(obj);
        if (isFunction(obj[offValueSymbol])) {
            canReflect.offValue(obj, noop);
        }
        return result;
    }
    module.exports = function temporarilyBind(fn) {
        return function (obj, key) {
            var gotKey = arguments.length === 2;
            return gotKey ? withKey(obj, key, fn) : withoutKey(obj, fn);
        };
    };
});
/*!
 * CanJS - 2.3.28
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 08 Dec 2016 20:53:50 GMT
 * Licensed MIT
 */

/*can@2.3.28#util/domless/domless*/
steal('can/util/can.js', 'can/util/attr', 'can/util/array/each.js', 'can/util/array/makeArray.js', function (can, attr) {
    var core_trim = String.prototype.trim;
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    function likeArray(obj) {
        return typeof obj.length === 'number';
    }
    function flatten(array) {
        return array.length > 0 ? Array.prototype.concat.apply([], array) : array;
    }
    can.isArray = function (arr) {
        if (Array.isArray) {
            return Array.isArray(arr);
        }
        return Object.prototype.toString.call(arr) === '[object Array]';
    };
    can.isFunction = function () {
        if (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') {
            return function (value) {
                return Object.prototype.toString.call(value) === '[object Function]';
            };
        } else {
            return function (value) {
                return typeof value === 'function';
            };
        }
    }();
    can.trim = core_trim && !core_trim.call('\uFEFF\xA0') ? function (text) {
        return text == null ? '' : core_trim.call(text);
    } : function (text) {
        return text == null ? '' : (text + '').replace(rtrim, '');
    };
    can.extend = function () {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== 'object' && !can.isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (can.isPlainObject(copy) || (copyIsArray = can.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && can.isArray(src) ? src : [];
                        } else {
                            clone = src && can.isPlainObject(src) ? src : {};
                        }
                        target[name] = can.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    can.map = function (elements, callback) {
        var values = [], putValue = function (val, index) {
                var value = callback(val, index);
                if (value != null) {
                    values.push(value);
                }
            };
        if (likeArray(elements)) {
            for (var i = 0, l = elements.length; i < l; i++) {
                putValue(elements[i], i);
            }
        } else {
            for (var key in elements) {
                putValue(elements[key], key);
            }
        }
        return flatten(values);
    };
    can.proxy = function (cb, that) {
        return function () {
            return cb.apply(that, arguments);
        };
    };
    can.attr = attr;
    return can;
});
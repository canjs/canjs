/*!
 * CanJS - 2.2.7
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 24 Jul 2015 20:57:32 GMT
 * Licensed MIT
 */

/*can@2.2.7#util/object/isplain/isplain*/
define(['can/util/can'], function () {
    var core_hasOwn = Object.prototype.hasOwnProperty, isWindow = function (obj) {
            return obj !== null && obj == obj.window;
        }, isPlainObject = function (obj) {
            if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
                return false;
            }
            try {
                if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            var key;
            for (key in obj) {
            }
            return key === undefined || core_hasOwn.call(obj, key);
        };
    can.isPlainObject = isPlainObject;
    return can;
});
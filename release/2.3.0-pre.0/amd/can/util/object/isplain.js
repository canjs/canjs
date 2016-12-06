/*!
 * CanJS - 2.3.0-pre.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 30 Apr 2015 21:40:42 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.0#util/object/isplain/isplain*/
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

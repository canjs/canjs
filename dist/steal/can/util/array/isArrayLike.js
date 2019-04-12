/*!
 * CanJS - 2.3.26
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 09 Sep 2016 23:05:41 GMT
 * Licensed MIT
 */

/*can@2.3.26#util/array/isArrayLike*/
steal('can/util/can.js', function (can) {
    can.isArrayLike = function (obj) {
        var length = obj && typeof obj !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    };
});
/*!
 * CanJS - 2.3.24
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 19 May 2016 17:46:31 GMT
 * Licensed MIT
 */

/*can@2.3.24#util/array/isArrayLike*/
define(['can/util/can'], function (can) {
    can.isArrayLike = function (obj) {
        var length = obj && typeof obj !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    };
});
/*!
 * CanJS - 2.3.16
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 17 Feb 2016 00:30:11 GMT
 * Licensed MIT
 */

/*can@2.3.16#util/array/isArrayLike*/
var can = require('../can.js');
can.isArrayLike = function (obj) {
    var length = obj && typeof obj !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
    return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
};
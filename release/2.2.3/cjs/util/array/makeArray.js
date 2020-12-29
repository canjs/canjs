/*!
 * CanJS - 2.2.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 03 Apr 2015 15:31:35 GMT
 * Licensed MIT
 */

/*can@2.2.3#util/array/makeArray*/
var can = require('./each.js');
can.makeArray = function (arr) {
    var ret = [];
    can.each(arr, function (a, i) {
        ret[i] = a;
    });
    return ret;
};
module.exports = can;

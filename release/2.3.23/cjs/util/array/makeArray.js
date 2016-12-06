/*!
 * CanJS - 2.3.23
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 08 Apr 2016 17:58:15 GMT
 * Licensed MIT
 */

/*can@2.3.23#util/array/makeArray*/
var can = require('./each.js');
can.makeArray = function (arr) {
    var ret = [];
    can.each(arr, function (a, i) {
        ret[i] = a;
    });
    return ret;
};
module.exports = can;
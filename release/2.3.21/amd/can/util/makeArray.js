/*!
 * CanJS - 2.3.21
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 19 Mar 2016 01:24:17 GMT
 * Licensed MIT
 */

/*can@2.3.21#util/array/makeArray*/
define(['can/util/each'], function (can) {
    can.makeArray = function (arr) {
        var ret = [];
        can.each(arr, function (a, i) {
            ret[i] = a;
        });
        return ret;
    };
    return can;
});
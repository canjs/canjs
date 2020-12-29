/*!
 * CanJS - 2.3.18
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 03 Mar 2016 17:58:31 GMT
 * Licensed MIT
 */

/*can@2.3.18#util/array/makeArray*/
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
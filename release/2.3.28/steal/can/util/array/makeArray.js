/*!
 * CanJS - 2.3.28
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 08 Dec 2016 20:53:50 GMT
 * Licensed MIT
 */

/*can@2.3.28#util/array/makeArray*/
steal('./each.js', function (can) {
    can.makeArray = function (arr) {
        var ret = [];
        can.each(arr, function (a, i) {
            ret[i] = a;
        });
        return ret;
    };
    return can;
});
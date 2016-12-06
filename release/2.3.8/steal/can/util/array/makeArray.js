/*!
 * CanJS - 2.3.8
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 04 Jan 2016 19:08:12 GMT
 * Licensed MIT
 */

/*can@2.3.8#util/array/makeArray*/
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
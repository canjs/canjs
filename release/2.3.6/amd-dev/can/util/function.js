/*!
 * CanJS - 2.3.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Sat, 12 Dec 2015 01:07:53 GMT
 * Licensed MIT
 */

/*can@2.3.6#util/function/function*/
define(['can/util/library'], function (can) {
    can.debounce = function (fn, time, context) {
        var timeout;
        return function () {
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(can.proxy(function () {
                fn.apply(this, args);
            }, context || this), time);
        };
    };
    can.throttle = function (fn, time, context) {
        var run;
        return function () {
            var args = arguments;
            var ctx = context || this;
            if (!run) {
                run = true;
                setTimeout(function () {
                    fn.apply(ctx, args);
                    run = false;
                }, time);
            }
        };
    };
    can.defer = function (fn, context) {
        var args = arguments;
        var ctx = context || this;
        setTimeout(function () {
            fn.apply(ctx, args);
        }, 0);
    };
    return can;
});
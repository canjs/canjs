/*!
 * CanJS - 2.3.31
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 19 Jul 2017 18:58:09 GMT
 * Licensed MIT
 */

/*can@2.3.31#util/hashchange*/
define(['can/util/can'], function (can) {
    (function () {
        var addEvent = function (el, ev, fn) {
                if (el.addEventListener) {
                    el.addEventListener(ev, fn, false);
                } else if (el.attachEvent) {
                    el.attachEvent('on' + ev, fn);
                } else {
                    el['on' + ev] = fn;
                }
            }, onHashchange = function () {
                can.trigger(window, 'hashchange');
            };
        addEvent(window, 'hashchange', onHashchange);
    }());
});
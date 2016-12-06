/*!
 * CanJS - 2.2.2
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Tue, 31 Mar 2015 17:29:12 GMT
 * Licensed MIT
 */

/*can@2.2.2#util/hashchange*/
define(['can/can'], function (can) {
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

/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#util/hashchange*/
steal('can/util/can.js', function (can) {
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
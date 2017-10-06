/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Mon, 02 Oct 2017 16:48:35 GMT
 * Licensed MIT
 */

/*can@2.3.32#util/hashchange*/
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
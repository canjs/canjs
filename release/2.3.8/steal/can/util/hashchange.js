/*!
 * CanJS - 2.3.8
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 04 Jan 2016 19:08:12 GMT
 * Licensed MIT
 */

/*can@2.3.8#util/hashchange*/
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
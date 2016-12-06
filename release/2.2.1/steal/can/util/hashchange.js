/*!
 * CanJS - 2.2.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Tue, 24 Mar 2015 22:13:03 GMT
 * Licensed MIT
 */

/*can@2.2.1#util/hashchange*/
steal('can/util/can.js', function (can) {
	// This is a workaround for libraries that don't natively listen to the window hashchange event
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


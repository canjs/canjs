/*!
 * CanJS - 2.1.2
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 16 Jun 2014 20:44:18 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/can"], function (can) {
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
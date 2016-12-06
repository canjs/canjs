/*!
 * CanJS - 2.0.5
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Tue, 04 Feb 2014 22:36:26 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(function () {
	/* global GLOBALCAN */
	var can = window.can || {};
	if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
		window.can = can;
	}

	can.isDeferred = function (obj) {
		var isFunction = this.isFunction;
		// Returns `true` if something looks like a deferred.
		return obj && isFunction(obj.then) && isFunction(obj.pipe);
	};

	var cid = 0;
	can.cid = function (object, name) {
		if (!object._cid) {
			cid++;
			object._cid = (name || '') + cid;
		}
		return object._cid;
	};
	can.VERSION = '2.0.5';

	can.simpleExtend = function (d, s) {
		for (var prop in s) {
			d[prop] = s[prop];
		}
		return d;
	};



	return can;
});
/*!
 * CanJS - 2.0.7
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Wed, 26 Mar 2014 16:12:27 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
steal(function () {
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
	can.VERSION = '2.0.7';

	can.simpleExtend = function (d, s) {
		for (var prop in s) {
			d[prop] = s[prop];
		}
		return d;
	};

	//!steal-remove-start
	can.dev = {
		logLevel: 0,
		/**
		 * Adds a warning message to the console.
		 * @codestart
		 * can.dev.warn("something evil");
		 * @codeend
		 * @param {String} out the message
		 */
		warn: function (out) {
			var ll = this.logLevel;
			if (ll < 2) {
				Array.prototype.unshift.call(arguments, 'WARN:');
				if (window.console && console.warn) {
					this._logger("warn", Array.prototype.slice.call(arguments));
				} else if (window.console && console.log) {
					this._logger("log", Array.prototype.slice.call(arguments));
				} else if (window.opera && window.opera.postError) {
					window.opera.postError("steal.js WARNING: " + out);
				}
			}
		},
		/**
		 * Adds a message to the console.
		 * @codestart
		 * can.dev.log("hi");
		 * @codeend
		 * @param {String} out the message
		 */
		log: function (out) {
			var ll = this.logLevel;
			if (ll < 1) {
				if (window.console && console.log) {
					Array.prototype.unshift.call(arguments, 'Info:');
					this._logger("log", Array.prototype.slice.call(arguments));
				} else if (window.opera && window.opera.postError) {
					window.opera.postError("steal.js INFO: " + out);
				}
			}
		},
		_logger: function (type, arr) {
			if (console.log.apply) {
				console[type].apply(console, arr);
			} else {
				console[type](arr);
			}
		}
	};
	//!steal-remove-end

	return can;
});

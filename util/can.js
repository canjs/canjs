steal(function () {
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
		if (object._cid) {
			return object._cid
		} else {
			return object._cid = (name || "" ) + (++cid)
		}
	}
	can.VERSION = '@EDGE';

	can.simpleExtend = function (d, s) {
		for (var prop in s) {
			d[prop] = s[prop]
		}
		return d;
	}

	// this is here in case can.compute hasn't loaded
	can.__reading = function(){};
	
	//!dev-remove-start
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
				Array.prototype.unshift.call(arguments, 'CanJS WARN:');
				if (window.console && console.warn) {
					this._logger("warn", Array.prototype.slice.call(arguments));
				} else if (window.console && console.log) {
					this._logger("log", Array.prototype.slice.call(arguments));
				} else if (window.opera && window.opera.postError) {
					opera.postError("steal.js WARNING: " + out);
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
					Array.prototype.unshift.call(arguments, 'CanJS info:');
					this._logger("log", Array.prototype.slice.call(arguments));
				}
				else if (window.opera && window.opera.postError) {
					opera.postError("steal.js INFO: " + out);
				}
			}
		},
		_logger: function (type, arr) {
			if (console.log.apply) {
				console[type].apply(console, arr)
			} else {
				console[type](arr)
			}
		}
	}
	//!dev-remove-end

	return can;
});

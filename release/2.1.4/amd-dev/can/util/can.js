/*!
 * CanJS - 2.1.4
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Fri, 21 Nov 2014 22:25:48 GMT
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

	// An empty function useful for where you need a dummy callback.
	can.k = function(){};

	can.isDeferred = function (obj) {
		// Returns `true` if something looks like a deferred.
		return obj && typeof obj.then === "function" && typeof obj.pipe === "function";
	};

	var cid = 0;
	can.cid = function (object, name) {
		if (!object._cid) {
			cid++;
			object._cid = (name || '') + cid;
		}
		return object._cid;
	};
	can.VERSION = '2.1.4';

	can.simpleExtend = function (d, s) {
		for (var prop in s) {
			d[prop] = s[prop];
		}
		return d;
	};


	can.frag = function(item){
		var frag;
		if(!item || typeof item === "string"){
			frag = can.buildFragment(item == null ? "" : ""+item, document.body);
			// If we have an empty frag...
			if (!frag.childNodes.length) {
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		} else if(item.nodeType === 11) {
			return item;
		} else if(typeof item.nodeType === "number") {
			frag = document.createDocumentFragment();
			frag.appendChild(item);
			return frag;
		} else if(typeof item.length === "number") {
			frag = document.createDocumentFragment();
			can.each(item, function(item){
				frag.appendChild( can.frag(item) );
			});
			return frag;
		} else {
			frag = can.buildFragment( ""+item, document.body);
			// If we have an empty frag...
			if (!frag.childNodes.length) {
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		}
	};
	
	// this is here in case can.compute hasn't loaded
	can.__reading = function () {};

	//!steal-remove-start
	can.dev = {
		warnTimeout: 5000,
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
/**
 * https://github.com/cho45/micro-location.js
 * (c) cho45 http://cho45.github.com/mit-license
 */
// immutable object, should not assign a value to properties
function Location () { this.init.apply(this, arguments) }
Location.prototype = {
	init : function (protocol, host, hostname, port, pathname, search, hash) {
		this.protocol  = protocol;
		this.host      = host;
		this.hostname  = hostname;
		this.port      = port || "";
		this.pathname  = pathname || "";
		this.search    = search || "";
		this.hash      = hash || "";
		if (protocol) {
			with (this) this.href = protocol + '//' + host + pathname + search + hash;
		} else
		if (host) {
			with (this) this.href = '//' + host + pathname + search + hash;
		} else {
			with (this) this.href = pathname + search + hash;
		}
	},

	params : function (name) {
		if (!this._params) {
			var params = {};

			var pairs = this.search.substring(1).split(/[;&]/);
			for (var i = 0, len = pairs.length; i < len; i++) {
				if (!pairs[i]) continue;
				var pair = pairs[i].split(/=/);
				var key  = decodeURIComponent(pair[0].replace(/\+/g, '%20'));
				var val  = decodeURIComponent(pair[1].replace(/\+/g, '%20'));

				if (!params[key]) params[key] = [];
				params[key].push(val);
			}

			this._params = params;
		}

		switch (typeof name) {
			case "undefined": return this._params;
			case "object"   : return this.build(name);
		}
		return this._params[name] ? this._params[name][0] : null;
	},

	build : function (params) {
		if (!params) params = this._params;

		var ret = new Location();
		var _search = this.search;
		if (params) {
			var search = [];
			for (var key in params) if (params.hasOwnProperty(key)) {
				var val = params[key];
				switch (typeof val) {
					case "object":
						for (var i = 0, len = val.length; i < len; i++) {
							search.push(encodeURIComponent(key) + '=' + encodeURIComponent(val[i]));
						}
						break;
					default:
						search.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
				}
			}
			_search = '?' + search.join('&');
		}

		with (this) ret.init.apply(ret, [
			protocol,
			host,
			hostname,
			port,
			pathname,
			_search,
			hash
		]);
		return ret;
	}
};
Location.regexp = new RegExp('^(?:(https?:)//(([^:/]+)(:[^/]+)?))?([^#?]*)(\\?[^#]*)?(#.*)?$');
Location.parse = function (string) {
	var matched = String(string).match(this.regexp);
	var ret = new Location();
	ret.init.apply(ret, matched.slice(1));
	return ret;
};

(function (root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = { 
			Location: factory()
		};
	} else if (typeof define === 'function' && define.amd) {
		define([], function () {
			return {
				Location: factory()
			}
		});
	} else {
		root.Location = factory();
	}
}(this, function () {
	return Location;
}));

/* global global: false */
steal(function () {
	/* global GLOBALCAN */
	/* global self */
	/* global WorkerGlobalScope */
	var glbl = typeof window !== "undefined" ? window :
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self : global;

	var can = {};
	if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
		glbl.can = can;
	}
	can.global = glbl;

	// An empty function useful for where you need a dummy callback.
	can.k = function(){};

	
	can.isDeferred = function(obj) {
		if (!!can.dev) { // can.dev may not be defined yet
			can.dev.warn('can.isDeferred: this function is deprecated and will be removed in a future release. can.isPromise replaces the functionality of can.isDeferred.');
		}
		return obj && typeof obj.then === "function" && typeof obj.pipe === "function";
	};
	can.isPromise = function(obj){
		return !!obj && (
			(window.Promise && (obj instanceof Promise)) ||
			(can.isFunction(obj.then) && (can.List === undefined || !(obj instanceof can.List)))
		);
	};
	can.isMapLike = function(obj){
		return can.Map && (obj instanceof can.Map || obj && obj.___get);
	};

	var cid = 0;
	can.cid = function (object, name) {
		if (!object._cid) {
			cid++;
			object._cid = (name || '') + cid;
		}
		return object._cid;
	};
	can.VERSION = '@EDGE';

	can.simpleExtend = function (d, s) {
		for (var prop in s) {
			d[prop] = s[prop];
		}
		return d;
	};

	can.last = function(arr){
		return arr && arr[arr.length - 1];
	};


	can.isDOM = function(el) {
		return (el.ownerDocument || el) === can.global.document;
	};

	can.childNodes = function(node) {
		var childNodes = node.childNodes;
		if("length" in childNodes) {
			return childNodes;
		} else {
			var cur = node.firstChild;
			var nodes = [];
			while(cur) {
				nodes.push(cur);
				cur = cur.nextSibling;
			}
			return nodes;
		}
	};

	var protoBind = Function.prototype.bind;
	if(protoBind) {
		can.proxy = function(fn, context){
			return protoBind.call(fn, context);
		};
	} else {
		can.proxy = function (fn, context) {
			return function () {
				return fn.apply(context, arguments);
			};
		};
	}

	can.frag = function(item, doc){
		var document = doc || can.document || can.global.document;
		var frag;
		if(!item || typeof item === "string"){
			frag = can.buildFragment(item == null ? "" : ""+item, document);
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
			if (!can.childNodes(frag).length) {
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		} else {
			frag = can.buildFragment( ""+item, document);
			// If we have an empty frag...
			if (!can.childNodes(frag).length) {
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		}
	};

	// Define the `can.scope` function that can be used to retrieve the `scope` from the element
	can.scope = can.viewModel = function (el, attr, val) {
		el = can.$(el);
		var scope = can.data(el, "scope") || can.data(el, "viewModel");
		if(!scope) {
			scope = new can.Map();
			can.data(el, "scope", scope);
			can.data(el, "viewModel", scope);
		}
		switch (arguments.length) {
			case 0:
			case 1:
				return scope;
			case 2:
				return scope.attr(attr);
			default:
				scope.attr(attr, val);
				return el;
		}
	};


	var parseURI = function(url){
			var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
				// authority = '//' + user + ':' + pass '@' + hostname + ':' port
			return (m ? {
				href     : m[0] || '',
				protocol : m[1] || '',
				authority: m[2] || '',
				host     : m[3] || '',
				hostname : m[4] || '',
				port     : m[5] || '',
				pathname : m[6] || '',
				search   : m[7] || '',
				hash     : m[8] || ''
			} : null);
		};

	can.joinURIs = function(base, href) {
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
				.replace(/\/(\.(\/|$))+/g, '/')
				.replace(/\/\.\.$/, '/../')
				.replace(/\/?[^\/]*/g, function (p) {
					if (p === '/..') {
						output.pop();
					} else {
						output.push(p);
					}
				});
			return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
		}

		href = parseURI(href || '');
		base = parseURI(base || '');

		return !href || !base ? null : (href.protocol || base.protocol) +
			(href.protocol || href.authority ? href.authority : base.authority) +
			removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
				(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
				href.hash;
	};

	can["import"] = function(moduleName, parentName) {
		var deferred = new can.Deferred();

		if(typeof window.System === "object" && can.isFunction(window.System["import"])) {
			window.System["import"](moduleName, {
				name: parentName
			}).then(can.proxy(deferred.resolve, deferred),
				can.proxy(deferred.reject, deferred));
		} else if(window.define && window.define.amd){

			window.require([moduleName], function(value){
				deferred.resolve(value);
			});

		} else if(window.steal) {

			steal.steal(moduleName, function(value){
				deferred.resolve(value);
			});

		} else if(window.require){
			deferred.resolve(window.require(moduleName));
		} else {
			// ideally this will use can.getObject
			deferred.resolve();
		}

		return deferred.promise();
	};

	// this is here in case can.compute hasn't loaded
	can.__observe = function () {};

	can.isNode = typeof process === "object" &&
		{}.toString.call(process) === "[object process]";

	can.isBrowserWindow = typeof window !== "undefined" &&
		typeof document !== "undefined" && typeof SimpleDOM === "undefined";
	can.isWebWorker = typeof WorkerGlobalScope !== "undefined" &&
		(self instanceof WorkerGlobalScope);


	//!steal-remove-start
	can.dev = {
		warnTimeout: 5000,
		logLevel: 0,
		/**
		 * Adds a warning message to the console.
		 * ```
		 * can.dev.warn("something evil");
		 * ```
		 * @param {String} out the message
		 */
		warn: function (out) {
			var ll = this.logLevel;
			if (ll < 2) {
				Array.prototype.unshift.call(arguments, 'WARN:');
				if (typeof window !== undefined && window.console && console.warn) {
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
		 * ```
		 * can.dev.log("hi");
		 * ```
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
			try {
				console[type].apply(console, arr);
			} catch(e) {
				console[type](arr);
			}
		}
	};
	//!steal-remove-end

	return can;
});

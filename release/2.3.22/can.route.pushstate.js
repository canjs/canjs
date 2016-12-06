/*!
 * CanJS - 2.3.22
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 31 Mar 2016 17:02:19 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can@2.3.22#route/pushstate/pushstate*/
define('can/route/pushstate/pushstate', [
    'can/util/util',
    'can/route/route'
], function (can) {
    'use strict';
    var hasPushstate = window.history && window.history.pushState;
    var isFileProtocol = window.location && window.location.protocol === 'file:';
    if (!isFileProtocol && hasPushstate) {
        can.route.bindings.pushstate = {
            root: '/',
            matchSlashes: false,
            paramsMatcher: /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/,
            querySeparator: '?',
            bind: function () {
                if (can.isNode) {
                    return;
                }
                can.delegate.call(can.$(document.documentElement), 'a', 'click', anchorClickHandler);
                can.each(methodsToOverwrite, function (method) {
                    originalMethods[method] = window.history[method];
                    window.history[method] = function (state, title, url) {
                        var absolute = url.indexOf('http') === 0;
                        var searchHash = window.location.search + window.location.hash;
                        if (!absolute && url !== window.location.pathname + searchHash || absolute && url !== window.location.href + searchHash) {
                            originalMethods[method].apply(window.history, arguments);
                            can.route.setState();
                        }
                    };
                });
                can.bind.call(window, 'popstate', can.route.setState);
            },
            unbind: function () {
                can.undelegate.call(can.$(document.documentElement), 'click', 'a', anchorClickHandler);
                can.each(methodsToOverwrite, function (method) {
                    window.history[method] = originalMethods[method];
                });
                can.unbind.call(window, 'popstate', can.route.setState);
            },
            matchingPartOfURL: function () {
                var root = cleanRoot(), loc = location.pathname + location.search, index = loc.indexOf(root);
                return loc.substr(index + root.length);
            },
            setURL: function (path, changed) {
                var method = 'pushState';
                if (includeHash && path.indexOf('#') === -1 && window.location.hash) {
                    path += window.location.hash;
                }
                if (replaceStateAttrs.length > 0) {
                    var toRemove = [];
                    for (var i = 0, l = changed.length; i < l; i++) {
                        if (can.inArray(changed[i], replaceStateAttrs) !== -1) {
                            method = 'replaceState';
                        }
                        if (can.inArray(changed[i], replaceStateAttrs.once) !== -1) {
                            toRemove.push(changed[i]);
                        }
                    }
                    if (toRemove.length > 0) {
                        removeAttrs(replaceStateAttrs, toRemove);
                        removeAttrs(replaceStateAttrs.once, toRemove);
                    }
                }
                window.history[method](null, null, can.route._call('root') + path);
            }
        };
        var anchorClickHandler = function (e) {
                if (!(e.isDefaultPrevented ? e.isDefaultPrevented() : e.defaultPrevented === true)) {
                    var node = this._node || this;
                    var linksHost = node.host || window.location.host;
                    if (node.href === 'javascript://') {
                        return;
                    }
                    if (window.location.host === linksHost) {
                        var root = cleanRoot();
                        if (node.pathname.indexOf(root) === 0) {
                            var url = (node.pathname + node.search).substr(root.length);
                            var curParams = can.route.deparam(url);
                            if (curParams.hasOwnProperty('route')) {
                                includeHash = true;
                                window.history.pushState(null, null, node.href);
                                if (e.preventDefault) {
                                    e.preventDefault();
                                }
                            }
                        }
                    }
                }
            }, cleanRoot = function () {
                var domain = location.protocol + '//' + location.host, root = can.route._call('root'), index = root.indexOf(domain);
                if (index === 0) {
                    return root.substr(domain.length);
                }
                return root;
            }, removeAttrs = function (arr, attrs) {
                var index;
                for (var i = attrs.length - 1; i >= 0; i--) {
                    if ((index = can.inArray(attrs[i], arr)) !== -1) {
                        arr.splice(index, 1);
                    }
                }
            }, methodsToOverwrite = [
                'pushState',
                'replaceState'
            ], originalMethods = {}, includeHash = false, replaceStateAttrs = [];
        can.route.defaultBinding = 'pushstate';
        can.extend(can.route, {
            replaceStateOn: function () {
                var attrs = can.makeArray(arguments);
                Array.prototype.push.apply(replaceStateAttrs, attrs);
            },
            replaceStateOnce: function () {
                var attrs = can.makeArray(arguments);
                replaceStateAttrs.once = can.makeArray(replaceStateAttrs.once);
                Array.prototype.push.apply(replaceStateAttrs.once, attrs);
                can.route.replaceStateOn.apply(this, arguments);
            },
            replaceStateOff: function () {
                var attrs = can.makeArray(arguments);
                removeAttrs(replaceStateAttrs, attrs);
            }
        });
    }
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
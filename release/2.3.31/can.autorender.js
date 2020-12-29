/*!
 * CanJS - 2.3.30
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 03 May 2017 15:32:43 GMT
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
/*can@2.3.30#map/app/app*/
define('can/map/app/app', [
    'can/util/util',
    'can/map/map',
    'can/compute/compute'
], function (can) {
    function sortedSetJson(set) {
        if (set == null) {
            return set;
        } else {
            var sorted = {};
            var keys = [];
            for (var k in set) {
                keys.push(k);
            }
            keys.sort();
            can.each(keys, function (prop) {
                sorted[prop] = set[prop];
            });
            return JSON.stringify(sorted);
        }
    }
    can.AppMap = can.Map.extend({
        setup: function () {
            can.Map.prototype.setup.apply(this, arguments);
            this.__readyPromises = [];
            this.__pageData = {};
            if (typeof System !== 'undefined' && System.has('asset-register')) {
                var register = System.get('asset-register')['default'];
                var self = this;
                register('inline-cache', function () {
                    var script = document.createElement('script');
                    var text = document.createTextNode('\nINLINE_CACHE = ' + JSON.stringify(self.__pageData) + ';\n');
                    script.appendChild(text);
                    return script;
                });
            }
        },
        waitFor: function (promise) {
            this.__readyPromises.push(promise);
            return promise;
        },
        pageData: can.__notObserve(function (key, set, inst) {
            var appState = this;
            function store(data) {
                var keyData = appState.__pageData[key];
                if (!keyData) {
                    keyData = appState.__pageData[key] = {};
                }
                keyData[sortedSetJson(set)] = typeof data.serialize === 'function' ? data.serialize() : data;
            }
            if (can.isPromise(inst)) {
                this.waitFor(inst);
                inst.then(function (data) {
                    store(data);
                });
            } else {
                store(inst);
            }
            return inst;
        })
    });
    return can.AppMap;
});
/*can@2.3.30#view/autorender/autorender*/
'format steal';
define('can/view/autorender/autorender', [
    'can/util/util',
    'can/map/app/app',
    'can/util/view_model/view_model'
], function (can) {
    var deferred = new can.Deferred(), ignoreAttributesRegExp = /^(dataViewId|class|id|type|src)$/i;
    var typeMatch = /\s*text\/(mustache|stache|ejs)\s*/;
    function isIn(element, type) {
        while (element.parentNode) {
            element = element.parentNode;
            if (element.nodeName.toLowerCase() === type.toLowerCase()) {
                return true;
            }
        }
    }
    function setAttr(el, attr, scope) {
        var camelized = can.camelize(attr);
        if (!ignoreAttributesRegExp.test(camelized)) {
            scope.attr(camelized, el.getAttribute(attr));
        }
    }
    function insertAfter(ref, element) {
        if (ref.nextSibling) {
            can.insertBefore(ref.parentNode, element, ref.nextSibling);
        } else {
            can.appendChild(ref.parentNode, element);
        }
    }
    function render(renderer, scope, el) {
        var frag = renderer(scope);
        if (isIn(el, 'head')) {
            can.appendChild(document.body, frag);
        } else if (el.nodeName.toLowerCase() === 'script') {
            insertAfter(el, frag);
        } else {
            insertAfter(el, frag);
            el.parentNode.removeChild(el);
        }
    }
    function setupScope(el) {
        var scope = can.viewModel(el);
        can.each(el.attributes || [], function (attr) {
            setAttr(el, attr.name, scope);
        });
        can.bind.call(el, 'attributes', function (ev) {
            setAttr(el, ev.attributeName, scope);
        });
        return scope;
    }
    function autoload() {
        var promises = [];
        can.each(can.$('[can-autorender]'), function (el, i) {
            el.style.display = 'none';
            var text = el.innerHTML || el.text, typeAttr = el.getAttribute('type'), typeInfo = typeAttr.match(typeMatch), type = typeInfo && typeInfo[1], typeModule = 'can/view/' + type;
            if (window.System || !(window.define && window.define.amd)) {
                typeModule += '/' + type;
            }
            promises.push(can['import'](typeModule).then(function (engine) {
                engine = can[type] || engine;
                if (engine.async) {
                    return engine.async(text).then(function (renderer) {
                        render(renderer, setupScope(el), el);
                    });
                } else {
                    var renderer = engine(text);
                    render(renderer, setupScope(el), el);
                }
            }));
        });
        can.when.apply(can, promises).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
    }
    if (document.readyState === 'complete') {
        autoload();
    } else {
        can.bind.call(window, 'load', autoload);
    }
    var promise = deferred.promise();
    can.autorender = function (success, error) {
        return promise.then(success, error);
    };
    return can.autorender;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
/*!
 * CanJS - 2.3.27
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 15 Sep 2016 21:14:18 GMT
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
/*can@2.3.27#construct/super/super*/
define('can/construct/super/super', [
    'can/util/util',
    'can/construct/construct'
], function (can, Construct) {
    var isFunction = can.isFunction, fnTest = /xyz/.test(function () {
            return this.xyz;
        }) ? /\b_super\b/ : /.*/, getset = [
            'get',
            'set'
        ], getSuper = function (base, name, fn) {
            return function () {
                var tmp = this._super, ret;
                this._super = base[name];
                ret = fn.apply(this, arguments);
                this._super = tmp;
                return ret;
            };
        };
    can.Construct._defineProperty = function (addTo, base, name, descriptor) {
        var _super = Object.getOwnPropertyDescriptor(base, name);
        if (_super) {
            can.each(getset, function (method) {
                if (isFunction(_super[method]) && isFunction(descriptor[method])) {
                    descriptor[method] = getSuper(_super, method, descriptor[method]);
                } else if (!isFunction(descriptor[method])) {
                    descriptor[method] = _super[method];
                }
            });
        }
        Object.defineProperty(addTo, name, descriptor);
    };
    can.Construct._overwrite = function (addTo, base, name, val) {
        addTo[name] = isFunction(val) && isFunction(base[name]) && fnTest.test(val) ? getSuper(base, name, val) : val;
    };
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
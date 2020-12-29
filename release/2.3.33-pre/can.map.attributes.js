/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 13 Sep 2017 22:08:47 GMT
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
/*can@2.3.32#map/attributes/attributes*/
define('can/map/attributes/attributes', [
    'can/util/util',
    'can/map/map_helpers',
    'can/map/map',
    'can/list/list'
], function (can, mapHelpers, Map) {
    can.each([
        can.Map,
        can.Model
    ], function (clss) {
        if (clss === undefined) {
            return;
        }
        var isObject = function (obj) {
            return typeof obj === 'object' && obj !== null && obj;
        };
        can.extend(clss, {
            attributes: {},
            convert: {
                'date': function (str) {
                    var type = typeof str;
                    if (type === 'string') {
                        str = Date.parse(str);
                        return isNaN(str) ? null : new Date(str);
                    } else if (type === 'number') {
                        return new Date(str);
                    } else {
                        return str;
                    }
                },
                'number': function (val) {
                    return parseFloat(val);
                },
                'boolean': function (val) {
                    if (val === 'false' || val === '0' || !val) {
                        return false;
                    }
                    return true;
                },
                'default': function (val, oldVal, error, type) {
                    if (can.Map.prototype.isPrototypeOf(type.prototype) && typeof type.model === 'function' && typeof type.models === 'function') {
                        return type[can.isArray(val) ? 'models' : 'model'](val);
                    }
                    if (can.Map.prototype.isPrototypeOf(type.prototype)) {
                        if (can.isArray(val) && typeof type.List === 'function') {
                            return new type.List(val);
                        }
                        return new type(val);
                    }
                    if (typeof type === 'function') {
                        return type(val, oldVal);
                    }
                    var construct = can.getObject(type), context = window, realType;
                    if (type.indexOf('.') >= 0) {
                        realType = type.substring(0, type.lastIndexOf('.'));
                        context = can.getObject(realType);
                    }
                    return typeof construct === 'function' ? construct.call(context, val, oldVal) : val;
                }
            },
            serialize: {
                'default': function (val, type) {
                    return isObject(val) && val.serialize ? val.serialize() : val;
                },
                'date': function (val) {
                    return val && val.getTime();
                }
            }
        });
        var oldSetup = clss.setup;
        clss.setup = function (superClass, fullName, stat, proto) {
            var self = this;
            oldSetup.call(self, superClass, fullName, stat, proto);
            can.each(['attributes'], function (name) {
                if (!self[name] || superClass[name] === self[name]) {
                    self[name] = {};
                }
            });
            can.each([
                'convert',
                'serialize'
            ], function (name) {
                if (superClass[name] !== self[name]) {
                    self[name] = can.extend({}, superClass[name], self[name]);
                }
            });
        };
    });
    can.Map.prototype.__convert = function (prop, value) {
        var Class = this.constructor, oldVal = this.__get(prop), type, converter;
        if (Class.attributes) {
            type = Class.attributes[prop];
            converter = Class.convert[type] || Class.convert['default'];
        }
        return value === null || !type ? value : converter.call(Class, value, oldVal, function () {
        }, type);
    };
    var oldSerialize = can.Map.prototype.___serialize;
    can.Map.prototype.___serialize = function (name, val) {
        var constructor = this.constructor, type = constructor.attributes ? constructor.attributes[name] : 0, converter = constructor.serialize ? constructor.serialize[type] : 0;
        return val && typeof val.serialize === 'function' ? oldSerialize.call(this, name, val) : converter ? converter(val, type) : oldSerialize.apply(this, arguments);
    };
    var mapSerialize = can.Map.prototype.serialize;
    can.Map.prototype.serialize = function (attrName) {
        var baseResult = mapSerialize.apply(this, arguments);
        if (attrName) {
            return baseResult[attrName];
        } else {
            return baseResult;
        }
    };
    return can.Map;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
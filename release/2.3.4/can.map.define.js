/*!
 * CanJS - 2.3.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 02 Dec 2015 22:49:52 GMT
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
/*can@2.3.4#map/define/define*/
define('can/map/define/define', [
    'can/util/util',
    'can/map/map_helpers',
    'can/map/map',
    'can/compute/compute'
], function (can, mapHelpers) {
    if (can.define) {
        return;
    }
    var define = can.define = {};
    var getPropDefineBehavior = function (behavior, attr, define) {
        var prop, defaultProp;
        if (define) {
            prop = define[attr];
            defaultProp = define['*'];
            if (prop && prop[behavior] !== undefined) {
                return prop[behavior];
            } else if (defaultProp && defaultProp[behavior] !== undefined) {
                return defaultProp[behavior];
            }
        }
    };
    mapHelpers.define = function (Map) {
        var definitions = Map.prototype.define;
        Map.defaultGenerators = {};
        for (var prop in definitions) {
            var type = definitions[prop].type;
            if (typeof type === 'string') {
                if (typeof define.types[type] === 'object') {
                    delete definitions[prop].type;
                    can.extend(definitions[prop], define.types[type]);
                }
            }
            if ('value' in definitions[prop]) {
                if (typeof definitions[prop].value === 'function') {
                    Map.defaultGenerators[prop] = definitions[prop].value;
                } else {
                    Map.defaults[prop] = definitions[prop].value;
                }
            }
            if (typeof definitions[prop].Value === 'function') {
                (function (Constructor) {
                    Map.defaultGenerators[prop] = function () {
                        return new Constructor();
                    };
                }(definitions[prop].Value));
            }
        }
    };
    var oldSetupDefaults = can.Map.prototype._setupDefaults;
    can.Map.prototype._setupDefaults = function (obj) {
        var defaults = oldSetupDefaults.call(this), propsCommittedToAttr = {}, Map = this.constructor, originalGet = this._get;
        this._get = function (originalProp) {
            var prop = originalProp.indexOf('.') !== -1 ? originalProp.substr(0, originalProp.indexOf('.')) : originalProp;
            if (prop in defaults && !(prop in propsCommittedToAttr)) {
                this.attr(prop, defaults[prop]);
                propsCommittedToAttr[prop] = true;
            }
            return originalGet.apply(this, arguments);
        };
        for (var prop in Map.defaultGenerators) {
            if (!obj || !(prop in obj)) {
                defaults[prop] = Map.defaultGenerators[prop].call(this);
            }
        }
        delete this._get;
        return defaults;
    };
    var proto = can.Map.prototype, oldSet = proto.__set;
    proto.__set = function (prop, value, current, success, error) {
        var errorCallback = function (errors) {
                var stub = error && error.call(self, errors);
                if (stub !== false) {
                    can.trigger(self, 'error', [
                        prop,
                        errors
                    ], true);
                }
                return false;
            }, self = this, setter = getPropDefineBehavior('set', prop, this.define), getter = getPropDefineBehavior('get', prop, this.define);
        if (setter) {
            can.batch.start();
            var setterCalled = false, setValue = setter.call(this, value, function (value) {
                    if (getter) {
                        self[prop](value);
                    } else {
                        oldSet.call(self, prop, value, current, success, errorCallback);
                    }
                    setterCalled = true;
                }, errorCallback, getter ? this._computedAttrs[prop].compute.computeInstance.lastSetValue.get() : current);
            if (getter) {
                if (setValue !== undefined && !setterCalled && setter.length >= 1) {
                    this._computedAttrs[prop].compute(setValue);
                }
                can.batch.stop();
                return;
            } else if (setValue === undefined && !setterCalled && setter.length >= 1) {
                can.batch.stop();
                return;
            } else {
                if (!setterCalled) {
                    oldSet.call(self, prop, setter.length === 0 && setValue === undefined ? value : setValue, current, success, errorCallback);
                }
                can.batch.stop();
                return this;
            }
        } else {
            oldSet.call(self, prop, value, current, success, errorCallback);
        }
        return this;
    };
    define.types = {
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
            if (val == null) {
                return val;
            }
            return +val;
        },
        'boolean': function (val) {
            if (val === 'false' || val === '0' || !val) {
                return false;
            }
            return true;
        },
        'htmlbool': function (val) {
            return typeof val === 'string' || !!val;
        },
        '*': function (val) {
            return val;
        },
        'string': function (val) {
            if (val == null) {
                return val;
            }
            return '' + val;
        },
        'compute': {
            set: function (newValue, setVal, setErr, oldValue) {
                if (newValue.isComputed) {
                    return newValue;
                }
                if (oldValue && oldValue.isComputed) {
                    oldValue(newValue);
                    return oldValue;
                }
                return newValue;
            },
            get: function (value) {
                return value && value.isComputed ? value() : value;
            }
        }
    };
    var oldType = proto.__type;
    proto.__type = function (value, prop) {
        var type = getPropDefineBehavior('type', prop, this.define), Type = getPropDefineBehavior('Type', prop, this.define), newValue = value;
        if (typeof type === 'string') {
            type = define.types[type];
        }
        if (type || Type) {
            if (type) {
                newValue = type.call(this, newValue, prop);
            }
            if (Type && !(newValue instanceof Type)) {
                newValue = new Type(newValue);
            }
            return newValue;
        } else if (can.isPlainObject(newValue) && newValue.define) {
            newValue = can.Map.extend(newValue);
            newValue = new newValue();
        }
        return oldType.call(this, newValue, prop);
    };
    var oldRemove = proto.__remove;
    proto.__remove = function (prop, current) {
        var remove = getPropDefineBehavior('remove', prop, this.define), res;
        if (remove) {
            can.batch.start();
            res = remove.call(this, current);
            if (res === false) {
                can.batch.stop();
                return;
            } else {
                res = oldRemove.call(this, prop, current);
                can.batch.stop();
                return res;
            }
        }
        return oldRemove.call(this, prop, current);
    };
    var oldSetupComputes = proto._setupComputedProperties;
    proto._setupComputedProperties = function () {
        oldSetupComputes.apply(this, arguments);
        for (var attr in this.define) {
            var def = this.define[attr], get = def.get;
            if (get) {
                mapHelpers.addComputedAttr(this, attr, can.compute.async(undefined, get, this));
            }
        }
    };
    var oldSingleSerialize = proto.___serialize;
    proto.___serialize = function (name, val) {
        return serializeProp(this, name, val);
    };
    var serializeProp = function (map, attr, val) {
        var serializer = attr === '*' ? false : getPropDefineBehavior('serialize', attr, map.define);
        if (serializer === undefined) {
            return oldSingleSerialize.call(map, attr, val);
        } else if (serializer !== false) {
            return typeof serializer === 'function' ? serializer.call(map, val, attr) : oldSingleSerialize.call(map, attr, val);
        }
    };
    var oldSerialize = proto.serialize;
    proto.serialize = function (property) {
        var serialized = oldSerialize.apply(this, arguments);
        if (property) {
            return serialized;
        }
        var serializer, val;
        for (var attr in this.define) {
            if (!(attr in serialized)) {
                serializer = this.define && this.define[attr] && this.define[attr].serialize;
                if (serializer) {
                    val = serializeProp(this, attr, this.attr(attr));
                    if (val !== undefined) {
                        serialized[attr] = val;
                    }
                }
            }
        }
        return serialized;
    };
    return can.define;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
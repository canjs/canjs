/*[process-shim]*/
(function(global, env) {
	// jshint ignore:line
	if (typeof process === "undefined") {
		global.process = {
			argv: [],
			cwd: function() {
				return "";
			},
			browser: true,
			env: {
				NODE_ENV: env || "development"
			},
			version: "",
			platform:
				global.navigator &&
				global.navigator.userAgent &&
				/Windows/.test(global.navigator.userAgent)
					? "win"
					: ""
		};
	}
})(
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	"development"
);

/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		} else if (!args[0] && deps[0] === "exports") {
			// Babel uses the exports and module object.
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{},
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*can-kefir@1.1.3#can-kefir*/
define('can-kefir', [
    'require',
    'exports',
    'module',
    'kefir',
    'can-symbol',
    'can-reflect',
    'can-event-queue/map/map',
    'can-observation-recorder'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var Kefir = require('kefir');
        var canSymbol = require('can-symbol');
        var canReflect = require('can-reflect');
        var mapEventsMixin = require('can-event-queue/map/map');
        var ObservationRecorder = require('can-observation-recorder');
        var metaSymbol = canSymbol.for('can.meta');
        var onKeyValueSymbol = canSymbol.for('can.onKeyValue');
        var offKeyValueSymbol = canSymbol.for('can.offKeyValue');
        var keyNames = {
            value: {
                on: 'onValue',
                off: 'offValue',
                handler: 'onValueHandler',
                handlers: 'onValueHandlers'
            },
            error: {
                on: 'onError',
                off: 'offError',
                handler: 'onErrorHandler',
                handlers: 'onErrorHandlers'
            }
        };
        function ensureMeta(obj) {
            var meta = obj[metaSymbol];
            if (!meta) {
                meta = {};
                canReflect.setKeyValue(obj, metaSymbol, meta);
            }
            return meta;
        }
        function getCurrentValue(stream, key) {
            if (stream._currentEvent && stream._currentEvent.type === key) {
                return stream._currentEvent.value;
            } else {
                var names = keyNames[key];
                if (!names) {
                    return stream[key];
                }
                var VALUE, valueHandler = function (value) {
                        VALUE = value;
                    };
                stream[names.on](valueHandler);
                stream[names.off](valueHandler);
                return VALUE;
            }
        }
        if (Kefir) {
            if (Object.isExtensible && !Object.isExtensible(Kefir)) {
                Kefir = Kefir.Kefir;
            }
            Kefir.Observable.prototype._eventSetup = function eventSetup() {
                var stream = this;
                var meta = ensureMeta(stream);
                meta.bound = true;
                meta.onValueHandler = function onValueHandler(newValue) {
                    var oldValue = meta.value;
                    meta.value = newValue;
                    if (newValue !== oldValue) {
                        mapEventsMixin.dispatch.call(stream, { type: 'value' }, [
                            newValue,
                            oldValue
                        ]);
                    }
                };
                meta.onErrorHandler = function onErrorHandler(error) {
                    var prevError = meta.error;
                    meta.error = error;
                    mapEventsMixin.dispatch.call(stream, { type: 'error' }, [
                        error,
                        prevError
                    ]);
                };
                stream.onValue(meta.onValueHandler);
                stream.onError(meta.onErrorHandler);
            };
            Kefir.Observable.prototype._eventTeardown = function eventTeardown() {
                var stream = this;
                var meta = ensureMeta(stream);
                meta.bound = false;
                stream.offValue(meta.onValueHandler);
                stream.offError(meta.onErrorHandler);
            };
            canReflect.assignSymbols(Kefir.Observable.prototype, {
                'can.onKeyValue': function onKeyValue() {
                    return mapEventsMixin[onKeyValueSymbol].apply(this, arguments);
                },
                'can.offKeyValue': function () {
                    return mapEventsMixin[offKeyValueSymbol].apply(this, arguments);
                },
                'can.getKeyValue': function (key) {
                    var stream = this;
                    var meta = ensureMeta(stream);
                    if (!keyNames[key]) {
                        return stream[key];
                    }
                    ObservationRecorder.add(stream, key);
                    if (meta.bound) {
                        return meta[key];
                    } else {
                        var currentValue = getCurrentValue(stream, key);
                        meta[key] = currentValue;
                        return currentValue;
                    }
                },
                'can.getValueDependencies': function getValueDependencies() {
                    var sources;
                    var stream = this;
                    if (stream._source != null) {
                        sources = [stream._source];
                    } else if (stream._sources != null) {
                        sources = stream._sources;
                    }
                    if (sources != null) {
                        return { valueDependencies: new Set(sources) };
                    }
                }
            });
            Kefir.emitterProperty = function () {
                var emitter;
                var setLastValue = false;
                var lastValue, lastError;
                var stream = Kefir.stream(function (EMITTER) {
                    emitter = EMITTER;
                    if (setLastValue) {
                        emitter.value(lastValue);
                    }
                    return function () {
                        emitter = undefined;
                    };
                });
                var property = stream.toProperty(function () {
                    return lastValue;
                });
                property.emitter = {
                    value: function (newValue) {
                        if (emitter) {
                            return emitter.emit(newValue);
                        } else {
                            setLastValue = true;
                            lastValue = newValue;
                        }
                    },
                    error: function (error) {
                        if (emitter) {
                            return emitter.error(error);
                        } else {
                            lastError = error;
                        }
                    }
                };
                property.emitter.emit = property.emitter.value;
                canReflect.assignSymbols(property, {
                    'can.setKeyValue': function setKeyValue(key, value) {
                        this.emitter[key](value);
                    },
                    'can.hasKey': function hasKey(key) {
                        return key in this.emitter;
                    }
                });
                return property;
            };
        }
        module.exports = Kefir;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);
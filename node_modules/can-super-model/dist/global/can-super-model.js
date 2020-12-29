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
		}
		// Babel uses the exports and module object.
		else if (!args[0] && deps[0] === "exports") {
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

/*can-super-model@1.1.1#can-super-model*/
define('can-super-model', [
    'require',
    'exports',
    'module',
    'can-connect',
    'can-connect/constructor/constructor',
    'can-connect/can/map/map',
    'can-connect/can/ref/ref',
    'can-connect/constructor/store/store',
    'can-connect/data/callbacks/callbacks',
    'can-connect/data/callbacks-cache/callbacks-cache',
    'can-connect/data/combine-requests/combine-requests',
    'can-connect/data/localstorage-cache/localstorage-cache',
    'can-connect/data/parse/parse',
    'can-connect/data/url/url',
    'can-connect/fall-through-cache/fall-through-cache',
    'can-connect/real-time/real-time',
    'can-connect/constructor/callbacks-once/callbacks-once',
    'can-define/list/list',
    'can-define/map/map',
    'can-namespace',
    'can-reflect',
    'can-query-logic'
], function (require, exports, module) {
    var connect = require('can-connect');
    var connectConstructor = require('can-connect/constructor/constructor');
    var canMap = require('can-connect/can/map/map');
    var canRef = require('can-connect/can/ref/ref');
    var constructorStore = require('can-connect/constructor/store/store');
    var dataCallbacks = require('can-connect/data/callbacks/callbacks');
    var callbacksCache = require('can-connect/data/callbacks-cache/callbacks-cache');
    var combineRequests = require('can-connect/data/combine-requests/combine-requests');
    var localCache = require('can-connect/data/localstorage-cache/localstorage-cache');
    var dataParse = require('can-connect/data/parse/parse');
    var dataUrl = require('can-connect/data/url/url');
    var fallThroughCache = require('can-connect/fall-through-cache/fall-through-cache');
    var realTime = require('can-connect/real-time/real-time');
    var callbacksOnce = require('can-connect/constructor/callbacks-once/callbacks-once');
    var DefineList = require('can-define/list/list');
    var DefineMap = require('can-define/map/map');
    var namespace = require('can-namespace');
    var canReflect = require('can-reflect');
    var QueryLogic = require('can-query-logic');
    function superModel(optionsOrUrl) {
        var options = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
        if (typeof options.Map === 'undefined') {
            options.Map = DefineMap.extend({ seal: false }, {});
        }
        if (typeof options.List === 'undefined') {
            options.List = options.Map.List || DefineList.extend({ '#': options.Map });
        }
        options = canReflect.assignDeep({}, options);
        if (!options.name) {
            options.name = canReflect.getName(options.Map) + '.connection';
        }
        if (!options.queryLogic) {
            options.queryLogic = new QueryLogic(options.Map);
        }
        var behaviors = [
            connectConstructor,
            canMap,
            canRef,
            constructorStore,
            dataCallbacks,
            combineRequests,
            dataParse,
            dataUrl,
            realTime,
            callbacksOnce
        ];
        if (typeof localStorage !== 'undefined') {
            if (!options.cacheConnection) {
                options.cacheConnection = connect([localCache], {
                    name: options.name + '.cacheConnection',
                    idProp: options.idProp,
                    queryLogic: options.queryLogic
                });
            }
            behaviors.push(callbacksCache, fallThroughCache);
        }
        return connect(behaviors, options);
    }
    module.exports = namespace.superModel = superModel;
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);
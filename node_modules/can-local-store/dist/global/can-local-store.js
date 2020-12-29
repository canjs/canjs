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

/*can-local-store@1.0.0#can-local-store*/
define('can-local-store', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-memory-store/make-simple-store',
    'can-namespace'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    var makeSimpleStore = require('can-memory-store/make-simple-store');
    var namespace = require('can-namespace');
    module.exports = namespace.localStore = function localStore(baseConnection) {
        baseConnection.constructor = localStore;
        var behavior = Object.create(makeSimpleStore(baseConnection));
        canReflect.assignMap(behavior, {
            clear: function () {
                localStorage.removeItem(this.name + '/queries');
                localStorage.removeItem(this.name + '/records');
                this._recordsMap = null;
                return Promise.resolve();
            },
            updateQueryDataSync: function (queries) {
                localStorage.setItem(this.name + '/queries', JSON.stringify(queries));
            },
            getQueryDataSync: function () {
                return JSON.parse(localStorage.getItem(this.name + '/queries')) || [];
            },
            getRecord: function (id) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                return this._recordsMap[id];
            },
            getAllRecords: function () {
                if (!this.cacheLocalStorageReads || !this._recordsMap) {
                    var recordsMap = JSON.parse(localStorage.getItem(this.name + '/records')) || {};
                    this._recordsMap = recordsMap;
                }
                var records = [];
                for (var id in this._recordsMap) {
                    records.push(this._recordsMap[id]);
                }
                return records;
            },
            destroyRecords: function (records) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                canReflect.eachIndex(records, function (record) {
                    var id = canReflect.getIdentity(record, this.queryLogic.schema);
                    delete this._recordsMap[id];
                }, this);
                localStorage.setItem(this.name + '/records', JSON.stringify(this._recordsMap));
            },
            updateRecordsSync: function (records) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                records.forEach(function (record) {
                    var id = canReflect.getIdentity(record, this.queryLogic.schema);
                    this._recordsMap[id] = record;
                }, this);
                localStorage.setItem(this.name + '/records', JSON.stringify(this._recordsMap));
            }
        });
        return behavior;
    };
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);
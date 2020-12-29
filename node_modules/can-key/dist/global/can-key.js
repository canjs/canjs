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

/*can-key@1.2.0#utils*/
define('can-key/utils', function (require, exports, module) {
    'use strict';
    var utils = {
        isContainer: function (current) {
            var type = typeof current;
            return current && (type === 'object' || type === 'function');
        },
        strReplacer: /\{([^\}]+)\}/g,
        parts: function (name) {
            if (Array.isArray(name)) {
                return name;
            } else {
                return typeof name !== 'undefined' ? (name + '').replace(/\[/g, '.').replace(/]/g, '').split('.') : [];
            }
        }
    };
    module.exports = utils;
});
/*can-key@1.2.0#delete/delete*/
define('can-key/delete/delete', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var utils = require('can-key/utils');
    module.exports = function deleteAtPath(data, path) {
        var parts = utils.parts(path);
        var current = data;
        for (var i = 0; i < parts.length - 1; i++) {
            if (current) {
                current = canReflect.getKeyValue(current, parts[i]);
            }
        }
        if (current) {
            canReflect.deleteKeyValue(current, parts[parts.length - 1]);
        }
    };
});
/*can-key@1.2.0#get/get*/
define('can-key/get/get', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var utils = require('can-key/utils');
    function get(obj, name) {
        var parts = utils.parts(name);
        var length = parts.length, current, i, container;
        if (!length) {
            return obj;
        }
        current = obj;
        for (i = 0; i < length && utils.isContainer(current) && current !== null; i++) {
            container = current;
            current = canReflect.getKeyValue(container, parts[i]);
        }
        return current;
    }
    module.exports = get;
});
/*can-key@1.2.0#replace-with/replace-with*/
define('can-key/replace-with/replace-with', [
    'require',
    'exports',
    'module',
    'can-key/utils',
    'can-key/get/get',
    'can-key/delete/delete'
], function (require, exports, module) {
    'use strict';
    var utils = require('can-key/utils');
    var get = require('can-key/get/get');
    var deleteKey = require('can-key/delete/delete');
    module.exports = function (str, data, replacer, shouldRemoveMatchedPaths) {
        return str.replace(utils.strReplacer, function (whole, path) {
            var value = get(data, path);
            if (shouldRemoveMatchedPaths) {
                deleteKey(data, path);
            }
            return replacer ? replacer(path, value) : value;
        });
    };
});
/*can-key@1.2.0#set/set*/
define('can-key/set/set', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-symbol',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var canSymbol = require('can-symbol');
    var utils = require('can-key/utils');
    var setValueSymbol = canSymbol.for('can.setValue');
    function set(object, path, value) {
        var parts = utils.parts(path);
        var current = object;
        var length = parts.length;
        for (var i = 0; i < length - 1; i++) {
            if (utils.isContainer(current)) {
                current = canReflect.getKeyValue(current, parts[i]);
            } else {
                break;
            }
        }
        if (current) {
            canReflect.setKeyValue(current, parts[i], value);
        } else {
            throw new TypeError('Cannot set value at key path \'' + path + '\'');
        }
        return object;
    }
    module.exports = set;
});
/*can-key@1.2.0#walk/walk*/
define('can-key/walk/walk', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-key/utils'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var utils = require('can-key/utils');
    module.exports = function walk(obj, name, keyCallback) {
        var parts = utils.parts(name);
        var length = parts.length, current, i, container, part;
        if (!length) {
            return;
        }
        current = obj;
        for (i = 0; i < length; i++) {
            container = current;
            part = parts[i];
            current = utils.isContainer(container) && canReflect.getKeyValue(container, part);
            var result = keyCallback({
                parent: container,
                key: part,
                value: current
            }, i);
            if (result !== undefined) {
                current = result;
            }
        }
    };
});
/*can-key@1.2.0#transform/transform*/
define('can-key/transform/transform', [
    'require',
    'exports',
    'module',
    'can-key/walk/walk',
    'can-key/utils',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var walk = require('can-key/walk/walk');
    var utils = require('can-key/utils');
    var canReflect = require('can-reflect');
    function deleteKeys(parentsAndKeys) {
        for (var i = parentsAndKeys.length - 1; i >= 0; i--) {
            var parentAndKey = parentsAndKeys[i];
            delete parentAndKey.parent[parentAndKey.key];
            if (canReflect.size(parentAndKey.parent) !== 0) {
                return;
            }
        }
    }
    module.exports = function (obj, transformer) {
        var copy = canReflect.serialize(obj);
        canReflect.eachKey(transformer, function (writeKey, readKey) {
            var readParts = utils.parts(readKey), writeParts = utils.parts(writeKey);
            var parentsAndKeys = [];
            walk(copy, readParts, function (info) {
                parentsAndKeys.push(info);
            });
            var last = parentsAndKeys[parentsAndKeys.length - 1];
            var value = last.value;
            if (value !== undefined) {
                walk(copy, writeParts, function (info, i) {
                    if (i < writeParts.length - 1 && !info.value) {
                        return info.parent[info.key] = {};
                    } else if (i === writeParts.length - 1) {
                        info.parent[info.key] = value;
                    }
                });
                deleteKeys(parentsAndKeys);
            }
        });
        return copy;
    };
});
/*can-key@1.2.0#can-key*/
define('can-key', [
    'require',
    'exports',
    'module',
    'can-key/delete/delete',
    'can-key/get/get',
    'can-key/replace-with/replace-with',
    'can-key/set/set',
    'can-key/transform/transform',
    'can-key/walk/walk',
    'can-namespace'
], function (require, exports, module) {
    'use strict';
    var deleteKey = require('can-key/delete/delete'), get = require('can-key/get/get'), replaceWith = require('can-key/replace-with/replace-with'), set = require('can-key/set/set'), transform = require('can-key/transform/transform'), walk = require('can-key/walk/walk'), namespace = require('can-namespace');
    module.exports = namespace.key = {
        deleteKey: deleteKey,
        get: get,
        replaceWith: replaceWith,
        set: set,
        transform: transform,
        walk: walk
    };
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);
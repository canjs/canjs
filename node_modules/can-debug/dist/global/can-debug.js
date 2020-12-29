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

/*can-debug@2.0.6#src/proxy-namespace*/
define('can-debug/src/proxy-namespace', function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var warned = false;
        module.exports = function proxyNamespace(namespace) {
            return new Proxy(namespace, {
                get: function get(target, name) {
                    if (!warned) {
                        console.warn('Warning: use of \'can\' global should be for debugging purposes only.');
                        warned = true;
                    }
                    return target[name];
                }
            });
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-debug@2.0.6#src/temporarily-bind*/
define('can-debug/src/temporarily-bind', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var canSymbol = require('can-symbol');
    var canReflect = require('can-reflect');
    var onValueSymbol = canSymbol.for('can.onValue');
    var offValueSymbol = canSymbol.for('can.offValue');
    var onKeyValueSymbol = canSymbol.for('can.onKeyValue');
    var offKeyValueSymbol = canSymbol.for('can.offKeyValue');
    var noop = function noop() {
    };
    function isFunction(value) {
        return typeof value === 'function';
    }
    function withKey(obj, key, fn) {
        var result;
        if (isFunction(obj[onKeyValueSymbol])) {
            canReflect.onKeyValue(obj, key, noop);
        }
        result = fn(obj, key);
        if (isFunction(obj[offKeyValueSymbol])) {
            canReflect.offKeyValue(obj, key, noop);
        }
        return result;
    }
    function withoutKey(obj, fn) {
        var result;
        if (isFunction(obj[onValueSymbol])) {
            canReflect.onValue(obj, noop);
        }
        result = fn(obj);
        if (isFunction(obj[offValueSymbol])) {
            canReflect.offValue(obj, noop);
        }
        return result;
    }
    module.exports = function temporarilyBind(fn) {
        return function (obj, key) {
            var gotKey = arguments.length === 2;
            return gotKey ? withKey(obj, key, fn) : withoutKey(obj, fn);
        };
    };
});
/*can-debug@2.0.6#src/graph/graph*/
define('can-debug/src/graph/graph', [
    'require',
    'exports',
    'module',
    'can-assign'
], function (require, exports, module) {
    'use strict';
    var canAssign = require('can-assign');
    function Graph() {
        this.nodes = [];
        this.arrows = new Map();
        this.arrowsMeta = new Map();
    }
    Graph.prototype.addNode = function addNode(node) {
        this.nodes.push(node);
        this.arrows.set(node, new Set());
    };
    Graph.prototype.addArrow = function addArrow(head, tail, meta) {
        var graph = this;
        graph.arrows.get(head).add(tail);
        if (meta) {
            addArrowMeta(graph, head, tail, meta);
        }
    };
    Graph.prototype.hasArrow = function hasArrow(head, tail) {
        return this.getNeighbors(head).has(tail);
    };
    Graph.prototype.getArrowMeta = function getArrowMeta(head, tail) {
        return this.arrowsMeta.get(head) && this.arrowsMeta.get(head).get(tail);
    };
    Graph.prototype.setArrowMeta = function setArrowMeta(head, tail, meta) {
        addArrowMeta(this, head, tail, meta);
    };
    Graph.prototype.getNeighbors = function getNeighbors(node) {
        return this.arrows.get(node);
    };
    Graph.prototype.findNode = function findNode(cb) {
        var found = null;
        var graph = this;
        var i, node;
        for (i = 0; i < graph.nodes.length; i++) {
            node = graph.nodes[i];
            if (cb(node)) {
                found = node;
                break;
            }
        }
        return found;
    };
    Graph.prototype.bfs = function bfs(visit) {
        var graph = this;
        var node = graph.nodes[0];
        var queue = [node];
        var visited = new Map();
        visited.set(node, true);
        while (queue.length) {
            node = queue.shift();
            visit(node);
            graph.arrows.get(node).forEach(function (adj) {
                if (!visited.has(adj)) {
                    queue.push(adj);
                    visited.set(adj, true);
                }
            });
        }
    };
    Graph.prototype.dfs = function dfs(visit) {
        var graph = this;
        var node = graph.nodes[0];
        var stack = [node];
        var visited = new Map();
        while (stack.length) {
            node = stack.pop();
            visit(node);
            if (!visited.has(node)) {
                visited.set(node, true);
                graph.arrows.get(node).forEach(function (adj) {
                    stack.push(adj);
                });
            }
        }
    };
    Graph.prototype.reverse = function reverse() {
        var graph = this;
        var reversed = new Graph();
        graph.nodes.forEach(reversed.addNode.bind(reversed));
        graph.nodes.forEach(function (node) {
            graph.getNeighbors(node).forEach(function (adj) {
                var meta = graph.getArrowMeta(node, adj);
                reversed.addArrow(adj, node, meta);
            });
        });
        return reversed;
    };
    function addArrowMeta(graph, head, tail, meta) {
        var entry = graph.arrowsMeta.get(head);
        if (entry) {
            var arrowMeta = entry.get(tail);
            if (!arrowMeta) {
                arrowMeta = {};
            }
            entry.set(tail, canAssign(arrowMeta, meta));
        } else {
            entry = new Map();
            entry.set(tail, meta);
            graph.arrowsMeta.set(head, entry);
        }
    }
    module.exports = Graph;
});
/*can-debug@2.0.6#src/get-graph/make-node*/
define('can-debug/src/get-graph/make-node', [
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    module.exports = function makeNode(obj, key) {
        var gotKey = arguments.length === 2;
        var node = {
            obj: obj,
            name: canReflect.getName(obj),
            value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
        };
        if (gotKey) {
            node.key = key;
        }
        return node;
    };
});
/*can-debug@2.0.6#src/get-graph/get-graph*/
define('can-debug/src/get-graph/get-graph', [
    'require',
    'exports',
    'module',
    'can-debug/src/graph/graph',
    'can-debug/src/get-graph/make-node',
    'can-reflect',
    'can-reflect-dependencies'
], function (require, exports, module) {
    'use strict';
    var Graph = require('can-debug/src/graph/graph');
    var makeNode = require('can-debug/src/get-graph/make-node');
    var canReflect = require('can-reflect');
    var mutateDeps = require('can-reflect-dependencies');
    module.exports = function getGraph(obj, key) {
        var order = 0;
        var graph = new Graph();
        var gotKey = arguments.length === 2;
        var addArrow = function addArrow(direction, parent, child, meta) {
            switch (direction) {
            case 'whatIChange':
                graph.addArrow(parent, child, meta);
                break;
            case 'whatChangesMe':
                graph.addArrow(child, parent, meta);
                break;
            default:
                throw new Error('Unknown direction value: ', meta.direction);
            }
        };
        var visitKeyDependencies = function visitKeyDependencies(source, meta, cb) {
            canReflect.eachKey(source.keyDependencies || {}, function (keys, obj) {
                canReflect.each(keys, function (key) {
                    cb(obj, meta, key);
                });
            });
        };
        var visitValueDependencies = function visitValueDependencies(source, meta, cb) {
            canReflect.eachIndex(source.valueDependencies || [], function (obj) {
                cb(obj, meta);
            });
        };
        var visit = function visit(obj, meta, key) {
            var gotKey = arguments.length === 3;
            var node = graph.findNode(function (node) {
                return gotKey ? node.obj === obj && node.key === key : node.obj === obj;
            });
            if (node) {
                if (meta.parent) {
                    addArrow(meta.direction, meta.parent, node, {
                        kind: meta.kind,
                        direction: meta.direction
                    });
                }
                return graph;
            }
            order += 1;
            node = gotKey ? makeNode(obj, key) : makeNode(obj);
            node.order = order;
            graph.addNode(node);
            if (meta.parent) {
                addArrow(meta.direction, meta.parent, node, {
                    kind: meta.kind,
                    direction: meta.direction
                });
            }
            var nextMeta;
            var data = gotKey ? mutateDeps.getDependencyDataOf(obj, key) : mutateDeps.getDependencyDataOf(obj);
            if (data && data.whatIChange) {
                nextMeta = {
                    direction: 'whatIChange',
                    parent: node
                };
                canReflect.eachKey(data.whatIChange, function (dependencyRecord, kind) {
                    nextMeta.kind = kind;
                    visitKeyDependencies(dependencyRecord, nextMeta, visit);
                    visitValueDependencies(dependencyRecord, nextMeta, visit);
                });
            }
            if (data && data.whatChangesMe) {
                nextMeta = {
                    direction: 'whatChangesMe',
                    parent: node
                };
                canReflect.eachKey(data.whatChangesMe, function (dependencyRecord, kind) {
                    nextMeta.kind = kind;
                    visitKeyDependencies(dependencyRecord, nextMeta, visit);
                    visitValueDependencies(dependencyRecord, nextMeta, visit);
                });
            }
            return graph;
        };
        return gotKey ? visit(obj, {}, key) : visit(obj, {});
    };
});
/*can-debug@2.0.6#src/format-graph/format-graph*/
define('can-debug/src/format-graph/format-graph', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-assign'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var canAssign = require('can-assign');
    module.exports = function formatGraph(graph) {
        var nodeIdMap = new Map();
        graph.nodes.forEach(function (node, index) {
            nodeIdMap.set(node, index + 1);
        });
        var nodesDataSet = graph.nodes.map(function (node) {
            return {
                shape: 'box',
                id: nodeIdMap.get(node),
                label: canReflect.getName(node.obj) + (node.key ? '.' + node.key : '')
            };
        });
        var getArrowData = function getArrowData(meta) {
            var regular = { arrows: 'to' };
            var withDashes = {
                arrows: 'to',
                dashes: true
            };
            var map = {
                derive: regular,
                mutate: withDashes
            };
            return map[meta.kind];
        };
        var visited = new Map();
        var arrowsDataSet = [];
        graph.nodes.forEach(function (node) {
            var visit = function (node) {
                if (!visited.has(node)) {
                    visited.set(node, true);
                    var arrows = graph.arrows.get(node);
                    var headId = nodeIdMap.get(node);
                    arrows.forEach(function (neighbor) {
                        var tailId = nodeIdMap.get(neighbor);
                        var meta = graph.arrowsMeta.get(node).get(neighbor);
                        arrowsDataSet.push(canAssign({
                            from: headId,
                            to: tailId
                        }, getArrowData(meta)));
                        visit(neighbor);
                    });
                }
            };
            visit(node);
        });
        return {
            nodes: nodesDataSet,
            edges: arrowsDataSet
        };
    };
});
/*can-debug@2.0.6#src/log-data/log-data*/
define('can-debug/src/log-data/log-data', [
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var canReflect = require('can-reflect');
    var quoteString = function quoteString(x) {
        return typeof x === 'string' ? JSON.stringify(x) : x;
    };
    module.exports = function log(data) {
        var node = data.node;
        var nameParts = [
            node.name,
            'key' in node ? '.' + node.key : ''
        ];
        console.group(nameParts.join(''));
        console.log('value  ', quoteString(node.value));
        console.log('object ', node.obj);
        if (data.derive.length) {
            console.group('DERIVED FROM');
            canReflect.eachIndex(data.derive, log);
            console.groupEnd();
        }
        if (data.mutations.length) {
            console.group('MUTATED BY');
            canReflect.eachIndex(data.mutations, log);
            console.groupEnd();
        }
        if (data.twoWay.length) {
            console.group('TWO WAY');
            canReflect.eachIndex(data.twoWay, log);
            console.groupEnd();
        }
        console.groupEnd();
    };
});
/*can-debug@2.0.6#src/label-cycles/label-cycles*/
define('can-debug/src/label-cycles/label-cycles', [
    'require',
    'exports',
    'module',
    'can-debug/src/graph/graph'
], function (require, exports, module) {
    'use strict';
    var Graph = require('can-debug/src/graph/graph');
    module.exports = function labelCycles(graph) {
        var visited = new Map();
        var result = new Graph();
        graph.nodes.forEach(function (node) {
            result.addNode(node);
        });
        var visit = function visit(node) {
            visited.set(node, true);
            graph.getNeighbors(node).forEach(function (adj) {
                if (visited.has(adj)) {
                    var isTwoWay = graph.hasArrow(node, adj);
                    if (isTwoWay) {
                        result.addArrow(adj, node, { kind: 'twoWay' });
                    }
                } else {
                    result.addArrow(node, adj, graph.getArrowMeta(node, adj));
                    visit(adj);
                }
            });
        };
        visit(graph.nodes[0]);
        return result;
    };
});
/*can-debug@2.0.6#src/get-data/get-data*/
define('can-debug/src/get-data/get-data', [
    'require',
    'exports',
    'module',
    'can-debug/src/label-cycles/label-cycles'
], function (require, exports, module) {
    'use strict';
    var labelCycles = require('can-debug/src/label-cycles/label-cycles');
    var isDisconnected = function isDisconnected(data) {
        return !data.derive.length && !data.mutations.length && !data.twoWay.length;
    };
    module.exports = function getDebugData(inputGraph, direction) {
        var visited = new Map();
        var graph = labelCycles(direction === 'whatChangesMe' ? inputGraph.reverse() : inputGraph);
        var visit = function visit(node) {
            var data = {
                node: node,
                derive: [],
                mutations: [],
                twoWay: []
            };
            visited.set(node, true);
            graph.getNeighbors(node).forEach(function (adj) {
                var meta = graph.getArrowMeta(node, adj);
                if (!visited.has(adj)) {
                    switch (meta.kind) {
                    case 'twoWay':
                        data.twoWay.push(visit(adj));
                        break;
                    case 'derive':
                        data.derive.push(visit(adj));
                        break;
                    case 'mutate':
                        data.mutations.push(visit(adj));
                        break;
                    default:
                        throw new Error('Unknow meta.kind value: ', meta.kind);
                    }
                }
            });
            return data;
        };
        var result = visit(graph.nodes[0]);
        return isDisconnected(result) ? null : result;
    };
});
/*can-debug@2.0.6#src/what-i-change/what-i-change*/
define('can-debug/src/what-i-change/what-i-change', [
    'require',
    'exports',
    'module',
    'can-debug/src/log-data/log-data',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var log = require('can-debug/src/log-data/log-data');
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function logWhatIChange(obj, key) {
        var gotKey = arguments.length === 2;
        var data = getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatIChange');
        if (data) {
            log(data);
        }
    };
});
/*can-debug@2.0.6#src/what-changes-me/what-changes-me*/
define('can-debug/src/what-changes-me/what-changes-me', [
    'require',
    'exports',
    'module',
    'can-debug/src/log-data/log-data',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var log = require('can-debug/src/log-data/log-data');
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function logWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        var data = getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatChangesMe');
        if (data) {
            log(data);
        }
    };
});
/*can-debug@2.0.6#src/get-what-i-change/get-what-i-change*/
define('can-debug/src/get-what-i-change/get-what-i-change', [
    'require',
    'exports',
    'module',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function getWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        return getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatIChange');
    };
});
/*can-debug@2.0.6#src/get-what-changes-me/get-what-changes-me*/
define('can-debug/src/get-what-changes-me/get-what-changes-me', [
    'require',
    'exports',
    'module',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function getWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        return getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatChangesMe');
    };
});
/*can-debug@2.0.6#can-debug*/
define('can-debug', [
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-globals',
    'can-debug/src/proxy-namespace',
    'can-debug/src/temporarily-bind',
    'can-debug/src/get-graph/get-graph',
    'can-debug/src/format-graph/format-graph',
    'can-debug/src/what-i-change/what-i-change',
    'can-debug/src/what-changes-me/what-changes-me',
    'can-debug/src/get-what-i-change/get-what-i-change',
    'can-debug/src/get-what-changes-me/get-what-changes-me',
    'can-observation',
    'can-symbol',
    'can-reflect',
    'can-queues',
    'can-diff/merge-deep/merge-deep'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var namespace = require('can-namespace');
        var globals = require('can-globals');
        var proxyNamespace = require('can-debug/src/proxy-namespace');
        var temporarilyBind = require('can-debug/src/temporarily-bind');
        var getGraph = require('can-debug/src/get-graph/get-graph');
        var formatGraph = require('can-debug/src/format-graph/format-graph');
        var logWhatIChange = require('can-debug/src/what-i-change/what-i-change');
        var logWhatChangesMe = require('can-debug/src/what-changes-me/what-changes-me');
        var getWhatIChange = require('can-debug/src/get-what-i-change/get-what-i-change');
        var getWhatChangesMe = require('can-debug/src/get-what-changes-me/get-what-changes-me');
        var Observation = require('can-observation');
        var canSymbol = require('can-symbol');
        var canReflect = require('can-reflect');
        var canQueues = require('can-queues');
        var mergeDeep = require('can-diff/merge-deep/merge-deep');
        var global = globals.getKeyValue('global');
        var devtoolsRegistrationComplete = false;
        function registerWithDevtools() {
            if (devtoolsRegistrationComplete) {
                return;
            }
            var devtoolsGlobalName = '__CANJS_DEVTOOLS__';
            var devtoolsCanModules = {
                Observation: Observation,
                Reflect: canReflect,
                Symbol: canSymbol,
                formatGraph: namespace.debug.formatGraph,
                getGraph: namespace.debug.getGraph,
                mergeDeep: mergeDeep,
                queues: canQueues
            };
            if (global[devtoolsGlobalName]) {
                global[devtoolsGlobalName].register(devtoolsCanModules);
            } else {
                Object.defineProperty(global, devtoolsGlobalName, {
                    set: function (devtoolsGlobal) {
                        Object.defineProperty(global, devtoolsGlobalName, { value: devtoolsGlobal });
                        devtoolsGlobal.register(devtoolsCanModules);
                    },
                    configurable: true
                });
            }
            devtoolsRegistrationComplete = true;
        }
        module.exports = function () {
            namespace.debug = {
                formatGraph: temporarilyBind(formatGraph),
                getGraph: temporarilyBind(getGraph),
                getWhatIChange: temporarilyBind(getWhatIChange),
                getWhatChangesMe: temporarilyBind(getWhatChangesMe),
                logWhatIChange: temporarilyBind(logWhatIChange),
                logWhatChangesMe: temporarilyBind(logWhatChangesMe)
            };
            registerWithDevtools();
            global.can = typeof Proxy !== 'undefined' ? proxyNamespace(namespace) : namespace;
            return namespace.debug;
        };
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
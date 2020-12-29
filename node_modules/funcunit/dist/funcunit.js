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
	{ jquery: "jQuery" },
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

/*funcunit@3.6.3#browser/jquery*/
define('funcunit/browser/jquery', function (require, exports, module) {
    (function (global, require, exports, module) {
        'format cjs';
        (function (global, factory) {
            if (typeof module === 'object' && typeof module.exports === 'object') {
                module.exports = global.document ? factory(global, true) : function (w) {
                    if (!w.document) {
                        throw new Error('jQuery requires a window with a document');
                    }
                    return factory(w);
                };
                module.exports = module.exports.noConflict(true);
            } else {
                factory(global);
            }
        }(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
            var deletedIds = [];
            var slice = deletedIds.slice;
            var concat = deletedIds.concat;
            var push = deletedIds.push;
            var indexOf = deletedIds.indexOf;
            var class2type = {};
            var toString = class2type.toString;
            var hasOwn = class2type.hasOwnProperty;
            var trim = ''.trim;
            var support = {};
            var version = '1.11.0', jQuery = function (selector, context) {
                    return new jQuery.fn.init(selector, context);
                }, rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi, fcamelCase = function (all, letter) {
                    return letter.toUpperCase();
                };
            jQuery.fn = jQuery.prototype = {
                jquery: version,
                constructor: jQuery,
                selector: '',
                length: 0,
                toArray: function () {
                    return slice.call(this);
                },
                get: function (num) {
                    return num != null ? num < 0 ? this[num + this.length] : this[num] : slice.call(this);
                },
                pushStack: function (elems) {
                    var ret = jQuery.merge(this.constructor(), elems);
                    ret.prevObject = this;
                    ret.context = this.context;
                    return ret;
                },
                each: function (callback, args) {
                    return jQuery.each(this, callback, args);
                },
                map: function (callback) {
                    return this.pushStack(jQuery.map(this, function (elem, i) {
                        return callback.call(elem, i, elem);
                    }));
                },
                slice: function () {
                    return this.pushStack(slice.apply(this, arguments));
                },
                first: function () {
                    return this.eq(0);
                },
                last: function () {
                    return this.eq(-1);
                },
                eq: function (i) {
                    var len = this.length, j = +i + (i < 0 ? len : 0);
                    return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
                },
                end: function () {
                    return this.prevObject || this.constructor(null);
                },
                push: push,
                sort: deletedIds.sort,
                splice: deletedIds.splice
            };
            jQuery.extend = jQuery.fn.extend = function () {
                var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
                if (typeof target === 'boolean') {
                    deep = target;
                    target = arguments[i] || {};
                    i++;
                }
                if (typeof target !== 'object' && !jQuery.isFunction(target)) {
                    target = {};
                }
                if (i === length) {
                    target = this;
                    i--;
                }
                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            src = target[name];
                            copy = options[name];
                            if (target === copy) {
                                continue;
                            }
                            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && jQuery.isArray(src) ? src : [];
                                } else {
                                    clone = src && jQuery.isPlainObject(src) ? src : {};
                                }
                                target[name] = jQuery.extend(deep, clone, copy);
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
                return target;
            };
            jQuery.extend({
                expando: 'jQuery' + (version + Math.random()).replace(/\D/g, ''),
                isReady: true,
                error: function (msg) {
                    throw new Error(msg);
                },
                noop: function () {
                },
                isFunction: function (obj) {
                    return jQuery.type(obj) === 'function';
                },
                isArray: Array.isArray || function (obj) {
                    return jQuery.type(obj) === 'array';
                },
                isWindow: function (obj) {
                    return obj != null && obj == obj.window;
                },
                isNumeric: function (obj) {
                    return obj - parseFloat(obj) >= 0;
                },
                isEmptyObject: function (obj) {
                    var name;
                    for (name in obj) {
                        return false;
                    }
                    return true;
                },
                isPlainObject: function (obj) {
                    var key;
                    if (!obj || jQuery.type(obj) !== 'object' || obj.nodeType || jQuery.isWindow(obj)) {
                        return false;
                    }
                    try {
                        if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                            return false;
                        }
                    } catch (e) {
                        return false;
                    }
                    if (support.ownLast) {
                        for (key in obj) {
                            return hasOwn.call(obj, key);
                        }
                    }
                    for (key in obj) {
                    }
                    return key === undefined || hasOwn.call(obj, key);
                },
                type: function (obj) {
                    if (obj == null) {
                        return obj + '';
                    }
                    return typeof obj === 'object' || typeof obj === 'function' ? class2type[toString.call(obj)] || 'object' : typeof obj;
                },
                globalEval: function (data) {
                    if (data && jQuery.trim(data)) {
                        (window.execScript || function (data) {
                            window['eval'].call(window, data);
                        })(data);
                    }
                },
                camelCase: function (string) {
                    return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);
                },
                nodeName: function (elem, name) {
                    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
                },
                each: function (obj, callback, args) {
                    var value, i = 0, length = obj.length, isArray = isArraylike(obj);
                    if (args) {
                        if (isArray) {
                            for (; i < length; i++) {
                                value = callback.apply(obj[i], args);
                                if (value === false) {
                                    break;
                                }
                            }
                        } else {
                            for (i in obj) {
                                value = callback.apply(obj[i], args);
                                if (value === false) {
                                    break;
                                }
                            }
                        }
                    } else {
                        if (isArray) {
                            for (; i < length; i++) {
                                value = callback.call(obj[i], i, obj[i]);
                                if (value === false) {
                                    break;
                                }
                            }
                        } else {
                            for (i in obj) {
                                value = callback.call(obj[i], i, obj[i]);
                                if (value === false) {
                                    break;
                                }
                            }
                        }
                    }
                    return obj;
                },
                trim: trim && !trim.call('\uFEFF\xA0') ? function (text) {
                    return text == null ? '' : trim.call(text);
                } : function (text) {
                    return text == null ? '' : (text + '').replace(rtrim, '');
                },
                makeArray: function (arr, results) {
                    var ret = results || [];
                    if (arr != null) {
                        if (isArraylike(Object(arr))) {
                            jQuery.merge(ret, typeof arr === 'string' ? [arr] : arr);
                        } else {
                            push.call(ret, arr);
                        }
                    }
                    return ret;
                },
                inArray: function (elem, arr, i) {
                    var len;
                    if (arr) {
                        if (indexOf) {
                            return indexOf.call(arr, elem, i);
                        }
                        len = arr.length;
                        i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
                        for (; i < len; i++) {
                            if (i in arr && arr[i] === elem) {
                                return i;
                            }
                        }
                    }
                    return -1;
                },
                merge: function (first, second) {
                    var len = +second.length, j = 0, i = first.length;
                    while (j < len) {
                        first[i++] = second[j++];
                    }
                    if (len !== len) {
                        while (second[j] !== undefined) {
                            first[i++] = second[j++];
                        }
                    }
                    first.length = i;
                    return first;
                },
                grep: function (elems, callback, invert) {
                    var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
                    for (; i < length; i++) {
                        callbackInverse = !callback(elems[i], i);
                        if (callbackInverse !== callbackExpect) {
                            matches.push(elems[i]);
                        }
                    }
                    return matches;
                },
                map: function (elems, callback, arg) {
                    var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];
                    if (isArray) {
                        for (; i < length; i++) {
                            value = callback(elems[i], i, arg);
                            if (value != null) {
                                ret.push(value);
                            }
                        }
                    } else {
                        for (i in elems) {
                            value = callback(elems[i], i, arg);
                            if (value != null) {
                                ret.push(value);
                            }
                        }
                    }
                    return concat.apply([], ret);
                },
                guid: 1,
                proxy: function (fn, context) {
                    var args, proxy, tmp;
                    if (typeof context === 'string') {
                        tmp = fn[context];
                        context = fn;
                        fn = tmp;
                    }
                    if (!jQuery.isFunction(fn)) {
                        return undefined;
                    }
                    args = slice.call(arguments, 2);
                    proxy = function () {
                        return fn.apply(context || this, args.concat(slice.call(arguments)));
                    };
                    proxy.guid = fn.guid = fn.guid || jQuery.guid++;
                    return proxy;
                },
                now: function () {
                    return +new Date();
                },
                support: support
            });
            jQuery.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
                class2type['[object ' + name + ']'] = name.toLowerCase();
            });
            function isArraylike(obj) {
                var length = obj.length, type = jQuery.type(obj);
                if (type === 'function' || jQuery.isWindow(obj)) {
                    return false;
                }
                if (obj.nodeType === 1 && length) {
                    return true;
                }
                return type === 'array' || length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj;
            }
            var Sizzle = function (window) {
                var i, support, Expr, getText, isXML, compile, outermostContext, sortInput, hasDuplicate, setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = 'sizzle' + -new Date(), preferredDoc = window.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), sortOrder = function (a, b) {
                        if (a === b) {
                            hasDuplicate = true;
                        }
                        return 0;
                    }, strundefined = typeof undefined, MAX_NEGATIVE = 1 << 31, hasOwn = {}.hasOwnProperty, arr = [], pop = arr.pop, push_native = arr.push, push = arr.push, slice = arr.slice, indexOf = arr.indexOf || function (elem) {
                        var i = 0, len = this.length;
                        for (; i < len; i++) {
                            if (this[i] === elem) {
                                return i;
                            }
                        }
                        return -1;
                    }, booleans = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped', whitespace = '[\\x20\\t\\r\\n\\f]', characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+', identifier = characterEncoding.replace('w', 'w#'), attributes = '\\[' + whitespace + '*(' + characterEncoding + ')' + whitespace + '*(?:([*^$|!~]?=)' + whitespace + '*(?:([\'"])((?:\\\\.|[^\\\\])*?)\\3|(' + identifier + ')|)|)' + whitespace + '*\\]', pseudos = ':(' + characterEncoding + ')(?:\\((([\'"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|' + attributes.replace(3, 8) + ')*)|.*)\\)|)', rtrim = new RegExp('^' + whitespace + '+|((?:^|[^\\\\])(?:\\\\.)*)' + whitespace + '+$', 'g'), rcomma = new RegExp('^' + whitespace + '*,' + whitespace + '*'), rcombinators = new RegExp('^' + whitespace + '*([>+~]|' + whitespace + ')' + whitespace + '*'), rattributeQuotes = new RegExp('=' + whitespace + '*([^\\]\'"]*?)' + whitespace + '*\\]', 'g'), rpseudo = new RegExp(pseudos), ridentifier = new RegExp('^' + identifier + '$'), matchExpr = {
                        'ID': new RegExp('^#(' + characterEncoding + ')'),
                        'CLASS': new RegExp('^\\.(' + characterEncoding + ')'),
                        'TAG': new RegExp('^(' + characterEncoding.replace('w', 'w*') + ')'),
                        'ATTR': new RegExp('^' + attributes),
                        'PSEUDO': new RegExp('^' + pseudos),
                        'CHILD': new RegExp('^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' + whitespace + '*(even|odd|(([+-]|)(\\d*)n|)' + whitespace + '*(?:([+-]|)' + whitespace + '*(\\d+)|))' + whitespace + '*\\)|)', 'i'),
                        'bool': new RegExp('^(?:' + booleans + ')$', 'i'),
                        'needsContext': new RegExp('^' + whitespace + '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' + whitespace + '*((?:-\\d)?\\d*)' + whitespace + '*\\)|)(?=[^-]|$)', 'i')
                    }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, rescape = /'|\\/g, runescape = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig'), funescape = function (_, escaped, escapedWhitespace) {
                        var high = '0x' + escaped - 65536;
                        return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
                    };
                try {
                    push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
                    arr[preferredDoc.childNodes.length].nodeType;
                } catch (e) {
                    push = {
                        apply: arr.length ? function (target, els) {
                            push_native.apply(target, slice.call(els));
                        } : function (target, els) {
                            var j = target.length, i = 0;
                            while (target[j++] = els[i++]) {
                            }
                            target.length = j - 1;
                        }
                    };
                }
                function Sizzle(selector, context, results, seed) {
                    var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
                    if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
                        setDocument(context);
                    }
                    context = context || document;
                    results = results || [];
                    if (!selector || typeof selector !== 'string') {
                        return results;
                    }
                    if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
                        return [];
                    }
                    if (documentIsHTML && !seed) {
                        if (match = rquickExpr.exec(selector)) {
                            if (m = match[1]) {
                                if (nodeType === 9) {
                                    elem = context.getElementById(m);
                                    if (elem && elem.parentNode) {
                                        if (elem.id === m) {
                                            results.push(elem);
                                            return results;
                                        }
                                    } else {
                                        return results;
                                    }
                                } else {
                                    if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                                        results.push(elem);
                                        return results;
                                    }
                                }
                            } else if (match[2]) {
                                push.apply(results, context.getElementsByTagName(selector));
                                return results;
                            } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
                                push.apply(results, context.getElementsByClassName(m));
                                return results;
                            }
                        }
                        if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                            nid = old = expando;
                            newContext = context;
                            newSelector = nodeType === 9 && selector;
                            if (nodeType === 1 && context.nodeName.toLowerCase() !== 'object') {
                                groups = tokenize(selector);
                                if (old = context.getAttribute('id')) {
                                    nid = old.replace(rescape, '\\$&');
                                } else {
                                    context.setAttribute('id', nid);
                                }
                                nid = '[id=\'' + nid + '\'] ';
                                i = groups.length;
                                while (i--) {
                                    groups[i] = nid + toSelector(groups[i]);
                                }
                                newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                                newSelector = groups.join(',');
                            }
                            if (newSelector) {
                                try {
                                    push.apply(results, newContext.querySelectorAll(newSelector));
                                    return results;
                                } catch (qsaError) {
                                } finally {
                                    if (!old) {
                                        context.removeAttribute('id');
                                    }
                                }
                            }
                        }
                    }
                    return select(selector.replace(rtrim, '$1'), context, results, seed);
                }
                function createCache() {
                    var keys = [];
                    function cache(key, value) {
                        if (keys.push(key + ' ') > Expr.cacheLength) {
                            delete cache[keys.shift()];
                        }
                        return cache[key + ' '] = value;
                    }
                    return cache;
                }
                function markFunction(fn) {
                    fn[expando] = true;
                    return fn;
                }
                function assert(fn) {
                    var div = document.createElement('div');
                    try {
                        return !!fn(div);
                    } catch (e) {
                        return false;
                    } finally {
                        if (div.parentNode) {
                            div.parentNode.removeChild(div);
                        }
                        div = null;
                    }
                }
                function addHandle(attrs, handler) {
                    var arr = attrs.split('|'), i = attrs.length;
                    while (i--) {
                        Expr.attrHandle[arr[i]] = handler;
                    }
                }
                function siblingCheck(a, b) {
                    var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
                    if (diff) {
                        return diff;
                    }
                    if (cur) {
                        while (cur = cur.nextSibling) {
                            if (cur === b) {
                                return -1;
                            }
                        }
                    }
                    return a ? 1 : -1;
                }
                function createInputPseudo(type) {
                    return function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return name === 'input' && elem.type === type;
                    };
                }
                function createButtonPseudo(type) {
                    return function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === 'input' || name === 'button') && elem.type === type;
                    };
                }
                function createPositionalPseudo(fn) {
                    return markFunction(function (argument) {
                        argument = +argument;
                        return markFunction(function (seed, matches) {
                            var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length;
                            while (i--) {
                                if (seed[j = matchIndexes[i]]) {
                                    seed[j] = !(matches[j] = seed[j]);
                                }
                            }
                        });
                    });
                }
                function testContext(context) {
                    return context && typeof context.getElementsByTagName !== strundefined && context;
                }
                support = Sizzle.support = {};
                isXML = Sizzle.isXML = function (elem) {
                    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                    return documentElement ? documentElement.nodeName !== 'HTML' : false;
                };
                setDocument = Sizzle.setDocument = function (node) {
                    var hasCompare, doc = node ? node.ownerDocument || node : preferredDoc, parent = doc.defaultView;
                    if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
                        return document;
                    }
                    document = doc;
                    docElem = doc.documentElement;
                    documentIsHTML = !isXML(doc);
                    if (parent && parent !== parent.top) {
                        if (parent.addEventListener) {
                            parent.addEventListener('unload', function () {
                                setDocument();
                            }, false);
                        } else if (parent.attachEvent) {
                            parent.attachEvent('onunload', function () {
                                setDocument();
                            });
                        }
                    }
                    support.attributes = assert(function (div) {
                        div.className = 'i';
                        return !div.getAttribute('className');
                    });
                    support.getElementsByTagName = assert(function (div) {
                        div.appendChild(doc.createComment(''));
                        return !div.getElementsByTagName('*').length;
                    });
                    support.getElementsByClassName = rnative.test(doc.getElementsByClassName) && assert(function (div) {
                        div.innerHTML = '<div class=\'a\'></div><div class=\'a i\'></div>';
                        div.firstChild.className = 'i';
                        return div.getElementsByClassName('i').length === 2;
                    });
                    support.getById = assert(function (div) {
                        docElem.appendChild(div).id = expando;
                        return !doc.getElementsByName || !doc.getElementsByName(expando).length;
                    });
                    if (support.getById) {
                        Expr.find['ID'] = function (id, context) {
                            if (typeof context.getElementById !== strundefined && documentIsHTML) {
                                var m = context.getElementById(id);
                                return m && m.parentNode ? [m] : [];
                            }
                        };
                        Expr.filter['ID'] = function (id) {
                            var attrId = id.replace(runescape, funescape);
                            return function (elem) {
                                return elem.getAttribute('id') === attrId;
                            };
                        };
                    } else {
                        delete Expr.find['ID'];
                        Expr.filter['ID'] = function (id) {
                            var attrId = id.replace(runescape, funescape);
                            return function (elem) {
                                var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode('id');
                                return node && node.value === attrId;
                            };
                        };
                    }
                    Expr.find['TAG'] = support.getElementsByTagName ? function (tag, context) {
                        if (typeof context.getElementsByTagName !== strundefined) {
                            return context.getElementsByTagName(tag);
                        }
                    } : function (tag, context) {
                        var elem, tmp = [], i = 0, results = context.getElementsByTagName(tag);
                        if (tag === '*') {
                            while (elem = results[i++]) {
                                if (elem.nodeType === 1) {
                                    tmp.push(elem);
                                }
                            }
                            return tmp;
                        }
                        return results;
                    };
                    Expr.find['CLASS'] = support.getElementsByClassName && function (className, context) {
                        if (typeof context.getElementsByClassName !== strundefined && documentIsHTML) {
                            return context.getElementsByClassName(className);
                        }
                    };
                    rbuggyMatches = [];
                    rbuggyQSA = [];
                    if (support.qsa = rnative.test(doc.querySelectorAll)) {
                        assert(function (div) {
                            div.innerHTML = '<select t=\'\'><option selected=\'\'></option></select>';
                            if (div.querySelectorAll('[t^=\'\']').length) {
                                rbuggyQSA.push('[*^$]=' + whitespace + '*(?:\'\'|"")');
                            }
                            if (!div.querySelectorAll('[selected]').length) {
                                rbuggyQSA.push('\\[' + whitespace + '*(?:value|' + booleans + ')');
                            }
                            if (!div.querySelectorAll(':checked').length) {
                                rbuggyQSA.push(':checked');
                            }
                        });
                        assert(function (div) {
                            var input = doc.createElement('input');
                            input.setAttribute('type', 'hidden');
                            div.appendChild(input).setAttribute('name', 'D');
                            if (div.querySelectorAll('[name=d]').length) {
                                rbuggyQSA.push('name' + whitespace + '*[*^$|!~]?=');
                            }
                            if (!div.querySelectorAll(':enabled').length) {
                                rbuggyQSA.push(':enabled', ':disabled');
                            }
                            div.querySelectorAll('*,:x');
                            rbuggyQSA.push(',.*:');
                        });
                    }
                    if (support.matchesSelector = rnative.test(matches = docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
                        assert(function (div) {
                            support.disconnectedMatch = matches.call(div, 'div');
                            matches.call(div, '[s!=\'\']:x');
                            rbuggyMatches.push('!=', pseudos);
                        });
                    }
                    rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join('|'));
                    rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join('|'));
                    hasCompare = rnative.test(docElem.compareDocumentPosition);
                    contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
                        var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
                        return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
                    } : function (a, b) {
                        if (b) {
                            while (b = b.parentNode) {
                                if (b === a) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    sortOrder = hasCompare ? function (a, b) {
                        if (a === b) {
                            hasDuplicate = true;
                            return 0;
                        }
                        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                        if (compare) {
                            return compare;
                        }
                        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
                        if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
                            if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                                return -1;
                            }
                            if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                                return 1;
                            }
                            return sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
                        }
                        return compare & 4 ? -1 : 1;
                    } : function (a, b) {
                        if (a === b) {
                            hasDuplicate = true;
                            return 0;
                        }
                        var cur, i = 0, aup = a.parentNode, bup = b.parentNode, ap = [a], bp = [b];
                        if (!aup || !bup) {
                            return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
                        } else if (aup === bup) {
                            return siblingCheck(a, b);
                        }
                        cur = a;
                        while (cur = cur.parentNode) {
                            ap.unshift(cur);
                        }
                        cur = b;
                        while (cur = cur.parentNode) {
                            bp.unshift(cur);
                        }
                        while (ap[i] === bp[i]) {
                            i++;
                        }
                        return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
                    };
                    return doc;
                };
                Sizzle.matches = function (expr, elements) {
                    return Sizzle(expr, null, null, elements);
                };
                Sizzle.matchesSelector = function (elem, expr) {
                    if ((elem.ownerDocument || elem) !== document) {
                        setDocument(elem);
                    }
                    expr = expr.replace(rattributeQuotes, '=\'$1\']');
                    if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
                        try {
                            var ret = matches.call(elem, expr);
                            if (ret || support.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
                                return ret;
                            }
                        } catch (e) {
                        }
                    }
                    return Sizzle(expr, document, null, [elem]).length > 0;
                };
                Sizzle.contains = function (context, elem) {
                    if ((context.ownerDocument || context) !== document) {
                        setDocument(context);
                    }
                    return contains(context, elem);
                };
                Sizzle.attr = function (elem, name) {
                    if ((elem.ownerDocument || elem) !== document) {
                        setDocument(elem);
                    }
                    var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
                    return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
                };
                Sizzle.error = function (msg) {
                    throw new Error('Syntax error, unrecognized expression: ' + msg);
                };
                Sizzle.uniqueSort = function (results) {
                    var elem, duplicates = [], j = 0, i = 0;
                    hasDuplicate = !support.detectDuplicates;
                    sortInput = !support.sortStable && results.slice(0);
                    results.sort(sortOrder);
                    if (hasDuplicate) {
                        while (elem = results[i++]) {
                            if (elem === results[i]) {
                                j = duplicates.push(i);
                            }
                        }
                        while (j--) {
                            results.splice(duplicates[j], 1);
                        }
                    }
                    sortInput = null;
                    return results;
                };
                getText = Sizzle.getText = function (elem) {
                    var node, ret = '', i = 0, nodeType = elem.nodeType;
                    if (!nodeType) {
                        while (node = elem[i++]) {
                            ret += getText(node);
                        }
                    } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                        if (typeof elem.textContent === 'string') {
                            return elem.textContent;
                        } else {
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                ret += getText(elem);
                            }
                        }
                    } else if (nodeType === 3 || nodeType === 4) {
                        return elem.nodeValue;
                    }
                    return ret;
                };
                Expr = Sizzle.selectors = {
                    cacheLength: 50,
                    createPseudo: markFunction,
                    match: matchExpr,
                    attrHandle: {},
                    find: {},
                    relative: {
                        '>': {
                            dir: 'parentNode',
                            first: true
                        },
                        ' ': { dir: 'parentNode' },
                        '+': {
                            dir: 'previousSibling',
                            first: true
                        },
                        '~': { dir: 'previousSibling' }
                    },
                    preFilter: {
                        'ATTR': function (match) {
                            match[1] = match[1].replace(runescape, funescape);
                            match[3] = (match[4] || match[5] || '').replace(runescape, funescape);
                            if (match[2] === '~=') {
                                match[3] = ' ' + match[3] + ' ';
                            }
                            return match.slice(0, 4);
                        },
                        'CHILD': function (match) {
                            match[1] = match[1].toLowerCase();
                            if (match[1].slice(0, 3) === 'nth') {
                                if (!match[3]) {
                                    Sizzle.error(match[0]);
                                }
                                match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === 'even' || match[3] === 'odd'));
                                match[5] = +(match[7] + match[8] || match[3] === 'odd');
                            } else if (match[3]) {
                                Sizzle.error(match[0]);
                            }
                            return match;
                        },
                        'PSEUDO': function (match) {
                            var excess, unquoted = !match[5] && match[2];
                            if (matchExpr['CHILD'].test(match[0])) {
                                return null;
                            }
                            if (match[3] && match[4] !== undefined) {
                                match[2] = match[4];
                            } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(')', unquoted.length - excess) - unquoted.length)) {
                                match[0] = match[0].slice(0, excess);
                                match[2] = unquoted.slice(0, excess);
                            }
                            return match.slice(0, 3);
                        }
                    },
                    filter: {
                        'TAG': function (nodeNameSelector) {
                            var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                            return nodeNameSelector === '*' ? function () {
                                return true;
                            } : function (elem) {
                                return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                            };
                        },
                        'CLASS': function (className) {
                            var pattern = classCache[className + ' '];
                            return pattern || (pattern = new RegExp('(^|' + whitespace + ')' + className + '(' + whitespace + '|$)')) && classCache(className, function (elem) {
                                return pattern.test(typeof elem.className === 'string' && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute('class') || '');
                            });
                        },
                        'ATTR': function (name, operator, check) {
                            return function (elem) {
                                var result = Sizzle.attr(elem, name);
                                if (result == null) {
                                    return operator === '!=';
                                }
                                if (!operator) {
                                    return true;
                                }
                                result += '';
                                return operator === '=' ? result === check : operator === '!=' ? result !== check : operator === '^=' ? check && result.indexOf(check) === 0 : operator === '*=' ? check && result.indexOf(check) > -1 : operator === '$=' ? check && result.slice(-check.length) === check : operator === '~=' ? (' ' + result + ' ').indexOf(check) > -1 : operator === '|=' ? result === check || result.slice(0, check.length + 1) === check + '-' : false;
                            };
                        },
                        'CHILD': function (type, what, argument, first, last) {
                            var simple = type.slice(0, 3) !== 'nth', forward = type.slice(-4) !== 'last', ofType = what === 'of-type';
                            return first === 1 && last === 0 ? function (elem) {
                                return !!elem.parentNode;
                            } : function (elem, context, xml) {
                                var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? 'nextSibling' : 'previousSibling', parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
                                if (parent) {
                                    if (simple) {
                                        while (dir) {
                                            node = elem;
                                            while (node = node[dir]) {
                                                if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                                                    return false;
                                                }
                                            }
                                            start = dir = type === 'only' && !start && 'nextSibling';
                                        }
                                        return true;
                                    }
                                    start = [forward ? parent.firstChild : parent.lastChild];
                                    if (forward && useCache) {
                                        outerCache = parent[expando] || (parent[expando] = {});
                                        cache = outerCache[type] || [];
                                        nodeIndex = cache[0] === dirruns && cache[1];
                                        diff = cache[0] === dirruns && cache[2];
                                        node = nodeIndex && parent.childNodes[nodeIndex];
                                        while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                                            if (node.nodeType === 1 && ++diff && node === elem) {
                                                outerCache[type] = [
                                                    dirruns,
                                                    nodeIndex,
                                                    diff
                                                ];
                                                break;
                                            }
                                        }
                                    } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                                        diff = cache[1];
                                    } else {
                                        while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                                            if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                                                if (useCache) {
                                                    (node[expando] || (node[expando] = {}))[type] = [
                                                        dirruns,
                                                        diff
                                                    ];
                                                }
                                                if (node === elem) {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    diff -= last;
                                    return diff === first || diff % first === 0 && diff / first >= 0;
                                }
                            };
                        },
                        'PSEUDO': function (pseudo, argument) {
                            var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error('unsupported pseudo: ' + pseudo);
                            if (fn[expando]) {
                                return fn(argument);
                            }
                            if (fn.length > 1) {
                                args = [
                                    pseudo,
                                    pseudo,
                                    '',
                                    argument
                                ];
                                return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
                                    var idx, matched = fn(seed, argument), i = matched.length;
                                    while (i--) {
                                        idx = indexOf.call(seed, matched[i]);
                                        seed[idx] = !(matches[idx] = matched[i]);
                                    }
                                }) : function (elem) {
                                    return fn(elem, 0, args);
                                };
                            }
                            return fn;
                        }
                    },
                    pseudos: {
                        'not': markFunction(function (selector) {
                            var input = [], results = [], matcher = compile(selector.replace(rtrim, '$1'));
                            return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
                                var elem, unmatched = matcher(seed, null, xml, []), i = seed.length;
                                while (i--) {
                                    if (elem = unmatched[i]) {
                                        seed[i] = !(matches[i] = elem);
                                    }
                                }
                            }) : function (elem, context, xml) {
                                input[0] = elem;
                                matcher(input, null, xml, results);
                                return !results.pop();
                            };
                        }),
                        'has': markFunction(function (selector) {
                            return function (elem) {
                                return Sizzle(selector, elem).length > 0;
                            };
                        }),
                        'contains': markFunction(function (text) {
                            return function (elem) {
                                return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                            };
                        }),
                        'lang': markFunction(function (lang) {
                            if (!ridentifier.test(lang || '')) {
                                Sizzle.error('unsupported lang: ' + lang);
                            }
                            lang = lang.replace(runescape, funescape).toLowerCase();
                            return function (elem) {
                                var elemLang;
                                do {
                                    if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute('xml:lang') || elem.getAttribute('lang')) {
                                        elemLang = elemLang.toLowerCase();
                                        return elemLang === lang || elemLang.indexOf(lang + '-') === 0;
                                    }
                                } while ((elem = elem.parentNode) && elem.nodeType === 1);
                                return false;
                            };
                        }),
                        'target': function (elem) {
                            var hash = window.location && window.location.hash;
                            return hash && hash.slice(1) === elem.id;
                        },
                        'root': function (elem) {
                            return elem === docElem;
                        },
                        'focus': function (elem) {
                            return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                        },
                        'enabled': function (elem) {
                            return elem.disabled === false;
                        },
                        'disabled': function (elem) {
                            return elem.disabled === true;
                        },
                        'checked': function (elem) {
                            var nodeName = elem.nodeName.toLowerCase();
                            return nodeName === 'input' && !!elem.checked || nodeName === 'option' && !!elem.selected;
                        },
                        'selected': function (elem) {
                            if (elem.parentNode) {
                                elem.parentNode.selectedIndex;
                            }
                            return elem.selected === true;
                        },
                        'empty': function (elem) {
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                if (elem.nodeType < 6) {
                                    return false;
                                }
                            }
                            return true;
                        },
                        'parent': function (elem) {
                            return !Expr.pseudos['empty'](elem);
                        },
                        'header': function (elem) {
                            return rheader.test(elem.nodeName);
                        },
                        'input': function (elem) {
                            return rinputs.test(elem.nodeName);
                        },
                        'button': function (elem) {
                            var name = elem.nodeName.toLowerCase();
                            return name === 'input' && elem.type === 'button' || name === 'button';
                        },
                        'text': function (elem) {
                            var attr;
                            return elem.nodeName.toLowerCase() === 'input' && elem.type === 'text' && ((attr = elem.getAttribute('type')) == null || attr.toLowerCase() === 'text');
                        },
                        'first': createPositionalPseudo(function () {
                            return [0];
                        }),
                        'last': createPositionalPseudo(function (matchIndexes, length) {
                            return [length - 1];
                        }),
                        'eq': createPositionalPseudo(function (matchIndexes, length, argument) {
                            return [argument < 0 ? argument + length : argument];
                        }),
                        'even': createPositionalPseudo(function (matchIndexes, length) {
                            var i = 0;
                            for (; i < length; i += 2) {
                                matchIndexes.push(i);
                            }
                            return matchIndexes;
                        }),
                        'odd': createPositionalPseudo(function (matchIndexes, length) {
                            var i = 1;
                            for (; i < length; i += 2) {
                                matchIndexes.push(i);
                            }
                            return matchIndexes;
                        }),
                        'lt': createPositionalPseudo(function (matchIndexes, length, argument) {
                            var i = argument < 0 ? argument + length : argument;
                            for (; --i >= 0;) {
                                matchIndexes.push(i);
                            }
                            return matchIndexes;
                        }),
                        'gt': createPositionalPseudo(function (matchIndexes, length, argument) {
                            var i = argument < 0 ? argument + length : argument;
                            for (; ++i < length;) {
                                matchIndexes.push(i);
                            }
                            return matchIndexes;
                        })
                    }
                };
                Expr.pseudos['nth'] = Expr.pseudos['eq'];
                for (i in {
                        radio: true,
                        checkbox: true,
                        file: true,
                        password: true,
                        image: true
                    }) {
                    Expr.pseudos[i] = createInputPseudo(i);
                }
                for (i in {
                        submit: true,
                        reset: true
                    }) {
                    Expr.pseudos[i] = createButtonPseudo(i);
                }
                function setFilters() {
                }
                setFilters.prototype = Expr.filters = Expr.pseudos;
                Expr.setFilters = new setFilters();
                function tokenize(selector, parseOnly) {
                    var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + ' '];
                    if (cached) {
                        return parseOnly ? 0 : cached.slice(0);
                    }
                    soFar = selector;
                    groups = [];
                    preFilters = Expr.preFilter;
                    while (soFar) {
                        if (!matched || (match = rcomma.exec(soFar))) {
                            if (match) {
                                soFar = soFar.slice(match[0].length) || soFar;
                            }
                            groups.push(tokens = []);
                        }
                        matched = false;
                        if (match = rcombinators.exec(soFar)) {
                            matched = match.shift();
                            tokens.push({
                                value: matched,
                                type: match[0].replace(rtrim, ' ')
                            });
                            soFar = soFar.slice(matched.length);
                        }
                        for (type in Expr.filter) {
                            if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                                matched = match.shift();
                                tokens.push({
                                    value: matched,
                                    type: type,
                                    matches: match
                                });
                                soFar = soFar.slice(matched.length);
                            }
                        }
                        if (!matched) {
                            break;
                        }
                    }
                    return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
                }
                function toSelector(tokens) {
                    var i = 0, len = tokens.length, selector = '';
                    for (; i < len; i++) {
                        selector += tokens[i].value;
                    }
                    return selector;
                }
                function addCombinator(matcher, combinator, base) {
                    var dir = combinator.dir, checkNonElements = base && dir === 'parentNode', doneName = done++;
                    return combinator.first ? function (elem, context, xml) {
                        while (elem = elem[dir]) {
                            if (elem.nodeType === 1 || checkNonElements) {
                                return matcher(elem, context, xml);
                            }
                        }
                    } : function (elem, context, xml) {
                        var oldCache, outerCache, newCache = [
                                dirruns,
                                doneName
                            ];
                        if (xml) {
                            while (elem = elem[dir]) {
                                if (elem.nodeType === 1 || checkNonElements) {
                                    if (matcher(elem, context, xml)) {
                                        return true;
                                    }
                                }
                            }
                        } else {
                            while (elem = elem[dir]) {
                                if (elem.nodeType === 1 || checkNonElements) {
                                    outerCache = elem[expando] || (elem[expando] = {});
                                    if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                                        return newCache[2] = oldCache[2];
                                    } else {
                                        outerCache[dir] = newCache;
                                        if (newCache[2] = matcher(elem, context, xml)) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    };
                }
                function elementMatcher(matchers) {
                    return matchers.length > 1 ? function (elem, context, xml) {
                        var i = matchers.length;
                        while (i--) {
                            if (!matchers[i](elem, context, xml)) {
                                return false;
                            }
                        }
                        return true;
                    } : matchers[0];
                }
                function condense(unmatched, map, filter, context, xml) {
                    var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = map != null;
                    for (; i < len; i++) {
                        if (elem = unmatched[i]) {
                            if (!filter || filter(elem, context, xml)) {
                                newUnmatched.push(elem);
                                if (mapped) {
                                    map.push(i);
                                }
                            }
                        }
                    }
                    return newUnmatched;
                }
                function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
                    if (postFilter && !postFilter[expando]) {
                        postFilter = setMatcher(postFilter);
                    }
                    if (postFinder && !postFinder[expando]) {
                        postFinder = setMatcher(postFinder, postSelector);
                    }
                    return markFunction(function (seed, results, context, xml) {
                        var temp, i, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || '*', context.nodeType ? [context] : context, []), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                        if (matcher) {
                            matcher(matcherIn, matcherOut, context, xml);
                        }
                        if (postFilter) {
                            temp = condense(matcherOut, postMap);
                            postFilter(temp, [], context, xml);
                            i = temp.length;
                            while (i--) {
                                if (elem = temp[i]) {
                                    matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
                                }
                            }
                        }
                        if (seed) {
                            if (postFinder || preFilter) {
                                if (postFinder) {
                                    temp = [];
                                    i = matcherOut.length;
                                    while (i--) {
                                        if (elem = matcherOut[i]) {
                                            temp.push(matcherIn[i] = elem);
                                        }
                                    }
                                    postFinder(null, matcherOut = [], temp, xml);
                                }
                                i = matcherOut.length;
                                while (i--) {
                                    if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {
                                        seed[temp] = !(results[temp] = elem);
                                    }
                                }
                            }
                        } else {
                            matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                            if (postFinder) {
                                postFinder(null, results, matcherOut, xml);
                            } else {
                                push.apply(results, matcherOut);
                            }
                        }
                    });
                }
                function matcherFromTokens(tokens) {
                    var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[' '], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function (elem) {
                            return elem === checkContext;
                        }, implicitRelative, true), matchAnyContext = addCombinator(function (elem) {
                            return indexOf.call(checkContext, elem) > -1;
                        }, implicitRelative, true), matchers = [function (elem, context, xml) {
                                return !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                            }];
                    for (; i < len; i++) {
                        if (matcher = Expr.relative[tokens[i].type]) {
                            matchers = [addCombinator(elementMatcher(matchers), matcher)];
                        } else {
                            matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
                            if (matcher[expando]) {
                                j = ++i;
                                for (; j < len; j++) {
                                    if (Expr.relative[tokens[j].type]) {
                                        break;
                                    }
                                }
                                return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === ' ' ? '*' : '' })).replace(rtrim, '$1'), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
                            }
                            matchers.push(matcher);
                        }
                    }
                    return elementMatcher(matchers);
                }
                function matcherFromGroupMatchers(elementMatchers, setMatchers) {
                    var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function (seed, context, xml, results, outermost) {
                            var elem, j, matcher, matchedCount = 0, i = '0', unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find['TAG']('*', outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
                            if (outermost) {
                                outermostContext = context !== document && context;
                            }
                            for (; i !== len && (elem = elems[i]) != null; i++) {
                                if (byElement && elem) {
                                    j = 0;
                                    while (matcher = elementMatchers[j++]) {
                                        if (matcher(elem, context, xml)) {
                                            results.push(elem);
                                            break;
                                        }
                                    }
                                    if (outermost) {
                                        dirruns = dirrunsUnique;
                                    }
                                }
                                if (bySet) {
                                    if (elem = !matcher && elem) {
                                        matchedCount--;
                                    }
                                    if (seed) {
                                        unmatched.push(elem);
                                    }
                                }
                            }
                            matchedCount += i;
                            if (bySet && i !== matchedCount) {
                                j = 0;
                                while (matcher = setMatchers[j++]) {
                                    matcher(unmatched, setMatched, context, xml);
                                }
                                if (seed) {
                                    if (matchedCount > 0) {
                                        while (i--) {
                                            if (!(unmatched[i] || setMatched[i])) {
                                                setMatched[i] = pop.call(results);
                                            }
                                        }
                                    }
                                    setMatched = condense(setMatched);
                                }
                                push.apply(results, setMatched);
                                if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                                    Sizzle.uniqueSort(results);
                                }
                            }
                            if (outermost) {
                                dirruns = dirrunsUnique;
                                outermostContext = contextBackup;
                            }
                            return unmatched;
                        };
                    return bySet ? markFunction(superMatcher) : superMatcher;
                }
                compile = Sizzle.compile = function (selector, group) {
                    var i, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + ' '];
                    if (!cached) {
                        if (!group) {
                            group = tokenize(selector);
                        }
                        i = group.length;
                        while (i--) {
                            cached = matcherFromTokens(group[i]);
                            if (cached[expando]) {
                                setMatchers.push(cached);
                            } else {
                                elementMatchers.push(cached);
                            }
                        }
                        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
                    }
                    return cached;
                };
                function multipleContexts(selector, contexts, results) {
                    var i = 0, len = contexts.length;
                    for (; i < len; i++) {
                        Sizzle(selector, contexts[i], results);
                    }
                    return results;
                }
                function select(selector, context, results, seed) {
                    var i, tokens, token, type, find, match = tokenize(selector);
                    if (!seed) {
                        if (match.length === 1) {
                            tokens = match[0] = match[0].slice(0);
                            if (tokens.length > 2 && (token = tokens[0]).type === 'ID' && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                                context = (Expr.find['ID'](token.matches[0].replace(runescape, funescape), context) || [])[0];
                                if (!context) {
                                    return results;
                                }
                                selector = selector.slice(tokens.shift().value.length);
                            }
                            i = matchExpr['needsContext'].test(selector) ? 0 : tokens.length;
                            while (i--) {
                                token = tokens[i];
                                if (Expr.relative[type = token.type]) {
                                    break;
                                }
                                if (find = Expr.find[type]) {
                                    if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
                                        tokens.splice(i, 1);
                                        selector = seed.length && toSelector(tokens);
                                        if (!selector) {
                                            push.apply(results, seed);
                                            return results;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    compile(selector, match)(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
                    return results;
                }
                support.sortStable = expando.split('').sort(sortOrder).join('') === expando;
                support.detectDuplicates = !!hasDuplicate;
                setDocument();
                support.sortDetached = assert(function (div1) {
                    return div1.compareDocumentPosition(document.createElement('div')) & 1;
                });
                if (!assert(function (div) {
                        div.innerHTML = '<a href=\'#\'></a>';
                        return div.firstChild.getAttribute('href') === '#';
                    })) {
                    addHandle('type|href|height|width', function (elem, name, isXML) {
                        if (!isXML) {
                            return elem.getAttribute(name, name.toLowerCase() === 'type' ? 1 : 2);
                        }
                    });
                }
                if (!support.attributes || !assert(function (div) {
                        div.innerHTML = '<input/>';
                        div.firstChild.setAttribute('value', '');
                        return div.firstChild.getAttribute('value') === '';
                    })) {
                    addHandle('value', function (elem, name, isXML) {
                        if (!isXML && elem.nodeName.toLowerCase() === 'input') {
                            return elem.defaultValue;
                        }
                    });
                }
                if (!assert(function (div) {
                        return div.getAttribute('disabled') == null;
                    })) {
                    addHandle(booleans, function (elem, name, isXML) {
                        var val;
                        if (!isXML) {
                            return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
                        }
                    });
                }
                return Sizzle;
            }(window);
            jQuery.find = Sizzle;
            jQuery.expr = Sizzle.selectors;
            jQuery.expr[':'] = jQuery.expr.pseudos;
            jQuery.unique = Sizzle.uniqueSort;
            jQuery.text = Sizzle.getText;
            jQuery.isXMLDoc = Sizzle.isXML;
            jQuery.contains = Sizzle.contains;
            var rneedsContext = jQuery.expr.match.needsContext;
            var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
            var risSimple = /^.[^:#\[\.,]*$/;
            function winnow(elements, qualifier, not) {
                if (jQuery.isFunction(qualifier)) {
                    return jQuery.grep(elements, function (elem, i) {
                        return !!qualifier.call(elem, i, elem) !== not;
                    });
                }
                if (qualifier.nodeType) {
                    return jQuery.grep(elements, function (elem) {
                        return elem === qualifier !== not;
                    });
                }
                if (typeof qualifier === 'string') {
                    if (risSimple.test(qualifier)) {
                        return jQuery.filter(qualifier, elements, not);
                    }
                    qualifier = jQuery.filter(qualifier, elements);
                }
                return jQuery.grep(elements, function (elem) {
                    return jQuery.inArray(elem, qualifier) >= 0 !== not;
                });
            }
            jQuery.filter = function (expr, elems, not) {
                var elem = elems[0];
                if (not) {
                    expr = ':not(' + expr + ')';
                }
                return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
                    return elem.nodeType === 1;
                }));
            };
            jQuery.fn.extend({
                find: function (selector) {
                    var i, ret = [], self = this, len = self.length;
                    if (typeof selector !== 'string') {
                        return this.pushStack(jQuery(selector).filter(function () {
                            for (i = 0; i < len; i++) {
                                if (jQuery.contains(self[i], this)) {
                                    return true;
                                }
                            }
                        }));
                    }
                    for (i = 0; i < len; i++) {
                        jQuery.find(selector, self[i], ret);
                    }
                    ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
                    ret.selector = this.selector ? this.selector + ' ' + selector : selector;
                    return ret;
                },
                filter: function (selector) {
                    return this.pushStack(winnow(this, selector || [], false));
                },
                not: function (selector) {
                    return this.pushStack(winnow(this, selector || [], true));
                },
                is: function (selector) {
                    return !!winnow(this, typeof selector === 'string' && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
                }
            });
            var rootjQuery, document = window.document, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, init = jQuery.fn.init = function (selector, context) {
                    var match, elem;
                    if (!selector) {
                        return this;
                    }
                    if (typeof selector === 'string') {
                        if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3) {
                            match = [
                                null,
                                selector,
                                null
                            ];
                        } else {
                            match = rquickExpr.exec(selector);
                        }
                        if (match && (match[1] || !context)) {
                            if (match[1]) {
                                context = context instanceof jQuery ? context[0] : context;
                                jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                                if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                                    for (match in context) {
                                        if (jQuery.isFunction(this[match])) {
                                            this[match](context[match]);
                                        } else {
                                            this.attr(match, context[match]);
                                        }
                                    }
                                }
                                return this;
                            } else {
                                elem = document.getElementById(match[2]);
                                if (elem && elem.parentNode) {
                                    if (elem.id !== match[2]) {
                                        return rootjQuery.find(selector);
                                    }
                                    this.length = 1;
                                    this[0] = elem;
                                }
                                this.context = document;
                                this.selector = selector;
                                return this;
                            }
                        } else if (!context || context.jquery) {
                            return (context || rootjQuery).find(selector);
                        } else {
                            return this.constructor(context).find(selector);
                        }
                    } else if (selector.nodeType) {
                        this.context = this[0] = selector;
                        this.length = 1;
                        return this;
                    } else if (jQuery.isFunction(selector)) {
                        return typeof rootjQuery.ready !== 'undefined' ? rootjQuery.ready(selector) : selector(jQuery);
                    }
                    if (selector.selector !== undefined) {
                        this.selector = selector.selector;
                        this.context = selector.context;
                    }
                    return jQuery.makeArray(selector, this);
                };
            init.prototype = jQuery.fn;
            rootjQuery = jQuery(document);
            var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
                    children: true,
                    contents: true,
                    next: true,
                    prev: true
                };
            jQuery.extend({
                dir: function (elem, dir, until) {
                    var matched = [], cur = elem[dir];
                    while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
                        if (cur.nodeType === 1) {
                            matched.push(cur);
                        }
                        cur = cur[dir];
                    }
                    return matched;
                },
                sibling: function (n, elem) {
                    var r = [];
                    for (; n; n = n.nextSibling) {
                        if (n.nodeType === 1 && n !== elem) {
                            r.push(n);
                        }
                    }
                    return r;
                }
            });
            jQuery.fn.extend({
                has: function (target) {
                    var i, targets = jQuery(target, this), len = targets.length;
                    return this.filter(function () {
                        for (i = 0; i < len; i++) {
                            if (jQuery.contains(this, targets[i])) {
                                return true;
                            }
                        }
                    });
                },
                closest: function (selectors, context) {
                    var cur, i = 0, l = this.length, matched = [], pos = rneedsContext.test(selectors) || typeof selectors !== 'string' ? jQuery(selectors, context || this.context) : 0;
                    for (; i < l; i++) {
                        for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                            if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
                                matched.push(cur);
                                break;
                            }
                        }
                    }
                    return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
                },
                index: function (elem) {
                    if (!elem) {
                        return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
                    }
                    if (typeof elem === 'string') {
                        return jQuery.inArray(this[0], jQuery(elem));
                    }
                    return jQuery.inArray(elem.jquery ? elem[0] : elem, this);
                },
                add: function (selector, context) {
                    return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
                },
                addBack: function (selector) {
                    return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
                }
            });
            function sibling(cur, dir) {
                do {
                    cur = cur[dir];
                } while (cur && cur.nodeType !== 1);
                return cur;
            }
            jQuery.each({
                parent: function (elem) {
                    var parent = elem.parentNode;
                    return parent && parent.nodeType !== 11 ? parent : null;
                },
                parents: function (elem) {
                    return jQuery.dir(elem, 'parentNode');
                },
                parentsUntil: function (elem, i, until) {
                    return jQuery.dir(elem, 'parentNode', until);
                },
                next: function (elem) {
                    return sibling(elem, 'nextSibling');
                },
                prev: function (elem) {
                    return sibling(elem, 'previousSibling');
                },
                nextAll: function (elem) {
                    return jQuery.dir(elem, 'nextSibling');
                },
                prevAll: function (elem) {
                    return jQuery.dir(elem, 'previousSibling');
                },
                nextUntil: function (elem, i, until) {
                    return jQuery.dir(elem, 'nextSibling', until);
                },
                prevUntil: function (elem, i, until) {
                    return jQuery.dir(elem, 'previousSibling', until);
                },
                siblings: function (elem) {
                    return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
                },
                children: function (elem) {
                    return jQuery.sibling(elem.firstChild);
                },
                contents: function (elem) {
                    return jQuery.nodeName(elem, 'iframe') ? elem.contentDocument || elem.contentWindow.document : jQuery.merge([], elem.childNodes);
                }
            }, function (name, fn) {
                jQuery.fn[name] = function (until, selector) {
                    var ret = jQuery.map(this, fn, until);
                    if (name.slice(-5) !== 'Until') {
                        selector = until;
                    }
                    if (selector && typeof selector === 'string') {
                        ret = jQuery.filter(selector, ret);
                    }
                    if (this.length > 1) {
                        if (!guaranteedUnique[name]) {
                            ret = jQuery.unique(ret);
                        }
                        if (rparentsprev.test(name)) {
                            ret = ret.reverse();
                        }
                    }
                    return this.pushStack(ret);
                };
            });
            var rnotwhite = /\S+/g;
            var optionsCache = {};
            function createOptions(options) {
                var object = optionsCache[options] = {};
                jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
                    object[flag] = true;
                });
                return object;
            }
            jQuery.Callbacks = function (options) {
                options = typeof options === 'string' ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
                var firing, memory, fired, firingLength, firingIndex, firingStart, list = [], stack = !options.once && [], fire = function (data) {
                        memory = options.memory && data;
                        fired = true;
                        firingIndex = firingStart || 0;
                        firingStart = 0;
                        firingLength = list.length;
                        firing = true;
                        for (; list && firingIndex < firingLength; firingIndex++) {
                            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                                memory = false;
                                break;
                            }
                        }
                        firing = false;
                        if (list) {
                            if (stack) {
                                if (stack.length) {
                                    fire(stack.shift());
                                }
                            } else if (memory) {
                                list = [];
                            } else {
                                self.disable();
                            }
                        }
                    }, self = {
                        add: function () {
                            if (list) {
                                var start = list.length;
                                (function add(args) {
                                    jQuery.each(args, function (_, arg) {
                                        var type = jQuery.type(arg);
                                        if (type === 'function') {
                                            if (!options.unique || !self.has(arg)) {
                                                list.push(arg);
                                            }
                                        } else if (arg && arg.length && type !== 'string') {
                                            add(arg);
                                        }
                                    });
                                }(arguments));
                                if (firing) {
                                    firingLength = list.length;
                                } else if (memory) {
                                    firingStart = start;
                                    fire(memory);
                                }
                            }
                            return this;
                        },
                        remove: function () {
                            if (list) {
                                jQuery.each(arguments, function (_, arg) {
                                    var index;
                                    while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                        list.splice(index, 1);
                                        if (firing) {
                                            if (index <= firingLength) {
                                                firingLength--;
                                            }
                                            if (index <= firingIndex) {
                                                firingIndex--;
                                            }
                                        }
                                    }
                                });
                            }
                            return this;
                        },
                        has: function (fn) {
                            return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
                        },
                        empty: function () {
                            list = [];
                            firingLength = 0;
                            return this;
                        },
                        disable: function () {
                            list = stack = memory = undefined;
                            return this;
                        },
                        disabled: function () {
                            return !list;
                        },
                        lock: function () {
                            stack = undefined;
                            if (!memory) {
                                self.disable();
                            }
                            return this;
                        },
                        locked: function () {
                            return !stack;
                        },
                        fireWith: function (context, args) {
                            if (list && (!fired || stack)) {
                                args = args || [];
                                args = [
                                    context,
                                    args.slice ? args.slice() : args
                                ];
                                if (firing) {
                                    stack.push(args);
                                } else {
                                    fire(args);
                                }
                            }
                            return this;
                        },
                        fire: function () {
                            self.fireWith(this, arguments);
                            return this;
                        },
                        fired: function () {
                            return !!fired;
                        }
                    };
                return self;
            };
            jQuery.extend({
                Deferred: function (func) {
                    var tuples = [
                            [
                                'resolve',
                                'done',
                                jQuery.Callbacks('once memory'),
                                'resolved'
                            ],
                            [
                                'reject',
                                'fail',
                                jQuery.Callbacks('once memory'),
                                'rejected'
                            ],
                            [
                                'notify',
                                'progress',
                                jQuery.Callbacks('memory')
                            ]
                        ], state = 'pending', promise = {
                            state: function () {
                                return state;
                            },
                            always: function () {
                                deferred.done(arguments).fail(arguments);
                                return this;
                            },
                            then: function () {
                                var fns = arguments;
                                return jQuery.Deferred(function (newDefer) {
                                    jQuery.each(tuples, function (i, tuple) {
                                        var fn = jQuery.isFunction(fns[i]) && fns[i];
                                        deferred[tuple[1]](function () {
                                            var returned = fn && fn.apply(this, arguments);
                                            if (returned && jQuery.isFunction(returned.promise)) {
                                                returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                                            } else {
                                                newDefer[tuple[0] + 'With'](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                                            }
                                        });
                                    });
                                    fns = null;
                                }).promise();
                            },
                            promise: function (obj) {
                                return obj != null ? jQuery.extend(obj, promise) : promise;
                            }
                        }, deferred = {};
                    promise.pipe = promise.then;
                    jQuery.each(tuples, function (i, tuple) {
                        var list = tuple[2], stateString = tuple[3];
                        promise[tuple[1]] = list.add;
                        if (stateString) {
                            list.add(function () {
                                state = stateString;
                            }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
                        }
                        deferred[tuple[0]] = function () {
                            deferred[tuple[0] + 'With'](this === deferred ? promise : this, arguments);
                            return this;
                        };
                        deferred[tuple[0] + 'With'] = list.fireWith;
                    });
                    promise.promise(deferred);
                    if (func) {
                        func.call(deferred, deferred);
                    }
                    return deferred;
                },
                when: function (subordinate) {
                    var i = 0, resolveValues = slice.call(arguments), length = resolveValues.length, remaining = length !== 1 || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0, deferred = remaining === 1 ? subordinate : jQuery.Deferred(), updateFunc = function (i, contexts, values) {
                            return function (value) {
                                contexts[i] = this;
                                values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                                if (values === progressValues) {
                                    deferred.notifyWith(contexts, values);
                                } else if (!--remaining) {
                                    deferred.resolveWith(contexts, values);
                                }
                            };
                        }, progressValues, progressContexts, resolveContexts;
                    if (length > 1) {
                        progressValues = new Array(length);
                        progressContexts = new Array(length);
                        resolveContexts = new Array(length);
                        for (; i < length; i++) {
                            if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
                                resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
                            } else {
                                --remaining;
                            }
                        }
                    }
                    if (!remaining) {
                        deferred.resolveWith(resolveContexts, resolveValues);
                    }
                    return deferred.promise();
                }
            });
            var readyList;
            jQuery.fn.ready = function (fn) {
                jQuery.ready.promise().done(fn);
                return this;
            };
            jQuery.extend({
                isReady: false,
                readyWait: 1,
                holdReady: function (hold) {
                    if (hold) {
                        jQuery.readyWait++;
                    } else {
                        jQuery.ready(true);
                    }
                },
                ready: function (wait) {
                    if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                        return;
                    }
                    if (!document.body) {
                        return setTimeout(jQuery.ready);
                    }
                    jQuery.isReady = true;
                    if (wait !== true && --jQuery.readyWait > 0) {
                        return;
                    }
                    readyList.resolveWith(document, [jQuery]);
                    if (jQuery.fn.trigger) {
                        jQuery(document).trigger('ready').off('ready');
                    }
                }
            });
            function detach() {
                if (document.addEventListener) {
                    document.removeEventListener('DOMContentLoaded', completed, false);
                    window.removeEventListener('load', completed, false);
                } else {
                    document.detachEvent('onreadystatechange', completed);
                    window.detachEvent('onload', completed);
                }
            }
            function completed() {
                if (document.addEventListener || event.type === 'load' || document.readyState === 'complete') {
                    detach();
                    jQuery.ready();
                }
            }
            jQuery.ready.promise = function (obj) {
                if (!readyList) {
                    readyList = jQuery.Deferred();
                    if (document.readyState === 'complete') {
                        setTimeout(jQuery.ready);
                    } else if (document.addEventListener) {
                        document.addEventListener('DOMContentLoaded', completed, false);
                        window.addEventListener('load', completed, false);
                    } else {
                        document.attachEvent('onreadystatechange', completed);
                        window.attachEvent('onload', completed);
                        var top = false;
                        try {
                            top = window.frameElement == null && document.documentElement;
                        } catch (e) {
                        }
                        if (top && top.doScroll) {
                            (function doScrollCheck() {
                                if (!jQuery.isReady) {
                                    try {
                                        top.doScroll('left');
                                    } catch (e) {
                                        return setTimeout(doScrollCheck, 50);
                                    }
                                    detach();
                                    jQuery.ready();
                                }
                            }());
                        }
                    }
                }
                return readyList.promise(obj);
            };
            var strundefined = typeof undefined;
            var i;
            for (i in jQuery(support)) {
                break;
            }
            support.ownLast = i !== '0';
            support.inlineBlockNeedsLayout = false;
            jQuery(function () {
                var container, div, body = document.getElementsByTagName('body')[0];
                if (!body) {
                    return;
                }
                container = document.createElement('div');
                container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
                div = document.createElement('div');
                body.appendChild(container).appendChild(div);
                if (typeof div.style.zoom !== strundefined) {
                    div.style.cssText = 'border:0;margin:0;width:1px;padding:1px;display:inline;zoom:1';
                    if (support.inlineBlockNeedsLayout = div.offsetWidth === 3) {
                        body.style.zoom = 1;
                    }
                }
                body.removeChild(container);
                container = div = null;
            });
            (function () {
                var div = document.createElement('div');
                if (support.deleteExpando == null) {
                    support.deleteExpando = true;
                    try {
                        delete div.test;
                    } catch (e) {
                        support.deleteExpando = false;
                    }
                }
                div = null;
            }());
            jQuery.acceptData = function (elem) {
                var noData = jQuery.noData[(elem.nodeName + ' ').toLowerCase()], nodeType = +elem.nodeType || 1;
                return nodeType !== 1 && nodeType !== 9 ? false : !noData || noData !== true && elem.getAttribute('classid') === noData;
            };
            var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /([A-Z])/g;
            function dataAttr(elem, key, data) {
                if (data === undefined && elem.nodeType === 1) {
                    var name = 'data-' + key.replace(rmultiDash, '-$1').toLowerCase();
                    data = elem.getAttribute(name);
                    if (typeof data === 'string') {
                        try {
                            data = data === 'true' ? true : data === 'false' ? false : data === 'null' ? null : +data + '' === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                        } catch (e) {
                        }
                        jQuery.data(elem, key, data);
                    } else {
                        data = undefined;
                    }
                }
                return data;
            }
            function isEmptyDataObject(obj) {
                var name;
                for (name in obj) {
                    if (name === 'data' && jQuery.isEmptyObject(obj[name])) {
                        continue;
                    }
                    if (name !== 'toJSON') {
                        return false;
                    }
                }
                return true;
            }
            function internalData(elem, name, data, pvt) {
                if (!jQuery.acceptData(elem)) {
                    return;
                }
                var ret, thisCache, internalKey = jQuery.expando, isNode = elem.nodeType, cache = isNode ? jQuery.cache : elem, id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;
                if ((!id || !cache[id] || !pvt && !cache[id].data) && data === undefined && typeof name === 'string') {
                    return;
                }
                if (!id) {
                    if (isNode) {
                        id = elem[internalKey] = deletedIds.pop() || jQuery.guid++;
                    } else {
                        id = internalKey;
                    }
                }
                if (!cache[id]) {
                    cache[id] = isNode ? {} : { toJSON: jQuery.noop };
                }
                if (typeof name === 'object' || typeof name === 'function') {
                    if (pvt) {
                        cache[id] = jQuery.extend(cache[id], name);
                    } else {
                        cache[id].data = jQuery.extend(cache[id].data, name);
                    }
                }
                thisCache = cache[id];
                if (!pvt) {
                    if (!thisCache.data) {
                        thisCache.data = {};
                    }
                    thisCache = thisCache.data;
                }
                if (data !== undefined) {
                    thisCache[jQuery.camelCase(name)] = data;
                }
                if (typeof name === 'string') {
                    ret = thisCache[name];
                    if (ret == null) {
                        ret = thisCache[jQuery.camelCase(name)];
                    }
                } else {
                    ret = thisCache;
                }
                return ret;
            }
            function internalRemoveData(elem, name, pvt) {
                if (!jQuery.acceptData(elem)) {
                    return;
                }
                var thisCache, i, isNode = elem.nodeType, cache = isNode ? jQuery.cache : elem, id = isNode ? elem[jQuery.expando] : jQuery.expando;
                if (!cache[id]) {
                    return;
                }
                if (name) {
                    thisCache = pvt ? cache[id] : cache[id].data;
                    if (thisCache) {
                        if (!jQuery.isArray(name)) {
                            if (name in thisCache) {
                                name = [name];
                            } else {
                                name = jQuery.camelCase(name);
                                if (name in thisCache) {
                                    name = [name];
                                } else {
                                    name = name.split(' ');
                                }
                            }
                        } else {
                            name = name.concat(jQuery.map(name, jQuery.camelCase));
                        }
                        i = name.length;
                        while (i--) {
                            delete thisCache[name[i]];
                        }
                        if (pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache)) {
                            return;
                        }
                    }
                }
                if (!pvt) {
                    delete cache[id].data;
                    if (!isEmptyDataObject(cache[id])) {
                        return;
                    }
                }
                if (isNode) {
                    jQuery.cleanData([elem], true);
                } else if (support.deleteExpando || cache != cache.window) {
                    delete cache[id];
                } else {
                    cache[id] = null;
                }
            }
            jQuery.extend({
                cache: {},
                noData: {
                    'applet ': true,
                    'embed ': true,
                    'object ': 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'
                },
                hasData: function (elem) {
                    elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
                    return !!elem && !isEmptyDataObject(elem);
                },
                data: function (elem, name, data) {
                    return internalData(elem, name, data);
                },
                removeData: function (elem, name) {
                    return internalRemoveData(elem, name);
                },
                _data: function (elem, name, data) {
                    return internalData(elem, name, data, true);
                },
                _removeData: function (elem, name) {
                    return internalRemoveData(elem, name, true);
                }
            });
            jQuery.fn.extend({
                data: function (key, value) {
                    var i, name, data, elem = this[0], attrs = elem && elem.attributes;
                    if (key === undefined) {
                        if (this.length) {
                            data = jQuery.data(elem);
                            if (elem.nodeType === 1 && !jQuery._data(elem, 'parsedAttrs')) {
                                i = attrs.length;
                                while (i--) {
                                    name = attrs[i].name;
                                    if (name.indexOf('data-') === 0) {
                                        name = jQuery.camelCase(name.slice(5));
                                        dataAttr(elem, name, data[name]);
                                    }
                                }
                                jQuery._data(elem, 'parsedAttrs', true);
                            }
                        }
                        return data;
                    }
                    if (typeof key === 'object') {
                        return this.each(function () {
                            jQuery.data(this, key);
                        });
                    }
                    return arguments.length > 1 ? this.each(function () {
                        jQuery.data(this, key, value);
                    }) : elem ? dataAttr(elem, key, jQuery.data(elem, key)) : undefined;
                },
                removeData: function (key) {
                    return this.each(function () {
                        jQuery.removeData(this, key);
                    });
                }
            });
            jQuery.extend({
                queue: function (elem, type, data) {
                    var queue;
                    if (elem) {
                        type = (type || 'fx') + 'queue';
                        queue = jQuery._data(elem, type);
                        if (data) {
                            if (!queue || jQuery.isArray(data)) {
                                queue = jQuery._data(elem, type, jQuery.makeArray(data));
                            } else {
                                queue.push(data);
                            }
                        }
                        return queue || [];
                    }
                },
                dequeue: function (elem, type) {
                    type = type || 'fx';
                    var queue = jQuery.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery._queueHooks(elem, type), next = function () {
                            jQuery.dequeue(elem, type);
                        };
                    if (fn === 'inprogress') {
                        fn = queue.shift();
                        startLength--;
                    }
                    if (fn) {
                        if (type === 'fx') {
                            queue.unshift('inprogress');
                        }
                        delete hooks.stop;
                        fn.call(elem, next, hooks);
                    }
                    if (!startLength && hooks) {
                        hooks.empty.fire();
                    }
                },
                _queueHooks: function (elem, type) {
                    var key = type + 'queueHooks';
                    return jQuery._data(elem, key) || jQuery._data(elem, key, {
                        empty: jQuery.Callbacks('once memory').add(function () {
                            jQuery._removeData(elem, type + 'queue');
                            jQuery._removeData(elem, key);
                        })
                    });
                }
            });
            jQuery.fn.extend({
                queue: function (type, data) {
                    var setter = 2;
                    if (typeof type !== 'string') {
                        data = type;
                        type = 'fx';
                        setter--;
                    }
                    if (arguments.length < setter) {
                        return jQuery.queue(this[0], type);
                    }
                    return data === undefined ? this : this.each(function () {
                        var queue = jQuery.queue(this, type, data);
                        jQuery._queueHooks(this, type);
                        if (type === 'fx' && queue[0] !== 'inprogress') {
                            jQuery.dequeue(this, type);
                        }
                    });
                },
                dequeue: function (type) {
                    return this.each(function () {
                        jQuery.dequeue(this, type);
                    });
                },
                clearQueue: function (type) {
                    return this.queue(type || 'fx', []);
                },
                promise: function (type, obj) {
                    var tmp, count = 1, defer = jQuery.Deferred(), elements = this, i = this.length, resolve = function () {
                            if (!--count) {
                                defer.resolveWith(elements, [elements]);
                            }
                        };
                    if (typeof type !== 'string') {
                        obj = type;
                        type = undefined;
                    }
                    type = type || 'fx';
                    while (i--) {
                        tmp = jQuery._data(elements[i], type + 'queueHooks');
                        if (tmp && tmp.empty) {
                            count++;
                            tmp.empty.add(resolve);
                        }
                    }
                    resolve();
                    return defer.promise(obj);
                }
            });
            var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
            var cssExpand = [
                'Top',
                'Right',
                'Bottom',
                'Left'
            ];
            var isHidden = function (elem, el) {
                elem = el || elem;
                return jQuery.css(elem, 'display') === 'none' || !jQuery.contains(elem.ownerDocument, elem);
            };
            var access = jQuery.access = function (elems, fn, key, value, chainable, emptyGet, raw) {
                var i = 0, length = elems.length, bulk = key == null;
                if (jQuery.type(key) === 'object') {
                    chainable = true;
                    for (i in key) {
                        jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
                    }
                } else if (value !== undefined) {
                    chainable = true;
                    if (!jQuery.isFunction(value)) {
                        raw = true;
                    }
                    if (bulk) {
                        if (raw) {
                            fn.call(elems, value);
                            fn = null;
                        } else {
                            bulk = fn;
                            fn = function (elem, key, value) {
                                return bulk.call(jQuery(elem), value);
                            };
                        }
                    }
                    if (fn) {
                        for (; i < length; i++) {
                            fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                        }
                    }
                }
                return chainable ? elems : bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
            };
            var rcheckableType = /^(?:checkbox|radio)$/i;
            (function () {
                var fragment = document.createDocumentFragment(), div = document.createElement('div'), input = document.createElement('input');
                div.setAttribute('className', 't');
                div.innerHTML = '  <link/><table></table><a href=\'/a\'>a</a>';
                support.leadingWhitespace = div.firstChild.nodeType === 3;
                support.tbody = !div.getElementsByTagName('tbody').length;
                support.htmlSerialize = !!div.getElementsByTagName('link').length;
                support.html5Clone = document.createElement('nav').cloneNode(true).outerHTML !== '<:nav></:nav>';
                input.type = 'checkbox';
                input.checked = true;
                fragment.appendChild(input);
                support.appendChecked = input.checked;
                div.innerHTML = '<textarea>x</textarea>';
                support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
                fragment.appendChild(div);
                div.innerHTML = '<input type=\'radio\' checked=\'checked\' name=\'t\'/>';
                support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
                support.noCloneEvent = true;
                if (div.attachEvent) {
                    div.attachEvent('onclick', function () {
                        support.noCloneEvent = false;
                    });
                    div.cloneNode(true).click();
                }
                if (support.deleteExpando == null) {
                    support.deleteExpando = true;
                    try {
                        delete div.test;
                    } catch (e) {
                        support.deleteExpando = false;
                    }
                }
                fragment = div = input = null;
            }());
            (function () {
                var i, eventName, div = document.createElement('div');
                for (i in {
                        submit: true,
                        change: true,
                        focusin: true
                    }) {
                    eventName = 'on' + i;
                    if (!(support[i + 'Bubbles'] = eventName in window)) {
                        div.setAttribute(eventName, 't');
                        support[i + 'Bubbles'] = div.attributes[eventName].expando === false;
                    }
                }
                div = null;
            }());
            var rformElems = /^(?:input|select|textarea)$/i, rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
            function returnTrue() {
                return true;
            }
            function returnFalse() {
                return false;
            }
            function safeActiveElement() {
                try {
                    return document.activeElement;
                } catch (err) {
                }
            }
            jQuery.event = {
                global: {},
                add: function (elem, types, handler, data, selector) {
                    var tmp, events, t, handleObjIn, special, eventHandle, handleObj, handlers, type, namespaces, origType, elemData = jQuery._data(elem);
                    if (!elemData) {
                        return;
                    }
                    if (handler.handler) {
                        handleObjIn = handler;
                        handler = handleObjIn.handler;
                        selector = handleObjIn.selector;
                    }
                    if (!handler.guid) {
                        handler.guid = jQuery.guid++;
                    }
                    if (!(events = elemData.events)) {
                        events = elemData.events = {};
                    }
                    if (!(eventHandle = elemData.handle)) {
                        eventHandle = elemData.handle = function (e) {
                            return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ? jQuery.event.dispatch.apply(eventHandle.elem, arguments) : undefined;
                        };
                        eventHandle.elem = elem;
                    }
                    types = (types || '').match(rnotwhite) || [''];
                    t = types.length;
                    while (t--) {
                        tmp = rtypenamespace.exec(types[t]) || [];
                        type = origType = tmp[1];
                        namespaces = (tmp[2] || '').split('.').sort();
                        if (!type) {
                            continue;
                        }
                        special = jQuery.event.special[type] || {};
                        type = (selector ? special.delegateType : special.bindType) || type;
                        special = jQuery.event.special[type] || {};
                        handleObj = jQuery.extend({
                            type: type,
                            origType: origType,
                            data: data,
                            handler: handler,
                            guid: handler.guid,
                            selector: selector,
                            needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                            namespace: namespaces.join('.')
                        }, handleObjIn);
                        if (!(handlers = events[type])) {
                            handlers = events[type] = [];
                            handlers.delegateCount = 0;
                            if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                                if (elem.addEventListener) {
                                    elem.addEventListener(type, eventHandle, false);
                                } else if (elem.attachEvent) {
                                    elem.attachEvent('on' + type, eventHandle);
                                }
                            }
                        }
                        if (special.add) {
                            special.add.call(elem, handleObj);
                            if (!handleObj.handler.guid) {
                                handleObj.handler.guid = handler.guid;
                            }
                        }
                        if (selector) {
                            handlers.splice(handlers.delegateCount++, 0, handleObj);
                        } else {
                            handlers.push(handleObj);
                        }
                        jQuery.event.global[type] = true;
                    }
                    elem = null;
                },
                remove: function (elem, types, handler, selector, mappedTypes) {
                    var j, handleObj, tmp, origCount, t, events, special, handlers, type, namespaces, origType, elemData = jQuery.hasData(elem) && jQuery._data(elem);
                    if (!elemData || !(events = elemData.events)) {
                        return;
                    }
                    types = (types || '').match(rnotwhite) || [''];
                    t = types.length;
                    while (t--) {
                        tmp = rtypenamespace.exec(types[t]) || [];
                        type = origType = tmp[1];
                        namespaces = (tmp[2] || '').split('.').sort();
                        if (!type) {
                            for (type in events) {
                                jQuery.event.remove(elem, type + types[t], handler, selector, true);
                            }
                            continue;
                        }
                        special = jQuery.event.special[type] || {};
                        type = (selector ? special.delegateType : special.bindType) || type;
                        handlers = events[type] || [];
                        tmp = tmp[2] && new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)');
                        origCount = j = handlers.length;
                        while (j--) {
                            handleObj = handlers[j];
                            if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === '**' && handleObj.selector)) {
                                handlers.splice(j, 1);
                                if (handleObj.selector) {
                                    handlers.delegateCount--;
                                }
                                if (special.remove) {
                                    special.remove.call(elem, handleObj);
                                }
                            }
                        }
                        if (origCount && !handlers.length) {
                            if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                                jQuery.removeEvent(elem, type, elemData.handle);
                            }
                            delete events[type];
                        }
                    }
                    if (jQuery.isEmptyObject(events)) {
                        delete elemData.handle;
                        jQuery._removeData(elem, 'events');
                    }
                },
                trigger: function (event, data, elem, onlyHandlers) {
                    var handle, ontype, cur, bubbleType, special, tmp, i, eventPath = [elem || document], type = hasOwn.call(event, 'type') ? event.type : event, namespaces = hasOwn.call(event, 'namespace') ? event.namespace.split('.') : [];
                    cur = tmp = elem = elem || document;
                    if (elem.nodeType === 3 || elem.nodeType === 8) {
                        return;
                    }
                    if (rfocusMorph.test(type + jQuery.event.triggered)) {
                        return;
                    }
                    if (type.indexOf('.') >= 0) {
                        namespaces = type.split('.');
                        type = namespaces.shift();
                        namespaces.sort();
                    }
                    ontype = type.indexOf(':') < 0 && 'on' + type;
                    event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === 'object' && event);
                    event.isTrigger = onlyHandlers ? 2 : 3;
                    event.namespace = namespaces.join('.');
                    event.namespace_re = event.namespace ? new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)') : null;
                    event.result = undefined;
                    if (!event.target) {
                        event.target = elem;
                    }
                    data = data == null ? [event] : jQuery.makeArray(data, [event]);
                    special = jQuery.event.special[type] || {};
                    if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                        return;
                    }
                    if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                        bubbleType = special.delegateType || type;
                        if (!rfocusMorph.test(bubbleType + type)) {
                            cur = cur.parentNode;
                        }
                        for (; cur; cur = cur.parentNode) {
                            eventPath.push(cur);
                            tmp = cur;
                        }
                        if (tmp === (elem.ownerDocument || document)) {
                            eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                        }
                    }
                    i = 0;
                    while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
                        event.type = i > 1 ? bubbleType : special.bindType || type;
                        handle = (jQuery._data(cur, 'events') || {})[event.type] && jQuery._data(cur, 'handle');
                        if (handle) {
                            handle.apply(cur, data);
                        }
                        handle = ontype && cur[ontype];
                        if (handle && handle.apply && jQuery.acceptData(cur)) {
                            event.result = handle.apply(cur, data);
                            if (event.result === false) {
                                event.preventDefault();
                            }
                        }
                    }
                    event.type = type;
                    if (!onlyHandlers && !event.isDefaultPrevented()) {
                        if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {
                            if (ontype && elem[type] && !jQuery.isWindow(elem)) {
                                tmp = elem[ontype];
                                if (tmp) {
                                    elem[ontype] = null;
                                }
                                jQuery.event.triggered = type;
                                try {
                                    elem[type]();
                                } catch (e) {
                                }
                                jQuery.event.triggered = undefined;
                                if (tmp) {
                                    elem[ontype] = tmp;
                                }
                            }
                        }
                    }
                    return event.result;
                },
                dispatch: function (event) {
                    event = jQuery.event.fix(event);
                    var i, ret, handleObj, matched, j, handlerQueue = [], args = slice.call(arguments), handlers = (jQuery._data(this, 'events') || {})[event.type] || [], special = jQuery.event.special[event.type] || {};
                    args[0] = event;
                    event.delegateTarget = this;
                    if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                        return;
                    }
                    handlerQueue = jQuery.event.handlers.call(this, event, handlers);
                    i = 0;
                    while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                        event.currentTarget = matched.elem;
                        j = 0;
                        while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                            if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
                                event.handleObj = handleObj;
                                event.data = handleObj.data;
                                ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                                if (ret !== undefined) {
                                    if ((event.result = ret) === false) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }
                            }
                        }
                    }
                    if (special.postDispatch) {
                        special.postDispatch.call(this, event);
                    }
                    return event.result;
                },
                handlers: function (event, handlers) {
                    var sel, handleObj, matches, i, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
                    if (delegateCount && cur.nodeType && (!event.button || event.type !== 'click')) {
                        for (; cur != this; cur = cur.parentNode || this) {
                            if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== 'click')) {
                                matches = [];
                                for (i = 0; i < delegateCount; i++) {
                                    handleObj = handlers[i];
                                    sel = handleObj.selector + ' ';
                                    if (matches[sel] === undefined) {
                                        matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
                                    }
                                    if (matches[sel]) {
                                        matches.push(handleObj);
                                    }
                                }
                                if (matches.length) {
                                    handlerQueue.push({
                                        elem: cur,
                                        handlers: matches
                                    });
                                }
                            }
                        }
                    }
                    if (delegateCount < handlers.length) {
                        handlerQueue.push({
                            elem: this,
                            handlers: handlers.slice(delegateCount)
                        });
                    }
                    return handlerQueue;
                },
                fix: function (event) {
                    if (event[jQuery.expando]) {
                        return event;
                    }
                    var i, prop, copy, type = event.type, originalEvent = event, fixHook = this.fixHooks[type];
                    if (!fixHook) {
                        this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
                    }
                    copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
                    event = new jQuery.Event(originalEvent);
                    i = copy.length;
                    while (i--) {
                        prop = copy[i];
                        event[prop] = originalEvent[prop];
                    }
                    if (!event.target) {
                        event.target = originalEvent.srcElement || document;
                    }
                    if (event.target.nodeType === 3) {
                        event.target = event.target.parentNode;
                    }
                    event.metaKey = !!event.metaKey;
                    return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
                },
                props: 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' '),
                fixHooks: {},
                keyHooks: {
                    props: 'char charCode key keyCode'.split(' '),
                    filter: function (event, original) {
                        if (event.which == null) {
                            event.which = original.charCode != null ? original.charCode : original.keyCode;
                        }
                        return event;
                    }
                },
                mouseHooks: {
                    props: 'button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '),
                    filter: function (event, original) {
                        var body, eventDoc, doc, button = original.button, fromElement = original.fromElement;
                        if (event.pageX == null && original.clientX != null) {
                            eventDoc = event.target.ownerDocument || document;
                            doc = eventDoc.documentElement;
                            body = eventDoc.body;
                            event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                            event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                        }
                        if (!event.relatedTarget && fromElement) {
                            event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                        }
                        if (!event.which && button !== undefined) {
                            event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
                        }
                        return event;
                    }
                },
                special: {
                    load: { noBubble: true },
                    focus: {
                        trigger: function () {
                            if (this !== safeActiveElement() && this.focus) {
                                try {
                                    this.focus();
                                    return false;
                                } catch (e) {
                                }
                            }
                        },
                        delegateType: 'focusin'
                    },
                    blur: {
                        trigger: function () {
                            if (this === safeActiveElement() && this.blur) {
                                this.blur();
                                return false;
                            }
                        },
                        delegateType: 'focusout'
                    },
                    click: {
                        trigger: function () {
                            if (jQuery.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                                this.click();
                                return false;
                            }
                        },
                        _default: function (event) {
                            return jQuery.nodeName(event.target, 'a');
                        }
                    },
                    beforeunload: {
                        postDispatch: function (event) {
                            if (event.result !== undefined) {
                                event.originalEvent.returnValue = event.result;
                            }
                        }
                    }
                },
                simulate: function (type, elem, event, bubble) {
                    var e = jQuery.extend(new jQuery.Event(), event, {
                        type: type,
                        isSimulated: true,
                        originalEvent: {}
                    });
                    if (bubble) {
                        jQuery.event.trigger(e, null, elem);
                    } else {
                        jQuery.event.dispatch.call(elem, e);
                    }
                    if (e.isDefaultPrevented()) {
                        event.preventDefault();
                    }
                }
            };
            jQuery.removeEvent = document.removeEventListener ? function (elem, type, handle) {
                if (elem.removeEventListener) {
                    elem.removeEventListener(type, handle, false);
                }
            } : function (elem, type, handle) {
                var name = 'on' + type;
                if (elem.detachEvent) {
                    if (typeof elem[name] === strundefined) {
                        elem[name] = null;
                    }
                    elem.detachEvent(name, handle);
                }
            };
            jQuery.Event = function (src, props) {
                if (!(this instanceof jQuery.Event)) {
                    return new jQuery.Event(src, props);
                }
                if (src && src.type) {
                    this.originalEvent = src;
                    this.type = src.type;
                    this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && (src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;
                } else {
                    this.type = src;
                }
                if (props) {
                    jQuery.extend(this, props);
                }
                this.timeStamp = src && src.timeStamp || jQuery.now();
                this[jQuery.expando] = true;
            };
            jQuery.Event.prototype = {
                isDefaultPrevented: returnFalse,
                isPropagationStopped: returnFalse,
                isImmediatePropagationStopped: returnFalse,
                preventDefault: function () {
                    var e = this.originalEvent;
                    this.isDefaultPrevented = returnTrue;
                    if (!e) {
                        return;
                    }
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                },
                stopPropagation: function () {
                    var e = this.originalEvent;
                    this.isPropagationStopped = returnTrue;
                    if (!e) {
                        return;
                    }
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.cancelBubble = true;
                },
                stopImmediatePropagation: function () {
                    this.isImmediatePropagationStopped = returnTrue;
                    this.stopPropagation();
                }
            };
            jQuery.each({
                mouseenter: 'mouseover',
                mouseleave: 'mouseout'
            }, function (orig, fix) {
                jQuery.event.special[orig] = {
                    delegateType: fix,
                    bindType: fix,
                    handle: function (event) {
                        var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                        if (!related || related !== target && !jQuery.contains(target, related)) {
                            event.type = handleObj.origType;
                            ret = handleObj.handler.apply(this, arguments);
                            event.type = fix;
                        }
                        return ret;
                    }
                };
            });
            if (!support.submitBubbles) {
                jQuery.event.special.submit = {
                    setup: function () {
                        if (jQuery.nodeName(this, 'form')) {
                            return false;
                        }
                        jQuery.event.add(this, 'click._submit keypress._submit', function (e) {
                            var elem = e.target, form = jQuery.nodeName(elem, 'input') || jQuery.nodeName(elem, 'button') ? elem.form : undefined;
                            if (form && !jQuery._data(form, 'submitBubbles')) {
                                jQuery.event.add(form, 'submit._submit', function (event) {
                                    event._submit_bubble = true;
                                });
                                jQuery._data(form, 'submitBubbles', true);
                            }
                        });
                    },
                    postDispatch: function (event) {
                        if (event._submit_bubble) {
                            delete event._submit_bubble;
                            if (this.parentNode && !event.isTrigger) {
                                jQuery.event.simulate('submit', this.parentNode, event, true);
                            }
                        }
                    },
                    teardown: function () {
                        if (jQuery.nodeName(this, 'form')) {
                            return false;
                        }
                        jQuery.event.remove(this, '._submit');
                    }
                };
            }
            if (!support.changeBubbles) {
                jQuery.event.special.change = {
                    setup: function () {
                        if (rformElems.test(this.nodeName)) {
                            if (this.type === 'checkbox' || this.type === 'radio') {
                                jQuery.event.add(this, 'propertychange._change', function (event) {
                                    if (event.originalEvent.propertyName === 'checked') {
                                        this._just_changed = true;
                                    }
                                });
                                jQuery.event.add(this, 'click._change', function (event) {
                                    if (this._just_changed && !event.isTrigger) {
                                        this._just_changed = false;
                                    }
                                    jQuery.event.simulate('change', this, event, true);
                                });
                            }
                            return false;
                        }
                        jQuery.event.add(this, 'beforeactivate._change', function (e) {
                            var elem = e.target;
                            if (rformElems.test(elem.nodeName) && !jQuery._data(elem, 'changeBubbles')) {
                                jQuery.event.add(elem, 'change._change', function (event) {
                                    if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                        jQuery.event.simulate('change', this.parentNode, event, true);
                                    }
                                });
                                jQuery._data(elem, 'changeBubbles', true);
                            }
                        });
                    },
                    handle: function (event) {
                        var elem = event.target;
                        if (this !== elem || event.isSimulated || event.isTrigger || elem.type !== 'radio' && elem.type !== 'checkbox') {
                            return event.handleObj.handler.apply(this, arguments);
                        }
                    },
                    teardown: function () {
                        jQuery.event.remove(this, '._change');
                        return !rformElems.test(this.nodeName);
                    }
                };
            }
            if (!support.focusinBubbles) {
                jQuery.each({
                    focus: 'focusin',
                    blur: 'focusout'
                }, function (orig, fix) {
                    var handler = function (event) {
                        jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
                    };
                    jQuery.event.special[fix] = {
                        setup: function () {
                            var doc = this.ownerDocument || this, attaches = jQuery._data(doc, fix);
                            if (!attaches) {
                                doc.addEventListener(orig, handler, true);
                            }
                            jQuery._data(doc, fix, (attaches || 0) + 1);
                        },
                        teardown: function () {
                            var doc = this.ownerDocument || this, attaches = jQuery._data(doc, fix) - 1;
                            if (!attaches) {
                                doc.removeEventListener(orig, handler, true);
                                jQuery._removeData(doc, fix);
                            } else {
                                jQuery._data(doc, fix, attaches);
                            }
                        }
                    };
                });
            }
            jQuery.fn.extend({
                on: function (types, selector, data, fn, one) {
                    var type, origFn;
                    if (typeof types === 'object') {
                        if (typeof selector !== 'string') {
                            data = data || selector;
                            selector = undefined;
                        }
                        for (type in types) {
                            this.on(type, selector, data, types[type], one);
                        }
                        return this;
                    }
                    if (data == null && fn == null) {
                        fn = selector;
                        data = selector = undefined;
                    } else if (fn == null) {
                        if (typeof selector === 'string') {
                            fn = data;
                            data = undefined;
                        } else {
                            fn = data;
                            data = selector;
                            selector = undefined;
                        }
                    }
                    if (fn === false) {
                        fn = returnFalse;
                    } else if (!fn) {
                        return this;
                    }
                    if (one === 1) {
                        origFn = fn;
                        fn = function (event) {
                            jQuery().off(event);
                            return origFn.apply(this, arguments);
                        };
                        fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
                    }
                    return this.each(function () {
                        jQuery.event.add(this, types, fn, data, selector);
                    });
                },
                one: function (types, selector, data, fn) {
                    return this.on(types, selector, data, fn, 1);
                },
                off: function (types, selector, fn) {
                    var handleObj, type;
                    if (types && types.preventDefault && types.handleObj) {
                        handleObj = types.handleObj;
                        jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + '.' + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                        return this;
                    }
                    if (typeof types === 'object') {
                        for (type in types) {
                            this.off(type, selector, types[type]);
                        }
                        return this;
                    }
                    if (selector === false || typeof selector === 'function') {
                        fn = selector;
                        selector = undefined;
                    }
                    if (fn === false) {
                        fn = returnFalse;
                    }
                    return this.each(function () {
                        jQuery.event.remove(this, types, fn, selector);
                    });
                },
                trigger: function (type, data) {
                    return this.each(function () {
                        jQuery.event.trigger(type, data, this);
                    });
                },
                triggerHandler: function (type, data) {
                    var elem = this[0];
                    if (elem) {
                        return jQuery.event.trigger(type, data, elem, true);
                    }
                }
            });
            function createSafeFragment(document) {
                var list = nodeNames.split('|'), safeFrag = document.createDocumentFragment();
                if (safeFrag.createElement) {
                    while (list.length) {
                        safeFrag.createElement(list.pop());
                    }
                }
                return safeFrag;
            }
            var nodeNames = 'abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|' + 'header|hgroup|mark|meter|nav|output|progress|section|summary|time|video', rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g, rnoshimcache = new RegExp('<(?:' + nodeNames + ')[\\s/>]', 'i'), rleadingWhitespace = /^\s+/, rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rtbody = /<tbody/i, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /^$|\/(?:java|ecma)script/i, rscriptTypeMasked = /^true\/(.*)/, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, wrapMap = {
                    option: [
                        1,
                        '<select multiple=\'multiple\'>',
                        '</select>'
                    ],
                    legend: [
                        1,
                        '<fieldset>',
                        '</fieldset>'
                    ],
                    area: [
                        1,
                        '<map>',
                        '</map>'
                    ],
                    param: [
                        1,
                        '<object>',
                        '</object>'
                    ],
                    thead: [
                        1,
                        '<table>',
                        '</table>'
                    ],
                    tr: [
                        2,
                        '<table><tbody>',
                        '</tbody></table>'
                    ],
                    col: [
                        2,
                        '<table><tbody></tbody><colgroup>',
                        '</colgroup></table>'
                    ],
                    td: [
                        3,
                        '<table><tbody><tr>',
                        '</tr></tbody></table>'
                    ],
                    _default: support.htmlSerialize ? [
                        0,
                        '',
                        ''
                    ] : [
                        1,
                        'X<div>',
                        '</div>'
                    ]
                }, safeFragment = createSafeFragment(document), fragmentDiv = safeFragment.appendChild(document.createElement('div'));
            wrapMap.optgroup = wrapMap.option;
            wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
            wrapMap.th = wrapMap.td;
            function getAll(context, tag) {
                var elems, elem, i = 0, found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName(tag || '*') : typeof context.querySelectorAll !== strundefined ? context.querySelectorAll(tag || '*') : undefined;
                if (!found) {
                    for (found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++) {
                        if (!tag || jQuery.nodeName(elem, tag)) {
                            found.push(elem);
                        } else {
                            jQuery.merge(found, getAll(elem, tag));
                        }
                    }
                }
                return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], found) : found;
            }
            function fixDefaultChecked(elem) {
                if (rcheckableType.test(elem.type)) {
                    elem.defaultChecked = elem.checked;
                }
            }
            function manipulationTarget(elem, content) {
                return jQuery.nodeName(elem, 'table') && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, 'tr') ? elem.getElementsByTagName('tbody')[0] || elem.appendChild(elem.ownerDocument.createElement('tbody')) : elem;
            }
            function disableScript(elem) {
                elem.type = (jQuery.find.attr(elem, 'type') !== null) + '/' + elem.type;
                return elem;
            }
            function restoreScript(elem) {
                var match = rscriptTypeMasked.exec(elem.type);
                if (match) {
                    elem.type = match[1];
                } else {
                    elem.removeAttribute('type');
                }
                return elem;
            }
            function setGlobalEval(elems, refElements) {
                var elem, i = 0;
                for (; (elem = elems[i]) != null; i++) {
                    jQuery._data(elem, 'globalEval', !refElements || jQuery._data(refElements[i], 'globalEval'));
                }
            }
            function cloneCopyEvent(src, dest) {
                if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
                    return;
                }
                var type, i, l, oldData = jQuery._data(src), curData = jQuery._data(dest, oldData), events = oldData.events;
                if (events) {
                    delete curData.handle;
                    curData.events = {};
                    for (type in events) {
                        for (i = 0, l = events[type].length; i < l; i++) {
                            jQuery.event.add(dest, type, events[type][i]);
                        }
                    }
                }
                if (curData.data) {
                    curData.data = jQuery.extend({}, curData.data);
                }
            }
            function fixCloneNodeIssues(src, dest) {
                var nodeName, e, data;
                if (dest.nodeType !== 1) {
                    return;
                }
                nodeName = dest.nodeName.toLowerCase();
                if (!support.noCloneEvent && dest[jQuery.expando]) {
                    data = jQuery._data(dest);
                    for (e in data.events) {
                        jQuery.removeEvent(dest, e, data.handle);
                    }
                    dest.removeAttribute(jQuery.expando);
                }
                if (nodeName === 'script' && dest.text !== src.text) {
                    disableScript(dest).text = src.text;
                    restoreScript(dest);
                } else if (nodeName === 'object') {
                    if (dest.parentNode) {
                        dest.outerHTML = src.outerHTML;
                    }
                    if (support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML))) {
                        dest.innerHTML = src.innerHTML;
                    }
                } else if (nodeName === 'input' && rcheckableType.test(src.type)) {
                    dest.defaultChecked = dest.checked = src.checked;
                    if (dest.value !== src.value) {
                        dest.value = src.value;
                    }
                } else if (nodeName === 'option') {
                    dest.defaultSelected = dest.selected = src.defaultSelected;
                } else if (nodeName === 'input' || nodeName === 'textarea') {
                    dest.defaultValue = src.defaultValue;
                }
            }
            jQuery.extend({
                clone: function (elem, dataAndEvents, deepDataAndEvents) {
                    var destElements, node, clone, i, srcElements, inPage = jQuery.contains(elem.ownerDocument, elem);
                    if (support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test('<' + elem.nodeName + '>')) {
                        clone = elem.cloneNode(true);
                    } else {
                        fragmentDiv.innerHTML = elem.outerHTML;
                        fragmentDiv.removeChild(clone = fragmentDiv.firstChild);
                    }
                    if ((!support.noCloneEvent || !support.noCloneChecked) && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                        destElements = getAll(clone);
                        srcElements = getAll(elem);
                        for (i = 0; (node = srcElements[i]) != null; ++i) {
                            if (destElements[i]) {
                                fixCloneNodeIssues(node, destElements[i]);
                            }
                        }
                    }
                    if (dataAndEvents) {
                        if (deepDataAndEvents) {
                            srcElements = srcElements || getAll(elem);
                            destElements = destElements || getAll(clone);
                            for (i = 0; (node = srcElements[i]) != null; i++) {
                                cloneCopyEvent(node, destElements[i]);
                            }
                        } else {
                            cloneCopyEvent(elem, clone);
                        }
                    }
                    destElements = getAll(clone, 'script');
                    if (destElements.length > 0) {
                        setGlobalEval(destElements, !inPage && getAll(elem, 'script'));
                    }
                    destElements = srcElements = node = null;
                    return clone;
                },
                buildFragment: function (elems, context, scripts, selection) {
                    var j, elem, contains, tmp, tag, tbody, wrap, l = elems.length, safe = createSafeFragment(context), nodes = [], i = 0;
                    for (; i < l; i++) {
                        elem = elems[i];
                        if (elem || elem === 0) {
                            if (jQuery.type(elem) === 'object') {
                                jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
                            } else if (!rhtml.test(elem)) {
                                nodes.push(context.createTextNode(elem));
                            } else {
                                tmp = tmp || safe.appendChild(context.createElement('div'));
                                tag = (rtagName.exec(elem) || [
                                    '',
                                    ''
                                ])[1].toLowerCase();
                                wrap = wrapMap[tag] || wrapMap._default;
                                tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, '<$1></$2>') + wrap[2];
                                j = wrap[0];
                                while (j--) {
                                    tmp = tmp.lastChild;
                                }
                                if (!support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                                    nodes.push(context.createTextNode(rleadingWhitespace.exec(elem)[0]));
                                }
                                if (!support.tbody) {
                                    elem = tag === 'table' && !rtbody.test(elem) ? tmp.firstChild : wrap[1] === '<table>' && !rtbody.test(elem) ? tmp : 0;
                                    j = elem && elem.childNodes.length;
                                    while (j--) {
                                        if (jQuery.nodeName(tbody = elem.childNodes[j], 'tbody') && !tbody.childNodes.length) {
                                            elem.removeChild(tbody);
                                        }
                                    }
                                }
                                jQuery.merge(nodes, tmp.childNodes);
                                tmp.textContent = '';
                                while (tmp.firstChild) {
                                    tmp.removeChild(tmp.firstChild);
                                }
                                tmp = safe.lastChild;
                            }
                        }
                    }
                    if (tmp) {
                        safe.removeChild(tmp);
                    }
                    if (!support.appendChecked) {
                        jQuery.grep(getAll(nodes, 'input'), fixDefaultChecked);
                    }
                    i = 0;
                    while (elem = nodes[i++]) {
                        if (selection && jQuery.inArray(elem, selection) !== -1) {
                            continue;
                        }
                        contains = jQuery.contains(elem.ownerDocument, elem);
                        tmp = getAll(safe.appendChild(elem), 'script');
                        if (contains) {
                            setGlobalEval(tmp);
                        }
                        if (scripts) {
                            j = 0;
                            while (elem = tmp[j++]) {
                                if (rscriptType.test(elem.type || '')) {
                                    scripts.push(elem);
                                }
                            }
                        }
                    }
                    tmp = null;
                    return safe;
                },
                cleanData: function (elems, acceptData) {
                    var elem, type, id, data, i = 0, internalKey = jQuery.expando, cache = jQuery.cache, deleteExpando = support.deleteExpando, special = jQuery.event.special;
                    for (; (elem = elems[i]) != null; i++) {
                        if (acceptData || jQuery.acceptData(elem)) {
                            id = elem[internalKey];
                            data = id && cache[id];
                            if (data) {
                                if (data.events) {
                                    for (type in data.events) {
                                        if (special[type]) {
                                            jQuery.event.remove(elem, type);
                                        } else {
                                            jQuery.removeEvent(elem, type, data.handle);
                                        }
                                    }
                                }
                                if (cache[id]) {
                                    delete cache[id];
                                    if (deleteExpando) {
                                        delete elem[internalKey];
                                    } else if (typeof elem.removeAttribute !== strundefined) {
                                        elem.removeAttribute(internalKey);
                                    } else {
                                        elem[internalKey] = null;
                                    }
                                    deletedIds.push(id);
                                }
                            }
                        }
                    }
                }
            });
            jQuery.fn.extend({
                text: function (value) {
                    return access(this, function (value) {
                        return value === undefined ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
                    }, null, value, arguments.length);
                },
                append: function () {
                    return this.domManip(arguments, function (elem) {
                        if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                            var target = manipulationTarget(this, elem);
                            target.appendChild(elem);
                        }
                    });
                },
                prepend: function () {
                    return this.domManip(arguments, function (elem) {
                        if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                            var target = manipulationTarget(this, elem);
                            target.insertBefore(elem, target.firstChild);
                        }
                    });
                },
                before: function () {
                    return this.domManip(arguments, function (elem) {
                        if (this.parentNode) {
                            this.parentNode.insertBefore(elem, this);
                        }
                    });
                },
                after: function () {
                    return this.domManip(arguments, function (elem) {
                        if (this.parentNode) {
                            this.parentNode.insertBefore(elem, this.nextSibling);
                        }
                    });
                },
                remove: function (selector, keepData) {
                    var elem, elems = selector ? jQuery.filter(selector, this) : this, i = 0;
                    for (; (elem = elems[i]) != null; i++) {
                        if (!keepData && elem.nodeType === 1) {
                            jQuery.cleanData(getAll(elem));
                        }
                        if (elem.parentNode) {
                            if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
                                setGlobalEval(getAll(elem, 'script'));
                            }
                            elem.parentNode.removeChild(elem);
                        }
                    }
                    return this;
                },
                empty: function () {
                    var elem, i = 0;
                    for (; (elem = this[i]) != null; i++) {
                        if (elem.nodeType === 1) {
                            jQuery.cleanData(getAll(elem, false));
                        }
                        while (elem.firstChild) {
                            elem.removeChild(elem.firstChild);
                        }
                        if (elem.options && jQuery.nodeName(elem, 'select')) {
                            elem.options.length = 0;
                        }
                    }
                    return this;
                },
                clone: function (dataAndEvents, deepDataAndEvents) {
                    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
                    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
                    return this.map(function () {
                        return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
                    });
                },
                html: function (value) {
                    return access(this, function (value) {
                        var elem = this[0] || {}, i = 0, l = this.length;
                        if (value === undefined) {
                            return elem.nodeType === 1 ? elem.innerHTML.replace(rinlinejQuery, '') : undefined;
                        }
                        if (typeof value === 'string' && !rnoInnerhtml.test(value) && (support.htmlSerialize || !rnoshimcache.test(value)) && (support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || [
                                '',
                                ''
                            ])[1].toLowerCase()]) {
                            value = value.replace(rxhtmlTag, '<$1></$2>');
                            try {
                                for (; i < l; i++) {
                                    elem = this[i] || {};
                                    if (elem.nodeType === 1) {
                                        jQuery.cleanData(getAll(elem, false));
                                        elem.innerHTML = value;
                                    }
                                }
                                elem = 0;
                            } catch (e) {
                            }
                        }
                        if (elem) {
                            this.empty().append(value);
                        }
                    }, null, value, arguments.length);
                },
                replaceWith: function () {
                    var arg = arguments[0];
                    this.domManip(arguments, function (elem) {
                        arg = this.parentNode;
                        jQuery.cleanData(getAll(this));
                        if (arg) {
                            arg.replaceChild(elem, this);
                        }
                    });
                    return arg && (arg.length || arg.nodeType) ? this : this.remove();
                },
                detach: function (selector) {
                    return this.remove(selector, true);
                },
                domManip: function (args, callback) {
                    args = concat.apply([], args);
                    var first, node, hasScripts, scripts, doc, fragment, i = 0, l = this.length, set = this, iNoClone = l - 1, value = args[0], isFunction = jQuery.isFunction(value);
                    if (isFunction || l > 1 && typeof value === 'string' && !support.checkClone && rchecked.test(value)) {
                        return this.each(function (index) {
                            var self = set.eq(index);
                            if (isFunction) {
                                args[0] = value.call(this, index, self.html());
                            }
                            self.domManip(args, callback);
                        });
                    }
                    if (l) {
                        fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
                        first = fragment.firstChild;
                        if (fragment.childNodes.length === 1) {
                            fragment = first;
                        }
                        if (first) {
                            scripts = jQuery.map(getAll(fragment, 'script'), disableScript);
                            hasScripts = scripts.length;
                            for (; i < l; i++) {
                                node = fragment;
                                if (i !== iNoClone) {
                                    node = jQuery.clone(node, true, true);
                                    if (hasScripts) {
                                        jQuery.merge(scripts, getAll(node, 'script'));
                                    }
                                }
                                callback.call(this[i], node, i);
                            }
                            if (hasScripts) {
                                doc = scripts[scripts.length - 1].ownerDocument;
                                jQuery.map(scripts, restoreScript);
                                for (i = 0; i < hasScripts; i++) {
                                    node = scripts[i];
                                    if (rscriptType.test(node.type || '') && !jQuery._data(node, 'globalEval') && jQuery.contains(doc, node)) {
                                        if (node.src) {
                                            if (jQuery._evalUrl) {
                                                jQuery._evalUrl(node.src);
                                            }
                                        } else {
                                            jQuery.globalEval((node.text || node.textContent || node.innerHTML || '').replace(rcleanScript, ''));
                                        }
                                    }
                                }
                            }
                            fragment = first = null;
                        }
                    }
                    return this;
                }
            });
            jQuery.each({
                appendTo: 'append',
                prependTo: 'prepend',
                insertBefore: 'before',
                insertAfter: 'after',
                replaceAll: 'replaceWith'
            }, function (name, original) {
                jQuery.fn[name] = function (selector) {
                    var elems, i = 0, ret = [], insert = jQuery(selector), last = insert.length - 1;
                    for (; i <= last; i++) {
                        elems = i === last ? this : this.clone(true);
                        jQuery(insert[i])[original](elems);
                        push.apply(ret, elems.get());
                    }
                    return this.pushStack(ret);
                };
            });
            var iframe, elemdisplay = {};
            function actualDisplay(name, doc) {
                var elem = jQuery(doc.createElement(name)).appendTo(doc.body), display = window.getDefaultComputedStyle ? window.getDefaultComputedStyle(elem[0]).display : jQuery.css(elem[0], 'display');
                elem.detach();
                return display;
            }
            function defaultDisplay(nodeName) {
                var doc = document, display = elemdisplay[nodeName];
                if (!display) {
                    display = actualDisplay(nodeName, doc);
                    if (display === 'none' || !display) {
                        iframe = (iframe || jQuery('<iframe frameborder=\'0\' width=\'0\' height=\'0\'/>')).appendTo(doc.documentElement);
                        doc = (iframe[0].contentWindow || iframe[0].contentDocument).document;
                        doc.write();
                        doc.close();
                        display = actualDisplay(nodeName, doc);
                        iframe.detach();
                    }
                    elemdisplay[nodeName] = display;
                }
                return display;
            }
            (function () {
                var a, shrinkWrapBlocksVal, div = document.createElement('div'), divReset = '-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;' + 'display:block;padding:0;margin:0;border:0';
                div.innerHTML = '  <link/><table></table><a href=\'/a\'>a</a><input type=\'checkbox\'/>';
                a = div.getElementsByTagName('a')[0];
                a.style.cssText = 'float:left;opacity:.5';
                support.opacity = /^0.5/.test(a.style.opacity);
                support.cssFloat = !!a.style.cssFloat;
                div.style.backgroundClip = 'content-box';
                div.cloneNode(true).style.backgroundClip = '';
                support.clearCloneStyle = div.style.backgroundClip === 'content-box';
                a = div = null;
                support.shrinkWrapBlocks = function () {
                    var body, container, div, containerStyles;
                    if (shrinkWrapBlocksVal == null) {
                        body = document.getElementsByTagName('body')[0];
                        if (!body) {
                            return;
                        }
                        containerStyles = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px';
                        container = document.createElement('div');
                        div = document.createElement('div');
                        body.appendChild(container).appendChild(div);
                        shrinkWrapBlocksVal = false;
                        if (typeof div.style.zoom !== strundefined) {
                            div.style.cssText = divReset + ';width:1px;padding:1px;zoom:1';
                            div.innerHTML = '<div></div>';
                            div.firstChild.style.width = '5px';
                            shrinkWrapBlocksVal = div.offsetWidth !== 3;
                        }
                        body.removeChild(container);
                        body = container = div = null;
                    }
                    return shrinkWrapBlocksVal;
                };
            }());
            var rmargin = /^margin/;
            var rnumnonpx = new RegExp('^(' + pnum + ')(?!px)[a-z%]+$', 'i');
            var getStyles, curCSS, rposition = /^(top|right|bottom|left)$/;
            if (window.getComputedStyle) {
                getStyles = function (elem) {
                    return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
                };
                curCSS = function (elem, name, computed) {
                    var width, minWidth, maxWidth, ret, style = elem.style;
                    computed = computed || getStyles(elem);
                    ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined;
                    if (computed) {
                        if (ret === '' && !jQuery.contains(elem.ownerDocument, elem)) {
                            ret = jQuery.style(elem, name);
                        }
                        if (rnumnonpx.test(ret) && rmargin.test(name)) {
                            width = style.width;
                            minWidth = style.minWidth;
                            maxWidth = style.maxWidth;
                            style.minWidth = style.maxWidth = style.width = ret;
                            ret = computed.width;
                            style.width = width;
                            style.minWidth = minWidth;
                            style.maxWidth = maxWidth;
                        }
                    }
                    return ret === undefined ? ret : ret + '';
                };
            } else if (document.documentElement.currentStyle) {
                getStyles = function (elem) {
                    return elem.currentStyle;
                };
                curCSS = function (elem, name, computed) {
                    var left, rs, rsLeft, ret, style = elem.style;
                    computed = computed || getStyles(elem);
                    ret = computed ? computed[name] : undefined;
                    if (ret == null && style && style[name]) {
                        ret = style[name];
                    }
                    if (rnumnonpx.test(ret) && !rposition.test(name)) {
                        left = style.left;
                        rs = elem.runtimeStyle;
                        rsLeft = rs && rs.left;
                        if (rsLeft) {
                            rs.left = elem.currentStyle.left;
                        }
                        style.left = name === 'fontSize' ? '1em' : ret;
                        ret = style.pixelLeft + 'px';
                        style.left = left;
                        if (rsLeft) {
                            rs.left = rsLeft;
                        }
                    }
                    return ret === undefined ? ret : ret + '' || 'auto';
                };
            }
            function addGetHookIf(conditionFn, hookFn) {
                return {
                    get: function () {
                        var condition = conditionFn();
                        if (condition == null) {
                            return;
                        }
                        if (condition) {
                            delete this.get;
                            return;
                        }
                        return (this.get = hookFn).apply(this, arguments);
                    }
                };
            }
            (function () {
                var a, reliableHiddenOffsetsVal, boxSizingVal, boxSizingReliableVal, pixelPositionVal, reliableMarginRightVal, div = document.createElement('div'), containerStyles = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px', divReset = '-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;' + 'display:block;padding:0;margin:0;border:0';
                div.innerHTML = '  <link/><table></table><a href=\'/a\'>a</a><input type=\'checkbox\'/>';
                a = div.getElementsByTagName('a')[0];
                a.style.cssText = 'float:left;opacity:.5';
                support.opacity = /^0.5/.test(a.style.opacity);
                support.cssFloat = !!a.style.cssFloat;
                div.style.backgroundClip = 'content-box';
                div.cloneNode(true).style.backgroundClip = '';
                support.clearCloneStyle = div.style.backgroundClip === 'content-box';
                a = div = null;
                jQuery.extend(support, {
                    reliableHiddenOffsets: function () {
                        if (reliableHiddenOffsetsVal != null) {
                            return reliableHiddenOffsetsVal;
                        }
                        var container, tds, isSupported, div = document.createElement('div'), body = document.getElementsByTagName('body')[0];
                        if (!body) {
                            return;
                        }
                        div.setAttribute('className', 't');
                        div.innerHTML = '  <link/><table></table><a href=\'/a\'>a</a><input type=\'checkbox\'/>';
                        container = document.createElement('div');
                        container.style.cssText = containerStyles;
                        body.appendChild(container).appendChild(div);
                        div.innerHTML = '<table><tr><td></td><td>t</td></tr></table>';
                        tds = div.getElementsByTagName('td');
                        tds[0].style.cssText = 'padding:0;margin:0;border:0;display:none';
                        isSupported = tds[0].offsetHeight === 0;
                        tds[0].style.display = '';
                        tds[1].style.display = 'none';
                        reliableHiddenOffsetsVal = isSupported && tds[0].offsetHeight === 0;
                        body.removeChild(container);
                        div = body = null;
                        return reliableHiddenOffsetsVal;
                    },
                    boxSizing: function () {
                        if (boxSizingVal == null) {
                            computeStyleTests();
                        }
                        return boxSizingVal;
                    },
                    boxSizingReliable: function () {
                        if (boxSizingReliableVal == null) {
                            computeStyleTests();
                        }
                        return boxSizingReliableVal;
                    },
                    pixelPosition: function () {
                        if (pixelPositionVal == null) {
                            computeStyleTests();
                        }
                        return pixelPositionVal;
                    },
                    reliableMarginRight: function () {
                        var body, container, div, marginDiv;
                        if (reliableMarginRightVal == null && window.getComputedStyle) {
                            body = document.getElementsByTagName('body')[0];
                            if (!body) {
                                return;
                            }
                            container = document.createElement('div');
                            div = document.createElement('div');
                            container.style.cssText = containerStyles;
                            body.appendChild(container).appendChild(div);
                            marginDiv = div.appendChild(document.createElement('div'));
                            marginDiv.style.cssText = div.style.cssText = divReset;
                            marginDiv.style.marginRight = marginDiv.style.width = '0';
                            div.style.width = '1px';
                            reliableMarginRightVal = !parseFloat((window.getComputedStyle(marginDiv, null) || {}).marginRight);
                            body.removeChild(container);
                        }
                        return reliableMarginRightVal;
                    }
                });
                function computeStyleTests() {
                    var container, div, body = document.getElementsByTagName('body')[0];
                    if (!body) {
                        return;
                    }
                    container = document.createElement('div');
                    div = document.createElement('div');
                    container.style.cssText = containerStyles;
                    body.appendChild(container).appendChild(div);
                    div.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;' + 'position:absolute;display:block;padding:1px;border:1px;width:4px;' + 'margin-top:1%;top:1%';
                    jQuery.swap(body, body.style.zoom != null ? { zoom: 1 } : {}, function () {
                        boxSizingVal = div.offsetWidth === 4;
                    });
                    boxSizingReliableVal = true;
                    pixelPositionVal = false;
                    reliableMarginRightVal = true;
                    if (window.getComputedStyle) {
                        pixelPositionVal = (window.getComputedStyle(div, null) || {}).top !== '1%';
                        boxSizingReliableVal = (window.getComputedStyle(div, null) || { width: '4px' }).width === '4px';
                    }
                    body.removeChild(container);
                    div = body = null;
                }
            }());
            jQuery.swap = function (elem, options, callback, args) {
                var ret, name, old = {};
                for (name in options) {
                    old[name] = elem.style[name];
                    elem.style[name] = options[name];
                }
                ret = callback.apply(elem, args || []);
                for (name in options) {
                    elem.style[name] = old[name];
                }
                return ret;
            };
            var ralpha = /alpha\([^)]*\)/i, ropacity = /opacity\s*=\s*([^)]*)/, rdisplayswap = /^(none|table(?!-c[ea]).+)/, rnumsplit = new RegExp('^(' + pnum + ')(.*)$', 'i'), rrelNum = new RegExp('^([+-])=(' + pnum + ')', 'i'), cssShow = {
                    position: 'absolute',
                    visibility: 'hidden',
                    display: 'block'
                }, cssNormalTransform = {
                    letterSpacing: 0,
                    fontWeight: 400
                }, cssPrefixes = [
                    'Webkit',
                    'O',
                    'Moz',
                    'ms'
                ];
            function vendorPropName(style, name) {
                if (name in style) {
                    return name;
                }
                var capName = name.charAt(0).toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length;
                while (i--) {
                    name = cssPrefixes[i] + capName;
                    if (name in style) {
                        return name;
                    }
                }
                return origName;
            }
            function showHide(elements, show) {
                var display, elem, hidden, values = [], index = 0, length = elements.length;
                for (; index < length; index++) {
                    elem = elements[index];
                    if (!elem.style) {
                        continue;
                    }
                    values[index] = jQuery._data(elem, 'olddisplay');
                    display = elem.style.display;
                    if (show) {
                        if (!values[index] && display === 'none') {
                            elem.style.display = '';
                        }
                        if (elem.style.display === '' && isHidden(elem)) {
                            values[index] = jQuery._data(elem, 'olddisplay', defaultDisplay(elem.nodeName));
                        }
                    } else {
                        if (!values[index]) {
                            hidden = isHidden(elem);
                            if (display && display !== 'none' || !hidden) {
                                jQuery._data(elem, 'olddisplay', hidden ? display : jQuery.css(elem, 'display'));
                            }
                        }
                    }
                }
                for (index = 0; index < length; index++) {
                    elem = elements[index];
                    if (!elem.style) {
                        continue;
                    }
                    if (!show || elem.style.display === 'none' || elem.style.display === '') {
                        elem.style.display = show ? values[index] || '' : 'none';
                    }
                }
                return elements;
            }
            function setPositiveNumber(elem, value, subtract) {
                var matches = rnumsplit.exec(value);
                return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || 'px') : value;
            }
            function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
                var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : name === 'width' ? 1 : 0, val = 0;
                for (; i < 4; i += 2) {
                    if (extra === 'margin') {
                        val += jQuery.css(elem, extra + cssExpand[i], true, styles);
                    }
                    if (isBorderBox) {
                        if (extra === 'content') {
                            val -= jQuery.css(elem, 'padding' + cssExpand[i], true, styles);
                        }
                        if (extra !== 'margin') {
                            val -= jQuery.css(elem, 'border' + cssExpand[i] + 'Width', true, styles);
                        }
                    } else {
                        val += jQuery.css(elem, 'padding' + cssExpand[i], true, styles);
                        if (extra !== 'padding') {
                            val += jQuery.css(elem, 'border' + cssExpand[i] + 'Width', true, styles);
                        }
                    }
                }
                return val;
            }
            function getWidthOrHeight(elem, name, extra) {
                var valueIsBorderBox = true, val = name === 'width' ? elem.offsetWidth : elem.offsetHeight, styles = getStyles(elem), isBorderBox = support.boxSizing() && jQuery.css(elem, 'boxSizing', false, styles) === 'border-box';
                if (val <= 0 || val == null) {
                    val = curCSS(elem, name, styles);
                    if (val < 0 || val == null) {
                        val = elem.style[name];
                    }
                    if (rnumnonpx.test(val)) {
                        return val;
                    }
                    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
                    val = parseFloat(val) || 0;
                }
                return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? 'border' : 'content'), valueIsBorderBox, styles) + 'px';
            }
            jQuery.extend({
                cssHooks: {
                    opacity: {
                        get: function (elem, computed) {
                            if (computed) {
                                var ret = curCSS(elem, 'opacity');
                                return ret === '' ? '1' : ret;
                            }
                        }
                    }
                },
                cssNumber: {
                    'columnCount': true,
                    'fillOpacity': true,
                    'fontWeight': true,
                    'lineHeight': true,
                    'opacity': true,
                    'order': true,
                    'orphans': true,
                    'widows': true,
                    'zIndex': true,
                    'zoom': true
                },
                cssProps: { 'float': support.cssFloat ? 'cssFloat' : 'styleFloat' },
                style: function (elem, name, value, extra) {
                    if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                        return;
                    }
                    var ret, type, hooks, origName = jQuery.camelCase(name), style = elem.style;
                    name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
                    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
                    if (value !== undefined) {
                        type = typeof value;
                        if (type === 'string' && (ret = rrelNum.exec(value))) {
                            value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
                            type = 'number';
                        }
                        if (value == null || value !== value) {
                            return;
                        }
                        if (type === 'number' && !jQuery.cssNumber[origName]) {
                            value += 'px';
                        }
                        if (!support.clearCloneStyle && value === '' && name.indexOf('background') === 0) {
                            style[name] = 'inherit';
                        }
                        if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                            try {
                                style[name] = '';
                                style[name] = value;
                            } catch (e) {
                            }
                        }
                    } else {
                        if (hooks && 'get' in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                            return ret;
                        }
                        return style[name];
                    }
                },
                css: function (elem, name, extra, styles) {
                    var num, val, hooks, origName = jQuery.camelCase(name);
                    name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
                    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
                    if (hooks && 'get' in hooks) {
                        val = hooks.get(elem, true, extra);
                    }
                    if (val === undefined) {
                        val = curCSS(elem, name, styles);
                    }
                    if (val === 'normal' && name in cssNormalTransform) {
                        val = cssNormalTransform[name];
                    }
                    if (extra === '' || extra) {
                        num = parseFloat(val);
                        return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
                    }
                    return val;
                }
            });
            jQuery.each([
                'height',
                'width'
            ], function (i, name) {
                jQuery.cssHooks[name] = {
                    get: function (elem, computed, extra) {
                        if (computed) {
                            return elem.offsetWidth === 0 && rdisplayswap.test(jQuery.css(elem, 'display')) ? jQuery.swap(elem, cssShow, function () {
                                return getWidthOrHeight(elem, name, extra);
                            }) : getWidthOrHeight(elem, name, extra);
                        }
                    },
                    set: function (elem, value, extra) {
                        var styles = extra && getStyles(elem);
                        return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, support.boxSizing() && jQuery.css(elem, 'boxSizing', false, styles) === 'border-box', styles) : 0);
                    }
                };
            });
            if (!support.opacity) {
                jQuery.cssHooks.opacity = {
                    get: function (elem, computed) {
                        return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || '') ? 0.01 * parseFloat(RegExp.$1) + '' : computed ? '1' : '';
                    },
                    set: function (elem, value) {
                        var style = elem.style, currentStyle = elem.currentStyle, opacity = jQuery.isNumeric(value) ? 'alpha(opacity=' + value * 100 + ')' : '', filter = currentStyle && currentStyle.filter || style.filter || '';
                        style.zoom = 1;
                        if ((value >= 1 || value === '') && jQuery.trim(filter.replace(ralpha, '')) === '' && style.removeAttribute) {
                            style.removeAttribute('filter');
                            if (value === '' || currentStyle && !currentStyle.filter) {
                                return;
                            }
                        }
                        style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + ' ' + opacity;
                    }
                };
            }
            jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function (elem, computed) {
                if (computed) {
                    return jQuery.swap(elem, { 'display': 'inline-block' }, curCSS, [
                        elem,
                        'marginRight'
                    ]);
                }
            });
            jQuery.each({
                margin: '',
                padding: '',
                border: 'Width'
            }, function (prefix, suffix) {
                jQuery.cssHooks[prefix + suffix] = {
                    expand: function (value) {
                        var i = 0, expanded = {}, parts = typeof value === 'string' ? value.split(' ') : [value];
                        for (; i < 4; i++) {
                            expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                        }
                        return expanded;
                    }
                };
                if (!rmargin.test(prefix)) {
                    jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
                }
            });
            jQuery.fn.extend({
                css: function (name, value) {
                    return access(this, function (elem, name, value) {
                        var styles, len, map = {}, i = 0;
                        if (jQuery.isArray(name)) {
                            styles = getStyles(elem);
                            len = name.length;
                            for (; i < len; i++) {
                                map[name[i]] = jQuery.css(elem, name[i], false, styles);
                            }
                            return map;
                        }
                        return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
                    }, name, value, arguments.length > 1);
                },
                show: function () {
                    return showHide(this, true);
                },
                hide: function () {
                    return showHide(this);
                },
                toggle: function (state) {
                    if (typeof state === 'boolean') {
                        return state ? this.show() : this.hide();
                    }
                    return this.each(function () {
                        if (isHidden(this)) {
                            jQuery(this).show();
                        } else {
                            jQuery(this).hide();
                        }
                    });
                }
            });
            function Tween(elem, options, prop, end, easing) {
                return new Tween.prototype.init(elem, options, prop, end, easing);
            }
            jQuery.Tween = Tween;
            Tween.prototype = {
                constructor: Tween,
                init: function (elem, options, prop, end, easing, unit) {
                    this.elem = elem;
                    this.prop = prop;
                    this.easing = easing || 'swing';
                    this.options = options;
                    this.start = this.now = this.cur();
                    this.end = end;
                    this.unit = unit || (jQuery.cssNumber[prop] ? '' : 'px');
                },
                cur: function () {
                    var hooks = Tween.propHooks[this.prop];
                    return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
                },
                run: function (percent) {
                    var eased, hooks = Tween.propHooks[this.prop];
                    if (this.options.duration) {
                        this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
                    } else {
                        this.pos = eased = percent;
                    }
                    this.now = (this.end - this.start) * eased + this.start;
                    if (this.options.step) {
                        this.options.step.call(this.elem, this.now, this);
                    }
                    if (hooks && hooks.set) {
                        hooks.set(this);
                    } else {
                        Tween.propHooks._default.set(this);
                    }
                    return this;
                }
            };
            Tween.prototype.init.prototype = Tween.prototype;
            Tween.propHooks = {
                _default: {
                    get: function (tween) {
                        var result;
                        if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                            return tween.elem[tween.prop];
                        }
                        result = jQuery.css(tween.elem, tween.prop, '');
                        return !result || result === 'auto' ? 0 : result;
                    },
                    set: function (tween) {
                        if (jQuery.fx.step[tween.prop]) {
                            jQuery.fx.step[tween.prop](tween);
                        } else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
                            jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
                        } else {
                            tween.elem[tween.prop] = tween.now;
                        }
                    }
                }
            };
            Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
                set: function (tween) {
                    if (tween.elem.nodeType && tween.elem.parentNode) {
                        tween.elem[tween.prop] = tween.now;
                    }
                }
            };
            jQuery.easing = {
                linear: function (p) {
                    return p;
                },
                swing: function (p) {
                    return 0.5 - Math.cos(p * Math.PI) / 2;
                }
            };
            jQuery.fx = Tween.prototype.init;
            jQuery.fx.step = {};
            var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp('^(?:([+-])=|)(' + pnum + ')([a-z%]*)$', 'i'), rrun = /queueHooks$/, animationPrefilters = [defaultPrefilter], tweeners = {
                    '*': [function (prop, value) {
                            var tween = this.createTween(prop, value), target = tween.cur(), parts = rfxnum.exec(value), unit = parts && parts[3] || (jQuery.cssNumber[prop] ? '' : 'px'), start = (jQuery.cssNumber[prop] || unit !== 'px' && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)), scale = 1, maxIterations = 20;
                            if (start && start[3] !== unit) {
                                unit = unit || start[3];
                                parts = parts || [];
                                start = +target || 1;
                                do {
                                    scale = scale || '.5';
                                    start = start / scale;
                                    jQuery.style(tween.elem, prop, start + unit);
                                } while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
                            }
                            if (parts) {
                                start = tween.start = +start || +target || 0;
                                tween.unit = unit;
                                tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
                            }
                            return tween;
                        }]
                };
            function createFxNow() {
                setTimeout(function () {
                    fxNow = undefined;
                });
                return fxNow = jQuery.now();
            }
            function genFx(type, includeWidth) {
                var which, attrs = { height: type }, i = 0;
                includeWidth = includeWidth ? 1 : 0;
                for (; i < 4; i += 2 - includeWidth) {
                    which = cssExpand[i];
                    attrs['margin' + which] = attrs['padding' + which] = type;
                }
                if (includeWidth) {
                    attrs.opacity = attrs.width = type;
                }
                return attrs;
            }
            function createTween(value, prop, animation) {
                var tween, collection = (tweeners[prop] || []).concat(tweeners['*']), index = 0, length = collection.length;
                for (; index < length; index++) {
                    if (tween = collection[index].call(animation, prop, value)) {
                        return tween;
                    }
                }
            }
            function defaultPrefilter(elem, props, opts) {
                var prop, value, toggle, tween, hooks, oldfire, display, dDisplay, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHidden(elem), dataShow = jQuery._data(elem, 'fxshow');
                if (!opts.queue) {
                    hooks = jQuery._queueHooks(elem, 'fx');
                    if (hooks.unqueued == null) {
                        hooks.unqueued = 0;
                        oldfire = hooks.empty.fire;
                        hooks.empty.fire = function () {
                            if (!hooks.unqueued) {
                                oldfire();
                            }
                        };
                    }
                    hooks.unqueued++;
                    anim.always(function () {
                        anim.always(function () {
                            hooks.unqueued--;
                            if (!jQuery.queue(elem, 'fx').length) {
                                hooks.empty.fire();
                            }
                        });
                    });
                }
                if (elem.nodeType === 1 && ('height' in props || 'width' in props)) {
                    opts.overflow = [
                        style.overflow,
                        style.overflowX,
                        style.overflowY
                    ];
                    display = jQuery.css(elem, 'display');
                    dDisplay = defaultDisplay(elem.nodeName);
                    if (display === 'none') {
                        display = dDisplay;
                    }
                    if (display === 'inline' && jQuery.css(elem, 'float') === 'none') {
                        if (!support.inlineBlockNeedsLayout || dDisplay === 'inline') {
                            style.display = 'inline-block';
                        } else {
                            style.zoom = 1;
                        }
                    }
                }
                if (opts.overflow) {
                    style.overflow = 'hidden';
                    if (!support.shrinkWrapBlocks()) {
                        anim.always(function () {
                            style.overflow = opts.overflow[0];
                            style.overflowX = opts.overflow[1];
                            style.overflowY = opts.overflow[2];
                        });
                    }
                }
                for (prop in props) {
                    value = props[prop];
                    if (rfxtypes.exec(value)) {
                        delete props[prop];
                        toggle = toggle || value === 'toggle';
                        if (value === (hidden ? 'hide' : 'show')) {
                            if (value === 'show' && dataShow && dataShow[prop] !== undefined) {
                                hidden = true;
                            } else {
                                continue;
                            }
                        }
                        orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
                    }
                }
                if (!jQuery.isEmptyObject(orig)) {
                    if (dataShow) {
                        if ('hidden' in dataShow) {
                            hidden = dataShow.hidden;
                        }
                    } else {
                        dataShow = jQuery._data(elem, 'fxshow', {});
                    }
                    if (toggle) {
                        dataShow.hidden = !hidden;
                    }
                    if (hidden) {
                        jQuery(elem).show();
                    } else {
                        anim.done(function () {
                            jQuery(elem).hide();
                        });
                    }
                    anim.done(function () {
                        var prop;
                        jQuery._removeData(elem, 'fxshow');
                        for (prop in orig) {
                            jQuery.style(elem, prop, orig[prop]);
                        }
                    });
                    for (prop in orig) {
                        tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
                        if (!(prop in dataShow)) {
                            dataShow[prop] = tween.start;
                            if (hidden) {
                                tween.end = tween.start;
                                tween.start = prop === 'width' || prop === 'height' ? 1 : 0;
                            }
                        }
                    }
                }
            }
            function propFilter(props, specialEasing) {
                var index, name, easing, value, hooks;
                for (index in props) {
                    name = jQuery.camelCase(index);
                    easing = specialEasing[name];
                    value = props[index];
                    if (jQuery.isArray(value)) {
                        easing = value[1];
                        value = props[index] = value[0];
                    }
                    if (index !== name) {
                        props[name] = value;
                        delete props[index];
                    }
                    hooks = jQuery.cssHooks[name];
                    if (hooks && 'expand' in hooks) {
                        value = hooks.expand(value);
                        delete props[name];
                        for (index in value) {
                            if (!(index in props)) {
                                props[index] = value[index];
                                specialEasing[index] = easing;
                            }
                        }
                    } else {
                        specialEasing[name] = easing;
                    }
                }
            }
            function Animation(elem, properties, options) {
                var result, stopped, index = 0, length = animationPrefilters.length, deferred = jQuery.Deferred().always(function () {
                        delete tick.elem;
                    }), tick = function () {
                        if (stopped) {
                            return false;
                        }
                        var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index = 0, length = animation.tweens.length;
                        for (; index < length; index++) {
                            animation.tweens[index].run(percent);
                        }
                        deferred.notifyWith(elem, [
                            animation,
                            percent,
                            remaining
                        ]);
                        if (percent < 1 && length) {
                            return remaining;
                        } else {
                            deferred.resolveWith(elem, [animation]);
                            return false;
                        }
                    }, animation = deferred.promise({
                        elem: elem,
                        props: jQuery.extend({}, properties),
                        opts: jQuery.extend(true, { specialEasing: {} }, options),
                        originalProperties: properties,
                        originalOptions: options,
                        startTime: fxNow || createFxNow(),
                        duration: options.duration,
                        tweens: [],
                        createTween: function (prop, end) {
                            var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                            animation.tweens.push(tween);
                            return tween;
                        },
                        stop: function (gotoEnd) {
                            var index = 0, length = gotoEnd ? animation.tweens.length : 0;
                            if (stopped) {
                                return this;
                            }
                            stopped = true;
                            for (; index < length; index++) {
                                animation.tweens[index].run(1);
                            }
                            if (gotoEnd) {
                                deferred.resolveWith(elem, [
                                    animation,
                                    gotoEnd
                                ]);
                            } else {
                                deferred.rejectWith(elem, [
                                    animation,
                                    gotoEnd
                                ]);
                            }
                            return this;
                        }
                    }), props = animation.props;
                propFilter(props, animation.opts.specialEasing);
                for (; index < length; index++) {
                    result = animationPrefilters[index].call(animation, elem, props, animation.opts);
                    if (result) {
                        return result;
                    }
                }
                jQuery.map(props, createTween, animation);
                if (jQuery.isFunction(animation.opts.start)) {
                    animation.opts.start.call(elem, animation);
                }
                jQuery.fx.timer(jQuery.extend(tick, {
                    elem: elem,
                    anim: animation,
                    queue: animation.opts.queue
                }));
                return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
            }
            jQuery.Animation = jQuery.extend(Animation, {
                tweener: function (props, callback) {
                    if (jQuery.isFunction(props)) {
                        callback = props;
                        props = ['*'];
                    } else {
                        props = props.split(' ');
                    }
                    var prop, index = 0, length = props.length;
                    for (; index < length; index++) {
                        prop = props[index];
                        tweeners[prop] = tweeners[prop] || [];
                        tweeners[prop].unshift(callback);
                    }
                },
                prefilter: function (callback, prepend) {
                    if (prepend) {
                        animationPrefilters.unshift(callback);
                    } else {
                        animationPrefilters.push(callback);
                    }
                }
            });
            jQuery.speed = function (speed, easing, fn) {
                var opt = speed && typeof speed === 'object' ? jQuery.extend({}, speed) : {
                    complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                    duration: speed,
                    easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
                };
                opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === 'number' ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
                if (opt.queue == null || opt.queue === true) {
                    opt.queue = 'fx';
                }
                opt.old = opt.complete;
                opt.complete = function () {
                    if (jQuery.isFunction(opt.old)) {
                        opt.old.call(this);
                    }
                    if (opt.queue) {
                        jQuery.dequeue(this, opt.queue);
                    }
                };
                return opt;
            };
            jQuery.fn.extend({
                fadeTo: function (speed, to, easing, callback) {
                    return this.filter(isHidden).css('opacity', 0).show().end().animate({ opacity: to }, speed, easing, callback);
                },
                animate: function (prop, speed, easing, callback) {
                    var empty = jQuery.isEmptyObject(prop), optall = jQuery.speed(speed, easing, callback), doAnimation = function () {
                            var anim = Animation(this, jQuery.extend({}, prop), optall);
                            if (empty || jQuery._data(this, 'finish')) {
                                anim.stop(true);
                            }
                        };
                    doAnimation.finish = doAnimation;
                    return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
                },
                stop: function (type, clearQueue, gotoEnd) {
                    var stopQueue = function (hooks) {
                        var stop = hooks.stop;
                        delete hooks.stop;
                        stop(gotoEnd);
                    };
                    if (typeof type !== 'string') {
                        gotoEnd = clearQueue;
                        clearQueue = type;
                        type = undefined;
                    }
                    if (clearQueue && type !== false) {
                        this.queue(type || 'fx', []);
                    }
                    return this.each(function () {
                        var dequeue = true, index = type != null && type + 'queueHooks', timers = jQuery.timers, data = jQuery._data(this);
                        if (index) {
                            if (data[index] && data[index].stop) {
                                stopQueue(data[index]);
                            }
                        } else {
                            for (index in data) {
                                if (data[index] && data[index].stop && rrun.test(index)) {
                                    stopQueue(data[index]);
                                }
                            }
                        }
                        for (index = timers.length; index--;) {
                            if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                                timers[index].anim.stop(gotoEnd);
                                dequeue = false;
                                timers.splice(index, 1);
                            }
                        }
                        if (dequeue || !gotoEnd) {
                            jQuery.dequeue(this, type);
                        }
                    });
                },
                finish: function (type) {
                    if (type !== false) {
                        type = type || 'fx';
                    }
                    return this.each(function () {
                        var index, data = jQuery._data(this), queue = data[type + 'queue'], hooks = data[type + 'queueHooks'], timers = jQuery.timers, length = queue ? queue.length : 0;
                        data.finish = true;
                        jQuery.queue(this, type, []);
                        if (hooks && hooks.stop) {
                            hooks.stop.call(this, true);
                        }
                        for (index = timers.length; index--;) {
                            if (timers[index].elem === this && timers[index].queue === type) {
                                timers[index].anim.stop(true);
                                timers.splice(index, 1);
                            }
                        }
                        for (index = 0; index < length; index++) {
                            if (queue[index] && queue[index].finish) {
                                queue[index].finish.call(this);
                            }
                        }
                        delete data.finish;
                    });
                }
            });
            jQuery.each([
                'toggle',
                'show',
                'hide'
            ], function (i, name) {
                var cssFn = jQuery.fn[name];
                jQuery.fn[name] = function (speed, easing, callback) {
                    return speed == null || typeof speed === 'boolean' ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
                };
            });
            jQuery.each({
                slideDown: genFx('show'),
                slideUp: genFx('hide'),
                slideToggle: genFx('toggle'),
                fadeIn: { opacity: 'show' },
                fadeOut: { opacity: 'hide' },
                fadeToggle: { opacity: 'toggle' }
            }, function (name, props) {
                jQuery.fn[name] = function (speed, easing, callback) {
                    return this.animate(props, speed, easing, callback);
                };
            });
            jQuery.timers = [];
            jQuery.fx.tick = function () {
                var timer, timers = jQuery.timers, i = 0;
                fxNow = jQuery.now();
                for (; i < timers.length; i++) {
                    timer = timers[i];
                    if (!timer() && timers[i] === timer) {
                        timers.splice(i--, 1);
                    }
                }
                if (!timers.length) {
                    jQuery.fx.stop();
                }
                fxNow = undefined;
            };
            jQuery.fx.timer = function (timer) {
                jQuery.timers.push(timer);
                if (timer()) {
                    jQuery.fx.start();
                } else {
                    jQuery.timers.pop();
                }
            };
            jQuery.fx.interval = 13;
            jQuery.fx.start = function () {
                if (!timerId) {
                    timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
                }
            };
            jQuery.fx.stop = function () {
                clearInterval(timerId);
                timerId = null;
            };
            jQuery.fx.speeds = {
                slow: 600,
                fast: 200,
                _default: 400
            };
            jQuery.fn.delay = function (time, type) {
                time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
                type = type || 'fx';
                return this.queue(type, function (next, hooks) {
                    var timeout = setTimeout(next, time);
                    hooks.stop = function () {
                        clearTimeout(timeout);
                    };
                });
            };
            (function () {
                var a, input, select, opt, div = document.createElement('div');
                div.setAttribute('className', 't');
                div.innerHTML = '  <link/><table></table><a href=\'/a\'>a</a><input type=\'checkbox\'/>';
                a = div.getElementsByTagName('a')[0];
                select = document.createElement('select');
                opt = select.appendChild(document.createElement('option'));
                input = div.getElementsByTagName('input')[0];
                a.style.cssText = 'top:1px';
                support.getSetAttribute = div.className !== 't';
                support.style = /top/.test(a.getAttribute('style'));
                support.hrefNormalized = a.getAttribute('href') === '/a';
                support.checkOn = !!input.value;
                support.optSelected = opt.selected;
                support.enctype = !!document.createElement('form').enctype;
                select.disabled = true;
                support.optDisabled = !opt.disabled;
                input = document.createElement('input');
                input.setAttribute('value', '');
                support.input = input.getAttribute('value') === '';
                input.value = 't';
                input.setAttribute('type', 'radio');
                support.radioValue = input.value === 't';
                a = input = select = opt = div = null;
            }());
            var rreturn = /\r/g;
            jQuery.fn.extend({
                val: function (value) {
                    var hooks, ret, isFunction, elem = this[0];
                    if (!arguments.length) {
                        if (elem) {
                            hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
                            if (hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
                                return ret;
                            }
                            ret = elem.value;
                            return typeof ret === 'string' ? ret.replace(rreturn, '') : ret == null ? '' : ret;
                        }
                        return;
                    }
                    isFunction = jQuery.isFunction(value);
                    return this.each(function (i) {
                        var val;
                        if (this.nodeType !== 1) {
                            return;
                        }
                        if (isFunction) {
                            val = value.call(this, i, jQuery(this).val());
                        } else {
                            val = value;
                        }
                        if (val == null) {
                            val = '';
                        } else if (typeof val === 'number') {
                            val += '';
                        } else if (jQuery.isArray(val)) {
                            val = jQuery.map(val, function (value) {
                                return value == null ? '' : value + '';
                            });
                        }
                        hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
                        if (!hooks || !('set' in hooks) || hooks.set(this, val, 'value') === undefined) {
                            this.value = val;
                        }
                    });
                }
            });
            jQuery.extend({
                valHooks: {
                    option: {
                        get: function (elem) {
                            var val = jQuery.find.attr(elem, 'value');
                            return val != null ? val : jQuery.text(elem);
                        }
                    },
                    select: {
                        get: function (elem) {
                            var value, option, options = elem.options, index = elem.selectedIndex, one = elem.type === 'select-one' || index < 0, values = one ? null : [], max = one ? index + 1 : options.length, i = index < 0 ? max : one ? index : 0;
                            for (; i < max; i++) {
                                option = options[i];
                                if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute('disabled') === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, 'optgroup'))) {
                                    value = jQuery(option).val();
                                    if (one) {
                                        return value;
                                    }
                                    values.push(value);
                                }
                            }
                            return values;
                        },
                        set: function (elem, value) {
                            var optionSet, option, options = elem.options, values = jQuery.makeArray(value), i = options.length;
                            while (i--) {
                                option = options[i];
                                if (jQuery.inArray(jQuery.valHooks.option.get(option), values) >= 0) {
                                    try {
                                        option.selected = optionSet = true;
                                    } catch (_) {
                                        option.scrollHeight;
                                    }
                                } else {
                                    option.selected = false;
                                }
                            }
                            if (!optionSet) {
                                elem.selectedIndex = -1;
                            }
                            return options;
                        }
                    }
                }
            });
            jQuery.each([
                'radio',
                'checkbox'
            ], function () {
                jQuery.valHooks[this] = {
                    set: function (elem, value) {
                        if (jQuery.isArray(value)) {
                            return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
                        }
                    }
                };
                if (!support.checkOn) {
                    jQuery.valHooks[this].get = function (elem) {
                        return elem.getAttribute('value') === null ? 'on' : elem.value;
                    };
                }
            });
            var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle, ruseDefault = /^(?:checked|selected)$/i, getSetAttribute = support.getSetAttribute, getSetInput = support.input;
            jQuery.fn.extend({
                attr: function (name, value) {
                    return access(this, jQuery.attr, name, value, arguments.length > 1);
                },
                removeAttr: function (name) {
                    return this.each(function () {
                        jQuery.removeAttr(this, name);
                    });
                }
            });
            jQuery.extend({
                attr: function (elem, name, value) {
                    var hooks, ret, nType = elem.nodeType;
                    if (!elem || nType === 3 || nType === 8 || nType === 2) {
                        return;
                    }
                    if (typeof elem.getAttribute === strundefined) {
                        return jQuery.prop(elem, name, value);
                    }
                    if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                        name = name.toLowerCase();
                        hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
                    }
                    if (value !== undefined) {
                        if (value === null) {
                            jQuery.removeAttr(elem, name);
                        } else if (hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                            return ret;
                        } else {
                            elem.setAttribute(name, value + '');
                            return value;
                        }
                    } else if (hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {
                        return ret;
                    } else {
                        ret = jQuery.find.attr(elem, name);
                        return ret == null ? undefined : ret;
                    }
                },
                removeAttr: function (elem, value) {
                    var name, propName, i = 0, attrNames = value && value.match(rnotwhite);
                    if (attrNames && elem.nodeType === 1) {
                        while (name = attrNames[i++]) {
                            propName = jQuery.propFix[name] || name;
                            if (jQuery.expr.match.bool.test(name)) {
                                if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
                                    elem[propName] = false;
                                } else {
                                    elem[jQuery.camelCase('default-' + name)] = elem[propName] = false;
                                }
                            } else {
                                jQuery.attr(elem, name, '');
                            }
                            elem.removeAttribute(getSetAttribute ? name : propName);
                        }
                    }
                },
                attrHooks: {
                    type: {
                        set: function (elem, value) {
                            if (!support.radioValue && value === 'radio' && jQuery.nodeName(elem, 'input')) {
                                var val = elem.value;
                                elem.setAttribute('type', value);
                                if (val) {
                                    elem.value = val;
                                }
                                return value;
                            }
                        }
                    }
                }
            });
            boolHook = {
                set: function (elem, value, name) {
                    if (value === false) {
                        jQuery.removeAttr(elem, name);
                    } else if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
                        elem.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name);
                    } else {
                        elem[jQuery.camelCase('default-' + name)] = elem[name] = true;
                    }
                    return name;
                }
            };
            jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {
                var getter = attrHandle[name] || jQuery.find.attr;
                attrHandle[name] = getSetInput && getSetAttribute || !ruseDefault.test(name) ? function (elem, name, isXML) {
                    var ret, handle;
                    if (!isXML) {
                        handle = attrHandle[name];
                        attrHandle[name] = ret;
                        ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
                        attrHandle[name] = handle;
                    }
                    return ret;
                } : function (elem, name, isXML) {
                    if (!isXML) {
                        return elem[jQuery.camelCase('default-' + name)] ? name.toLowerCase() : null;
                    }
                };
            });
            if (!getSetInput || !getSetAttribute) {
                jQuery.attrHooks.value = {
                    set: function (elem, value, name) {
                        if (jQuery.nodeName(elem, 'input')) {
                            elem.defaultValue = value;
                        } else {
                            return nodeHook && nodeHook.set(elem, value, name);
                        }
                    }
                };
            }
            if (!getSetAttribute) {
                nodeHook = {
                    set: function (elem, value, name) {
                        var ret = elem.getAttributeNode(name);
                        if (!ret) {
                            elem.setAttributeNode(ret = elem.ownerDocument.createAttribute(name));
                        }
                        ret.value = value += '';
                        if (name === 'value' || value === elem.getAttribute(name)) {
                            return value;
                        }
                    }
                };
                attrHandle.id = attrHandle.name = attrHandle.coords = function (elem, name, isXML) {
                    var ret;
                    if (!isXML) {
                        return (ret = elem.getAttributeNode(name)) && ret.value !== '' ? ret.value : null;
                    }
                };
                jQuery.valHooks.button = {
                    get: function (elem, name) {
                        var ret = elem.getAttributeNode(name);
                        if (ret && ret.specified) {
                            return ret.value;
                        }
                    },
                    set: nodeHook.set
                };
                jQuery.attrHooks.contenteditable = {
                    set: function (elem, value, name) {
                        nodeHook.set(elem, value === '' ? false : value, name);
                    }
                };
                jQuery.each([
                    'width',
                    'height'
                ], function (i, name) {
                    jQuery.attrHooks[name] = {
                        set: function (elem, value) {
                            if (value === '') {
                                elem.setAttribute(name, 'auto');
                                return value;
                            }
                        }
                    };
                });
            }
            if (!support.style) {
                jQuery.attrHooks.style = {
                    get: function (elem) {
                        return elem.style.cssText || undefined;
                    },
                    set: function (elem, value) {
                        return elem.style.cssText = value + '';
                    }
                };
            }
            var rfocusable = /^(?:input|select|textarea|button|object)$/i, rclickable = /^(?:a|area)$/i;
            jQuery.fn.extend({
                prop: function (name, value) {
                    return access(this, jQuery.prop, name, value, arguments.length > 1);
                },
                removeProp: function (name) {
                    name = jQuery.propFix[name] || name;
                    return this.each(function () {
                        try {
                            this[name] = undefined;
                            delete this[name];
                        } catch (e) {
                        }
                    });
                }
            });
            jQuery.extend({
                propFix: {
                    'for': 'htmlFor',
                    'class': 'className'
                },
                prop: function (elem, name, value) {
                    var ret, hooks, notxml, nType = elem.nodeType;
                    if (!elem || nType === 3 || nType === 8 || nType === 2) {
                        return;
                    }
                    notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
                    if (notxml) {
                        name = jQuery.propFix[name] || name;
                        hooks = jQuery.propHooks[name];
                    }
                    if (value !== undefined) {
                        return hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : elem[name] = value;
                    } else {
                        return hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
                    }
                },
                propHooks: {
                    tabIndex: {
                        get: function (elem) {
                            var tabindex = jQuery.find.attr(elem, 'tabindex');
                            return tabindex ? parseInt(tabindex, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : -1;
                        }
                    }
                }
            });
            if (!support.hrefNormalized) {
                jQuery.each([
                    'href',
                    'src'
                ], function (i, name) {
                    jQuery.propHooks[name] = {
                        get: function (elem) {
                            return elem.getAttribute(name, 4);
                        }
                    };
                });
            }
            if (!support.optSelected) {
                jQuery.propHooks.selected = {
                    get: function (elem) {
                        var parent = elem.parentNode;
                        if (parent) {
                            parent.selectedIndex;
                            if (parent.parentNode) {
                                parent.parentNode.selectedIndex;
                            }
                        }
                        return null;
                    }
                };
            }
            jQuery.each([
                'tabIndex',
                'readOnly',
                'maxLength',
                'cellSpacing',
                'cellPadding',
                'rowSpan',
                'colSpan',
                'useMap',
                'frameBorder',
                'contentEditable'
            ], function () {
                jQuery.propFix[this.toLowerCase()] = this;
            });
            if (!support.enctype) {
                jQuery.propFix.enctype = 'encoding';
            }
            var rclass = /[\t\r\n\f]/g;
            jQuery.fn.extend({
                addClass: function (value) {
                    var classes, elem, cur, clazz, j, finalValue, i = 0, len = this.length, proceed = typeof value === 'string' && value;
                    if (jQuery.isFunction(value)) {
                        return this.each(function (j) {
                            jQuery(this).addClass(value.call(this, j, this.className));
                        });
                    }
                    if (proceed) {
                        classes = (value || '').match(rnotwhite) || [];
                        for (; i < len; i++) {
                            elem = this[i];
                            cur = elem.nodeType === 1 && (elem.className ? (' ' + elem.className + ' ').replace(rclass, ' ') : ' ');
                            if (cur) {
                                j = 0;
                                while (clazz = classes[j++]) {
                                    if (cur.indexOf(' ' + clazz + ' ') < 0) {
                                        cur += clazz + ' ';
                                    }
                                }
                                finalValue = jQuery.trim(cur);
                                if (elem.className !== finalValue) {
                                    elem.className = finalValue;
                                }
                            }
                        }
                    }
                    return this;
                },
                removeClass: function (value) {
                    var classes, elem, cur, clazz, j, finalValue, i = 0, len = this.length, proceed = arguments.length === 0 || typeof value === 'string' && value;
                    if (jQuery.isFunction(value)) {
                        return this.each(function (j) {
                            jQuery(this).removeClass(value.call(this, j, this.className));
                        });
                    }
                    if (proceed) {
                        classes = (value || '').match(rnotwhite) || [];
                        for (; i < len; i++) {
                            elem = this[i];
                            cur = elem.nodeType === 1 && (elem.className ? (' ' + elem.className + ' ').replace(rclass, ' ') : '');
                            if (cur) {
                                j = 0;
                                while (clazz = classes[j++]) {
                                    while (cur.indexOf(' ' + clazz + ' ') >= 0) {
                                        cur = cur.replace(' ' + clazz + ' ', ' ');
                                    }
                                }
                                finalValue = value ? jQuery.trim(cur) : '';
                                if (elem.className !== finalValue) {
                                    elem.className = finalValue;
                                }
                            }
                        }
                    }
                    return this;
                },
                toggleClass: function (value, stateVal) {
                    var type = typeof value;
                    if (typeof stateVal === 'boolean' && type === 'string') {
                        return stateVal ? this.addClass(value) : this.removeClass(value);
                    }
                    if (jQuery.isFunction(value)) {
                        return this.each(function (i) {
                            jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                        });
                    }
                    return this.each(function () {
                        if (type === 'string') {
                            var className, i = 0, self = jQuery(this), classNames = value.match(rnotwhite) || [];
                            while (className = classNames[i++]) {
                                if (self.hasClass(className)) {
                                    self.removeClass(className);
                                } else {
                                    self.addClass(className);
                                }
                            }
                        } else if (type === strundefined || type === 'boolean') {
                            if (this.className) {
                                jQuery._data(this, '__className__', this.className);
                            }
                            this.className = this.className || value === false ? '' : jQuery._data(this, '__className__') || '';
                        }
                    });
                },
                hasClass: function (selector) {
                    var className = ' ' + selector + ' ', i = 0, l = this.length;
                    for (; i < l; i++) {
                        if (this[i].nodeType === 1 && (' ' + this[i].className + ' ').replace(rclass, ' ').indexOf(className) >= 0) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            jQuery.each(('blur focus focusin focusout load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select submit keydown keypress keyup error contextmenu').split(' '), function (i, name) {
                jQuery.fn[name] = function (data, fn) {
                    return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
                };
            });
            jQuery.fn.extend({
                hover: function (fnOver, fnOut) {
                    return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
                },
                bind: function (types, data, fn) {
                    return this.on(types, null, data, fn);
                },
                unbind: function (types, fn) {
                    return this.off(types, null, fn);
                },
                delegate: function (selector, types, data, fn) {
                    return this.on(types, selector, data, fn);
                },
                undelegate: function (selector, types, fn) {
                    return arguments.length === 1 ? this.off(selector, '**') : this.off(types, selector || '**', fn);
                }
            });
            var nonce = jQuery.now();
            var rquery = /\?/;
            var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
            jQuery.parseJSON = function (data) {
                if (window.JSON && window.JSON.parse) {
                    return window.JSON.parse(data + '');
                }
                var requireNonComma, depth = null, str = jQuery.trim(data + '');
                return str && !jQuery.trim(str.replace(rvalidtokens, function (token, comma, open, close) {
                    if (requireNonComma && comma) {
                        depth = 0;
                    }
                    if (depth === 0) {
                        return token;
                    }
                    requireNonComma = open || comma;
                    depth += !close - !open;
                    return '';
                })) ? Function('return ' + str)() : jQuery.error('Invalid JSON: ' + data);
            };
            jQuery.parseXML = function (data) {
                var xml, tmp;
                if (!data || typeof data !== 'string') {
                    return null;
                }
                try {
                    if (window.DOMParser) {
                        tmp = new DOMParser();
                        xml = tmp.parseFromString(data, 'text/xml');
                    } else {
                        xml = new ActiveXObject('Microsoft.XMLDOM');
                        xml.async = 'false';
                        xml.loadXML(data);
                    }
                } catch (e) {
                    xml = undefined;
                }
                if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
                    jQuery.error('Invalid XML: ' + data);
                }
                return xml;
            };
            var ajaxLocParts, ajaxLocation, rhash = /#.*$/, rts = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, prefilters = {}, transports = {}, allTypes = '*/'.concat('*');
            try {
                ajaxLocation = location.href;
            } catch (e) {
                ajaxLocation = document.createElement('a');
                ajaxLocation.href = '';
                ajaxLocation = ajaxLocation.href;
            }
            ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
            function addToPrefiltersOrTransports(structure) {
                return function (dataTypeExpression, func) {
                    if (typeof dataTypeExpression !== 'string') {
                        func = dataTypeExpression;
                        dataTypeExpression = '*';
                    }
                    var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
                    if (jQuery.isFunction(func)) {
                        while (dataType = dataTypes[i++]) {
                            if (dataType.charAt(0) === '+') {
                                dataType = dataType.slice(1) || '*';
                                (structure[dataType] = structure[dataType] || []).unshift(func);
                            } else {
                                (structure[dataType] = structure[dataType] || []).push(func);
                            }
                        }
                    }
                };
            }
            function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
                var inspected = {}, seekingTransport = structure === transports;
                function inspect(dataType) {
                    var selected;
                    inspected[dataType] = true;
                    jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
                        var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                        if (typeof dataTypeOrTransport === 'string' && !seekingTransport && !inspected[dataTypeOrTransport]) {
                            options.dataTypes.unshift(dataTypeOrTransport);
                            inspect(dataTypeOrTransport);
                            return false;
                        } else if (seekingTransport) {
                            return !(selected = dataTypeOrTransport);
                        }
                    });
                    return selected;
                }
                return inspect(options.dataTypes[0]) || !inspected['*'] && inspect('*');
            }
            function ajaxExtend(target, src) {
                var deep, key, flatOptions = jQuery.ajaxSettings.flatOptions || {};
                for (key in src) {
                    if (src[key] !== undefined) {
                        (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
                    }
                }
                if (deep) {
                    jQuery.extend(true, target, deep);
                }
                return target;
            }
            function ajaxHandleResponses(s, jqXHR, responses) {
                var firstDataType, ct, finalDataType, type, contents = s.contents, dataTypes = s.dataTypes;
                while (dataTypes[0] === '*') {
                    dataTypes.shift();
                    if (ct === undefined) {
                        ct = s.mimeType || jqXHR.getResponseHeader('Content-Type');
                    }
                }
                if (ct) {
                    for (type in contents) {
                        if (contents[type] && contents[type].test(ct)) {
                            dataTypes.unshift(type);
                            break;
                        }
                    }
                }
                if (dataTypes[0] in responses) {
                    finalDataType = dataTypes[0];
                } else {
                    for (type in responses) {
                        if (!dataTypes[0] || s.converters[type + ' ' + dataTypes[0]]) {
                            finalDataType = type;
                            break;
                        }
                        if (!firstDataType) {
                            firstDataType = type;
                        }
                    }
                    finalDataType = finalDataType || firstDataType;
                }
                if (finalDataType) {
                    if (finalDataType !== dataTypes[0]) {
                        dataTypes.unshift(finalDataType);
                    }
                    return responses[finalDataType];
                }
            }
            function ajaxConvert(s, response, jqXHR, isSuccess) {
                var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
                if (dataTypes[1]) {
                    for (conv in s.converters) {
                        converters[conv.toLowerCase()] = s.converters[conv];
                    }
                }
                current = dataTypes.shift();
                while (current) {
                    if (s.responseFields[current]) {
                        jqXHR[s.responseFields[current]] = response;
                    }
                    if (!prev && isSuccess && s.dataFilter) {
                        response = s.dataFilter(response, s.dataType);
                    }
                    prev = current;
                    current = dataTypes.shift();
                    if (current) {
                        if (current === '*') {
                            current = prev;
                        } else if (prev !== '*' && prev !== current) {
                            conv = converters[prev + ' ' + current] || converters['* ' + current];
                            if (!conv) {
                                for (conv2 in converters) {
                                    tmp = conv2.split(' ');
                                    if (tmp[1] === current) {
                                        conv = converters[prev + ' ' + tmp[0]] || converters['* ' + tmp[0]];
                                        if (conv) {
                                            if (conv === true) {
                                                conv = converters[conv2];
                                            } else if (converters[conv2] !== true) {
                                                current = tmp[0];
                                                dataTypes.unshift(tmp[1]);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            if (conv !== true) {
                                if (conv && s['throws']) {
                                    response = conv(response);
                                } else {
                                    try {
                                        response = conv(response);
                                    } catch (e) {
                                        return {
                                            state: 'parsererror',
                                            error: conv ? e : 'No conversion from ' + prev + ' to ' + current
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
                return {
                    state: 'success',
                    data: response
                };
            }
            jQuery.extend({
                active: 0,
                lastModified: {},
                etag: {},
                ajaxSettings: {
                    url: ajaxLocation,
                    type: 'GET',
                    isLocal: rlocalProtocol.test(ajaxLocParts[1]),
                    global: true,
                    processData: true,
                    async: true,
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    accepts: {
                        '*': allTypes,
                        text: 'text/plain',
                        html: 'text/html',
                        xml: 'application/xml, text/xml',
                        json: 'application/json, text/javascript'
                    },
                    contents: {
                        xml: /xml/,
                        html: /html/,
                        json: /json/
                    },
                    responseFields: {
                        xml: 'responseXML',
                        text: 'responseText',
                        json: 'responseJSON'
                    },
                    converters: {
                        '* text': String,
                        'text html': true,
                        'text json': jQuery.parseJSON,
                        'text xml': jQuery.parseXML
                    },
                    flatOptions: {
                        url: true,
                        context: true
                    }
                },
                ajaxSetup: function (target, settings) {
                    return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
                },
                ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
                ajaxTransport: addToPrefiltersOrTransports(transports),
                ajax: function (url, options) {
                    if (typeof url === 'object') {
                        options = url;
                        url = undefined;
                    }
                    options = options || {};
                    var parts, i, cacheURL, responseHeadersString, timeoutTimer, fireGlobals, transport, responseHeaders, s = jQuery.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event, deferred = jQuery.Deferred(), completeDeferred = jQuery.Callbacks('once memory'), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, state = 0, strAbort = 'canceled', jqXHR = {
                            readyState: 0,
                            getResponseHeader: function (key) {
                                var match;
                                if (state === 2) {
                                    if (!responseHeaders) {
                                        responseHeaders = {};
                                        while (match = rheaders.exec(responseHeadersString)) {
                                            responseHeaders[match[1].toLowerCase()] = match[2];
                                        }
                                    }
                                    match = responseHeaders[key.toLowerCase()];
                                }
                                return match == null ? null : match;
                            },
                            getAllResponseHeaders: function () {
                                return state === 2 ? responseHeadersString : null;
                            },
                            setRequestHeader: function (name, value) {
                                var lname = name.toLowerCase();
                                if (!state) {
                                    name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                                    requestHeaders[name] = value;
                                }
                                return this;
                            },
                            overrideMimeType: function (type) {
                                if (!state) {
                                    s.mimeType = type;
                                }
                                return this;
                            },
                            statusCode: function (map) {
                                var code;
                                if (map) {
                                    if (state < 2) {
                                        for (code in map) {
                                            statusCode[code] = [
                                                statusCode[code],
                                                map[code]
                                            ];
                                        }
                                    } else {
                                        jqXHR.always(map[jqXHR.status]);
                                    }
                                }
                                return this;
                            },
                            abort: function (statusText) {
                                var finalText = statusText || strAbort;
                                if (transport) {
                                    transport.abort(finalText);
                                }
                                done(0, finalText);
                                return this;
                            }
                        };
                    deferred.promise(jqXHR).complete = completeDeferred.add;
                    jqXHR.success = jqXHR.done;
                    jqXHR.error = jqXHR.fail;
                    s.url = ((url || s.url || ajaxLocation) + '').replace(rhash, '').replace(rprotocol, ajaxLocParts[1] + '//');
                    s.type = options.method || options.type || s.method || s.type;
                    s.dataTypes = jQuery.trim(s.dataType || '*').toLowerCase().match(rnotwhite) || [''];
                    if (s.crossDomain == null) {
                        parts = rurl.exec(s.url.toLowerCase());
                        s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === 'http:' ? '80' : '443')) !== (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));
                    }
                    if (s.data && s.processData && typeof s.data !== 'string') {
                        s.data = jQuery.param(s.data, s.traditional);
                    }
                    inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
                    if (state === 2) {
                        return jqXHR;
                    }
                    fireGlobals = s.global;
                    if (fireGlobals && jQuery.active++ === 0) {
                        jQuery.event.trigger('ajaxStart');
                    }
                    s.type = s.type.toUpperCase();
                    s.hasContent = !rnoContent.test(s.type);
                    cacheURL = s.url;
                    if (!s.hasContent) {
                        if (s.data) {
                            cacheURL = s.url += (rquery.test(cacheURL) ? '&' : '?') + s.data;
                            delete s.data;
                        }
                        if (s.cache === false) {
                            s.url = rts.test(cacheURL) ? cacheURL.replace(rts, '$1_=' + nonce++) : cacheURL + (rquery.test(cacheURL) ? '&' : '?') + '_=' + nonce++;
                        }
                    }
                    if (s.ifModified) {
                        if (jQuery.lastModified[cacheURL]) {
                            jqXHR.setRequestHeader('If-Modified-Since', jQuery.lastModified[cacheURL]);
                        }
                        if (jQuery.etag[cacheURL]) {
                            jqXHR.setRequestHeader('If-None-Match', jQuery.etag[cacheURL]);
                        }
                    }
                    if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                        jqXHR.setRequestHeader('Content-Type', s.contentType);
                    }
                    jqXHR.setRequestHeader('Accept', s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== '*' ? ', ' + allTypes + '; q=0.01' : '') : s.accepts['*']);
                    for (i in s.headers) {
                        jqXHR.setRequestHeader(i, s.headers[i]);
                    }
                    if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                        return jqXHR.abort();
                    }
                    strAbort = 'abort';
                    for (i in {
                            success: 1,
                            error: 1,
                            complete: 1
                        }) {
                        jqXHR[i](s[i]);
                    }
                    transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
                    if (!transport) {
                        done(-1, 'No Transport');
                    } else {
                        jqXHR.readyState = 1;
                        if (fireGlobals) {
                            globalEventContext.trigger('ajaxSend', [
                                jqXHR,
                                s
                            ]);
                        }
                        if (s.async && s.timeout > 0) {
                            timeoutTimer = setTimeout(function () {
                                jqXHR.abort('timeout');
                            }, s.timeout);
                        }
                        try {
                            state = 1;
                            transport.send(requestHeaders, done);
                        } catch (e) {
                            if (state < 2) {
                                done(-1, e);
                            } else {
                                throw e;
                            }
                        }
                    }
                    function done(status, nativeStatusText, responses, headers) {
                        var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                        if (state === 2) {
                            return;
                        }
                        state = 2;
                        if (timeoutTimer) {
                            clearTimeout(timeoutTimer);
                        }
                        transport = undefined;
                        responseHeadersString = headers || '';
                        jqXHR.readyState = status > 0 ? 4 : 0;
                        isSuccess = status >= 200 && status < 300 || status === 304;
                        if (responses) {
                            response = ajaxHandleResponses(s, jqXHR, responses);
                        }
                        response = ajaxConvert(s, response, jqXHR, isSuccess);
                        if (isSuccess) {
                            if (s.ifModified) {
                                modified = jqXHR.getResponseHeader('Last-Modified');
                                if (modified) {
                                    jQuery.lastModified[cacheURL] = modified;
                                }
                                modified = jqXHR.getResponseHeader('etag');
                                if (modified) {
                                    jQuery.etag[cacheURL] = modified;
                                }
                            }
                            if (status === 204 || s.type === 'HEAD') {
                                statusText = 'nocontent';
                            } else if (status === 304) {
                                statusText = 'notmodified';
                            } else {
                                statusText = response.state;
                                success = response.data;
                                error = response.error;
                                isSuccess = !error;
                            }
                        } else {
                            error = statusText;
                            if (status || !statusText) {
                                statusText = 'error';
                                if (status < 0) {
                                    status = 0;
                                }
                            }
                        }
                        jqXHR.status = status;
                        jqXHR.statusText = (nativeStatusText || statusText) + '';
                        if (isSuccess) {
                            deferred.resolveWith(callbackContext, [
                                success,
                                statusText,
                                jqXHR
                            ]);
                        } else {
                            deferred.rejectWith(callbackContext, [
                                jqXHR,
                                statusText,
                                error
                            ]);
                        }
                        jqXHR.statusCode(statusCode);
                        statusCode = undefined;
                        if (fireGlobals) {
                            globalEventContext.trigger(isSuccess ? 'ajaxSuccess' : 'ajaxError', [
                                jqXHR,
                                s,
                                isSuccess ? success : error
                            ]);
                        }
                        completeDeferred.fireWith(callbackContext, [
                            jqXHR,
                            statusText
                        ]);
                        if (fireGlobals) {
                            globalEventContext.trigger('ajaxComplete', [
                                jqXHR,
                                s
                            ]);
                            if (!--jQuery.active) {
                                jQuery.event.trigger('ajaxStop');
                            }
                        }
                    }
                    return jqXHR;
                },
                getJSON: function (url, data, callback) {
                    return jQuery.get(url, data, callback, 'json');
                },
                getScript: function (url, callback) {
                    return jQuery.get(url, undefined, callback, 'script');
                }
            });
            jQuery.each([
                'get',
                'post'
            ], function (i, method) {
                jQuery[method] = function (url, data, callback, type) {
                    if (jQuery.isFunction(data)) {
                        type = type || callback;
                        callback = data;
                        data = undefined;
                    }
                    return jQuery.ajax({
                        url: url,
                        type: method,
                        dataType: type,
                        data: data,
                        success: callback
                    });
                };
            });
            jQuery.each([
                'ajaxStart',
                'ajaxStop',
                'ajaxComplete',
                'ajaxError',
                'ajaxSuccess',
                'ajaxSend'
            ], function (i, type) {
                jQuery.fn[type] = function (fn) {
                    return this.on(type, fn);
                };
            });
            jQuery._evalUrl = function (url) {
                return jQuery.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'script',
                    async: false,
                    global: false,
                    'throws': true
                });
            };
            jQuery.fn.extend({
                wrapAll: function (html) {
                    if (jQuery.isFunction(html)) {
                        return this.each(function (i) {
                            jQuery(this).wrapAll(html.call(this, i));
                        });
                    }
                    if (this[0]) {
                        var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                        if (this[0].parentNode) {
                            wrap.insertBefore(this[0]);
                        }
                        wrap.map(function () {
                            var elem = this;
                            while (elem.firstChild && elem.firstChild.nodeType === 1) {
                                elem = elem.firstChild;
                            }
                            return elem;
                        }).append(this);
                    }
                    return this;
                },
                wrapInner: function (html) {
                    if (jQuery.isFunction(html)) {
                        return this.each(function (i) {
                            jQuery(this).wrapInner(html.call(this, i));
                        });
                    }
                    return this.each(function () {
                        var self = jQuery(this), contents = self.contents();
                        if (contents.length) {
                            contents.wrapAll(html);
                        } else {
                            self.append(html);
                        }
                    });
                },
                wrap: function (html) {
                    var isFunction = jQuery.isFunction(html);
                    return this.each(function (i) {
                        jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
                    });
                },
                unwrap: function () {
                    return this.parent().each(function () {
                        if (!jQuery.nodeName(this, 'body')) {
                            jQuery(this).replaceWith(this.childNodes);
                        }
                    }).end();
                }
            });
            jQuery.expr.filters.hidden = function (elem) {
                return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 || !support.reliableHiddenOffsets() && (elem.style && elem.style.display || jQuery.css(elem, 'display')) === 'none';
            };
            jQuery.expr.filters.visible = function (elem) {
                return !jQuery.expr.filters.hidden(elem);
            };
            var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
            function buildParams(prefix, obj, traditional, add) {
                var name;
                if (jQuery.isArray(obj)) {
                    jQuery.each(obj, function (i, v) {
                        if (traditional || rbracket.test(prefix)) {
                            add(prefix, v);
                        } else {
                            buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
                        }
                    });
                } else if (!traditional && jQuery.type(obj) === 'object') {
                    for (name in obj) {
                        buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
                    }
                } else {
                    add(prefix, obj);
                }
            }
            jQuery.param = function (a, traditional) {
                var prefix, s = [], add = function (key, value) {
                        value = jQuery.isFunction(value) ? value() : value == null ? '' : value;
                        s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
                    };
                if (traditional === undefined) {
                    traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
                }
                if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
                    jQuery.each(a, function () {
                        add(this.name, this.value);
                    });
                } else {
                    for (prefix in a) {
                        buildParams(prefix, a[prefix], traditional, add);
                    }
                }
                return s.join('&').replace(r20, '+');
            };
            jQuery.fn.extend({
                serialize: function () {
                    return jQuery.param(this.serializeArray());
                },
                serializeArray: function () {
                    return this.map(function () {
                        var elements = jQuery.prop(this, 'elements');
                        return elements ? jQuery.makeArray(elements) : this;
                    }).filter(function () {
                        var type = this.type;
                        return this.name && !jQuery(this).is(':disabled') && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
                    }).map(function (i, elem) {
                        var val = jQuery(this).val();
                        return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val) {
                            return {
                                name: elem.name,
                                value: val.replace(rCRLF, '\r\n')
                            };
                        }) : {
                            name: elem.name,
                            value: val.replace(rCRLF, '\r\n')
                        };
                    }).get();
                }
            });
            jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ? function () {
                return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && createStandardXHR() || createActiveXHR();
            } : createStandardXHR;
            var xhrId = 0, xhrCallbacks = {}, xhrSupported = jQuery.ajaxSettings.xhr();
            if (window.ActiveXObject) {
                jQuery(window).on('unload', function () {
                    for (var key in xhrCallbacks) {
                        xhrCallbacks[key](undefined, true);
                    }
                });
            }
            support.cors = !!xhrSupported && 'withCredentials' in xhrSupported;
            xhrSupported = support.ajax = !!xhrSupported;
            if (xhrSupported) {
                jQuery.ajaxTransport(function (options) {
                    if (!options.crossDomain || support.cors) {
                        var callback;
                        return {
                            send: function (headers, complete) {
                                var i, xhr = options.xhr(), id = ++xhrId;
                                xhr.open(options.type, options.url, options.async, options.username, options.password);
                                if (options.xhrFields) {
                                    for (i in options.xhrFields) {
                                        xhr[i] = options.xhrFields[i];
                                    }
                                }
                                if (options.mimeType && xhr.overrideMimeType) {
                                    xhr.overrideMimeType(options.mimeType);
                                }
                                if (!options.crossDomain && !headers['X-Requested-With']) {
                                    headers['X-Requested-With'] = 'XMLHttpRequest';
                                }
                                for (i in headers) {
                                    if (headers[i] !== undefined) {
                                        xhr.setRequestHeader(i, headers[i] + '');
                                    }
                                }
                                xhr.send(options.hasContent && options.data || null);
                                callback = function (_, isAbort) {
                                    var status, statusText, responses;
                                    if (callback && (isAbort || xhr.readyState === 4)) {
                                        delete xhrCallbacks[id];
                                        callback = undefined;
                                        xhr.onreadystatechange = jQuery.noop;
                                        if (isAbort) {
                                            if (xhr.readyState !== 4) {
                                                xhr.abort();
                                            }
                                        } else {
                                            responses = {};
                                            status = xhr.status;
                                            if (typeof xhr.responseText === 'string') {
                                                responses.text = xhr.responseText;
                                            }
                                            try {
                                                statusText = xhr.statusText;
                                            } catch (e) {
                                                statusText = '';
                                            }
                                            if (!status && options.isLocal && !options.crossDomain) {
                                                status = responses.text ? 200 : 404;
                                            } else if (status === 1223) {
                                                status = 204;
                                            }
                                        }
                                    }
                                    if (responses) {
                                        complete(status, statusText, responses, xhr.getAllResponseHeaders());
                                    }
                                };
                                if (!options.async) {
                                    callback();
                                } else if (xhr.readyState === 4) {
                                    setTimeout(callback);
                                } else {
                                    xhr.onreadystatechange = xhrCallbacks[id] = callback;
                                }
                            },
                            abort: function () {
                                if (callback) {
                                    callback(undefined, true);
                                }
                            }
                        };
                    }
                });
            }
            function createStandardXHR() {
                try {
                    return new window.XMLHttpRequest();
                } catch (e) {
                }
            }
            function createActiveXHR() {
                try {
                    return new window.ActiveXObject('Microsoft.XMLHTTP');
                } catch (e) {
                }
            }
            jQuery.ajaxSetup({
                accepts: { script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript' },
                contents: { script: /(?:java|ecma)script/ },
                converters: {
                    'text script': function (text) {
                        jQuery.globalEval(text);
                        return text;
                    }
                }
            });
            jQuery.ajaxPrefilter('script', function (s) {
                if (s.cache === undefined) {
                    s.cache = false;
                }
                if (s.crossDomain) {
                    s.type = 'GET';
                    s.global = false;
                }
            });
            jQuery.ajaxTransport('script', function (s) {
                if (s.crossDomain) {
                    var script, head = document.head || jQuery('head')[0] || document.documentElement;
                    return {
                        send: function (_, callback) {
                            script = document.createElement('script');
                            script.async = true;
                            if (s.scriptCharset) {
                                script.charset = s.scriptCharset;
                            }
                            script.src = s.url;
                            script.onload = script.onreadystatechange = function (_, isAbort) {
                                if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                                    script.onload = script.onreadystatechange = null;
                                    if (script.parentNode) {
                                        script.parentNode.removeChild(script);
                                    }
                                    script = null;
                                    if (!isAbort) {
                                        callback(200, 'success');
                                    }
                                }
                            };
                            head.insertBefore(script, head.firstChild);
                        },
                        abort: function () {
                            if (script) {
                                script.onload(undefined, true);
                            }
                        }
                    };
                }
            });
            var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
            jQuery.ajaxSetup({
                jsonp: 'callback',
                jsonpCallback: function () {
                    var callback = oldCallbacks.pop() || jQuery.expando + '_' + nonce++;
                    this[callback] = true;
                    return callback;
                }
            });
            jQuery.ajaxPrefilter('json jsonp', function (s, originalSettings, jqXHR) {
                var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? 'url' : typeof s.data === 'string' && !(s.contentType || '').indexOf('application/x-www-form-urlencoded') && rjsonp.test(s.data) && 'data');
                if (jsonProp || s.dataTypes[0] === 'jsonp') {
                    callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
                    if (jsonProp) {
                        s[jsonProp] = s[jsonProp].replace(rjsonp, '$1' + callbackName);
                    } else if (s.jsonp !== false) {
                        s.url += (rquery.test(s.url) ? '&' : '?') + s.jsonp + '=' + callbackName;
                    }
                    s.converters['script json'] = function () {
                        if (!responseContainer) {
                            jQuery.error(callbackName + ' was not called');
                        }
                        return responseContainer[0];
                    };
                    s.dataTypes[0] = 'json';
                    overwritten = window[callbackName];
                    window[callbackName] = function () {
                        responseContainer = arguments;
                    };
                    jqXHR.always(function () {
                        window[callbackName] = overwritten;
                        if (s[callbackName]) {
                            s.jsonpCallback = originalSettings.jsonpCallback;
                            oldCallbacks.push(callbackName);
                        }
                        if (responseContainer && jQuery.isFunction(overwritten)) {
                            overwritten(responseContainer[0]);
                        }
                        responseContainer = overwritten = undefined;
                    });
                    return 'script';
                }
            });
            jQuery.parseHTML = function (data, context, keepScripts) {
                if (!data || typeof data !== 'string') {
                    return null;
                }
                if (typeof context === 'boolean') {
                    keepScripts = context;
                    context = false;
                }
                context = context || document;
                var parsed = rsingleTag.exec(data), scripts = !keepScripts && [];
                if (parsed) {
                    return [context.createElement(parsed[1])];
                }
                parsed = jQuery.buildFragment([data], context, scripts);
                if (scripts && scripts.length) {
                    jQuery(scripts).remove();
                }
                return jQuery.merge([], parsed.childNodes);
            };
            var _load = jQuery.fn.load;
            jQuery.fn.load = function (url, params, callback) {
                if (typeof url !== 'string' && _load) {
                    return _load.apply(this, arguments);
                }
                var selector, response, type, self = this, off = url.indexOf(' ');
                if (off >= 0) {
                    selector = url.slice(off, url.length);
                    url = url.slice(0, off);
                }
                if (jQuery.isFunction(params)) {
                    callback = params;
                    params = undefined;
                } else if (params && typeof params === 'object') {
                    type = 'POST';
                }
                if (self.length > 0) {
                    jQuery.ajax({
                        url: url,
                        type: type,
                        dataType: 'html',
                        data: params
                    }).done(function (responseText) {
                        response = arguments;
                        self.html(selector ? jQuery('<div>').append(jQuery.parseHTML(responseText)).find(selector) : responseText);
                    }).complete(callback && function (jqXHR, status) {
                        self.each(callback, response || [
                            jqXHR.responseText,
                            status,
                            jqXHR
                        ]);
                    });
                }
                return this;
            };
            jQuery.expr.filters.animated = function (elem) {
                return jQuery.grep(jQuery.timers, function (fn) {
                    return elem === fn.elem;
                }).length;
            };
            var docElem = window.document.documentElement;
            function getWindow(elem) {
                return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
            }
            jQuery.offset = {
                setOffset: function (elem, options, i) {
                    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery.css(elem, 'position'), curElem = jQuery(elem), props = {};
                    if (position === 'static') {
                        elem.style.position = 'relative';
                    }
                    curOffset = curElem.offset();
                    curCSSTop = jQuery.css(elem, 'top');
                    curCSSLeft = jQuery.css(elem, 'left');
                    calculatePosition = (position === 'absolute' || position === 'fixed') && jQuery.inArray('auto', [
                        curCSSTop,
                        curCSSLeft
                    ]) > -1;
                    if (calculatePosition) {
                        curPosition = curElem.position();
                        curTop = curPosition.top;
                        curLeft = curPosition.left;
                    } else {
                        curTop = parseFloat(curCSSTop) || 0;
                        curLeft = parseFloat(curCSSLeft) || 0;
                    }
                    if (jQuery.isFunction(options)) {
                        options = options.call(elem, i, curOffset);
                    }
                    if (options.top != null) {
                        props.top = options.top - curOffset.top + curTop;
                    }
                    if (options.left != null) {
                        props.left = options.left - curOffset.left + curLeft;
                    }
                    if ('using' in options) {
                        options.using.call(elem, props);
                    } else {
                        curElem.css(props);
                    }
                }
            };
            jQuery.fn.extend({
                offset: function (options) {
                    if (arguments.length) {
                        return options === undefined ? this : this.each(function (i) {
                            jQuery.offset.setOffset(this, options, i);
                        });
                    }
                    var docElem, win, box = {
                            top: 0,
                            left: 0
                        }, elem = this[0], doc = elem && elem.ownerDocument;
                    if (!doc) {
                        return;
                    }
                    docElem = doc.documentElement;
                    if (!jQuery.contains(docElem, elem)) {
                        return box;
                    }
                    if (typeof elem.getBoundingClientRect !== strundefined) {
                        box = elem.getBoundingClientRect();
                    }
                    win = getWindow(doc);
                    return {
                        top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                        left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
                    };
                },
                position: function () {
                    if (!this[0]) {
                        return;
                    }
                    var offsetParent, offset, parentOffset = {
                            top: 0,
                            left: 0
                        }, elem = this[0];
                    if (jQuery.css(elem, 'position') === 'fixed') {
                        offset = elem.getBoundingClientRect();
                    } else {
                        offsetParent = this.offsetParent();
                        offset = this.offset();
                        if (!jQuery.nodeName(offsetParent[0], 'html')) {
                            parentOffset = offsetParent.offset();
                        }
                        parentOffset.top += jQuery.css(offsetParent[0], 'borderTopWidth', true);
                        parentOffset.left += jQuery.css(offsetParent[0], 'borderLeftWidth', true);
                    }
                    return {
                        top: offset.top - parentOffset.top - jQuery.css(elem, 'marginTop', true),
                        left: offset.left - parentOffset.left - jQuery.css(elem, 'marginLeft', true)
                    };
                },
                offsetParent: function () {
                    return this.map(function () {
                        var offsetParent = this.offsetParent || docElem;
                        while (offsetParent && (!jQuery.nodeName(offsetParent, 'html') && jQuery.css(offsetParent, 'position') === 'static')) {
                            offsetParent = offsetParent.offsetParent;
                        }
                        return offsetParent || docElem;
                    });
                }
            });
            jQuery.each({
                scrollLeft: 'pageXOffset',
                scrollTop: 'pageYOffset'
            }, function (method, prop) {
                var top = /Y/.test(prop);
                jQuery.fn[method] = function (val) {
                    return access(this, function (elem, method, val) {
                        var win = getWindow(elem);
                        if (val === undefined) {
                            return win ? prop in win ? win[prop] : win.document.documentElement[method] : elem[method];
                        }
                        if (win) {
                            win.scrollTo(!top ? val : jQuery(win).scrollLeft(), top ? val : jQuery(win).scrollTop());
                        } else {
                            elem[method] = val;
                        }
                    }, method, val, arguments.length, null);
                };
            });
            jQuery.each([
                'top',
                'left'
            ], function (i, prop) {
                jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function (elem, computed) {
                    if (computed) {
                        computed = curCSS(elem, prop);
                        return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + 'px' : computed;
                    }
                });
            });
            jQuery.each({
                Height: 'height',
                Width: 'width'
            }, function (name, type) {
                jQuery.each({
                    padding: 'inner' + name,
                    content: type,
                    '': 'outer' + name
                }, function (defaultExtra, funcName) {
                    jQuery.fn[funcName] = function (margin, value) {
                        var chainable = arguments.length && (defaultExtra || typeof margin !== 'boolean'), extra = defaultExtra || (margin === true || value === true ? 'margin' : 'border');
                        return access(this, function (elem, type, value) {
                            var doc;
                            if (jQuery.isWindow(elem)) {
                                return elem.document.documentElement['client' + name];
                            }
                            if (elem.nodeType === 9) {
                                doc = elem.documentElement;
                                return Math.max(elem.body['scroll' + name], doc['scroll' + name], elem.body['offset' + name], doc['offset' + name], doc['client' + name]);
                            }
                            return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
                        }, type, chainable ? margin : undefined, chainable, null);
                    };
                });
            });
            jQuery.fn.size = function () {
                return this.length;
            };
            jQuery.fn.andSelf = jQuery.fn.addBack;
            if (typeof define === 'function' && define.amd) {
                define('jquery', [], function () {
                    return jQuery;
                });
            }
            var _jQuery = window.jQuery, _$ = window.$;
            jQuery.noConflict = function (deep) {
                if (window.$ === jQuery) {
                    window.$ = _$;
                }
                if (deep && window.jQuery === jQuery) {
                    window.jQuery = _jQuery;
                }
                return jQuery;
            };
            if (typeof noGlobal === strundefined) {
                window.jQuery = window.$ = jQuery;
            }
            return jQuery;
        }));
    }(function () {
        return this;
    }(), require, exports, module));
});
/*funcunit@3.6.3#browser/init*/
define('funcunit/browser/init', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery'
], function (require, exports, module) {
    var jQuery = require('funcunit/browser/jquery');
    var FuncUnit = window.FuncUnit || {};
    jQuery.sub = function () {
        function jQuerySub(selector, context) {
            return new jQuerySub.fn.init(selector, context);
        }
        jQuery.extend(true, jQuerySub, this);
        jQuerySub.superclass = this;
        jQuerySub.fn = jQuerySub.prototype = this();
        jQuerySub.fn.constructor = jQuerySub;
        jQuerySub.sub = this.sub;
        jQuerySub.fn.init = function init(selector, context) {
            if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
                context = jQuerySub(context);
            }
            return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
        };
        jQuerySub.fn.init.prototype = jQuerySub.fn;
        var rootjQuerySub = jQuerySub(document);
        return jQuerySub;
    };
    FuncUnit.jQuery = jQuery;
    module.exports = FuncUnit;
});
/*funcunit@3.6.3#browser/core*/
define('funcunit/browser/core', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/init'
], function (require, exports, module) {
    var jQuery = require('funcunit/browser/jquery');
    var oldFuncUnit = require('funcunit/browser/init');
    var FuncUnit = oldFuncUnit.jQuery.sub();
    var origFuncUnit = FuncUnit;
    FuncUnit = function (selector, frame) {
        var frame, forceSync, isSyncOnly = false;
        if (frame && frame.forceSync) {
            forceSync = frame.forceSync;
        }
        if (frame && typeof frame.frame !== 'undefined') {
            frame = frame.frame;
        }
        isSyncOnly = typeof forceSync === 'boolean' ? forceSync : isSyncOnly;
        if (typeof selector == 'function') {
            return FuncUnit.wait(0, selector);
        }
        this.selector = selector;
        if (isSyncOnly === true) {
            var collection = performSyncQuery(selector, frame);
            return collection;
        } else {
            performAsyncQuery(selector, frame, this);
            var collection = performSyncQuery(selector, frame);
            return collection;
        }
    };
    var getContext = function (context) {
            if (typeof context === 'number' || typeof context === 'string') {
                var sel = typeof context === 'number' ? 'iframe:eq(' + context + ')' : 'iframe[name=\'' + context + '\']', frames = new origFuncUnit.fn.init(sel, FuncUnit.win.document.documentElement, true);
                var frame = (frames.length ? frames.get(0).contentWindow : FuncUnit.win).document.documentElement;
            } else {
                frame = FuncUnit.win.document.documentElement;
            }
            return frame;
        }, performAsyncQuery = function (selector, frame, self) {
            FuncUnit.add({
                method: function (success, error) {
                    this.frame = frame;
                    if (FuncUnit.win) {
                        frame = getContext(frame);
                    }
                    this.selector = selector;
                    this.bind = new origFuncUnit.fn.init(selector, frame, true);
                    success();
                    return this;
                },
                error: 'selector failed: ' + selector,
                type: 'query'
            });
        }, performSyncQuery = function (selector, frame) {
            var origFrame = frame;
            if (FuncUnit.win) {
                frame = getContext(frame);
            }
            var obj = new origFuncUnit.fn.init(selector, frame, true);
            obj.frame = origFrame;
            return obj;
        };
    oldFuncUnit.jQuery.extend(FuncUnit, oldFuncUnit, origFuncUnit);
    FuncUnit.prototype = origFuncUnit.prototype;
    module.exports = FuncUnit;
});
/*funcunit@3.6.3#browser/adapters/jasmine*/
define('funcunit/browser/adapters/jasmine', function (require, exports, module) {
    module.exports = function (jasmine) {
        var paused = false;
        return {
            pauseTest: function () {
                paused = true;
                waitsFor(function () {
                    return paused === false;
                }, 60000);
            },
            resumeTest: function () {
                paused = false;
            },
            assertOK: function (assertion) {
                expect(assertion).toBeTruthy();
            },
            equiv: function (expected, actual) {
                return jasmine.getEnv().equals_(expected, actual);
            }
        };
    };
});
/*funcunit@3.6.3#browser/adapters/jasmine2*/
define('funcunit/browser/adapters/jasmine2', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core'
], function (require, exports, module) {
    var FuncUnit = require('funcunit/browser/core');
    module.exports = function () {
        FuncUnit.timeout = 4900;
        return {
            pauseTest: function () {
            },
            resumeTest: function () {
            },
            assertOK: function (assertion) {
                expect(assertion).toBeTruthy();
            },
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
    };
});
/*funcunit@3.6.3#browser/adapters/qunit*/
define('funcunit/browser/adapters/qunit', function (require, exports, module) {
    module.exports = function (QUnit) {
        return {
            pauseTest: function () {
                QUnit.stop();
            },
            resumeTest: function () {
                QUnit.start();
            },
            assertOK: function (assertion, message) {
                QUnit.ok(assertion, message);
            },
            equiv: function (expected, actual) {
                return QUnit.equiv(expected, actual);
            }
        };
    };
});
/*funcunit@3.6.3#browser/adapters/qunit2*/
define('funcunit/browser/adapters/qunit2', function (require, exports, module) {
    module.exports = function (runner) {
        var doneStack = [];
        var getCurrentAssert = function () {
            if (runner.config.current) {
                return runner.config.current.assert;
            }
            throw new Error('Outside of test context');
        };
        return {
            pauseTest: function () {
                doneStack.push(getCurrentAssert().async());
            },
            resumeTest: function () {
                doneStack.pop()();
            },
            assertOK: function (assertion, message) {
                getCurrentAssert().ok(assertion, message);
            },
            equiv: function (expected, actual) {
                return runner.equiv(expected, actual);
            }
        };
    };
});
/*funcunit@3.6.3#browser/adapters/mocha*/
define('funcunit/browser/adapters/mocha', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core'
], function (require, exports, module) {
    var FuncUnit = require('funcunit/browser/core');
    var ok = function (expr, msg) {
        if (!expr)
            throw new Error(msg);
    };
    module.exports = function () {
        FuncUnit.timeout = 1900;
        return {
            pauseTest: function () {
            },
            resumeTest: function () {
            },
            assertOK: function (assertion, message) {
                ok(assertion, message);
            },
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
    };
});
/*funcunit@3.6.3#browser/adapters/adapters*/
define('funcunit/browser/adapters/adapters', [
    'require',
    'exports',
    'module',
    'funcunit/browser/adapters/jasmine',
    'funcunit/browser/adapters/jasmine2',
    'funcunit/browser/adapters/qunit',
    'funcunit/browser/adapters/qunit2',
    'funcunit/browser/adapters/mocha',
    'funcunit/browser/core'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var jasmineAdapter = require('funcunit/browser/adapters/jasmine');
        var jasmine2Adapter = require('funcunit/browser/adapters/jasmine2');
        var qunitAdapter = require('funcunit/browser/adapters/qunit');
        var qunit2Adapter = require('funcunit/browser/adapters/qunit2');
        var mochaAdapter = require('funcunit/browser/adapters/mocha');
        var FuncUnit = require('funcunit/browser/core');
        var noop = function () {
        };
        var defaultAdapter = {
            pauseTest: noop,
            resumeTest: noop,
            assertOK: noop,
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
        FuncUnit.unit = defaultAdapter;
        FuncUnit.attach = function (runner) {
            var unit;
            if (isQUnit(runner)) {
                unit = qunitAdapter(runner);
            } else if (isQUnit2(runner)) {
                unit = qunit2Adapter(runner);
            } else if (isMocha(runner)) {
                unit = mochaAdapter(runner);
            } else if (isJasmine(runner)) {
                unit = jasmineAdapter(runner);
            } else if (isJasmine2(runner)) {
                unit = jasmine2Adapter(runner);
            } else {
                unit = defaultAdapter;
            }
            FuncUnit.unit = unit;
        };
        function isQUnit(runner) {
            return !!(window.QUnit && runner === window.QUnit && (!runner.version || runner.version.startsWith('1.')));
        }
        function isQUnit2(runner) {
            return !!(window.QUnit && runner === window.QUnit && runner.version && runner.version.startsWith('2.'));
        }
        function isMocha(runner) {
            return !!(runner.setup && runner.globals && runner.reporter);
        }
        function isJasmine(runner) {
            return !!(runner.getEnv && typeof window.waitsFor === 'function');
        }
        function isJasmine2(runner) {
            return !!(runner.getEnv && typeof runner.clock === 'function' && !window.waitsFor);
        }
        FuncUnit.detach = function () {
            FuncUnit.unit = defaultAdapter;
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*syn@0.14.1#synthetic*/
define('syn/synthetic', function (require, exports, module) {
    var opts = window.syn ? window.syn : {};
    var extend = function (d, s) {
            var p;
            for (p in s) {
                d[p] = s[p];
            }
            return d;
        }, browser = {
            msie: !!(window.attachEvent && !window.opera) || navigator.userAgent.indexOf('Trident/') > -1,
            opera: !!window.opera,
            webkit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
            safari: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Chrome/') === -1,
            gecko: navigator.userAgent.indexOf('Gecko') > -1,
            mobilesafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
            rhino: navigator.userAgent.match(/Rhino/) && true,
            chrome: !!window.chrome && !!window.chrome.webstore
        }, createEventObject = function (type, options, element) {
            var event = element.ownerDocument.createEventObject();
            return extend(event, options);
        }, data = {}, id = 1, expando = '_synthetic' + new Date().getTime(), bind, unbind, schedule, key = /keypress|keyup|keydown/, page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/, activeElement, syn = function (type, element, options, callback) {
            return new syn.init(type, element, options, callback);
        };
    syn.config = opts;
    syn.__tryFocus = function tryFocus(element) {
        try {
            element.focus();
        } catch (e) {
        }
    };
    bind = function (el, ev, f) {
        return el.addEventListener ? el.addEventListener(ev, f, false) : el.attachEvent('on' + ev, f);
    };
    unbind = function (el, ev, f) {
        return el.addEventListener ? el.removeEventListener(ev, f, false) : el.detachEvent('on' + ev, f);
    };
    schedule = syn.config.schedule || function (fn, ms) {
        setTimeout(fn, ms);
    };
    extend(syn, {
        init: function (type, element, options, callback) {
            var args = syn.args(options, element, callback), self = this;
            this.queue = [];
            this.element = args.element;
            if (typeof this[type] === 'function') {
                this[type](args.element, args.options, function (defaults, el) {
                    if (args.callback) {
                        args.callback.apply(self, arguments);
                    }
                    self.done.apply(self, arguments);
                });
            } else {
                this.result = syn.trigger(args.element, type, args.options);
                if (args.callback) {
                    args.callback.call(this, args.element, this.result);
                }
            }
        },
        jquery: function (el, fast) {
            if (window.FuncUnit && window.FuncUnit.jQuery) {
                return window.FuncUnit.jQuery;
            }
            if (el) {
                return syn.helpers.getWindow(el).jQuery || window.jQuery;
            } else {
                return window.jQuery;
            }
        },
        args: function () {
            var res = {}, i = 0;
            for (; i < arguments.length; i++) {
                if (typeof arguments[i] === 'function') {
                    res.callback = arguments[i];
                } else if (arguments[i] && arguments[i].jquery) {
                    res.element = arguments[i][0];
                } else if (arguments[i] && arguments[i].nodeName) {
                    res.element = arguments[i];
                } else if (res.options && typeof arguments[i] === 'string') {
                    res.element = document.getElementById(arguments[i]);
                } else if (arguments[i]) {
                    res.options = arguments[i];
                }
            }
            return res;
        },
        click: function (element, options, callback) {
            syn('click!', element, options, callback);
        },
        defaults: {
            focus: function focus() {
                if (!syn.support.focusChanges) {
                    var element = this, nodeName = element.nodeName.toLowerCase();
                    syn.data(element, 'syntheticvalue', element.value);
                    if (nodeName === 'input' || nodeName === 'textarea') {
                        bind(element, 'blur', function blur() {
                            if (syn.data(element, 'syntheticvalue') !== element.value) {
                                syn.trigger(element, 'change', {});
                            }
                            unbind(element, 'blur', blur);
                        });
                    }
                }
            },
            submit: function () {
                syn.onParents(this, function (el) {
                    if (el.nodeName.toLowerCase() === 'form') {
                        el.submit();
                        return false;
                    }
                });
            }
        },
        changeOnBlur: function (element, prop, value) {
            bind(element, 'blur', function onblur() {
                if (value !== element[prop]) {
                    syn.trigger(element, 'change', {});
                }
                unbind(element, 'blur', onblur);
            });
        },
        closest: function (el, type) {
            while (el && el.nodeName.toLowerCase() !== type.toLowerCase()) {
                el = el.parentNode;
            }
            return el;
        },
        data: function (el, key, value) {
            var d;
            if (!el[expando]) {
                el[expando] = id++;
            }
            if (!data[el[expando]]) {
                data[el[expando]] = {};
            }
            d = data[el[expando]];
            if (value) {
                data[el[expando]][key] = value;
            } else {
                return data[el[expando]][key];
            }
        },
        onParents: function (el, func) {
            var res;
            while (el && res !== false) {
                res = func(el);
                el = el.parentNode;
            }
            return el;
        },
        focusable: /^(a|area|frame|iframe|label|input|select|textarea|button|html|object)$/i,
        isFocusable: function (elem) {
            var attributeNode;
            if (elem.getAttributeNode) {
                attributeNode = elem.getAttributeNode('tabIndex');
            }
            return this.focusable.test(elem.nodeName) || attributeNode && attributeNode.specified && syn.isVisible(elem);
        },
        isVisible: function (elem) {
            return elem.offsetWidth && elem.offsetHeight || elem.clientWidth && elem.clientHeight;
        },
        tabIndex: function (elem) {
            var attributeNode = elem.getAttributeNode('tabIndex');
            return attributeNode && attributeNode.specified && (parseInt(elem.getAttribute('tabIndex')) || 0);
        },
        bind: bind,
        unbind: unbind,
        schedule: schedule,
        browser: browser,
        helpers: {
            createEventObject: createEventObject,
            createBasicStandardEvent: function (type, defaults, doc) {
                var event;
                try {
                    event = doc.createEvent('Events');
                } catch (e2) {
                    event = doc.createEvent('UIEvents');
                } finally {
                    event.initEvent(type, true, true);
                    extend(event, defaults);
                }
                return event;
            },
            inArray: function (item, array) {
                var i = 0;
                for (; i < array.length; i++) {
                    if (array[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
            getWindow: function (element) {
                if (element.ownerDocument) {
                    return element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
                }
            },
            extend: extend,
            scrollOffset: function (win, set) {
                var doc = win.document.documentElement, body = win.document.body;
                if (set) {
                    window.scrollTo(set.left, set.top);
                } else {
                    return {
                        left: (doc && doc.scrollLeft || body && body.scrollLeft || 0) + (doc.clientLeft || 0),
                        top: (doc && doc.scrollTop || body && body.scrollTop || 0) + (doc.clientTop || 0)
                    };
                }
            },
            scrollDimensions: function (win) {
                var doc = win.document.documentElement, body = win.document.body, docWidth = doc.clientWidth, docHeight = doc.clientHeight, compat = win.document.compatMode === 'CSS1Compat';
                return {
                    height: compat && docHeight || body.clientHeight || docHeight,
                    width: compat && docWidth || body.clientWidth || docWidth
                };
            },
            addOffset: function (options, el) {
                var jq = syn.jquery(el), off;
                if (typeof options === 'object' && options.clientX === undefined && options.clientY === undefined && options.pageX === undefined && options.pageY === undefined && jq) {
                    el = jq(el);
                    off = el.offset();
                    options.pageX = off.left + el.width() / 2;
                    options.pageY = off.top + el.height() / 2;
                }
            }
        },
        key: {
            ctrlKey: null,
            altKey: null,
            shiftKey: null,
            metaKey: null
        },
        dispatch: function (event, element, type, autoPrevent) {
            if (element.dispatchEvent && event) {
                var preventDefault = event.preventDefault, prevents = autoPrevent ? -1 : 0;
                if (autoPrevent) {
                    bind(element, type, function ontype(ev) {
                        ev.preventDefault();
                        unbind(this, type, ontype);
                    });
                }
                event.preventDefault = function () {
                    prevents++;
                    if (++prevents > 0) {
                        preventDefault.apply(this, []);
                    }
                };
                element.dispatchEvent(event);
                return prevents <= 0;
            } else {
                try {
                    window.event = event;
                } catch (e) {
                }
                return element.sourceIndex <= 0 || element.fireEvent && element.fireEvent('on' + type, event);
            }
        },
        create: {
            page: {
                event: function (type, options, element) {
                    var doc = syn.helpers.getWindow(element).document || document, event;
                    if (doc.createEvent) {
                        event = doc.createEvent('Events');
                        event.initEvent(type, true, true);
                        return event;
                    } else {
                        try {
                            event = createEventObject(type, options, element);
                        } catch (e) {
                        }
                        return event;
                    }
                }
            },
            focus: {
                event: function (type, options, element) {
                    syn.onParents(element, function (el) {
                        if (syn.isFocusable(el)) {
                            if (el.nodeName.toLowerCase() !== 'html') {
                                syn.__tryFocus(el);
                                activeElement = el;
                            } else if (activeElement) {
                                var doc = syn.helpers.getWindow(element).document;
                                if (doc !== window.document) {
                                    return false;
                                } else if (doc.activeElement) {
                                    doc.activeElement.blur();
                                    activeElement = null;
                                } else {
                                    activeElement.blur();
                                    activeElement = null;
                                }
                            }
                            return false;
                        }
                    });
                    return true;
                }
            }
        },
        support: {
            clickChanges: false,
            clickSubmits: false,
            keypressSubmits: false,
            mouseupSubmits: false,
            radioClickChanges: false,
            focusChanges: false,
            linkHrefJS: false,
            keyCharacters: false,
            backspaceWorks: false,
            mouseDownUpClicks: false,
            tabKeyTabs: false,
            keypressOnAnchorClicks: false,
            optionClickBubbles: false,
            pointerEvents: false,
            touchEvents: false,
            ready: 0
        },
        trigger: function (element, type, options) {
            if (!options) {
                options = {};
            }
            var create = syn.create, setup = create[type] && create[type].setup, kind = key.test(type) ? 'key' : page.test(type) ? 'page' : 'mouse', createType = create[type] || {}, createKind = create[kind], event, ret, autoPrevent, dispatchEl = element;
            if (syn.support.ready === 2 && setup) {
                setup(type, options, element);
            }
            autoPrevent = options._autoPrevent;
            delete options._autoPrevent;
            if (createType.event) {
                ret = createType.event(type, options, element);
            } else {
                options = createKind.options ? createKind.options(type, options, element) : options;
                if (!syn.support.changeBubbles && /option/i.test(element.nodeName)) {
                    dispatchEl = element.parentNode;
                }
                event = createKind.event(type, options, dispatchEl);
                ret = syn.dispatch(event, dispatchEl, type, autoPrevent);
            }
            if (ret && syn.support.ready === 2 && syn.defaults[type]) {
                syn.defaults[type].call(element, options, autoPrevent);
            }
            return ret;
        },
        eventSupported: function (eventName) {
            var el = document.createElement('div');
            eventName = 'on' + eventName;
            var isSupported = eventName in el;
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] === 'function';
            }
            el = null;
            return isSupported;
        }
    });
    extend(syn.init.prototype, {
        then: function (type, element, options, callback) {
            if (syn.autoDelay) {
                this.delay();
            }
            var args = syn.args(options, element, callback), self = this;
            this.queue.unshift(function (el, prevented) {
                if (typeof this[type] === 'function') {
                    this.element = args.element || el;
                    this[type](this.element, args.options, function (defaults, el) {
                        if (args.callback) {
                            args.callback.apply(self, arguments);
                        }
                        self.done.apply(self, arguments);
                    });
                } else {
                    this.result = syn.trigger(args.element, type, args.options);
                    if (args.callback) {
                        args.callback.call(this, args.element, this.result);
                    }
                    return this;
                }
            });
            return this;
        },
        delay: function (timeout, callback) {
            if (typeof timeout === 'function') {
                callback = timeout;
                timeout = null;
            }
            timeout = timeout || 600;
            var self = this;
            this.queue.unshift(function () {
                schedule(function () {
                    if (callback) {
                        callback.apply(self, []);
                    }
                    self.done.apply(self, arguments);
                }, timeout);
            });
            return this;
        },
        done: function (defaults, el) {
            if (el) {
                this.element = el;
            }
            if (this.queue.length) {
                this.queue.pop().call(this, this.element, defaults);
            }
        },
        '_click': function (element, options, callback, force) {
            syn.helpers.addOffset(options, element);
            if (syn.support.pointerEvents) {
                syn.trigger(element, 'pointerdown', options);
            }
            if (syn.support.touchEvents) {
                syn.trigger(element, 'touchstart', options);
            }
            syn.trigger(element, 'mousedown', options);
            schedule(function () {
                if (syn.support.pointerEvents) {
                    syn.trigger(element, 'pointerup', options);
                }
                if (syn.support.touchEvents) {
                    syn.trigger(element, 'touchend', options);
                }
                syn.trigger(element, 'mouseup', options);
                if (!syn.support.mouseDownUpClicks || force) {
                    syn.trigger(element, 'click', options);
                    callback(true);
                } else {
                    syn.create.click.setup('click', options, element);
                    syn.defaults.click.call(element);
                    schedule(function () {
                        callback(true);
                    }, 1);
                }
            }, 1);
        },
        '_rightClick': function (element, options, callback) {
            syn.helpers.addOffset(options, element);
            var mouseopts = extend(extend({}, syn.mouse.browser.right.mouseup), options);
            if (syn.support.pointerEvents) {
                syn.trigger(element, 'pointerdown', mouseopts);
            }
            syn.trigger(element, 'mousedown', mouseopts);
            schedule(function () {
                if (syn.support.pointerEvents) {
                    syn.trigger(element, 'pointerup', mouseopts);
                }
                syn.trigger(element, 'mouseup', mouseopts);
                if (syn.mouse.browser.right.contextmenu) {
                    syn.trigger(element, 'contextmenu', extend(extend({}, syn.mouse.browser.right.contextmenu), options));
                }
                callback(true);
            }, 1);
        },
        '_dblclick': function (element, options, callback) {
            syn.helpers.addOffset(options, element);
            var self = this;
            this._click(element, options, function () {
                schedule(function () {
                    self._click(element, options, function () {
                        syn.trigger(element, 'dblclick', options);
                        callback(true);
                    }, true);
                }, 2);
            });
        }
    });
    var actions = [
            'click',
            'dblclick',
            'move',
            'drag',
            'key',
            'type',
            'rightClick'
        ], makeAction = function (name) {
            syn[name] = function (element, options, callback) {
                return syn('_' + name, element, options, callback);
            };
            syn.init.prototype[name] = function (element, options, callback) {
                return this.then('_' + name, element, options, callback);
            };
        }, i = 0;
    for (; i < actions.length; i++) {
        makeAction(actions[i]);
    }
    module.exports = syn;
});
/*syn@0.14.1#mouse*/
define('syn/mouse', [
    'require',
    'exports',
    'module',
    'syn/synthetic'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    var h = syn.helpers, getWin = h.getWindow;
    syn.mouse = {};
    h.extend(syn.defaults, {
        mousedown: function (options) {
            syn.trigger(this, 'focus', {});
        },
        click: function () {
            var element = this, href, type, createChange, radioChanged, nodeName, scope;
            try {
                href = element.href;
                type = element.type;
                createChange = syn.data(element, 'createChange');
                radioChanged = syn.data(element, 'radioChanged');
                scope = getWin(element);
                nodeName = element.nodeName.toLowerCase();
            } catch (e) {
                return;
            }
            if (!syn.support.linkHrefJS && /^\s*javascript:/.test(href)) {
                var code = href.replace(/^\s*javascript:/, '');
                if (code !== '//' && code.indexOf('void(0)') === -1) {
                    if (window.selenium) {
                        eval('with(selenium.browserbot.getCurrentWindow()){' + code + '}');
                    } else {
                        eval('with(scope){' + code + '}');
                    }
                }
            }
            if (!syn.support.clickSubmits && ((nodeName === 'input' || nodeName === 'button') && type === 'submit')) {
                var form = syn.closest(element, 'form');
                if (form) {
                    syn.trigger(form, 'submit', {});
                }
            }
            if (nodeName === 'a' && element.href && !/^\s*javascript:/.test(href)) {
                scope.location.href = href;
            }
            if (nodeName === 'input' && type === 'checkbox') {
                if (!syn.support.clickChanges) {
                    syn.trigger(element, 'change', {});
                }
            }
            if (nodeName === 'input' && type === 'radio') {
                if (radioChanged && !syn.support.radioClickChanges) {
                    syn.trigger(element, 'change', {});
                }
            }
            if (nodeName === 'option' && createChange) {
                syn.trigger(element.parentNode, 'change', {});
                syn.data(element, 'createChange', false);
            }
        }
    });
    h.extend(syn.create, {
        mouse: {
            options: function (type, options, element) {
                var doc = document.documentElement, body = document.body, center = [
                        options.pageX || 0,
                        options.pageY || 0
                    ], left = syn.mouse.browser && syn.mouse.browser.left[type], right = syn.mouse.browser && syn.mouse.browser.right[type];
                return h.extend({
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    detail: 1,
                    screenX: 1,
                    screenY: 1,
                    clientX: options.clientX || center[0] - (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
                    clientY: options.clientY || center[1] - (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0),
                    ctrlKey: !!syn.key.ctrlKey,
                    altKey: !!syn.key.altKey,
                    shiftKey: !!syn.key.shiftKey,
                    metaKey: !!syn.key.metaKey,
                    button: left && left.button !== null ? left.button : right && right.button || (type === 'contextmenu' ? 2 : 0),
                    relatedTarget: document.documentElement
                }, options);
            },
            event: function (type, defaults, element) {
                var doc = getWin(element).document || document, event;
                if (doc.createEvent) {
                    try {
                        event = doc.createEvent('MouseEvents');
                        event.initMouseEvent(type, defaults.bubbles, defaults.cancelable, defaults.view, defaults.detail, defaults.screenX, defaults.screenY, defaults.clientX, defaults.clientY, defaults.ctrlKey, defaults.altKey, defaults.shiftKey, defaults.metaKey, defaults.button, defaults.relatedTarget);
                    } catch (e) {
                        event = h.createBasicStandardEvent(type, defaults, doc);
                    }
                    event.synthetic = true;
                    return event;
                } else {
                    try {
                        event = h.createEventObject(type, defaults, element);
                    } catch (e) {
                    }
                    return event;
                }
            }
        },
        click: {
            setup: function (type, options, element) {
                var nodeName = element.nodeName.toLowerCase();
                if (!syn.support.clickChecks && !syn.support.changeChecks && nodeName === 'input') {
                    type = element.type.toLowerCase();
                    if (type === 'checkbox') {
                        element.checked = !element.checked;
                    }
                    if (type === 'radio') {
                        if (!element.checked) {
                            try {
                                syn.data(element, 'radioChanged', true);
                            } catch (e) {
                            }
                            element.checked = true;
                        }
                    }
                }
                if (nodeName === 'a' && element.href && !/^\s*javascript:/.test(element.href)) {
                    syn.data(element, 'href', element.href);
                }
                if (/option/i.test(element.nodeName)) {
                    var child = element.parentNode.firstChild, i = -1;
                    while (child) {
                        if (child.nodeType === 1) {
                            i++;
                            if (child === element) {
                                break;
                            }
                        }
                        child = child.nextSibling;
                    }
                    if (i !== element.parentNode.selectedIndex) {
                        element.parentNode.selectedIndex = i;
                        syn.data(element, 'createChange', true);
                    }
                }
            }
        },
        mousedown: {
            setup: function (type, options, element) {
                var nn = element.nodeName.toLowerCase();
                if (syn.browser.safari && (nn === 'select' || nn === 'option')) {
                    options._autoPrevent = true;
                }
            }
        }
    });
});
/*syn@0.14.1#mouse.support*/
define('syn/mouse.support', [
    'require',
    'exports',
    'module',
    'syn/synthetic',
    'syn/mouse'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    require('syn/mouse');
    (function checkSupport() {
        if (!document.body) {
            return syn.schedule(checkSupport, 1);
        }
        window.__synthTest = function () {
            syn.support.linkHrefJS = true;
        };
        var div = document.createElement('div'), checkbox, submit, form, select;
        div.innerHTML = '<form id=\'outer\'>' + '<input name=\'checkbox\' type=\'checkbox\'/>' + '<input name=\'radio\' type=\'radio\' />' + '<input type=\'submit\' name=\'submitter\'/>' + '<input type=\'input\' name=\'inputter\'/>' + '<input name=\'one\'>' + '<input name=\'two\'/>' + '<a href=\'javascript:__synthTest()\' id=\'synlink\'></a>' + '<select><option></option></select>' + '</form>';
        document.documentElement.appendChild(div);
        form = div.firstChild;
        checkbox = form.childNodes[0];
        submit = form.childNodes[2];
        select = form.getElementsByTagName('select')[0];
        syn.trigger(form.childNodes[6], 'click', {});
        checkbox.checked = false;
        checkbox.onchange = function () {
            syn.support.clickChanges = true;
        };
        syn.trigger(checkbox, 'click', {});
        syn.support.clickChecks = checkbox.checked;
        checkbox.checked = false;
        syn.trigger(checkbox, 'change', {});
        syn.support.changeChecks = checkbox.checked;
        form.onsubmit = function (ev) {
            if (ev.preventDefault) {
                ev.preventDefault();
            }
            syn.support.clickSubmits = true;
            return false;
        };
        syn.trigger(submit, 'click', {});
        form.childNodes[1].onchange = function () {
            syn.support.radioClickChanges = true;
        };
        syn.trigger(form.childNodes[1], 'click', {});
        syn.bind(div, 'click', function onclick() {
            syn.support.optionClickBubbles = true;
            syn.unbind(div, 'click', onclick);
        });
        syn.trigger(select.firstChild, 'click', {});
        syn.support.changeBubbles = syn.eventSupported('change');
        div.onclick = function () {
            syn.support.mouseDownUpClicks = true;
        };
        syn.trigger(div, 'mousedown', {});
        syn.trigger(div, 'mouseup', {});
        document.documentElement.removeChild(div);
        syn.support.pointerEvents = syn.eventSupported('pointerdown');
        syn.support.touchEvents = syn.eventSupported('touchstart');
        syn.support.ready++;
    }());
});
/*syn@0.14.1#browsers*/
define('syn/browsers', [
    'require',
    'exports',
    'module',
    'syn/synthetic',
    'syn/mouse'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    require('syn/mouse');
    syn.key.browsers = {
        webkit: {
            'prevent': {
                'keyup': [],
                'keydown': [
                    'char',
                    'keypress'
                ],
                'keypress': ['char']
            },
            'character': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    'char',
                    'char'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'specialChars': {
                'keydown': [
                    0,
                    'char'
                ],
                'keyup': [
                    0,
                    'char'
                ]
            },
            'navigation': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'special': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'tab': {
                'keydown': [
                    0,
                    'char'
                ],
                'keyup': [
                    0,
                    'char'
                ]
            },
            'pause-break': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'caps': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'escape': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'num-lock': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'scroll-lock': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'print': {
                'keyup': [
                    0,
                    'key'
                ]
            },
            'function': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            '\r': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    'char',
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            }
        },
        gecko: {
            'prevent': {
                'keyup': [],
                'keydown': ['char'],
                'keypress': ['char']
            },
            'character': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    'char',
                    0
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'specialChars': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'navigation': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'special': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            '\t': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'pause-break': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'caps': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'escape': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'num-lock': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'scroll-lock': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            'print': {
                'keyup': [
                    0,
                    'key'
                ]
            },
            'function': {
                'keydown': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            },
            '\r': {
                'keydown': [
                    0,
                    'key'
                ],
                'keypress': [
                    0,
                    'key'
                ],
                'keyup': [
                    0,
                    'key'
                ]
            }
        },
        msie: {
            'prevent': {
                'keyup': [],
                'keydown': [
                    'char',
                    'keypress'
                ],
                'keypress': ['char']
            },
            'character': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'char'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'specialChars': {
                'keydown': [
                    null,
                    'char'
                ],
                'keyup': [
                    null,
                    'char'
                ]
            },
            'navigation': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'special': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'tab': {
                'keydown': [
                    null,
                    'char'
                ],
                'keyup': [
                    null,
                    'char'
                ]
            },
            'pause-break': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'caps': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'escape': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'num-lock': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'scroll-lock': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'print': {
                'keyup': [
                    null,
                    'key'
                ]
            },
            'function': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            '\r': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            }
        },
        opera: {
            'prevent': {
                'keyup': [],
                'keydown': [],
                'keypress': ['char']
            },
            'character': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'char'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'specialChars': {
                'keydown': [
                    null,
                    'char'
                ],
                'keypress': [
                    null,
                    'char'
                ],
                'keyup': [
                    null,
                    'char'
                ]
            },
            'navigation': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ]
            },
            'special': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'tab': {
                'keydown': [
                    null,
                    'char'
                ],
                'keypress': [
                    null,
                    'char'
                ],
                'keyup': [
                    null,
                    'char'
                ]
            },
            'pause-break': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'caps': {
                'keydown': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'escape': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ]
            },
            'num-lock': {
                'keyup': [
                    null,
                    'key'
                ],
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ]
            },
            'scroll-lock': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            'print': {},
            'function': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            },
            '\r': {
                'keydown': [
                    null,
                    'key'
                ],
                'keypress': [
                    null,
                    'key'
                ],
                'keyup': [
                    null,
                    'key'
                ]
            }
        }
    };
    syn.mouse.browsers = {
        webkit: {
            'right': {
                'mousedown': {
                    'button': 2,
                    'which': 3
                },
                'mouseup': {
                    'button': 2,
                    'which': 3
                },
                'contextmenu': {
                    'button': 2,
                    'which': 3
                }
            },
            'left': {
                'mousedown': {
                    'button': 0,
                    'which': 1
                },
                'mouseup': {
                    'button': 0,
                    'which': 1
                },
                'click': {
                    'button': 0,
                    'which': 1
                }
            }
        },
        opera: {
            'right': {
                'mousedown': {
                    'button': 2,
                    'which': 3
                },
                'mouseup': {
                    'button': 2,
                    'which': 3
                }
            },
            'left': {
                'mousedown': {
                    'button': 0,
                    'which': 1
                },
                'mouseup': {
                    'button': 0,
                    'which': 1
                },
                'click': {
                    'button': 0,
                    'which': 1
                }
            }
        },
        msie: {
            'right': {
                'mousedown': { 'button': 2 },
                'mouseup': { 'button': 2 },
                'contextmenu': { 'button': 0 }
            },
            'left': {
                'mousedown': { 'button': 1 },
                'mouseup': { 'button': 1 },
                'click': { 'button': 0 }
            }
        },
        chrome: {
            'right': {
                'mousedown': {
                    'button': 2,
                    'which': 3
                },
                'mouseup': {
                    'button': 2,
                    'which': 3
                },
                'contextmenu': {
                    'button': 2,
                    'which': 3
                }
            },
            'left': {
                'mousedown': {
                    'button': 0,
                    'which': 1
                },
                'mouseup': {
                    'button': 0,
                    'which': 1
                },
                'click': {
                    'button': 0,
                    'which': 1
                }
            }
        },
        gecko: {
            'left': {
                'mousedown': {
                    'button': 0,
                    'which': 1
                },
                'mouseup': {
                    'button': 0,
                    'which': 1
                },
                'click': {
                    'button': 0,
                    'which': 1
                }
            },
            'right': {
                'mousedown': {
                    'button': 2,
                    'which': 3
                },
                'mouseup': {
                    'button': 2,
                    'which': 3
                },
                'contextmenu': {
                    'button': 2,
                    'which': 3
                }
            }
        }
    };
    syn.key.browser = function () {
        if (syn.key.browsers[window.navigator.userAgent]) {
            return syn.key.browsers[window.navigator.userAgent];
        }
        for (var browser in syn.browser) {
            if (syn.browser[browser] && syn.key.browsers[browser]) {
                return syn.key.browsers[browser];
            }
        }
        return syn.key.browsers.gecko;
    }();
    syn.mouse.browser = function () {
        if (syn.mouse.browsers[window.navigator.userAgent]) {
            return syn.mouse.browsers[window.navigator.userAgent];
        }
        for (var browser in syn.browser) {
            if (syn.browser[browser] && syn.mouse.browsers[browser]) {
                return syn.mouse.browsers[browser];
            }
        }
        return syn.mouse.browsers.gecko;
    }();
});
/*syn@0.14.1#typeable*/
define('syn/typeable', [
    'require',
    'exports',
    'module',
    'syn/synthetic'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    var typeables = [];
    var __indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) {
                return i;
            }
        }
        return -1;
    };
    syn.typeable = function (fn) {
        if (__indexOf.call(typeables, fn) === -1) {
            typeables.push(fn);
        }
    };
    syn.typeable.test = function (el) {
        for (var i = 0, len = typeables.length; i < len; i++) {
            if (typeables[i](el)) {
                return true;
            }
        }
        return false;
    };
    var type = syn.typeable;
    var typeableExp = /input|textarea/i;
    type(function (el) {
        return typeableExp.test(el.nodeName);
    });
    type(function (el) {
        return __indexOf.call([
            '',
            'true'
        ], el.getAttribute('contenteditable')) !== -1;
    });
});
/*syn@0.14.1#key*/
define('syn/key', [
    'require',
    'exports',
    'module',
    'syn/synthetic',
    'syn/typeable',
    'syn/browsers'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    require('syn/typeable');
    require('syn/browsers');
    var h = syn.helpers, formElExp = /input|textarea/i, supportsSelection = function (el) {
            var result;
            try {
                result = el.selectionStart !== undefined && el.selectionStart !== null;
            } catch (e) {
                result = false;
            }
            return result;
        }, getSelection = function (el) {
            var real, r, start;
            if (supportsSelection(el)) {
                if (document.activeElement && document.activeElement !== el && el.selectionStart === el.selectionEnd && el.selectionStart === 0) {
                    return {
                        start: el.value.length,
                        end: el.value.length
                    };
                }
                return {
                    start: el.selectionStart,
                    end: el.selectionEnd
                };
            } else {
                try {
                    if (el.nodeName.toLowerCase() === 'input') {
                        real = h.getWindow(el).document.selection.createRange();
                        r = el.createTextRange();
                        r.setEndPoint('EndToStart', real);
                        start = r.text.length;
                        return {
                            start: start,
                            end: start + real.text.length
                        };
                    } else {
                        real = h.getWindow(el).document.selection.createRange();
                        r = real.duplicate();
                        var r2 = real.duplicate(), r3 = real.duplicate();
                        r2.collapse();
                        r3.collapse(false);
                        r2.moveStart('character', -1);
                        r3.moveStart('character', -1);
                        r.moveToElementText(el);
                        r.setEndPoint('EndToEnd', real);
                        start = r.text.length - real.text.length;
                        var end = r.text.length;
                        if (start !== 0 && r2.text === '') {
                            start += 2;
                        }
                        if (end !== 0 && r3.text === '') {
                            end += 2;
                        }
                        return {
                            start: start,
                            end: end
                        };
                    }
                } catch (e) {
                    var prop = formElExp.test(el.nodeName) ? 'value' : 'textContent';
                    return {
                        start: el[prop].length,
                        end: el[prop].length
                    };
                }
            }
        }, getFocusable = function (el) {
            var document = h.getWindow(el).document, res = [];
            var els = document.getElementsByTagName('*'), len = els.length;
            for (var i = 0; i < len; i++) {
                if (syn.isFocusable(els[i]) && els[i] !== document.documentElement) {
                    res.push(els[i]);
                }
            }
            return res;
        }, textProperty = function () {
            var el = document.createElement('span');
            return el.textContent != null ? 'textContent' : 'innerText';
        }(), getText = function (el) {
            if (formElExp.test(el.nodeName)) {
                return el.value;
            }
            return el[textProperty];
        }, setText = function (el, value) {
            if (formElExp.test(el.nodeName)) {
                el.value = value;
            } else {
                el[textProperty] = value;
            }
        };
    h.extend(syn, {
        keycodes: {
            '\b': 8,
            '\t': 9,
            '\r': 13,
            'shift': 16,
            'ctrl': 17,
            'alt': 18,
            'meta': 91,
            'pause-break': 19,
            'caps': 20,
            'escape': 27,
            'num-lock': 144,
            'scroll-lock': 145,
            'print': 44,
            'page-up': 33,
            'page-down': 34,
            'end': 35,
            'home': 36,
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,
            'insert': 45,
            'delete': 46,
            ' ': 32,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'a': 65,
            'b': 66,
            'c': 67,
            'd': 68,
            'e': 69,
            'f': 70,
            'g': 71,
            'h': 72,
            'i': 73,
            'j': 74,
            'k': 75,
            'l': 76,
            'm': 77,
            'n': 78,
            'o': 79,
            'p': 80,
            'q': 81,
            'r': 82,
            's': 83,
            't': 84,
            'u': 85,
            'v': 86,
            'w': 87,
            'x': 88,
            'y': 89,
            'z': 90,
            'num0': 96,
            'num1': 97,
            'num2': 98,
            'num3': 99,
            'num4': 100,
            'num5': 101,
            'num6': 102,
            'num7': 103,
            'num8': 104,
            'num9': 105,
            '*': 106,
            '+': 107,
            'subtract': 109,
            'decimal': 110,
            'divide': 111,
            ';': 186,
            '=': 187,
            ',': 188,
            'dash': 189,
            '-': 189,
            'period': 190,
            '.': 190,
            'forward-slash': 191,
            '/': 191,
            '`': 192,
            '[': 219,
            '\\': 220,
            ']': 221,
            '\'': 222,
            'left window key': 91,
            'right window key': 92,
            'select key': 93,
            'f1': 112,
            'f2': 113,
            'f3': 114,
            'f4': 115,
            'f5': 116,
            'f6': 117,
            'f7': 118,
            'f8': 119,
            'f9': 120,
            'f10': 121,
            'f11': 122,
            'f12': 123
        },
        selectText: function (el, start, end) {
            if (supportsSelection(el)) {
                if (!end) {
                    syn.__tryFocus(el);
                    el.setSelectionRange(start, start);
                } else {
                    el.selectionStart = start;
                    el.selectionEnd = end;
                }
            } else if (el.createTextRange) {
                var r = el.createTextRange();
                r.moveStart('character', start);
                end = end || start;
                r.moveEnd('character', end - el.value.length);
                r.select();
            }
        },
        getText: function (el) {
            if (syn.typeable.test(el)) {
                var sel = getSelection(el);
                return el.value.substring(sel.start, sel.end);
            }
            var win = syn.helpers.getWindow(el);
            if (win.getSelection) {
                return win.getSelection().toString();
            } else if (win.document.getSelection) {
                return win.document.getSelection().toString();
            } else {
                return win.document.selection.createRange().text;
            }
        },
        getSelection: getSelection
    });
    h.extend(syn.key, {
        data: function (key) {
            if (syn.key.browser[key]) {
                return syn.key.browser[key];
            }
            for (var kind in syn.key.kinds) {
                if (h.inArray(key, syn.key.kinds[kind]) > -1) {
                    return syn.key.browser[kind];
                }
            }
            return syn.key.browser.character;
        },
        isSpecial: function (keyCode) {
            var specials = syn.key.kinds.special;
            for (var i = 0; i < specials.length; i++) {
                if (syn.keycodes[specials[i]] === keyCode) {
                    return specials[i];
                }
            }
        },
        options: function (key, event) {
            var keyData = syn.key.data(key);
            if (!keyData[event]) {
                return null;
            }
            var charCode = keyData[event][0], keyCode = keyData[event][1], result = {};
            if (keyCode === 'key') {
                result.keyCode = syn.keycodes[key];
            } else if (keyCode === 'char') {
                result.keyCode = key.charCodeAt(0);
            } else {
                result.keyCode = keyCode;
            }
            if (charCode === 'char') {
                result.charCode = key.charCodeAt(0);
            } else if (charCode !== null) {
                result.charCode = charCode;
            }
            if (result.keyCode) {
                result.which = result.keyCode;
            } else {
                result.which = result.charCode;
            }
            return result;
        },
        kinds: {
            special: [
                'shift',
                'ctrl',
                'alt',
                'meta',
                'caps'
            ],
            specialChars: ['\b'],
            navigation: [
                'page-up',
                'page-down',
                'end',
                'home',
                'left',
                'up',
                'right',
                'down',
                'insert',
                'delete'
            ],
            'function': [
                'f1',
                'f2',
                'f3',
                'f4',
                'f5',
                'f6',
                'f7',
                'f8',
                'f9',
                'f10',
                'f11',
                'f12'
            ]
        },
        getDefault: function (key) {
            if (syn.key.defaults[key]) {
                return syn.key.defaults[key];
            }
            for (var kind in syn.key.kinds) {
                if (h.inArray(key, syn.key.kinds[kind]) > -1 && syn.key.defaults[kind]) {
                    return syn.key.defaults[kind];
                }
            }
            return syn.key.defaults.character;
        },
        defaults: {
            'character': function (options, scope, key, force, sel) {
                if (/num\d+/.test(key)) {
                    key = key.match(/\d+/)[0];
                }
                if (force || !syn.support.keyCharacters && syn.typeable.test(this)) {
                    var current = getText(this), before = current.substr(0, sel.start), after = current.substr(sel.end), character = key;
                    setText(this, before + character + after);
                    var charLength = character === '\n' && syn.support.textareaCarriage ? 2 : character.length;
                    syn.selectText(this, before.length + charLength);
                }
            },
            'c': function (options, scope, key, force, sel) {
                if (syn.key.ctrlKey) {
                    syn.key.clipboard = syn.getText(this);
                } else {
                    syn.key.defaults.character.apply(this, arguments);
                }
            },
            'v': function (options, scope, key, force, sel) {
                if (syn.key.ctrlKey) {
                    syn.key.defaults.character.call(this, options, scope, syn.key.clipboard, true, sel);
                } else {
                    syn.key.defaults.character.apply(this, arguments);
                }
            },
            'a': function (options, scope, key, force, sel) {
                if (syn.key.ctrlKey) {
                    syn.selectText(this, 0, getText(this).length);
                } else {
                    syn.key.defaults.character.apply(this, arguments);
                }
            },
            'home': function () {
                syn.onParents(this, function (el) {
                    if (el.scrollHeight !== el.clientHeight) {
                        el.scrollTop = 0;
                        return false;
                    }
                });
            },
            'end': function () {
                syn.onParents(this, function (el) {
                    if (el.scrollHeight !== el.clientHeight) {
                        el.scrollTop = el.scrollHeight;
                        return false;
                    }
                });
            },
            'page-down': function () {
                syn.onParents(this, function (el) {
                    if (el.scrollHeight !== el.clientHeight) {
                        var ch = el.clientHeight;
                        el.scrollTop += ch;
                        return false;
                    }
                });
            },
            'page-up': function () {
                syn.onParents(this, function (el) {
                    if (el.scrollHeight !== el.clientHeight) {
                        var ch = el.clientHeight;
                        el.scrollTop -= ch;
                        return false;
                    }
                });
            },
            '\b': function (options, scope, key, force, sel) {
                if (!syn.support.backspaceWorks && syn.typeable.test(this)) {
                    var current = getText(this), before = current.substr(0, sel.start), after = current.substr(sel.end);
                    if (sel.start === sel.end && sel.start > 0) {
                        setText(this, before.substring(0, before.length - 1) + after);
                        syn.selectText(this, sel.start - 1);
                    } else {
                        setText(this, before + after);
                        syn.selectText(this, sel.start);
                    }
                }
            },
            'delete': function (options, scope, key, force, sel) {
                if (!syn.support.backspaceWorks && syn.typeable.test(this)) {
                    var current = getText(this), before = current.substr(0, sel.start), after = current.substr(sel.end);
                    if (sel.start === sel.end && sel.start <= getText(this).length - 1) {
                        setText(this, before + after.substring(1));
                    } else {
                        setText(this, before + after);
                    }
                    syn.selectText(this, sel.start);
                }
            },
            '\r': function (options, scope, key, force, sel) {
                var nodeName = this.nodeName.toLowerCase();
                if (nodeName === 'input') {
                    syn.trigger(this, 'change', {});
                }
                if (!syn.support.keypressSubmits && nodeName === 'input') {
                    var form = syn.closest(this, 'form');
                    if (form) {
                        syn.trigger(form, 'submit', {});
                    }
                }
                if (!syn.support.keyCharacters && nodeName === 'textarea') {
                    syn.key.defaults.character.call(this, options, scope, '\n', undefined, sel);
                }
                if (!syn.support.keypressOnAnchorClicks && nodeName === 'a') {
                    syn.trigger(this, 'click', {});
                }
            },
            '\t': function (options, scope) {
                var focusEls = getFocusable(this), current = null, i = 0, el, firstNotIndexed, orders = [];
                for (; i < focusEls.length; i++) {
                    orders.push([
                        focusEls[i],
                        i
                    ]);
                }
                var sort = function (order1, order2) {
                    var el1 = order1[0], el2 = order2[0], tab1 = syn.tabIndex(el1) || 0, tab2 = syn.tabIndex(el2) || 0;
                    if (tab1 === tab2) {
                        return order1[1] - order2[1];
                    } else {
                        if (tab1 === 0) {
                            return 1;
                        } else if (tab2 === 0) {
                            return -1;
                        } else {
                            return tab1 - tab2;
                        }
                    }
                };
                orders.sort(sort);
                var ordersLength = orders.length;
                for (i = 0; i < ordersLength; i++) {
                    el = orders[i][0];
                    if (this === el) {
                        var nextIndex = i;
                        if (syn.key.shiftKey) {
                            nextIndex--;
                            current = nextIndex >= 0 && orders[nextIndex][0] || orders[ordersLength - 1][0];
                        } else {
                            nextIndex++;
                            current = nextIndex < ordersLength && orders[nextIndex][0] || orders[0][0];
                        }
                    }
                }
                if (!current) {
                    current = firstNotIndexed;
                } else {
                    syn.__tryFocus(current);
                }
                return current;
            },
            'left': function (options, scope, key, force, sel) {
                if (syn.typeable.test(this)) {
                    if (syn.key.shiftKey) {
                        syn.selectText(this, sel.start === 0 ? 0 : sel.start - 1, sel.end);
                    } else {
                        syn.selectText(this, sel.start === 0 ? 0 : sel.start - 1);
                    }
                }
            },
            'right': function (options, scope, key, force, sel) {
                if (syn.typeable.test(this)) {
                    if (syn.key.shiftKey) {
                        syn.selectText(this, sel.start, sel.end + 1 > getText(this).length ? getText(this).length : sel.end + 1);
                    } else {
                        syn.selectText(this, sel.end + 1 > getText(this).length ? getText(this).length : sel.end + 1);
                    }
                }
            },
            'up': function () {
                if (/select/i.test(this.nodeName)) {
                    this.selectedIndex = this.selectedIndex ? this.selectedIndex - 1 : 0;
                }
            },
            'down': function () {
                if (/select/i.test(this.nodeName)) {
                    syn.changeOnBlur(this, 'selectedIndex', this.selectedIndex);
                    this.selectedIndex = this.selectedIndex + 1;
                }
            },
            'shift': function () {
                return null;
            },
            'ctrl': function () {
                return null;
            },
            'alt': function () {
                return null;
            },
            'meta': function () {
                return null;
            }
        }
    });
    h.extend(syn.create, {
        keydown: {
            setup: function (type, options, element) {
                if (h.inArray(options, syn.key.kinds.special) !== -1) {
                    syn.key[options + 'Key'] = element;
                }
            }
        },
        keypress: {
            setup: function (type, options, element) {
                if (syn.support.keyCharacters && !syn.support.keysOnNotFocused) {
                    syn.__tryFocus(element);
                }
            }
        },
        keyup: {
            setup: function (type, options, element) {
                if (h.inArray(options, syn.key.kinds.special) !== -1) {
                    syn.key[options + 'Key'] = null;
                }
            }
        },
        key: {
            options: function (type, options, element) {
                options = typeof options !== 'object' ? { character: options } : options;
                options = h.extend({}, options);
                if (options.character) {
                    h.extend(options, syn.key.options(options.character, type));
                    delete options.character;
                }
                options = h.extend({
                    ctrlKey: !!syn.key.ctrlKey,
                    altKey: !!syn.key.altKey,
                    shiftKey: !!syn.key.shiftKey,
                    metaKey: !!syn.key.metaKey
                }, options);
                return options;
            },
            event: function (type, options, element) {
                var doc = h.getWindow(element).document || document, event;
                if (doc.createEvent) {
                    try {
                        event = doc.createEvent('KeyEvents');
                        event.initKeyEvent(type, true, true, window, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.keyCode, options.charCode);
                    } catch (e) {
                        event = h.createBasicStandardEvent(type, options, doc);
                    }
                    event.synthetic = true;
                    return event;
                } else {
                    try {
                        event = h.createEventObject.apply(this, arguments);
                        h.extend(event, options);
                    } catch (e) {
                    }
                    return event;
                }
            }
        }
    });
    var convert = {
        'enter': '\r',
        'backspace': '\b',
        'tab': '\t',
        'space': ' '
    };
    h.extend(syn.init.prototype, {
        _key: function (element, options, callback) {
            if (/-up$/.test(options) && h.inArray(options.replace('-up', ''), syn.key.kinds.special) !== -1) {
                syn.trigger(element, 'keyup', options.replace('-up', ''));
                return callback(true, element);
            }
            var activeElement = h.getWindow(element).document.activeElement, caret = syn.typeable.test(element) && getSelection(element), key = convert[options] || options, runDefaults = syn.trigger(element, 'keydown', key), getDefault = syn.key.getDefault, prevent = syn.key.browser.prevent, defaultResult, keypressOptions = syn.key.options(key, 'keypress');
            if (runDefaults) {
                if (!keypressOptions) {
                    defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key, undefined, caret);
                } else {
                    if (activeElement !== h.getWindow(element).document.activeElement) {
                        element = h.getWindow(element).document.activeElement;
                    }
                    runDefaults = syn.trigger(element, 'keypress', keypressOptions);
                    if (runDefaults) {
                        defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key, undefined, caret);
                    }
                }
            } else {
                if (keypressOptions && h.inArray('keypress', prevent.keydown) === -1) {
                    if (activeElement !== h.getWindow(element).document.activeElement) {
                        element = h.getWindow(element).document.activeElement;
                    }
                    syn.trigger(element, 'keypress', keypressOptions);
                }
            }
            if (defaultResult && defaultResult.nodeName) {
                element = defaultResult;
            }
            if (defaultResult !== null) {
                syn.schedule(function () {
                    if (key === '\r' && element.nodeName.toLowerCase() === 'input') {
                    } else if (syn.support.oninput) {
                        syn.trigger(element, 'input', syn.key.options(key, 'input'));
                    }
                    syn.trigger(element, 'keyup', syn.key.options(key, 'keyup'));
                    callback(runDefaults, element);
                }, 1);
            } else {
                callback(runDefaults, element);
            }
            return element;
        },
        _type: function (element, options, callback) {
            var parts = (options + '').match(/(\[[^\]]+\])|([^\[])/g), self = this, runNextPart = function (runDefaults, el) {
                    var part = parts.shift();
                    if (!part) {
                        callback(runDefaults, el);
                        return;
                    }
                    el = el || element;
                    if (part.length > 1) {
                        part = part.substr(1, part.length - 2);
                    }
                    self._key(el, part, runNextPart);
                };
            runNextPart();
        }
    });
});
/*syn@0.14.1#key.support*/
define('syn/key.support', [
    'require',
    'exports',
    'module',
    'syn/synthetic',
    'syn/key'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    require('syn/key');
    if (!syn.config.support) {
        (function checkForSupport() {
            if (!document.body) {
                return syn.schedule(checkForSupport, 1);
            }
            var div = document.createElement('div'), checkbox, submit, form, anchor, textarea, inputter, one, doc;
            doc = document.documentElement;
            div.innerHTML = '<form id=\'outer\'>' + '<input name=\'checkbox\' type=\'checkbox\'/>' + '<input name=\'radio\' type=\'radio\' />' + '<input type=\'submit\' name=\'submitter\'/>' + '<input type=\'input\' name=\'inputter\'/>' + '<input name=\'one\'>' + '<input name=\'two\'/>' + '<a href=\'#abc\'></a>' + '<textarea>1\n2</textarea>' + '</form>';
            doc.insertBefore(div, doc.firstElementChild || doc.children[0]);
            form = div.firstChild;
            checkbox = form.childNodes[0];
            submit = form.childNodes[2];
            anchor = form.getElementsByTagName('a')[0];
            textarea = form.getElementsByTagName('textarea')[0];
            inputter = form.childNodes[3];
            one = form.childNodes[4];
            form.onsubmit = function (ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                }
                syn.support.keypressSubmits = true;
                ev.returnValue = false;
                return false;
            };
            syn.__tryFocus(inputter);
            syn.trigger(inputter, 'keypress', '\r');
            syn.trigger(inputter, 'keypress', 'a');
            syn.support.keyCharacters = inputter.value === 'a';
            inputter.value = 'a';
            syn.trigger(inputter, 'keypress', '\b');
            syn.support.backspaceWorks = inputter.value === '';
            inputter.onchange = function () {
                syn.support.focusChanges = true;
            };
            syn.__tryFocus(inputter);
            syn.trigger(inputter, 'keypress', 'a');
            syn.__tryFocus(form.childNodes[5]);
            syn.trigger(inputter, 'keypress', 'b');
            syn.support.keysOnNotFocused = inputter.value === 'ab';
            syn.bind(anchor, 'click', function (ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                }
                syn.support.keypressOnAnchorClicks = true;
                ev.returnValue = false;
                return false;
            });
            syn.trigger(anchor, 'keypress', '\r');
            syn.support.textareaCarriage = textarea.value.length === 4;
            syn.support.oninput = 'oninput' in one;
            doc.removeChild(div);
            syn.support.ready++;
        }());
    } else {
        syn.helpers.extend(syn.support, syn.config.support);
    }
});
/*syn@0.14.1#drag*/
define('syn/drag', [
    'require',
    'exports',
    'module',
    'syn/synthetic'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    var elementFromPoint = function (point, win) {
        var clientX = point.clientX;
        var clientY = point.clientY;
        if (point == null) {
            return null;
        }
        if (syn.support.elementFromPage) {
            var off = syn.helpers.scrollOffset(win);
            clientX = clientX + off.left;
            clientY = clientY + off.top;
        }
        return win.document.elementFromPoint(Math.round(clientX), Math.round(clientY));
    };
    var DragonDrop = {
        html5drag: false,
        focusWindow: null,
        dragAndDrop: function (focusWindow, fromPoint, toPoint, duration, callback) {
            this.currentDataTransferItem = null;
            this.focusWindow = focusWindow;
            this._mouseOver(fromPoint);
            this._mouseEnter(fromPoint);
            this._mouseMove(fromPoint);
            this._mouseDown(fromPoint);
            this._dragStart(fromPoint);
            this._drag(fromPoint);
            this._dragEnter(fromPoint);
            this._dragOver(fromPoint);
            DragonDrop.startMove(fromPoint, toPoint, duration, function () {
                DragonDrop._dragLeave(fromPoint);
                DragonDrop._dragEnd(fromPoint);
                DragonDrop._mouseOut(fromPoint);
                DragonDrop._mouseLeave(fromPoint);
                DragonDrop._drop(toPoint);
                DragonDrop._dragEnd(toPoint);
                DragonDrop._mouseOver(toPoint);
                DragonDrop._mouseEnter(toPoint);
                DragonDrop._mouseMove(toPoint);
                DragonDrop._mouseOut(toPoint);
                DragonDrop._mouseLeave(toPoint);
                callback();
                DragonDrop.cleanup();
            });
        },
        _dragStart: function (node, options) {
            this.createAndDispatchEvent(node, 'dragstart', options);
        },
        _drag: function (node, options) {
            this.createAndDispatchEvent(node, 'drag', options);
        },
        _dragEnter: function (node, options) {
            this.createAndDispatchEvent(node, 'dragenter', options);
        },
        _dragOver: function (node, options) {
            this.createAndDispatchEvent(node, 'dragover', options);
        },
        _dragLeave: function (node, options) {
            this.createAndDispatchEvent(node, 'dragleave', options);
        },
        _drop: function (node, options) {
            this.createAndDispatchEvent(node, 'drop', options);
        },
        _dragEnd: function (node, options) {
            this.createAndDispatchEvent(node, 'dragend', options);
        },
        _mouseDown: function (node, options) {
            this.createAndDispatchEvent(node, 'mousedown', options);
        },
        _mouseMove: function (node, options) {
            this.createAndDispatchEvent(node, 'mousemove', options);
        },
        _mouseEnter: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseenter', options);
        },
        _mouseOver: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseover', options);
        },
        _mouseOut: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseout', options);
        },
        _mouseLeave: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseleave', options);
        },
        createAndDispatchEvent: function (point, eventName, options) {
            if (point) {
                var targetElement = elementFromPoint(point, this.focusWindow);
                syn.trigger(targetElement, eventName, options);
            }
        },
        getDataTransferObject: function () {
            if (!this.currentDataTransferItem) {
                return this.currentDataTransferItem = this.createDataTransferObject();
            } else {
                return this.currentDataTransferItem;
            }
        },
        cleanup: function () {
            this.currentDataTransferItem = null;
            this.focusWindow = null;
        },
        createDataTransferObject: function () {
            var dataTransfer = {
                dropEffect: 'none',
                effectAllowed: 'uninitialized',
                files: [],
                items: [],
                types: [],
                data: [],
                setData: function (dataFlavor, value) {
                    var tempdata = {};
                    tempdata.dataFlavor = dataFlavor;
                    tempdata.val = value;
                    this.data.push(tempdata);
                },
                getData: function (dataFlavor) {
                    for (var i = 0; i < this.data.length; i++) {
                        var tempdata = this.data[i];
                        if (tempdata.dataFlavor === dataFlavor) {
                            return tempdata.val;
                        }
                    }
                }
            };
            return dataTransfer;
        },
        startMove: function (start, end, duration, callback) {
            var startTime = new Date();
            var distX = end.clientX - start.clientX;
            var distY = end.clientY - start.clientY;
            var win = this.focusWindow;
            var current = start;
            var cursor = win.document.createElement('div');
            var calls = 0;
            var move;
            move = function onmove() {
                var now = new Date();
                var scrollOffset = syn.helpers.scrollOffset(win);
                var fraction = (calls === 0 ? 0 : now - startTime) / duration;
                var options = {
                    clientX: distX * fraction + start.clientX,
                    clientY: distY * fraction + start.clientY
                };
                calls++;
                if (fraction < 1) {
                    syn.helpers.extend(cursor.style, {
                        left: options.clientX + scrollOffset.left + 2 + 'px',
                        top: options.clientY + scrollOffset.top + 2 + 'px'
                    });
                    current = DragonDrop.mouseMove(options, current);
                    syn.schedule(onmove, 15);
                } else {
                    current = DragonDrop.mouseMove(end, current);
                    win.document.body.removeChild(cursor);
                    callback();
                }
            };
            syn.helpers.extend(cursor.style, {
                height: '5px',
                width: '5px',
                backgroundColor: 'red',
                position: 'absolute',
                zIndex: 19999,
                fontSize: '1px'
            });
            win.document.body.appendChild(cursor);
            move();
        },
        mouseMove: function (thisPoint, previousPoint) {
            var thisElement = elementFromPoint(thisPoint, this.focusWindow);
            var previousElement = elementFromPoint(previousPoint, this.focusWindow);
            var options = syn.helpers.extend({}, thisPoint);
            if (thisElement !== previousElement) {
                options.relatedTarget = thisElement;
                this._dragLeave(previousPoint, options);
                options.relatedTarget = previousElement;
                this._dragEnter(thisPoint, options);
            }
            this._dragOver(thisPoint, options);
            return thisPoint;
        }
    };
    function createDragEvent(eventName, options, element) {
        var dragEvent = syn.create.mouse.event(eventName, options, element);
        dragEvent.dataTransfer = DragonDrop.getDataTransferObject();
        return syn.dispatch(dragEvent, element, eventName, false);
    }
    syn.create.dragstart = { event: createDragEvent };
    syn.create.dragenter = { event: createDragEvent };
    syn.create.dragover = { event: createDragEvent };
    syn.create.dragleave = { event: createDragEvent };
    syn.create.drag = { event: createDragEvent };
    syn.create.drop = { event: createDragEvent };
    syn.create.dragend = { event: createDragEvent };
    (function dragSupport() {
        if (!document.body) {
            syn.schedule(dragSupport, 1);
            return;
        }
        var div = document.createElement('div');
        document.body.appendChild(div);
        syn.helpers.extend(div.style, {
            width: '100px',
            height: '10000px',
            backgroundColor: 'blue',
            position: 'absolute',
            top: '10px',
            left: '0px',
            zIndex: 19999
        });
        document.body.scrollTop = 11;
        if (!document.elementFromPoint) {
            return;
        }
        var el = document.elementFromPoint(3, 1);
        if (el === div) {
            syn.support.elementFromClient = true;
        } else {
            syn.support.elementFromPage = true;
        }
        document.body.removeChild(div);
        document.body.scrollTop = 0;
    }());
    var mouseMove = function (point, win, last) {
            var el = elementFromPoint(point, win);
            if (last !== el && el && last) {
                var options = syn.helpers.extend({}, point);
                options.relatedTarget = el;
                if (syn.support.pointerEvents) {
                    syn.trigger(last, 'pointerout', options);
                    syn.trigger(last, 'pointerleave', options);
                }
                syn.trigger(last, 'mouseout', options);
                syn.trigger(last, 'mouseleave', options);
                options.relatedTarget = last;
                if (syn.support.pointerEvents) {
                    syn.trigger(el, 'pointerover', options);
                    syn.trigger(el, 'pointerenter', options);
                }
                syn.trigger(el, 'mouseover', options);
                syn.trigger(el, 'mouseenter', options);
            }
            if (syn.support.pointerEvents) {
                syn.trigger(el || win, 'pointermove', point);
            }
            if (syn.support.touchEvents) {
                syn.trigger(el || win, 'touchmove', point);
            }
            if (DragonDrop.html5drag) {
                if (!syn.support.pointerEvents) {
                    syn.trigger(el || win, 'mousemove', point);
                }
            } else {
                syn.trigger(el || win, 'mousemove', point);
            }
            return el;
        }, createEventAtPoint = function (event, point, win) {
            var el = elementFromPoint(point, win);
            syn.trigger(el || win, event, point);
            return el;
        }, startMove = function (win, start, end, duration, callback) {
            var startTime = new Date(), distX = end.clientX - start.clientX, distY = end.clientY - start.clientY, current = elementFromPoint(start, win), cursor = win.document.createElement('div'), calls = 0, move;
            move = function onmove() {
                var now = new Date(), scrollOffset = syn.helpers.scrollOffset(win), fraction = (calls === 0 ? 0 : now - startTime) / duration, options = {
                        clientX: distX * fraction + start.clientX,
                        clientY: distY * fraction + start.clientY
                    };
                calls++;
                if (fraction < 1) {
                    syn.helpers.extend(cursor.style, {
                        left: options.clientX + scrollOffset.left + 2 + 'px',
                        top: options.clientY + scrollOffset.top + 2 + 'px'
                    });
                    current = mouseMove(options, win, current);
                    syn.schedule(onmove, 15);
                } else {
                    current = mouseMove(end, win, current);
                    win.document.body.removeChild(cursor);
                    callback();
                }
            };
            syn.helpers.extend(cursor.style, {
                height: '5px',
                width: '5px',
                backgroundColor: 'red',
                position: 'absolute',
                zIndex: 19999,
                fontSize: '1px'
            });
            win.document.body.appendChild(cursor);
            move();
        }, startDrag = function (win, fromPoint, toPoint, duration, callback) {
            if (syn.support.pointerEvents) {
                createEventAtPoint('pointerover', fromPoint, win);
                createEventAtPoint('pointerenter', fromPoint, win);
            }
            createEventAtPoint('mouseover', fromPoint, win);
            createEventAtPoint('mouseenter', fromPoint, win);
            if (syn.support.pointerEvents) {
                createEventAtPoint('pointermove', fromPoint, win);
            }
            createEventAtPoint('mousemove', fromPoint, win);
            if (syn.support.pointerEvents) {
                createEventAtPoint('pointerdown', fromPoint, win);
            }
            if (syn.support.touchEvents) {
                createEventAtPoint('touchstart', fromPoint, win);
            }
            createEventAtPoint('mousedown', fromPoint, win);
            startMove(win, fromPoint, toPoint, duration, function () {
                if (syn.support.pointerEvents) {
                    createEventAtPoint('pointerup', toPoint, win);
                }
                if (syn.support.touchEvents) {
                    createEventAtPoint('touchend', toPoint, win);
                }
                createEventAtPoint('mouseup', toPoint, win);
                if (syn.support.pointerEvents) {
                    createEventAtPoint('pointerleave', toPoint, win);
                }
                createEventAtPoint('mouseleave', toPoint, win);
                callback();
            });
        }, center = function (el) {
            var j = syn.jquery()(el), o = j.offset();
            return {
                pageX: o.left + j.outerWidth() / 2,
                pageY: o.top + j.outerHeight() / 2
            };
        }, convertOption = function (option, win, from) {
            var page = /(\d+)[x ](\d+)/, client = /(\d+)X(\d+)/, relative = /([+-]\d+)[xX ]([+-]\d+)/, parts;
            if (typeof option === 'string' && relative.test(option) && from) {
                var cent = center(from);
                parts = option.match(relative);
                option = {
                    pageX: cent.pageX + parseInt(parts[1]),
                    pageY: cent.pageY + parseInt(parts[2])
                };
            }
            if (typeof option === 'string' && page.test(option)) {
                parts = option.match(page);
                option = {
                    pageX: parseInt(parts[1]),
                    pageY: parseInt(parts[2])
                };
            }
            if (typeof option === 'string' && client.test(option)) {
                parts = option.match(client);
                option = {
                    clientX: parseInt(parts[1]),
                    clientY: parseInt(parts[2])
                };
            }
            if (typeof option === 'string') {
                option = syn.jquery()(option, win.document)[0];
            }
            if (option.nodeName) {
                option = center(option);
            }
            if (option.pageX != null) {
                var off = syn.helpers.scrollOffset(win);
                option = {
                    clientX: option.pageX - off.left,
                    clientY: option.pageY - off.top
                };
            }
            return option;
        }, adjust = function (from, to, win) {
            if (from.clientY < 0) {
                var off = syn.helpers.scrollOffset(win);
                var top = off.top + from.clientY - 100, diff = top - off.top;
                if (top > 0) {
                } else {
                    top = 0;
                    diff = -off.top;
                }
                from.clientY = from.clientY - diff;
                to.clientY = to.clientY - diff;
                syn.helpers.scrollOffset(win, {
                    top: top,
                    left: off.left
                });
            }
        };
    syn.helpers.extend(syn.init.prototype, {
        _move: function (from, options, callback) {
            var win = syn.helpers.getWindow(from);
            var sourceCoordinates = convertOption(options.from || from, win, from);
            var destinationCoordinates = convertOption(options.to || options, win, from);
            DragonDrop.html5drag = syn.support.pointerEvents;
            if (options.adjust !== false) {
                adjust(sourceCoordinates, destinationCoordinates, win);
            }
            startMove(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
        },
        _drag: function (from, options, callback) {
            var win = syn.helpers.getWindow(from);
            var sourceCoordinates = convertOption(options.from || from, win, from);
            var destinationCoordinates = convertOption(options.to || options, win, from);
            if (options.adjust !== false) {
                adjust(sourceCoordinates, destinationCoordinates, win);
            }
            DragonDrop.html5drag = from.draggable;
            if (DragonDrop.html5drag) {
                DragonDrop.dragAndDrop(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
            } else {
                startDrag(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
            }
        }
    });
});
/*syn@0.14.1#syn*/
define('syn/syn', [
    'require',
    'exports',
    'module',
    'syn/synthetic',
    'syn/mouse.support',
    'syn/browsers',
    'syn/key.support',
    'syn/drag'
], function (require, exports, module) {
    var syn = require('syn/synthetic');
    require('syn/mouse.support');
    require('syn/browsers');
    require('syn/key.support');
    require('syn/drag');
    window.syn = syn;
    module.exports = syn;
});
/*funcunit@3.6.3#browser/open*/
define('funcunit/browser/open', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core',
    'syn/syn'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    var syn = require('syn/syn');
    if (FuncUnit.frameMode) {
        var ifrm = document.createElement('iframe');
        ifrm.id = 'funcunit_app';
        document.body.insertBefore(ifrm, document.body.firstChild);
    }
    var confirms = [], prompts = [], currentDocument, currentHref, appWin, lookingForNewDocument = false, urlWithoutHash = function (url) {
            return url.replace(/\#.*$/, '');
        }, isCurrentPage = function (url) {
            var pathname = urlWithoutHash(FuncUnit.win.location.pathname), href = urlWithoutHash(FuncUnit.win.location.href), url = urlWithoutHash(url);
            if (pathname === url || href === url) {
                return true;
            }
            return false;
        };
    $.extend(FuncUnit, {
        open: function (path, success, timeout) {
            if (typeof success != 'function') {
                timeout = success;
                success = undefined;
            }
            FuncUnit.add({
                method: function (success, error) {
                    if (typeof path === 'string') {
                        var fullPath = FuncUnit.getAbsolutePath(path);
                        FuncUnit._open(fullPath, error);
                        FuncUnit._onload(function () {
                            success();
                        }, error);
                    } else {
                        FuncUnit.win = path;
                        success();
                    }
                },
                success: success,
                error: 'Page ' + path + ' not loaded in time!',
                timeout: timeout || 30000
            });
        },
        _open: function (url) {
            FuncUnit.win = appWin;
            hasSteal = false;
            FuncUnit.frame = $('#funcunit_app').length ? $('#funcunit_app')[0] : null;
            if (newPage) {
                if (FuncUnit.frame) {
                    FuncUnit.win = FuncUnit.frame.contentWindow;
                    FuncUnit.win.location = url;
                } else {
                    var width = $(window).width();
                    FuncUnit.win = window.open(url, 'funcunit', 'height=1000,toolbar=yes,status=yes,width=' + width / 2 + ',left=' + width / 2);
                    if (FuncUnit.win && FuncUnit.win.___FUNCUNIT_OPENED) {
                        FuncUnit.win.close();
                        FuncUnit.win = window.open(url, 'funcunit', 'height=1000,toolbar=yes,status=yes,left=' + width / 2);
                    }
                    if (!FuncUnit.win) {
                        throw 'Could not open a popup window.  Your popup blocker is probably on.  Please turn it off and try again';
                    }
                }
                appWin = FuncUnit.win;
            } else {
                lookingForNewDocument = true;
                if (isCurrentPage(url)) {
                    FuncUnit.win.document.body.parentNode.removeChild(FuncUnit.win.document.body);
                    FuncUnit.win.location.hash = url.split('#')[1] || '';
                    FuncUnit.win.location.reload(true);
                } else {
                    FuncUnit.win.location = url;
                }
                currentDocument = null;
            }
            lookingForNewDocument = true;
        },
        confirm: function (answer) {
            confirms.push(!!answer);
        },
        prompt: function (answer) {
            prompts.push(answer);
        },
        _opened: function () {
            if (!this._isOverridden('alert')) {
                FuncUnit.win.alert = function () {
                };
            }
            if (!this._isOverridden('confirm')) {
                FuncUnit.win.confirm = function () {
                    var res = confirms.shift();
                    return res;
                };
            }
            if (!this._isOverridden('prompt')) {
                FuncUnit.win.prompt = function () {
                    return prompts.shift();
                };
            }
        },
        _isOverridden: function (type) {
            return !/(native code)|(source code not available)/.test(FuncUnit.win[type]);
        },
        _onload: function (success, error) {
            loadSuccess = function () {
                if (FuncUnit.win.steal) {
                    hasSteal = true;
                }
                if (!hasSteal) {
                    return success();
                }
                FuncUnit.win.steal.done().then(success);
            };
            if (!newPage) {
                return;
            }
            newPage = false;
            if (FuncUnit.support.readystate) {
                poller();
            } else {
                unloadLoader();
            }
        },
        getAbsolutePath: function (path) {
            if (/^\/\//.test(path)) {
                path = path.substr(2);
            }
            return path;
        },
        win: window,
        support: { readystate: 'readyState' in document },
        eval: function (str) {
            return FuncUnit.win.eval(str);
        },
        documentLoaded: function () {
            var loaded = FuncUnit.win.document.readyState === 'complete' && FuncUnit.win.location.href != 'about:blank' && FuncUnit.win.document.body;
            return loaded;
        },
        checkForNewDocument: function () {
            var documentFound = false;
            try {
                documentFound = (FuncUnit.win.document !== currentDocument && !FuncUnit.win.___FUNCUNIT_OPENED || currentHref != FuncUnit.win.location.href) && FuncUnit.documentLoaded();
            } catch (e) {
            }
            if (documentFound) {
                lookingForNewDocument = false;
                currentDocument = FuncUnit.win.document;
                currentHref = FuncUnit.win.location.href;
                FuncUnit.win.___FUNCUNIT_OPENED = true;
                FuncUnit._opened();
            }
            return documentFound;
        }
    });
    var newPage = true, hasSteal = false, unloadLoader, loadSuccess, firstLoad = true, onload = function () {
            FuncUnit.win.document.documentElement.tabIndex = 0;
            setTimeout(function () {
                FuncUnit.win.focus();
                var ls = loadSuccess;
                loadSuccess = null;
                if (ls) {
                    ls();
                }
            }, 0);
            syn.unbind(FuncUnit.win, 'load', onload);
        }, onunload = function () {
            FuncUnit.stop = true;
            removeListeners();
            setTimeout(unloadLoader, 0);
        }, removeListeners = function () {
            syn.unbind(FuncUnit.win, 'unload', onunload);
            Syn.unbind(FuncUnit.win, 'load', onload);
        };
    unloadLoader = function () {
        if (!firstLoad)
            removeListeners();
        syn.bind(FuncUnit.win, 'load', onload);
        syn.bind(FuncUnit.win, 'unload', onunload);
    };
    var newDocument = false, poller = function () {
            var ls;
            if (lookingForNewDocument && FuncUnit.checkForNewDocument()) {
                ls = loadSuccess;
                loadSuccess = null;
                if (ls) {
                    FuncUnit.win.focus();
                    FuncUnit.win.document.documentElement.tabIndex = 0;
                    ls();
                }
            }
            setTimeout(arguments.callee, 500);
        };
    $(window).unload(function () {
        if (FuncUnit.win && FuncUnit.win !== window.top) {
            FuncUnit.win.close();
        }
    });
    module.exports = FuncUnit;
});
/*funcunit@3.6.3#browser/actions*/
define('funcunit/browser/actions', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core',
    'syn/syn'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    var syn = window.syn = require('syn/syn');
    var clicks = [
            'click',
            'dblclick',
            'rightClick'
        ], makeClick = function (name) {
            FuncUnit.prototype[name] = function (options, success) {
                this._addExists();
                if (typeof options == 'function') {
                    success = options;
                    options = {};
                }
                var selector = this.selector;
                FuncUnit.add({
                    method: function (success, error) {
                        options = options || {};
                        syn('_' + name, this.bind[0], options, success);
                    },
                    success: success,
                    error: 'Could not ' + name + ' \'' + this.selector + '\'',
                    bind: this,
                    type: 'action'
                });
                return this;
            };
        };
    for (var i = 0; i < clicks.length; i++) {
        makeClick(clicks[i]);
    }
    $.extend(FuncUnit.prototype, {
        _addExists: function () {
            this.exists(false);
        },
        type: function (text, success) {
            this._addExists();
            this.click();
            var selector = this.selector;
            if (text === '') {
                text = '[ctrl]a[ctrl-up]\b';
            }
            FuncUnit.add({
                method: function (success, error) {
                    syn('_type', this.bind[0], text, success);
                },
                success: success,
                error: 'Could not type ' + text + ' into ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        sendKeys: function (keys, success) {
            this._addExists();
            var selector = this.selector;
            if (keys === '') {
                keys = '[ctrl]a[ctrl-up]\b';
            }
            FuncUnit.add({
                method: function (success, error) {
                    syn('_type', this.bind[0], keys, success);
                },
                success: success,
                error: 'Could not send the keys ' + keys + ' into ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        trigger: function (evName, success) {
            this._addExists();
            FuncUnit.add({
                method: function (success, error) {
                    if (!FuncUnit.win.jQuery) {
                        throw 'Can not trigger custom event, no jQuery found on target page.';
                    }
                    FuncUnit.win.jQuery(this.bind.selector).trigger(evName);
                    success();
                },
                success: success,
                error: 'Could not trigger ' + evName,
                bind: this,
                type: 'action'
            });
            return this;
        },
        drag: function (options, success) {
            this._addExists();
            if (typeof options == 'string') {
                options = { to: options };
            }
            options.from = this.selector;
            var selector = this.selector;
            FuncUnit.add({
                method: function (success, error) {
                    syn('_drag', this.bind[0], options, success);
                },
                success: success,
                error: 'Could not drag ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        move: function (options, success) {
            this._addExists();
            if (typeof options == 'string') {
                options = { to: options };
            }
            options.from = this.selector;
            var selector = this.selector;
            FuncUnit.add({
                method: function (success, error) {
                    syn('_move', this.bind[0], options, success);
                },
                success: success,
                error: 'Could not move ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        scroll: function (direction, amount, success) {
            this._addExists();
            var selector = this.selector, direction;
            if (direction == 'left' || direction == 'right') {
                direction = 'Left';
            } else if (direction == 'top' || direction == 'bottom') {
                direction = 'Top';
            }
            FuncUnit.add({
                method: function (success, error) {
                    this.bind.each(function (i, el) {
                        this['scroll' + direction] = amount;
                    });
                    success();
                },
                success: success,
                error: 'Could not scroll ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        }
    });
    module.exports = FuncUnit;
});
/*funcunit@3.6.3#browser/getters*/
define('funcunit/browser/getters', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    FuncUnit.funcs = {
        'size': 0,
        'attr': 1,
        'hasClass': 1,
        'html': 0,
        'text': 0,
        'val': 0,
        'css': 1,
        'prop': 1,
        'offset': 0,
        'position': 0,
        'scrollTop': 0,
        'scrollLeft': 0,
        'height': 0,
        'width': 0,
        'innerHeight': 0,
        'innerWidth': 0,
        'outerHeight': 0,
        'outerWidth': 0
    };
    FuncUnit.makeFunc = function (fname, argIndex) {
        var orig = FuncUnit.fn[fname];
        FuncUnit.prototype[fname] = function () {
            var args = FuncUnit.makeArray(arguments), isWait = args.length > argIndex, success, self = this;
            args.unshift(this.selector, this.frame, fname);
            if (isWait) {
                var tester = args[argIndex + 3], timeout = args[argIndex + 4], success = args[argIndex + 5], message = args[argIndex + 6], testVal = tester, errorMessage = 'waiting for ' + fname + ' on ' + this.selector, frame = this.frame, logMessage = 'Checking ' + fname + ' on \'' + this.selector + '\'', ret;
                if (typeof tester == 'object' && !(tester instanceof RegExp)) {
                    timeout = tester.timeout;
                    success = tester.success;
                    message = tester.message;
                    if (tester.errorMessage) {
                        errorMessage = tester.errorMessage;
                    }
                    if (typeof tester.logMessage !== 'undefined') {
                        logMessage = tester.logMessage;
                    }
                    tester = tester.condition;
                }
                if (typeof timeout == 'function') {
                    message = success;
                    success = timeout;
                    timeout = undefined;
                }
                if (typeof timeout == 'string') {
                    message = timeout;
                    timeout = undefined;
                    success = undefined;
                }
                if (typeof message !== 'string') {
                    message = undefined;
                }
                args.splice(argIndex + 3, args.length - argIndex - 3);
                if (typeof tester != 'function') {
                    errorMessage += ' !== ' + testVal;
                    tester = function (val) {
                        return FuncUnit.unit.equiv(val, testVal) || testVal instanceof RegExp && testVal.test(val);
                    };
                }
                if (message) {
                    errorMessage = message;
                }
                FuncUnit.repeat({
                    method: function (print) {
                        if (this.bind.prevObject && this.bind.prevTraverser) {
                            var prev = this.bind;
                            this.bind = this.bind.prevObject[this.bind.prevTraverser](this.bind.prevTraverserSelector);
                            this.bind.prevTraverser = prev.prevTraverser;
                            this.bind.prevTraverserSelector = prev.prevTraverserSelector;
                        } else {
                            this.bind = F(this.selector, {
                                frame: frame,
                                forceSync: true
                            });
                        }
                        if (logMessage) {
                            print(logMessage);
                        }
                        var methodArgs = [];
                        if (argIndex > 0) {
                            methodArgs.push(args[3]);
                        }
                        FuncUnit._ignoreGetterError = true;
                        ret = this.bind[fname].apply(this.bind, methodArgs);
                        FuncUnit._ignoreGetterError = false;
                        var passed = tester.call(this.bind, ret);
                        if (this.bind.length === 0 && fname !== 'size') {
                            passed = false;
                        }
                        if (passed) {
                            if (!FuncUnit.documentLoaded()) {
                                passed = false;
                            } else {
                                FuncUnit.checkForNewDocument();
                            }
                        }
                        return passed;
                    },
                    success: function () {
                        if (message) {
                            FuncUnit.unit.assertOK(true, message);
                        }
                        success && success.apply(this, arguments);
                    },
                    error: function () {
                        var msg = errorMessage;
                        if (ret) {
                            msg += ', actual value: ' + ret;
                        }
                        FuncUnit.unit.assertOK(false, msg);
                    },
                    timeout: timeout,
                    bind: this,
                    type: 'wait'
                });
                return this;
            } else {
                if (!FuncUnit._ignoreGetterError && !FuncUnit._incallback && FuncUnit._haveAsyncQueries()) {
                    console && console.error('You can\'t run getters after actions and waits. Please put your getters in a callback or at the beginning of the test.');
                }
                var methodArgs = [];
                if (argIndex > 0) {
                    methodArgs.push(args[3]);
                }
                return orig.apply(this, methodArgs);
            }
        };
    };
    for (var prop in FuncUnit.funcs) {
        FuncUnit.makeFunc(prop, FuncUnit.funcs[prop]);
    }
    module.exports = FuncUnit;
});
/*funcunit@3.6.3#browser/traversers*/
define('funcunit/browser/traversers', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    var traversers = [
            'closest',
            'next',
            'prev',
            'siblings',
            'last',
            'first',
            'find'
        ], makeTraverser = function (name) {
            var orig = FuncUnit.prototype[name];
            FuncUnit.prototype[name] = function (selector) {
                var args = arguments;
                if (FuncUnit.win && this[0] && this[0].parentNode && this[0].parentNode.nodeType !== 9) {
                    FuncUnit.add({
                        method: function (success, error) {
                            var newBind = orig.apply(this.bind, args);
                            newBind.prevTraverser = name;
                            newBind.prevTraverserSelector = selector;
                            success(newBind);
                        },
                        error: 'Could not traverse: ' + name + ' ' + selector,
                        bind: this
                    });
                }
                return orig.apply(this, arguments);
            };
        };
    for (var i = 0; i < traversers.length; i++) {
        makeTraverser(traversers[i]);
    }
    module.exports = FuncUnit;
});
/*funcunit@3.6.3#browser/queue*/
define('funcunit/browser/queue', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var FuncUnit = require('funcunit/browser/core');
        FuncUnit._incallback = false;
        var currentPosition = 0, startedQueue = false;
        FuncUnit.speed = 0;
        FuncUnit.timeout = 10000;
        FuncUnit._queue = [];
        FuncUnit._needSyncQuery = function () {
            if (FuncUnit._queue.length === 1) {
                if (FuncUnit._queue[0].type === 'query') {
                    FuncUnit._queue = [];
                    return true;
                }
            }
            if (FuncUnit._queue.length === 0) {
                return true;
            }
            return false;
        };
        FuncUnit._lastQueuedItem = function () {
            if (!FuncUnit._queue.length) {
                return null;
            }
            return FuncUnit._queue[FuncUnit._queue.length - 1];
        };
        FuncUnit._haveAsyncQueries = function () {
            for (var i = 0; i < FuncUnit._queue.length; i++) {
                if (FuncUnit._queue[i].type === 'action' || FuncUnit._queue[i].type === 'wait')
                    return true;
            }
            return false;
        };
        FuncUnit.add = function (handler, error, context) {
            if (handler instanceof Function) {
                if (typeof error === 'object') {
                    context = error;
                    delete error;
                }
                error = error && error.toString() || 'Custom method has failed.';
                var cb = handler;
                handler = {
                    method: function (success, error) {
                        success();
                    },
                    success: cb,
                    error: error,
                    bind: context
                };
            }
            if (FuncUnit._incallback) {
                FuncUnit._queue.splice(currentPosition, 0, handler);
                currentPosition++;
            } else {
                FuncUnit._queue.push(handler);
            }
            if (FuncUnit._queue.length == 1 && !FuncUnit._incallback) {
                FuncUnit.unit.pauseTest();
                setTimeout(FuncUnit._done, 13);
            }
        };
        var currentEl;
        FuncUnit._done = function (el, selector) {
            var next, timer, speed = FuncUnit.speed || 0;
            if (FuncUnit.speed === 'slow') {
                speed = 500;
            }
            if (FuncUnit._queue.length > 0) {
                next = FuncUnit._queue.shift();
                currentPosition = 0;
                setTimeout(function () {
                    timer = setTimeout(function () {
                        next.stop && next.stop();
                        if (typeof next.error === 'function') {
                            next.error();
                        } else {
                            FuncUnit.unit.assertOK(false, next.error);
                        }
                        FuncUnit._done();
                    }, (next.timeout || FuncUnit.timeout) + speed);
                    if (el && el.jquery) {
                        currentEl = el;
                    }
                    if (currentEl) {
                        next.bind = currentEl;
                    }
                    next.selector = selector;
                    next.method(function (el) {
                        if (el && el.jquery) {
                            next.bind = el;
                        }
                        clearTimeout(timer);
                        FuncUnit._incallback = true;
                        if (next.success) {
                            next.success.apply(next.bind, arguments);
                        }
                        FuncUnit._incallback = false;
                        FuncUnit._done(next.bind, next.selector);
                    }, function (message) {
                        clearTimeout(timer);
                        FuncUnit.unit.assertOK(false, message);
                        FuncUnit._done();
                    });
                }, speed);
            } else {
                FuncUnit.unit.resumeTest();
            }
        };
        module.exports = FuncUnit;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*funcunit@3.6.3#browser/waits*/
define('funcunit/browser/waits', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    FuncUnit.wait = function (time, success) {
        if (typeof time == 'function') {
            success = time;
            time = undefined;
        }
        time = time != null ? time : 5000;
        FuncUnit.add({
            method: function (success, error) {
                setTimeout(success, time);
            },
            success: success,
            error: 'Couldn\'t wait!',
            timeout: time + 1000
        });
        return this;
    };
    FuncUnit.branch = function (check1, success1, check2, success2, timeout) {
        FuncUnit.repeat({
            method: function (print) {
                print('Running a branch statement');
                if (check1()) {
                    success1();
                    return true;
                }
                if (check2()) {
                    success2();
                    return true;
                }
            },
            error: 'no branch condition was ever true',
            timeout: timeout,
            type: 'branch'
        });
    };
    FuncUnit.repeat = function (options) {
        var interval, stopped = false, stop = function () {
                clearTimeout(interval);
                stopped = true;
            };
        FuncUnit.add({
            method: function (success, error) {
                options.bind = this.bind;
                options.selector = this.selector;
                var printed = false, print = function (msg) {
                        if (!printed) {
                            printed = true;
                        }
                    };
                interval = setTimeout(function () {
                    var result = null;
                    try {
                        result = options.method(print);
                    } catch (e) {
                    }
                    if (result) {
                        success(options.bind);
                    } else if (!stopped) {
                        interval = setTimeout(arguments.callee, 10);
                    }
                }, 10);
            },
            success: options.success,
            error: options.error,
            timeout: options.timeout,
            stop: stop,
            bind: options.bind,
            type: options.type
        });
    };
    FuncUnit.animationEnd = function () {
        F('body').wait(200).size(function () {
            return F.win.$(':animated').length === 0;
        });
    };
    FuncUnit.animationsDone = FuncUnit.animationEnd;
    $.extend(FuncUnit.prototype, {
        exists: function (timeout, success, message) {
            var logMessage = 'Waiting for \'' + this.selector + '\' to exist';
            if (timeout === false) {
                logMessage = false;
            }
            return this.size({
                condition: function (size) {
                    return size > 0;
                },
                timeout: timeout,
                success: success,
                message: message,
                errorMessage: 'Exist failed: element with selector \'' + this.selector + '\' not found',
                logMessage: logMessage
            });
        },
        missing: function (timeout, success, message) {
            return this.size(0, timeout, success, message);
        },
        visible: function (timeout, success, message) {
            var self = this, sel = this.selector, ret;
            return this.size(function (size) {
                return this.is(':visible') === true;
            }, timeout, success, message);
        },
        invisible: function (timeout, success, message) {
            var self = this, sel = this.selector, ret;
            return this.size(function (size) {
                return this.is(':visible') === false;
            }, timeout, success, message);
        },
        wait: function (checker, timeout, success, message) {
            if (typeof checker === 'number') {
                timeout = checker;
                FuncUnit.wait(timeout, success);
                return this;
            } else {
                return this.size(checker, timeout, success, message);
            }
        },
        then: function (success) {
            var self = this;
            FuncUnit.wait(0, function () {
                success.call(this, this);
            });
            return this;
        }
    });
    module.exports = FuncUnit;
});
/*funcunit*/
define('funcunit', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core',
    'funcunit/browser/adapters/adapters',
    'funcunit/browser/open',
    'funcunit/browser/actions',
    'funcunit/browser/getters',
    'funcunit/browser/traversers',
    'funcunit/browser/queue',
    'funcunit/browser/waits'
], function (require, exports, module) {
    var FuncUnit = require('funcunit/browser/core');
    require('funcunit/browser/adapters/adapters');
    require('funcunit/browser/open');
    require('funcunit/browser/actions');
    require('funcunit/browser/getters');
    require('funcunit/browser/traversers');
    require('funcunit/browser/queue');
    require('funcunit/browser/waits');
    window.FuncUnit = window.S = window.F = FuncUnit;
    module.exports = FuncUnit;
});
/*global*/
define('global', [
    'require',
    'exports',
    'module',
    'funcunit'
], function (require, exports, module) {
    require('funcunit');
    var FuncUnit = window.FuncUnit || {};
    module.exports = FuncUnit;
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);
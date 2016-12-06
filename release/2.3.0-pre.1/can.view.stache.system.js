/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
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
	global.System = {
		define: function(__name, __code){
			global.define = origDefine;
			eval("(function() { " + __code + " \n }).call(global);");
			global.define = ourDefine;
		},
		orig: global.System
	};
})({},window)
/*can@2.3.0-pre.1#view/target/target*/
define('can/view/target/target', [
    'can/util/util',
    'can/view/elements'
], function (can, elements, vdom) {
    var processNodes = function (nodes, paths, location, document) {
            var frag = document.createDocumentFragment();
            for (var i = 0, len = nodes.length; i < len; i++) {
                var node = nodes[i];
                frag.appendChild(processNode(node, paths, location.concat(i), document));
            }
            return frag;
        }, keepsTextNodes = typeof document !== 'undefined' && function () {
            var testFrag = document.createDocumentFragment();
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(''));
            div.appendChild(document.createTextNode(''));
            testFrag.appendChild(div);
            var cloned = testFrag.cloneNode(true);
            return can.childNodes(cloned.firstChild).length === 2;
        }(), clonesWork = typeof document !== 'undefined' && function () {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            var clone = a.cloneNode(true);
            return clone.innerHTML === '<xyz></xyz>';
        }(), namespacesWork = typeof document !== 'undefined' && !!document.createElementNS, attributeDummy = typeof document !== 'undefined' ? document.createElement('div') : null, setAttribute = function (el, attrName, value) {
            try {
                el.setAttribute(attrName, value);
            } catch (e) {
                attributeDummy.innerHTML = '<div ' + attrName + '="' + value + '"></div>';
                el.setAttributeNode(attributeDummy.childNodes[0].attributes[0].cloneNode());
            }
        };
    var cloneNode = clonesWork ? function (el) {
            return el.cloneNode(true);
        } : function (node) {
            var copy;
            if (node.nodeType === 1) {
                copy = document.createElement(node.nodeName);
            } else if (node.nodeType === 3) {
                copy = document.createTextNode(node.nodeValue);
            } else if (node.nodeType === 8) {
                copy = document.createComment(node.nodeValue);
            } else if (node.nodeType === 11) {
                copy = document.createDocumentFragment();
            }
            if (node.attributes) {
                var attributes = can.makeArray(node.attributes);
                can.each(attributes, function (node) {
                    if (node && node.specified) {
                        setAttribute(copy, node.nodeName, node.nodeValue);
                    }
                });
            }
            if (node.childNodes) {
                can.each(node.childNodes, function (child) {
                    copy.appendChild(cloneNode(child));
                });
            }
            return copy;
        };
    function processNode(node, paths, location, document) {
        var callback, loc = location, nodeType = typeof node, el, p, i, len;
        var getCallback = function () {
            if (!callback) {
                callback = {
                    path: location,
                    callbacks: []
                };
                paths.push(callback);
                loc = [];
            }
            return callback;
        };
        if (nodeType === 'object') {
            if (node.tag) {
                if (namespacesWork && node.namespace) {
                    el = document.createElementNS(node.namespace, node.tag);
                } else {
                    el = document.createElement(node.tag);
                }
                if (node.attrs) {
                    for (var attrName in node.attrs) {
                        var value = node.attrs[attrName];
                        if (typeof value === 'function') {
                            getCallback().callbacks.push({ callback: value });
                        } else {
                            setAttribute(el, attrName, value);
                        }
                    }
                }
                if (node.attributes) {
                    for (i = 0, len = node.attributes.length; i < len; i++) {
                        getCallback().callbacks.push({ callback: node.attributes[i] });
                    }
                }
                if (node.children && node.children.length) {
                    if (callback) {
                        p = callback.paths = [];
                    } else {
                        p = paths;
                    }
                    el.appendChild(processNodes(node.children, p, loc, document));
                }
            } else if (node.comment) {
                el = document.createComment(node.comment);
                if (node.callbacks) {
                    for (i = 0, len = node.attributes.length; i < len; i++) {
                        getCallback().callbacks.push({ callback: node.callbacks[i] });
                    }
                }
            }
        } else if (nodeType === 'string') {
            el = document.createTextNode(node);
        } else if (nodeType === 'function') {
            if (keepsTextNodes) {
                el = document.createTextNode('');
                getCallback().callbacks.push({ callback: node });
            } else {
                el = document.createComment('~');
                getCallback().callbacks.push({
                    callback: function () {
                        var el = document.createTextNode('');
                        elements.replace([this], el);
                        return node.apply(el, arguments);
                    }
                });
            }
        }
        return el;
    }
    function getCallbacks(el, pathData, elementCallbacks) {
        var path = pathData.path, callbacks = pathData.callbacks, paths = pathData.paths, child = el, pathLength = path ? path.length : 0, pathsLength = paths ? paths.length : 0;
        for (var i = 0; i < pathLength; i++) {
            child = child.childNodes.item(path[i]);
        }
        elementCallbacks.push({
            element: child,
            callbacks: callbacks
        });
        for (i = 0; i < pathsLength; i++) {
            getCallbacks(child, paths[i], elementCallbacks);
        }
    }
    function hydrateCallbacks(callbacks, args) {
        var len = callbacks.length, callbacksLength, callbackElement, callbackData;
        for (var i = 0; i < len; i++) {
            callbackData = callbacks[i];
            callbacksLength = callbackData.callbacks.length;
            callbackElement = callbackData.element;
            for (var c = 0; c < callbacksLength; c++) {
                callbackData.callbacks[c].callback.apply(callbackElement, args);
            }
        }
    }
    function makeTarget(nodes, doc) {
        var paths = [];
        var frag = processNodes(nodes, paths, [], doc || can.global.document);
        return {
            paths: paths,
            clone: frag,
            hydrate: function () {
                var cloned = cloneNode(this.clone);
                var args = can.makeArray(arguments);
                var callbacks = [];
                for (var i = 0; i < paths.length; i++) {
                    getCallbacks(cloned, paths[i], callbacks);
                }
                hydrateCallbacks(callbacks, args);
                return cloned;
            }
        };
    }
    makeTarget.keepsTextNodes = keepsTextNodes;
    can.view.target = makeTarget;
    return makeTarget;
});
/*can@2.3.0-pre.1#view/stache/html_section*/
define('can/view/stache/html_section', [
    'can/util/util',
    'can/view/target/target',
    'can/view/stache/utils',
    'can/view/stache/mustache_core'
], function (can, target, utils, mustacheCore) {
    var decodeHTML = typeof document !== 'undefined' && function () {
            var el = document.createElement('div');
            return function (html) {
                if (html.indexOf('&') === -1) {
                    return html.replace(/\r\n/g, '\n');
                }
                el.innerHTML = html;
                return el.childNodes.length === 0 ? '' : el.childNodes[0].nodeValue;
            };
        }();
    var HTMLSectionBuilder = function () {
        this.stack = [new HTMLSection()];
    };
    can.extend(HTMLSectionBuilder.prototype, utils.mixins);
    can.extend(HTMLSectionBuilder.prototype, {
        startSubSection: function (process) {
            var newSection = new HTMLSection(process);
            this.stack.push(newSection);
            return newSection;
        },
        endSubSectionAndReturnRenderer: function () {
            if (this.last().isEmpty()) {
                this.stack.pop();
                return null;
            } else {
                var htmlSection = this.endSection();
                return can.proxy(htmlSection.compiled.hydrate, htmlSection.compiled);
            }
        },
        startSection: function (process) {
            var newSection = new HTMLSection(process);
            this.last().add(newSection.targetCallback);
            this.stack.push(newSection);
        },
        endSection: function () {
            this.last().compile();
            return this.stack.pop();
        },
        inverse: function () {
            this.last().inverse();
        },
        compile: function () {
            var compiled = this.stack.pop().compile();
            return function (scope, options, nodeList) {
                if (!(scope instanceof can.view.Scope)) {
                    scope = can.view.Scope.refsScope().add(scope || {});
                }
                if (!(options instanceof mustacheCore.Options)) {
                    options = new mustacheCore.Options(options || {});
                }
                return compiled.hydrate(scope, options, nodeList);
            };
        },
        push: function (chars) {
            this.last().push(chars);
        },
        pop: function () {
            return this.last().pop();
        }
    });
    var HTMLSection = function (process) {
        this.data = 'targetData';
        this.targetData = [];
        this.targetStack = [];
        var self = this;
        this.targetCallback = function (scope, options, sectionNode) {
            process.call(this, scope, options, sectionNode, can.proxy(self.compiled.hydrate, self.compiled), self.inverseCompiled && can.proxy(self.inverseCompiled.hydrate, self.inverseCompiled));
        };
    };
    can.extend(HTMLSection.prototype, {
        inverse: function () {
            this.inverseData = [];
            this.data = 'inverseData';
        },
        push: function (data) {
            this.add(data);
            this.targetStack.push(data);
        },
        pop: function () {
            return this.targetStack.pop();
        },
        add: function (data) {
            if (typeof data === 'string') {
                data = decodeHTML(data);
            }
            if (this.targetStack.length) {
                this.targetStack[this.targetStack.length - 1].children.push(data);
            } else {
                this[this.data].push(data);
            }
        },
        compile: function () {
            this.compiled = target(this.targetData, can.document || can.global.document);
            if (this.inverseData) {
                this.inverseCompiled = target(this.inverseData, can.document || can.global.document);
                delete this.inverseData;
            }
            delete this.targetData;
            delete this.targetStack;
            return this.compiled;
        },
        children: function () {
            if (this.targetStack.length) {
                return this.targetStack[this.targetStack.length - 1].children;
            } else {
                return this[this.data];
            }
        },
        isEmpty: function () {
            return !this.targetData.length;
        }
    });
    return HTMLSectionBuilder;
});
/*can@2.3.0-pre.1#view/stache/text_section*/
define('can/view/stache/text_section', [
    'can/util/util',
    'can/view/live/live',
    'can/view/stache/utils'
], function (can, live, utils) {
    live = live || can.view.live;
    var TextSectionBuilder = function () {
            this.stack = [new TextSection()];
        }, emptyHandler = function () {
        };
    can.extend(TextSectionBuilder.prototype, utils.mixins);
    can.extend(TextSectionBuilder.prototype, {
        startSection: function (process) {
            var subSection = new TextSection();
            this.last().add({
                process: process,
                truthy: subSection
            });
            this.stack.push(subSection);
        },
        endSection: function () {
            this.stack.pop();
        },
        inverse: function () {
            this.stack.pop();
            var falseySection = new TextSection();
            this.last().last().falsey = falseySection;
            this.stack.push(falseySection);
        },
        compile: function (state) {
            var renderer = this.stack[0].compile();
            return function (scope, options) {
                var compute = can.compute(function () {
                        return renderer(scope, options);
                    }, this, false, true);
                compute.bind('change', emptyHandler);
                var value = compute();
                if (compute.computeInstance.hasDependencies) {
                    if (state.attr) {
                        live.simpleAttribute(this, state.attr, compute);
                    } else {
                        live.attributes(this, compute);
                    }
                    compute.unbind('change', emptyHandler);
                } else {
                    if (state.attr) {
                        can.attr.set(this, state.attr, value);
                    } else {
                        live.setAttributes(this, value);
                    }
                }
            };
        }
    });
    var passTruthyFalsey = function (process, truthy, falsey) {
        return function (scope, options) {
            return process.call(this, scope, options, truthy, falsey);
        };
    };
    var TextSection = function () {
        this.values = [];
    };
    can.extend(TextSection.prototype, {
        add: function (data) {
            this.values.push(data);
        },
        last: function () {
            return this.values[this.values.length - 1];
        },
        compile: function () {
            var values = this.values, len = values.length;
            for (var i = 0; i < len; i++) {
                var value = this.values[i];
                if (typeof value === 'object') {
                    values[i] = passTruthyFalsey(value.process, value.truthy && value.truthy.compile(), value.falsey && value.falsey.compile());
                }
            }
            return function (scope, options) {
                var txt = '', value;
                for (var i = 0; i < len; i++) {
                    value = values[i];
                    txt += typeof value === 'string' ? value : value.call(this, scope, options);
                }
                return txt;
            };
        }
    });
    return TextSectionBuilder;
});
/*can@2.3.0-pre.1#view/import/import*/
define('can/view/import/import', [
    'can/util/util',
    'can/view/callbacks/callbacks'
], function (can) {
    can.view.tag('can-import', function (el, tagData) {
        var moduleName = el.getAttribute('from');
        var importPromise;
        if (moduleName) {
            importPromise = can['import'](moduleName);
        } else {
            importPromise = can.Deferred().reject('No moduleName provided').promise();
        }
        var root = tagData.scope.attr('@root');
        if (root && can.isFunction(root.waitFor)) {
            root.waitFor(importPromise);
        }
        can.data(can.$(el), 'viewModel', importPromise);
        var scope = tagData.scope.add(importPromise);
        var handOffTag = el.getAttribute('can-tag');
        if (handOffTag) {
            var callback = can.view.callbacks._tags[handOffTag];
            callback(el, can.extend(tagData, { scope: scope }));
            var viewModel = can.viewModel(el);
            importPromise.then(function (val) {
                viewModel.attr('value', val);
            });
        } else {
            var frag = tagData.subtemplate ? tagData.subtemplate(scope, tagData.options) : document.createDocumentFragment();
            var nodeList = can.view.nodeLists.register([], undefined, true);
            can.one.call(el, 'removed', function () {
                can.view.nodeLists.unregister(nodeList);
            });
            can.appendChild(el, frag, can.document);
            can.view.nodeLists.update(nodeList, can.childNodes(el));
        }
    });
});
/*can@2.3.0-pre.1#view/stache/intermediate_and_imports*/
define('can/view/stache/intermediate_and_imports', [
    'can/view/stache/mustache_core',
    'can/view/parser/parser',
    'can/view/import/import'
], function (mustacheCore, parser) {
    return function (source) {
        var template = mustacheCore.cleanLineEndings(source);
        var imports = [], ases = {}, inImport = false, inFrom = false, inAs = false, currentAs = '', currentFrom = '';
        var intermediate = parser(template, {
                start: function (tagName, unary) {
                    if (tagName === 'can-import') {
                        inImport = true;
                    } else if (inImport) {
                        inImport = false;
                    }
                },
                attrStart: function (attrName) {
                    if (attrName === 'from') {
                        inFrom = true;
                    } else if (inImport && attrName === '[.]') {
                        inAs = true;
                        currentAs = 'viewModel';
                        return false;
                    }
                },
                attrEnd: function (attrName) {
                    if (attrName === 'from') {
                        inFrom = false;
                    } else if (inImport && attrName === '[.]') {
                        inAs = false;
                        return false;
                    }
                },
                attrValue: function (value) {
                    if (inFrom && inImport) {
                        imports.push(value);
                        currentFrom = value;
                    } else if (inAs && currentAs === 'viewModel') {
                        return false;
                    }
                },
                end: function (tagName) {
                    if (tagName === 'can-import') {
                        if (currentAs) {
                            ases[currentAs] = currentFrom;
                            currentAs = '';
                            inAs = false;
                        }
                    }
                },
                close: function (tagName) {
                    if (tagName === 'can-import') {
                        imports.pop();
                    }
                }
            }, true);
        return {
            intermediate: intermediate,
            imports: imports,
            ases: ases
        };
    };
});
/*can@2.3.0-pre.1#view/stache/stache*/
define('can/view/stache/stache', [
    'can/util/util',
    'can/view/parser/parser',
    'can/view/target/target',
    'can/view/stache/html_section',
    'can/view/stache/text_section',
    'can/view/stache/mustache_core',
    'can/view/stache/mustache_helpers',
    'can/view/stache/intermediate_and_imports',
    'can/view/callbacks/callbacks',
    'can/view/bindings/bindings'
], function (can, parser, target, HTMLSectionBuilder, TextSectionBuilder, mustacheCore, mustacheHelpers, getIntermediateAndImports, viewCallbacks) {
    parser = parser || can.view.parser;
    can.view.parser = parser;
    viewCallbacks = viewCallbacks || can.view.callbacks;
    var svgNamespace = 'http://www.w3.org/2000/svg';
    var namespaces = {
            'svg': svgNamespace,
            'g': svgNamespace
        };
    function stache(template) {
        if (typeof template === 'string') {
            template = mustacheCore.cleanLineEndings(template);
        }
        var section = new HTMLSectionBuilder(), state = {
                node: null,
                attr: null,
                sectionElementStack: [],
                text: false,
                namespaceStack: []
            }, makeRendererAndUpdateSection = function (section, mode, stache) {
                if (mode === '>') {
                    section.add(mustacheCore.makeLiveBindingPartialRenderer(stache, state));
                } else if (mode === '/') {
                    section.endSection();
                    if (section instanceof HTMLSectionBuilder) {
                        state.sectionElementStack.pop();
                    }
                } else if (mode === 'else') {
                    section.inverse();
                } else {
                    var makeRenderer = section instanceof HTMLSectionBuilder ? mustacheCore.makeLiveBindingBranchRenderer : mustacheCore.makeStringBranchRenderer;
                    if (mode === '{' || mode === '&') {
                        section.add(makeRenderer(null, stache, copyState()));
                    } else if (mode === '#' || mode === '^') {
                        section.startSection(makeRenderer(mode, stache, copyState()));
                        if (section instanceof HTMLSectionBuilder) {
                            state.sectionElementStack.push('section');
                        }
                    } else {
                        section.add(makeRenderer(null, stache, copyState({ text: true })));
                    }
                }
            }, copyState = function (overwrites) {
                var lastElement = state.sectionElementStack[state.sectionElementStack.length - 1];
                var cur = {
                        tag: state.node && state.node.tag,
                        attr: state.attr && state.attr.name,
                        directlyNested: state.sectionElementStack.length ? lastElement === 'section' || lastElement === 'custom' : true
                    };
                return overwrites ? can.simpleExtend(cur, overwrites) : cur;
            }, addAttributesCallback = function (node, callback) {
                if (!node.attributes) {
                    node.attributes = [];
                }
                node.attributes.unshift(callback);
            };
        parser(template, {
            start: function (tagName, unary) {
                var matchedNamespace = namespaces[tagName];
                if (matchedNamespace && !unary) {
                    state.namespaceStack.push(matchedNamespace);
                }
                state.node = {
                    tag: tagName,
                    children: [],
                    namespace: matchedNamespace || can.last(state.namespaceStack)
                };
            },
            end: function (tagName, unary) {
                var isCustomTag = viewCallbacks.tag(tagName);
                if (unary) {
                    section.add(state.node);
                    if (isCustomTag) {
                        addAttributesCallback(state.node, function (scope, options, parentNodeList) {
                            viewCallbacks.tagHandler(this, tagName, {
                                scope: scope,
                                options: options,
                                subtemplate: null,
                                templateType: 'stache',
                                parentNodeList: parentNodeList
                            });
                        });
                    }
                } else {
                    section.push(state.node);
                    state.sectionElementStack.push(isCustomTag ? 'custom' : 'element');
                    if (isCustomTag) {
                        section.startSubSection();
                    }
                }
                state.node = null;
            },
            close: function (tagName) {
                var matchedNamespace = namespaces[tagName];
                if (matchedNamespace) {
                    state.namespaceStack.pop();
                }
                var isCustomTag = viewCallbacks.tag(tagName), renderer;
                if (isCustomTag) {
                    renderer = section.endSubSectionAndReturnRenderer();
                }
                var oldNode = section.pop();
                if (isCustomTag) {
                    addAttributesCallback(oldNode, function (scope, options, parentNodeList) {
                        viewCallbacks.tagHandler(this, tagName, {
                            scope: scope,
                            options: options,
                            subtemplate: renderer,
                            templateType: 'stache',
                            parentNodeList: parentNodeList
                        });
                    });
                }
                state.sectionElementStack.pop();
            },
            attrStart: function (attrName) {
                if (state.node.section) {
                    state.node.section.add(attrName + '="');
                } else {
                    state.attr = {
                        name: attrName,
                        value: ''
                    };
                }
            },
            attrEnd: function (attrName) {
                if (state.node.section) {
                    state.node.section.add('" ');
                } else {
                    if (!state.node.attrs) {
                        state.node.attrs = {};
                    }
                    state.node.attrs[state.attr.name] = state.attr.section ? state.attr.section.compile(copyState()) : state.attr.value;
                    var attrCallback = viewCallbacks.attr(attrName);
                    if (attrCallback) {
                        if (!state.node.attributes) {
                            state.node.attributes = [];
                        }
                        state.node.attributes.push(function (scope, options) {
                            attrCallback(this, {
                                attributeName: attrName,
                                scope: scope,
                                options: options
                            });
                        });
                    }
                    state.attr = null;
                }
            },
            attrValue: function (value) {
                var section = state.node.section || state.attr.section;
                if (section) {
                    section.add(value);
                } else {
                    state.attr.value += value;
                }
            },
            chars: function (text) {
                section.add(text);
            },
            special: function (text) {
                var firstAndText = mustacheCore.splitModeFromExpression(text, state), mode = firstAndText.mode, expression = firstAndText.expression;
                if (expression === 'else') {
                    (state.attr && state.attr.section ? state.attr.section : section).inverse();
                    return;
                }
                if (mode === '!') {
                    return;
                }
                if (state.node && state.node.section) {
                    makeRendererAndUpdateSection(state.node.section, mode, expression);
                    if (state.node.section.subSectionDepth() === 0) {
                        state.node.attributes.push(state.node.section.compile(copyState()));
                        delete state.node.section;
                    }
                } else if (state.attr) {
                    if (!state.attr.section) {
                        state.attr.section = new TextSectionBuilder();
                        if (state.attr.value) {
                            state.attr.section.add(state.attr.value);
                        }
                    }
                    makeRendererAndUpdateSection(state.attr.section, mode, expression);
                } else if (state.node) {
                    if (!state.node.attributes) {
                        state.node.attributes = [];
                    }
                    if (!mode) {
                        state.node.attributes.push(mustacheCore.makeLiveBindingBranchRenderer(null, expression, copyState()));
                    } else if (mode === '#' || mode === '^') {
                        if (!state.node.section) {
                            state.node.section = new TextSectionBuilder();
                        }
                        makeRendererAndUpdateSection(state.node.section, mode, expression);
                    } else {
                        throw mode + ' is currently not supported within a tag.';
                    }
                } else {
                    makeRendererAndUpdateSection(section, mode, expression);
                }
            },
            comment: function (text) {
                section.add({ comment: text });
            },
            done: function () {
            }
        });
        return section.compile();
    }
    var escMap = {
            '\n': '\\n',
            '\r': '\\r',
            '\u2028': '\\u2028',
            '\u2029': '\\u2029'
        };
    var esc = function (string) {
        return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
            if ('\'"\\'.indexOf(character) >= 0) {
                return '\\' + character;
            } else {
                return escMap[character];
            }
        });
    };
    can.view.register({
        suffix: 'stache',
        contentType: 'x-stache-template',
        fragRenderer: function (id, text) {
            return stache(text);
        },
        script: function (id, src) {
            return 'can.stache("' + esc(src) + '")';
        }
    });
    can.view.ext = '.stache';
    can.extend(can.stache, mustacheHelpers);
    can.extend(stache, mustacheHelpers);
    can.stache.safeString = stache.safeString = function (text) {
        return {
            toString: function () {
                return text;
            }
        };
    };
    can.stache.async = function (source) {
        var iAi = getIntermediateAndImports(source);
        var importPromises = can.map(iAi.imports, function (moduleName) {
                return can['import'](moduleName);
            });
        return can.when.apply(can, importPromises).then(function () {
            return stache(iAi.intermediate);
        });
    };
    return stache;
});
/*can@2.3.0-pre.1#view/stache/system*/
'format steal';
define('can/view/stache/system', [
    'can/view/stache/stache',
    'can/view/stache/intermediate_and_imports'
], function (stache, getIntermediateAndImports) {
    function translate(load) {
        var intermediateAndImports = getIntermediateAndImports(load.source);
        intermediateAndImports.imports.unshift('can/view/stache/stache');
        return 'define(' + JSON.stringify(intermediateAndImports.imports) + ',function(stache){' + 'return stache(' + JSON.stringify(intermediateAndImports.intermediate) + ')' + '})';
    }
    return { translate: translate };
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
	window.System = window.System.orig;
})();
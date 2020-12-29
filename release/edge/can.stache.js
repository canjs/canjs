/*!
 * CanJS - 2.1.2-pre
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Thu, 12 Jun 2014 22:19:11 GMT
 * Licensed MIT
 * Includes: can/view/stache
 * Download from: http://canjs.com
 */
(function(undefined) {

    // ## view/target/target.js
    var __m11 = (function(can, elements) {

        var processNodes = function(nodes, paths, location) {
            var frag = document.createDocumentFragment();

            for (var i = 0, len = nodes.length; i < len; i++) {
                var node = nodes[i];
                frag.appendChild(processNode(node, paths, location.concat(i)));
            }
            return frag;
        },
            keepsTextNodes = (function() {
                var testFrag = document.createDocumentFragment();
                var div = document.createElement("div");

                div.appendChild(document.createTextNode(""));
                div.appendChild(document.createTextNode(""));
                testFrag.appendChild(div);

                var cloned = testFrag.cloneNode(true);

                return cloned.childNodes[0].childNodes.length === 2;
            })(),
            clonesWork = (function() {
                // Since html5shiv is required to support custom elements, assume cloning
                // works in any browser that doesn't have html5shiv

                // Clone an element containing a custom tag to see if the innerHTML is what we
                // expect it to be, or if not it probably was created outside of the document's
                // namespace.
                var a = document.createElement('a');
                a.innerHTML = "<xyz></xyz>";
                var clone = a.cloneNode(true);

                return clone.innerHTML === "<xyz></xyz>";
            })();


        var cloneNode = clonesWork ? function(el) {
                return el.cloneNode(true);
            } : function(node) {
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
                    can.each(attributes, function(node) {
                        if (node && node.specified) {
                            copy.setAttribute(node.nodeName, node.nodeValue);
                        }
                    });
                }

                if (node.childNodes) {
                    can.each(node.childNodes, function(child) {
                        copy.appendChild(cloneNode(child));
                    });
                }

                return copy;
            };

        function processNode(node, paths, location) {
            var callback,
                loc = location,
                nodeType = typeof node,
                el,
                p,
                i, len;
            var getCallback = function() {
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

            if (nodeType === "object") {
                if (node.tag) {
                    el = document.createElement(node.tag);

                    if (node.attrs) {
                        for (var attrName in node.attrs) {
                            var value = node.attrs[attrName];
                            if (typeof value === "function") {
                                getCallback().callbacks.push({
                                        callback: value
                                    });
                            } else {
                                el.setAttribute(attrName, value);
                            }
                        }
                    }
                    if (node.attributes) {
                        for (i = 0, len = node.attributes.length; i < len; i++) {
                            getCallback().callbacks.push({
                                    callback: node.attributes[i]
                                });
                        }
                    }
                    if (node.children && node.children.length) {
                        // add paths
                        if (callback) {
                            p = callback.paths = [];
                        } else {
                            p = paths;
                        }
                        el.appendChild(processNodes(node.children, p, loc));
                    }
                } else if (node.comment) {
                    el = document.createComment(node.comment);

                    if (node.callbacks) {
                        for (i = 0, len = node.attributes.length; i < len; i++) {
                            getCallback().callbacks.push({
                                    callback: node.callbacks[i]
                                });
                        }
                    }
                }


            } else if (nodeType === "string") {
                el = document.createTextNode(node);
            } else if (nodeType === "function") {

                if (keepsTextNodes) {
                    el = document.createTextNode("");
                    getCallback().callbacks.push({
                            callback: node
                        });
                } else {
                    el = document.createComment("~");
                    getCallback().callbacks.push({
                            callback: function() {
                                var el = document.createTextNode("");
                                elements.replace([this], el);
                                return node.apply(el, arguments);
                            }
                        });
                }

            }
            return el;
        }

        function hydratePath(el, pathData, args) {
            var path = pathData.path,
                callbacks = pathData.callbacks,
                paths = pathData.paths,
                callbackData,
                child = el;

            for (var i = 0, len = path.length; i < len; i++) {
                child = child.childNodes[path[i]];
            }

            for (i = 0, len = callbacks.length; i < len; i++) {
                callbackData = callbacks[i];
                callbackData.callback.apply(child, args);
            }
            if (paths && paths.length) {
                for (i = paths.length - 1; i >= 0; i--) {
                    hydratePath(child, paths[i], args);
                }
            }
        }

        function makeTarget(nodes) {
            var paths = [];
            var frag = processNodes(nodes, paths, []);
            return {
                paths: paths,
                clone: frag,
                hydrate: function() {
                    var cloned = cloneNode(this.clone);
                    var args = can.makeArray(arguments);
                    for (var i = paths.length - 1; i >= 0; i--) {
                        hydratePath(cloned, paths[i], args);
                    }
                    return cloned;
                }
            };
        }
        makeTarget.keepsTextNodes = keepsTextNodes;

        can.view.target = makeTarget;

        return makeTarget;
    })(window.can, undefined);

    // ## view/stache/utils.js
    var __m14 = (function() {
        return {
            // Returns if something looks like an array.  This works for can.List
            isArrayLike: function(obj) {
                return obj && obj.splice && typeof obj.length === 'number';
            },
            // Returns if something is an observe.  This works for can.route
            isObserveLike: function(obj) {
                return obj instanceof can.Map || (obj && !! obj._get);
            },
            // A generic empty function
            emptyHandler: function() {},
            // Converts a string like "1" into 1. "null" into null, etc.
            // This doesn't have to do full JSON, so removing eval would be good.
            jsonParse: function(str) {
                // if it starts with a quote, assume a string.
                if (str[0] === "'") {
                    return str.substr(1, str.length - 2);
                } else if (str === "undefined") {
                    return undefined;
                } else if (window.JSON) {
                    return JSON.parse(str);
                } else {
                    return eval("(" + str + ")");
                }
            },
            mixins: {
                last: function() {
                    return this.stack[this.stack.length - 1];
                },
                add: function(chars) {
                    this.last().add(chars);
                },
                subSectionDepth: function() {
                    return this.stack.length - 1;
                }
            }
        };
    })(window.can);

    // ## view/stache/mustache_helpers.js
    var __m16 = (function(can, utils, live) {
        live = live || can.view.live;

        var resolve = function(value) {
            if (utils.isObserveLike(value) && utils.isArrayLike(value) && value.attr('length')) {
                return value;
            } else if (can.isFunction(value)) {
                return value();
            } else {
                return value;
            }
        };

        var helpers = {
            "each": function(items, options) {
                var resolved = resolve(items),
                    result = [],
                    keys,
                    key,
                    i;

                if (resolved instanceof can.List || (items && items.isComputed && resolved === undefined)) {
                    return function(el) {
                        var cb = function(item, index, parentNodeList) {

                            return options.fn(options.scope.add({
                                        "@index": index
                                    }).add(item), options.options, parentNodeList);

                        };
                        live.list(el, items, cb, options.context, el.parentNode, options.nodeList);
                    };
                }

                var expr = resolved;

                if ( !! expr && utils.isArrayLike(expr)) {
                    for (i = 0; i < expr.length; i++) {
                        result.push(options.fn(options.scope.add({
                                        "@index": i
                                    })
                                .add(expr[i])));
                    }
                } else if (utils.isObserveLike(expr)) {
                    keys = can.Map.keys(expr);
                    // listen to keys changing so we can livebind lists of attributes.

                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        result.push(options.fn(options.scope.add({
                                        "@key": key
                                    })
                                .add(expr[key])));
                    }
                } else if (expr instanceof Object) {
                    for (key in expr) {
                        result.push(options.fn(options.scope.add({
                                        "@key": key
                                    })
                                .add(expr[key])));
                    }

                }
                return result;

            },
            'if': function(expr, options) {
                var value;
                // if it's a function, wrap its value in a compute
                // that will only change values from true to false
                if (can.isFunction(expr)) {
                    value = can.compute.truthy(expr)();
                } else {
                    value = !! resolve(expr);
                }

                if (value) {
                    return options.fn(options.scope || this);
                } else {
                    return options.inverse(options.scope || this);
                }
            },
            'unless': function(expr, options) {
                return helpers['if'].apply(this, [can.isFunction(expr) ? can.compute(function() {
                                return !expr();
                            }) : !expr, options]);
            },
            'with': function(expr, options) {
                var ctx = expr;
                expr = resolve(expr);
                if ( !! expr) {
                    return options.fn(ctx);
                }
            },
            'log': function(expr, options) {
                if (typeof console !== "undefined" && console.log) {
                    if (!options) {
                        console.log(expr.context);
                    } else {
                        console.log(expr, options.context);
                    }
                }
            },
            'data': function(attr) {
                // options will either be the second or third argument.
                // Get the argument before that.
                var data = arguments.length === 2 ? this : arguments[1];
                return function(el) {

                    can.data(can.$(el), attr, data || this.context);
                };
            }
        };

        return {
            registerHelper: function(name, callback) {
                helpers[name] = callback;
            },
            getHelper: function(name, options) {
                var helper = options.attr("helpers." + name);
                if (!helper) {
                    helper = helpers[name];
                }
                if (helper) {
                    return {
                        fn: helper
                    };
                }
            }
        };

    })(window.can, __m14, undefined);

    // ## view/stache/mustache_core.js
    var __m15 = (function(can, utils, mustacheHelpers, live, elements, Scope, nodeLists) {

        live = live || can.view.live;
        elements = elements || can.view.elements;
        Scope = Scope || can.view.Scope;
        nodeLists = nodeLists || can.view.nodeLists;

        // ## Types

        // A lookup is an object that is used to identify a lookup in the scope.



        // ## Helpers

        // Breaks up the name and arguments of a mustache expression.
        var argumentsRegExp = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
            // Identifies the type of an argument or hash in a mustache expression.
            literalNumberStringBooleanRegExp = /^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/,
            // Finds mustache tags and their surrounding whitespace.
            mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g,
            // Identifies if an argument value should be looked up.
            isLookup = function(obj) {
                return obj && typeof obj.get === "string";
            },
            // A helper for calling the truthy subsection for each item in a list and putting them in a document Fragment.
            getItemsFragContent = function(items, isObserveList, helperOptions, options) {
                var frag = document.createDocumentFragment();
                for (var i = 0, len = items.length; i < len; i++) {
                    append(frag, helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options));
                }
                return frag;
            },
            // Appends some content to a document fragment.  If the content is a string, it puts it in a TextNode.
            append = function(frag, content) {
                if (content) {
                    frag.appendChild(typeof content === "string" ? document.createTextNode(content) : content);
                }
            },
            // A helper for calling the truthy subsection for each item in a list and returning them in a string.
            getItemsStringContent = function(items, isObserveList, helperOptions, options) {
                var txt = "";
                for (var i = 0, len = items.length; i < len; i++) {
                    txt += helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options);
                }
                return txt;
            },
            getKeyComputeData = function(key, scope, isArgument) {

                // Get a compute (and some helper data) that represents key's value in the current scope
                var data = scope.computeData(key, {
                        isArgument: isArgument,
                        args: [scope.attr('.'), scope]
                    });

                can.compute.temporarilyBind(data.compute);

                return data;
            },
            // Returns a value or compute for the given key.
            getKeyArgValue = function(key, scope) {
                var data = getKeyComputeData(key, scope, true);
                // If there are no dependencies, just return the value.
                if (!data.compute.hasDependencies) {
                    return data.initialValue;
                } else {
                    return data.compute;
                }
            },
            // Sets .fn and .inverse on a helperOptions object and makes sure 
            // they can reference the current scope and options.
            convertToScopes = function(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer) {
                // overwrite fn and inverse to always convert to scopes
                if (truthyRenderer) {
                    helperOptions.fn = makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
                }
                if (falseyRenderer) {
                    helperOptions.inverse = makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
                }
            },
            // Returns a new renderer function that makes sure any data or helpers passed
            // to it are converted to a can.view.Scope and a can.view.Options.
            makeRendererConvertScopes = function(renderer, parentScope, parentOptions, nodeList) {
                var rendererWithScope = function(ctx, opts, parentNodeList) {
                    return renderer(ctx || parentScope, opts, parentNodeList);
                };
                return function(newScope, newOptions, parentNodeList) {
                    // prevent binding on fn.
                    var reads = can.__clearReading();
                    // If a non-scope value is passed, add that to the parent scope.
                    if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
                        newScope = parentScope.add(newScope);
                    }
                    if (newOptions !== undefined && !(newOptions instanceof core.Options)) {
                        newOptions = parentOptions.add(newOptions);
                    }
                    var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList || nodeList);
                    can.__setReading(reads);
                    return result;
                };
            };



        var core = {
            // ## mustacheCore.expressionData
            // Returns processed information about the arguments and hash in a mustache expression.

            expressionData: function(expression) {
                var args = [],
                    hashes = {},
                    i = 0;

                (can.trim(expression) + ' ').replace(argumentsRegExp, function(whole, arg) {
                    var m;
                    // Check for special helper arguments (string/number/boolean/hashes).
                    if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
                        if (m[1] || m[2]) {
                            args.push(utils.jsonParse(m[1] || m[2]));
                        }
                        // Found a hash object.
                        else {
                            // Addd to the hash object.
                            hashes[m[3]] = (m[6] ? {
                                    get: m[6]
                                } : utils.jsonParse(m[4] || m[5]));
                        }
                    }
                    // Otherwise output a normal interpolation reference.
                    else {
                        args.push({
                                get: arg
                            });
                    }
                    i++;
                });

                return {
                    name: args.shift(),
                    args: args,
                    hash: hashes
                };
            },
            // ## mustacheCore.makeEvaluator
            // Given a scope and expression, returns a function that evaluates that expression in the scope. 
            // This function first reads lookup values in the args and hash.  Then it tries to figure out
            // if a helper is being called or a value is being read.  Finally, depending on
            // if it's a helper, or not, and which mode the expression is in, it returns
            // a function that can quickly evaluate the expression.

            makeEvaluator: function(scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {
                // Arguments for the helper.
                var args = [],
                    // Hash values for helper.
                    hash = {},
                    // Helper options object.
                    helperOptions = {
                        fn: function() {},
                        inverse: function() {}
                    },
                    // The current context.
                    context = scope.attr("."),

                    // The main value.
                    name = exprData.name,

                    // If name is a helper, this gets set to the helper.
                    helper,
                    // `true` if the expression looks like a helper.
                    looksLikeAHelper = exprData.args.length || !can.isEmptyObject(exprData.hash),
                    // The "peaked" at value of the name.
                    initialValue;

                // Convert lookup values in arguments to actual values.
                for (var i = 0, len = exprData.args.length; i < len; i++) {
                    var arg = exprData.args[i];
                    if (arg && isLookup(arg)) {
                        args.push(getKeyArgValue(arg.get, scope, true));
                    } else {
                        args.push(arg);
                    }
                }
                // Convert lookup values in hash to actual values.
                for (var prop in exprData.hash) {
                    if (isLookup(exprData.hash[prop])) {
                        hash[prop] = getKeyArgValue(exprData.hash[prop].get, scope);
                    } else {
                        hash[prop] = exprData.hash[prop];
                    }
                }

                // Lookup value in name.  Also determine if name is a helper.
                if (isLookup(name)) {

                    // If the expression looks like a helper, try to get a helper right away.
                    if (looksLikeAHelper) {
                        // Try to find a registered helper.
                        helper = mustacheHelpers.getHelper(name.get, options);

                        // If a function is on top of the context, call that as a helper.
                        if (!helper && typeof context[name.get] === "function") {
                            helper = {
                                fn: context[name.get]
                            };
                        }

                    }
                    // If a helper has not been found, either because this does not look like a helper
                    // or because a helper was not found, get the value of name and determine 
                    // if it's a value or not.
                    if (!helper) {
                        var get = name.get;

                        // Get info about the compute that represents this lookup.
                        // This way, we can get the initial value without "reading" the compute.
                        var computeData = getKeyComputeData(name.get, scope, false),
                            compute = computeData.compute;

                        initialValue = computeData.initialValue;
                        if (computeData.reads && computeData.reads.length === 1 && computeData.root instanceof can.Map) {
                            compute = can.compute(computeData.root, computeData.reads[0]);
                        }


                        // Set name to be the compute if the compute reads observables,
                        // or the value of the value of the compute if no observables are found.
                        if (computeData.compute.hasDependencies) {
                            name = compute;
                        } else {
                            name = initialValue;
                        }

                        // If it doesn't look like a helper and there is no value, check helpers
                        // anyway. This is for when foo is a helper in `{{foo}}`.
                        if (!looksLikeAHelper && initialValue === undefined) {
                            helper = mustacheHelpers.getHelper(get, options);
                        }
                        // Otherwise, if the value is a function, we'll call that as a helper.
                        else if (typeof initialValue === "function") {
                            helper = {
                                fn: initialValue
                            };
                        }

                    }

                }


                // If inverse mode, reverse renderers.
                if (mode === "^") {
                    var temp = truthyRenderer;
                    truthyRenderer = falseyRenderer;
                    falseyRenderer = temp;
                }

                // Check for a registered helper or a helper-like function.
                if (helper) {

                    // Add additional data to be used by helper functions
                    convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);

                    can.simpleExtend(helperOptions, {
                            context: context,
                            scope: scope,
                            contexts: scope,
                            hash: hash,
                            nodeList: nodeList
                        });

                    args.push(helperOptions);
                    // Call the helper.
                    return function() {
                        return helper.fn.apply(context, args) || '';
                    };

                }

                // Return evaluators for no mode.
                if (!mode) {
                    // If it's computed, return a function that just reads the compute.
                    if (name && name.isComputed) {
                        return name;
                    }
                    // Just return name as the value
                    else {

                        return function() {
                            return '' + (name != null ? name : '');
                        };
                    }
                } else if (mode === "#" || mode === "^") {
                    // Setup renderers.
                    convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);
                    return function() {
                        // Get the value
                        var value;
                        if (can.isFunction(name) && name.isComputed) {
                            value = name();
                        } else {
                            value = name;
                        }
                        // If it's an array, render.
                        if (utils.isArrayLike(value)) {
                            var isObserveList = utils.isObserveLike(value);

                            if (isObserveList ? value.attr("length") : value.length) {
                                return (stringOnly ? getItemsStringContent : getItemsFragContent)
                                (value, isObserveList, helperOptions, options);
                            } else {
                                return helperOptions.inverse(scope, options);
                            }
                        }
                        // If truthy, render fn, otherwise, inverse.
                        else {
                            return value ? helperOptions.fn(value || scope, options) : helperOptions.inverse(scope, options);
                        }
                    };
                } else {
                    // not supported!
                }
            },
            // ## mustacheCore.makeLiveBindingPartialRenderer
            // Returns a renderer function that live binds a partial.

            makeLiveBindingPartialRenderer: function(partialName, state) {
                partialName = can.trim(partialName);

                return function(scope, options, parentSectionNodeList) {
                    // Look up partials in options first.
                    var partial = options.attr("partials." + partialName),
                        res;
                    if (partial) {
                        res = partial.render ? partial.render(scope, options) :
                            partial(scope, options);
                    }
                    // Use can.view to get and render the partial.
                    else {

                        res = can.view.render(partialName, scope, options);
                    }

                    res = can.frag(res);

                    var nodeList = [this];

                    nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true : true);
                    nodeLists.update(nodeList, res.childNodes);
                    elements.replace([this], res);
                };
            },
            // ## mustacheCore.makeStringBranchRenderer
            // Return a renderer function that evalutes to a string and caches
            // the evaluator on the scope.

            makeStringBranchRenderer: function(mode, expression) {

                var exprData = expressionData(expression);

                // A branching renderer takes truthy and falsey renderer.
                return function branchRenderer(scope, options, truthyRenderer, falseyRenderer) {
                    // TODO: What happens if same mode/expresion, but different sub-sections?
                    // Check the scope's cache if the evaluator already exists for performance.
                    //console.log("here!");
                    var evaluator = makeEvaluator(scope, options, null, mode, exprData, truthyRenderer, falseyRenderer, true);
                    // Run the evaluator and return the result.
                    var res = evaluator();
                    return res == null ? "" : "" + res;
                };
            },
            // ## mustacheCore.makeLiveBindingBranchRenderer
            // Return a renderer function that evaluates the mustache expression and 
            // sets up live binding if a compute with dependencies is found. Otherwise,
            // the element's value is set.
            // This function works by creating a `can.compute` from the mustache expression.
            // If the compute has dependent observables, it passes the compute to `can.view.live`; otherwise,
            // it updates the element's property based on the compute's value.

            makeLiveBindingBranchRenderer: function(mode, expression, state) {

                // Pre-process the expression.
                var exprData = expressionData(expression);

                // A branching renderer takes truthy and falsey renderer.
                return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer) {

                    var nodeList = [this];
                    nodeList.expression = expression;
                    // register this nodeList.
                    // Regsiter it with its parent ONLY if this is directly nested.  Otherwise, it's unencessary.
                    nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true : true);


                    // Get the evaluator. This does not need to be cached (probably) because if there
                    // an observable value, it will be handled by `can.view.live`.
                    var evaluator = makeEvaluator(scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer,
                        // If this is within a tag, make sure we only get string values. 
                        state.tag);

                    // Create a compute that can not be observed by other 
                    // comptues. This is important because this renderer is likely called by 
                    // parent expresions.  If this value changes, the parent expressions should
                    // not re-evaluate. We prevent that by making sure this compute is ignored by 
                    // everyone else.
                    var compute = can.compute(evaluator, null, false, true);

                    // Bind on the compute to set the cached value. This helps performance
                    // so live binding can read a cached value instead of re-calculating.
                    compute.bind("change", can.k);
                    var value = compute();

                    // If value is a function, it's a helper that returned a function.
                    if (typeof value === "function") {

                        // A helper function should do it's own binding.  Similar to how
                        // we prevented this function's compute from being noticed by parent expressions,
                        // we hide any observables read in the function by saving any observables that
                        // have been read and then setting them back which overwrites any `can.__reading` calls
                        // performed in value.
                        var old = can.__clearReading();
                        value(this);
                        can.__setReading(old);

                    }
                    // If the compute has observable dependencies, setup live binding.
                    else if (compute.hasDependencies) {

                        // Depending on where the template is, setup live-binding differently.
                        if (state.attr) {
                            live.simpleAttribute(this, state.attr, compute);
                        } else if (state.tag) {
                            live.attributes(this, compute);
                        } else if (state.text && typeof value !== "object") {
                            live.text(this, compute, this.parentNode, nodeList);
                        } else {
                            live.html(this, compute, this.parentNode, nodeList);
                        }
                    }
                    // If the compute has no observable dependencies, just set the value on the element.
                    else {

                        if (state.attr) {
                            can.attr.set(this, state.attr, value);
                        } else if (state.tag) {
                            live.setAttributes(this, value);
                        } else if (state.text && typeof value === "string") {
                            this.nodeValue = value;
                        } else if (value) {
                            elements.replace([this], can.frag(value));
                        }
                    }
                    // Unbind the compute. 
                    compute.unbind("change", can.k);
                };
            },
            // ## mustacheCore.splitModeFromExpression
            // Returns the mustache mode split from the rest of the expression.

            splitModeFromExpression: function(expression, state) {
                expression = can.trim(expression);
                var mode = expression[0];

                if ("#/{&^>!".indexOf(mode) >= 0) {
                    expression = can.trim(expression.substr(1));
                } else {
                    mode = null;
                }
                // Triple braces do nothing within a tag.
                if (mode === "{" && state.node) {
                    mode = null;
                }
                return {
                    mode: mode,
                    expression: expression
                };
            },
            // ## mustacheCore.cleanLineEndings
            // Removes line breaks accoding to the mustache specification.

            cleanLineEndings: function(template) {

                // Finds mustache tags with space around them or no space around them.
                return template.replace(mustacheLineBreakRegExp, function(whole,
                    returnBefore,
                    spaceBefore,
                    special,
                    expression,
                    spaceAfter,
                    returnAfter,
                    // A mustache magic tag that has no space around it.
                    spaceLessSpecial,
                    spaceLessExpression,
                    matchIndex) {

                    // IE 8 will provide undefined
                    spaceAfter = (spaceAfter || "");
                    returnBefore = (returnBefore || "");
                    spaceBefore = (spaceBefore || "");

                    var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression, {});

                    // If it's a partial or tripple stache, leave in place.
                    if (spaceLessSpecial || ">{".indexOf(modeAndExpression.mode) >= 0) {
                        return whole;
                    } else if ("^#!/".indexOf(modeAndExpression.mode) >= 0) {

                        // Return the magic tag and a trailing linebreak if this did not 
                        // start a new line and there was an end line.
                        return special + (matchIndex !== 0 && returnAfter.length ? returnBefore + "\n" : "");


                    } else {
                        // There is no mode, return special with spaces around it.
                        return spaceBefore + special + spaceAfter + (spaceBefore.length || matchIndex !== 0 ? returnBefore + "\n" : "");
                    }

                });
            },
            // ## can.view.Options
            // This contains the local helpers, partials, and tags available to a template.

            Options: can.view.Scope.extend({
                    init: function(data, parent) {
                        if (!data.helpers && !data.partials && !data.tags) {
                            data = {
                                helpers: data
                            };
                        }
                        can.view.Scope.prototype.init.apply(this, arguments);
                    }
                })
        };

        // ## Local Variable Cache
        // The following creates slightly more quickly accessible references of the following
        // core functions.
        var makeEvaluator = core.makeEvaluator,
            expressionData = core.expressionData,
            splitModeFromExpression = core.splitModeFromExpression;


        return core;
    })(window.can, __m14, __m16, undefined, undefined, undefined, undefined);

    // ## view/stache/html_section.js
    var __m13 = (function(can, target, utils, mustacheCore) {


        var decodeHTML = (function() {
            var el = document.createElement('div');
            return function(html) {
                if (html.indexOf("&") === -1) {
                    return html.replace(/\r\n/g, "\n");
                }
                el.innerHTML = html;
                return el.childNodes.length === 0 ? "" : el.childNodes[0].nodeValue;
            };
        })();
        // ## HTMLSectionBuilder
        // Contains a stack of HTMLSections.
        // An HTMLSection is created everytime a subsection is found. For example:
        //     {{#if items}} {{#items}} X
        // At the point X was being processed, their would be 2 HTMLSections in the 
        // stack.  One for the content of `{{#if items}}` and the other for the
        // content of `{{#items}}`
        var HTMLSectionBuilder = function() {
            this.stack = [new HTMLSection()];
        };

        can.extend(HTMLSectionBuilder.prototype, utils.mixins);

        can.extend(HTMLSectionBuilder.prototype, {
                startSubSection: function(process) {
                    var newSection = new HTMLSection(process);
                    this.stack.push(newSection);
                    return newSection;
                },
                // Ends the current section and returns a renderer.
                // But only returns a renderer if there is a template.
                endSubSectionAndReturnRenderer: function() {
                    if (this.last().isEmpty()) {
                        this.stack.pop();
                        return null;
                    } else {
                        var htmlSection = this.endSection();
                        return can.proxy(htmlSection.compiled.hydrate, htmlSection.compiled);
                    }
                },
                startSection: function(process) {
                    var newSection = new HTMLSection(process);
                    this.last().add(newSection.targetCallback);
                    // adding a section within a section ...
                    // the stack has section ...
                    this.stack.push(newSection);
                },
                endSection: function() {
                    this.last().compile();
                    return this.stack.pop();
                },
                inverse: function() {
                    this.last().inverse();
                },
                compile: function() {
                    var compiled = this.stack.pop().compile();

                    return function(scope, options) {
                        if (!(scope instanceof can.view.Scope)) {
                            scope = new can.view.Scope(scope || {});
                        }
                        if (!(options instanceof mustacheCore.Options)) {
                            options = new mustacheCore.Options(options || {});
                        }
                        return compiled.hydrate(scope, options);
                    };
                },
                push: function(chars) {
                    this.last().push(chars);
                },
                pop: function() {
                    return this.last().pop();
                }
            });

        var HTMLSection = function(process) {
            this.data = "targetData";
            this.targetData = [];
            // A record of what targetData element we are within.
            this.targetStack = [];
            var self = this;
            this.targetCallback = function(scope, options, sectionNode) {
                process.call(this,
                    scope,
                    options,
                    sectionNode,
                    can.proxy(self.compiled.hydrate, self.compiled),
                    self.inverseCompiled && can.proxy(self.inverseCompiled.hydrate, self.inverseCompiled));
            };
        };
        can.extend(HTMLSection.prototype, {
                inverse: function() {
                    this.inverseData = [];
                    this.data = "inverseData";
                },
                // Adds a DOM node.
                push: function(data) {
                    this.add(data);
                    this.targetStack.push(data);
                },
                pop: function() {
                    return this.targetStack.pop();
                },
                add: function(data) {
                    if (typeof data === "string") {
                        data = decodeHTML(data);
                    }
                    if (this.targetStack.length) {
                        this.targetStack[this.targetStack.length - 1].children.push(data);
                    } else {
                        this[this.data].push(data);
                    }
                },
                compile: function() {
                    this.compiled = target(this.targetData);
                    if (this.inverseData) {
                        this.inverseCompiled = target(this.inverseData);
                        delete this.inverseData;
                    }
                    delete this.targetData;
                    delete this.targetStack;
                    return this.compiled;
                },
                children: function() {
                    if (this.targetStack.length) {
                        return this.targetStack[this.targetStack.length - 1].children;
                    } else {
                        return this[this.data];
                    }
                },
                // Returns if a section is empty
                isEmpty: function() {
                    return !this.targetData.length;
                }
            });

        return HTMLSectionBuilder;

    })(window.can, __m11, __m14, __m15);

    // ## view/stache/text_section.js
    var __m28 = (function(can, live, utils) {
        live = live || can.view.live;

        var TextSectionBuilder = function() {
            this.stack = [new TextSection()];
        },
            emptyHandler = function() {};

        can.extend(TextSectionBuilder.prototype, utils.mixins);

        can.extend(TextSectionBuilder.prototype, {
                // Adds a subsection.
                startSection: function(process) {
                    var subSection = new TextSection();
                    this.last().add({
                            process: process,
                            truthy: subSection
                        });
                    this.stack.push(subSection);
                },
                endSection: function() {
                    this.stack.pop();
                },
                inverse: function() {
                    this.stack.pop();
                    var falseySection = new TextSection();
                    this.last().last().falsey = falseySection;
                    this.stack.push(falseySection);
                },
                compile: function(state) {

                    var renderer = this.stack[0].compile();

                    return function(scope, options) {

                        var compute = can.compute(function() {
                            return renderer(scope, options);
                        }, this, false, true);

                        compute.bind("change", emptyHandler);
                        var value = compute();

                        if (compute.hasDependencies) {
                            if (state.attr) {
                                live.simpleAttribute(this, state.attr, compute);
                            } else {
                                live.attributes(this, compute);
                            }
                            compute.unbind("change", emptyHandler);
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

        var passTruthyFalsey = function(process, truthy, falsey) {
            return function(scope, options) {
                return process.call(this, scope, options, truthy, falsey);
            };
        };

        var TextSection = function() {
            this.values = [];
        };

        can.extend(TextSection.prototype, {
                add: function(data) {
                    this.values.push(data);
                },
                last: function() {
                    return this.values[this.values.length - 1];
                },
                compile: function() {
                    var values = this.values,
                        len = values.length;

                    for (var i = 0; i < len; i++) {
                        var value = this.values[i];
                        if (typeof value === "object") {
                            values[i] = passTruthyFalsey(value.process,
                                value.truthy && value.truthy.compile(),
                                value.falsey && value.falsey.compile());
                        }
                    }

                    return function(scope, options) {
                        var txt = "",
                            value;
                        for (var i = 0; i < len; i++) {
                            value = values[i];
                            txt += typeof value === "string" ? value : value.call(this, scope, options);
                        }
                        return txt;
                    };
                }
            });

        return TextSectionBuilder;
    })(window.can, undefined, __m14);

    // ## view/stache/stache.js
    var __m1 = (function(can, parser, target, HTMLSectionBuilder, TextSectionBuilder, mustacheCore, mustacheHelpers, viewCallbacks) {

        // Make sure that we can also use our modules with Stache as a plugin
        parser = parser || can.view.parser;
        viewCallbacks = viewCallbacks || can.view.callbacks;

        function stache(template) {

            // Remove line breaks according to mustache's specs.
            template = mustacheCore.cleanLineEndings(template);

            // The HTML section that is the root section for the entire template.
            var section = new HTMLSectionBuilder(),
                // Tracks the state of the parser.
                state = {
                    node: null,
                    attr: null,
                    // A stack of which node / section we are in.
                    // There is probably a better way of doing this.
                    sectionElementStack: [],
                    // If text should be inserted and HTML escaped
                    text: false
                },
                // This function is a catch all for taking a section and figuring out
                // how to create a "renderer" that handles the functionality for a 
                // given section and modify the section to use that renderer.
                // For example, if an HTMLSection is passed with mode `#` it knows to 
                // create a liveBindingBranchRenderer and pass that to section.add.
                makeRendererAndUpdateSection = function(section, mode, stache) {

                    if (mode === ">") {
                        // Partials use liveBindingPartialRenderers
                        section.add(mustacheCore.makeLiveBindingPartialRenderer(stache, state));

                    } else if (mode === "/") {

                        section.endSection();
                        if (section instanceof HTMLSectionBuilder) {
                            state.sectionElementStack.pop();
                        }
                    } else if (mode === "else") {

                        section.inverse();

                    } else {

                        // If we are an HTMLSection, we will generate a 
                        // a LiveBindingBranchRenderer; otherwise, a StringBranchRenderer.
                        // A LiveBindingBranchRenderer function processes
                        // the mustache text, and sets up live binding if an observable is read.
                        // A StringBranchRenderer function processes the mustache text and returns a 
                        // text value.  
                        var makeRenderer = section instanceof HTMLSectionBuilder ?

                        mustacheCore.makeLiveBindingBranchRenderer :
                            mustacheCore.makeStringBranchRenderer;


                        if (mode === "{" || mode === "&") {

                            // Adds a renderer function that just reads a value or calls a helper.
                            section.add(makeRenderer(null, stache, copyState()));

                        } else if (mode === "#" || mode === "^") {
                            // Adds a renderer function and starts a section.
                            section.startSection(makeRenderer(mode, stache, copyState()));
                            // If we are a directly nested section, count how many we are within
                            if (section instanceof HTMLSectionBuilder) {
                                state.sectionElementStack.push("section");
                            }
                        } else {
                            // Adds a renderer function that only updates text.
                            section.add(makeRenderer(null, stache, copyState({
                                            text: true
                                        })));
                        }

                    }
                },
                // Copys the state object for use in renderers.
                copyState = function(overwrites) {
                    var cur = {
                        tag: state.node && state.node.tag,
                        attr: state.attr && state.attr.name,
                        directlyNested: state.sectionElementStack[state.sectionElementStack.length - 1] === "section"
                    };
                    return overwrites ? can.simpleExtend(cur, overwrites) : cur;
                },
                addAttributesCallback = function(node, callback) {
                    if (!node.attributes) {
                        node.attributes = [];
                    }
                    node.attributes.push(callback);
                };

            parser(template, {
                    start: function(tagName, unary) {
                        state.node = {
                            tag: tagName,
                            children: []
                        };
                    },
                    end: function(tagName, unary) {
                        var isCustomTag = viewCallbacks.tag(tagName);

                        if (unary) {
                            // If it's a custom tag with content, we need a section renderer.
                            section.add(state.node);
                            if (isCustomTag) {
                                addAttributesCallback(state.node, function(scope, options) {
                                    viewCallbacks.tagHandler(this, tagName, {
                                            scope: scope,
                                            options: options,
                                            subtemplate: null,
                                            templateType: "stache"
                                        });
                                });
                            }
                        } else {
                            section.push(state.node);

                            state.sectionElementStack.push("element");

                            // If it's a custom tag with content, we need a section renderer.
                            if (isCustomTag) {
                                section.startSubSection();
                            }
                        }


                        state.node = null;

                    },
                    close: function(tagName) {
                        var isCustomTag = viewCallbacks.tag(tagName),
                            renderer;

                        if (isCustomTag) {
                            renderer = section.endSubSectionAndReturnRenderer();
                        }

                        var oldNode = section.pop();
                        if (isCustomTag) {
                            addAttributesCallback(oldNode, function(scope, options) {
                                viewCallbacks.tagHandler(this, tagName, {
                                        scope: scope,
                                        options: options,
                                        subtemplate: renderer,
                                        templateType: "stache"
                                    });
                            });
                        }
                        state.sectionElementStack.pop();
                    },
                    attrStart: function(attrName) {
                        if (state.node.section) {
                            state.node.section.add(attrName + "=\"");
                        } else {
                            state.attr = {
                                name: attrName,
                                value: ""
                            };
                        }

                    },
                    attrEnd: function(attrName) {
                        if (state.node.section) {
                            state.node.section.add("\" ");
                        } else {
                            if (!state.node.attrs) {
                                state.node.attrs = {};
                            }

                            state.node.attrs[state.attr.name] =
                                state.attr.section ? state.attr.section.compile(copyState()) : state.attr.value;

                            var attrCallback = viewCallbacks.attr(attrName);
                            if (attrCallback) {
                                if (!state.node.attributes) {
                                    state.node.attributes = [];
                                }
                                state.node.attributes.push(function(scope, options) {
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
                    attrValue: function(value) {
                        var section = state.node.section || state.attr.section;
                        if (section) {
                            section.add(value);
                        } else {
                            state.attr.value += value;
                        }
                    },
                    chars: function(text) {
                        section.add(text);
                    },
                    special: function(text) {


                        var firstAndText = mustacheCore.splitModeFromExpression(text, state),
                            mode = firstAndText.mode,
                            expression = firstAndText.expression;


                        if (expression === "else") {
                            (state.attr && state.attr.section ? state.attr.section : section).inverse();
                            return;
                        }

                        if (mode === "!") {
                            return;
                        }

                        if (state.node && state.node.section) {

                            makeRendererAndUpdateSection(state.node.section, mode, expression);

                            if (state.node.section.subSectionDepth() === 0) {
                                state.node.attributes.push(state.node.section.compile(copyState()));
                                delete state.node.section;
                            }

                        }
                        // `{{}}` in an attribute like `class="{{}}"`
                        else if (state.attr) {

                            if (!state.attr.section) {
                                state.attr.section = new TextSectionBuilder();
                                if (state.attr.value) {
                                    state.attr.section.add(state.attr.value);
                                }
                            }
                            makeRendererAndUpdateSection(state.attr.section, mode, expression);
                        }
                        // `{{}}` in a tag like `<div {{}}>`
                        else if (state.node) {

                            if (!state.node.attributes) {
                                state.node.attributes = [];
                            }
                            if (!mode) {
                                state.node.attributes.push(mustacheCore.makeLiveBindingBranchRenderer(null, expression, copyState()));
                            } else if (mode === "#" || mode === "^") {
                                if (!state.node.section) {
                                    state.node.section = new TextSectionBuilder();
                                }
                                makeRendererAndUpdateSection(state.node.section, mode, expression);
                            } else {
                                throw mode + " is currently not supported within a tag.";
                            }



                        } else {
                            makeRendererAndUpdateSection(section, mode, expression);
                        }
                    },
                    comment: function(text) {
                        // create comment node
                        section.add({
                                comment: text
                            });
                    },
                    done: function() {}
                });

            return section.compile();
        }
        var escMap = {
            '\n': "\\n",
            '\r': "\\r",
            '\u2028': "\\u2028",
            '\u2029': "\\u2029"
        };
        var esc = function(string) {
            return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function(character) {
                if ("'\"\\".indexOf(character) >= 0) {
                    return "\\" + character;
                } else {
                    return escMap[character];
                }
            });
        };

        can.view.register({
                suffix: "stache",

                contentType: "x-stache-template",

                // Returns a `function` that renders the view.
                fragRenderer: function(id, text) {
                    return stache(text);
                },
                script: function(id, src) {
                    return "can.stache(\"" + esc(src) + "\")";
                }
            });
        can.view.ext = ".stache";

        // At this point, can.stache has been created
        can.extend(can.stache, mustacheHelpers);

        // Copy helpers on raw stache function too so it can be used by stealing it.
        can.extend(stache, mustacheHelpers);

        can.stache.safeString = stache.safeString = function(text) {
            return {
                toString: function() {
                    return text;
                }
            };
        };

        return stache;
    })(window.can, undefined, __m11, __m13, __m28, __m15, __m16, undefined);

})();
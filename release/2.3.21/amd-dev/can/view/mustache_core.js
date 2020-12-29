/*!
 * CanJS - 2.3.21
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 19 Mar 2016 01:24:17 GMT
 * Licensed MIT
 */

/*can@2.3.21#view/stache/mustache_core*/
define([
    'can/util/library',
    'can/view/utils',
    'can/view/mustache_helpers',
    'can/view/expression',
    'can/view/live',
    'can/elements',
    'can/view/scope',
    'can/view/node_lists'
], function (can, utils, mustacheHelpers, expression, live, elements, Scope, nodeLists) {
    live = live || can.view.live;
    elements = elements || can.view.elements;
    Scope = Scope || can.view.Scope;
    nodeLists = nodeLists || can.view.nodeLists;
    var mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g, getItemsFragContent = function (items, isObserveList, helperOptions, options) {
            var frag = (can.document || can.global.document).createDocumentFragment();
            for (var i = 0, len = items.length; i < len; i++) {
                append(frag, helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options));
            }
            return frag;
        }, append = function (frag, content) {
            if (content) {
                frag.appendChild(typeof content === 'string' ? frag.ownerDocument.createTextNode(content) : content);
            }
        }, getItemsStringContent = function (items, isObserveList, helperOptions, options) {
            var txt = '';
            for (var i = 0, len = items.length; i < len; i++) {
                txt += helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options);
            }
            return txt;
        }, k = function () {
        };
    var core = {
        expression: expression,
        makeEvaluator: function (scope, helperOptions, nodeList, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {
            if (mode === '^') {
                var temp = truthyRenderer;
                truthyRenderer = falseyRenderer;
                falseyRenderer = temp;
            }
            var value, helperOptionArg;
            if (exprData instanceof expression.Call) {
                helperOptionArg = {
                    fn: function () {
                    },
                    inverse: function () {
                    },
                    context: scope.attr('.'),
                    scope: scope,
                    nodeList: nodeList,
                    exprData: exprData,
                    helpersScope: helperOptions
                };
                utils.convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer);
                value = exprData.value(scope, helperOptions, helperOptionArg);
                if (exprData.isHelper) {
                    return value;
                }
            } else {
                var readOptions = {
                    isArgument: true,
                    args: [
                        scope.attr('.'),
                        scope
                    ],
                    asCompute: true
                };
                var helperAndValue = exprData.helperAndValue(scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
                var helper = helperAndValue.helper;
                value = helperAndValue.value;
                if (helper) {
                    return exprData.evaluator(helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
                }
            }
            if (!mode) {
                if (value && value.isComputed) {
                    return value;
                } else {
                    return function () {
                        return '' + (value != null ? value : '');
                    };
                }
            } else if (mode === '#' || mode === '^') {
                helperOptionArg = {
                    fn: function () {
                    },
                    inverse: function () {
                    }
                };
                utils.convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer);
                return function () {
                    var finalValue;
                    if (can.isFunction(value) && value.isComputed) {
                        finalValue = value();
                    } else {
                        finalValue = value;
                    }
                    if (typeof finalValue === 'function') {
                        return finalValue;
                    } else if (utils.isArrayLike(finalValue)) {
                        var isObserveList = utils.isObserveLike(finalValue);
                        if (isObserveList ? finalValue.attr('length') : finalValue.length) {
                            return (stringOnly ? getItemsStringContent : getItemsFragContent)(finalValue, isObserveList, helperOptionArg, helperOptions);
                        } else {
                            return helperOptionArg.inverse(scope, helperOptions);
                        }
                    } else {
                        return finalValue ? helperOptionArg.fn(finalValue || scope, helperOptions) : helperOptionArg.inverse(scope, helperOptions);
                    }
                };
            } else {
            }
        },
        makeLiveBindingPartialRenderer: function (partialName, state) {
            partialName = can.trim(partialName);
            return function (scope, options, parentSectionNodeList) {
                var nodeList = [this];
                nodeList.expression = '>' + partialName;
                nodeLists.register(nodeList, null, parentSectionNodeList || true, state.directlyNested);
                var partialFrag = can.compute(function () {
                    var localPartialName = partialName;
                    var partial = options.attr('partials.' + localPartialName), renderer;
                    if (partial) {
                        renderer = function () {
                            return partial.render ? partial.render(scope, options, nodeList) : partial(scope, options);
                        };
                    } else {
                        var scopePartialName = scope.read(localPartialName, { isArgument: true }).value;
                        if (scopePartialName === null || !scopePartialName && localPartialName[0] === '*') {
                            return can.frag('');
                        }
                        if (scopePartialName) {
                            localPartialName = scopePartialName;
                        }
                        renderer = function () {
                            return can.isFunction(localPartialName) ? localPartialName(scope, options, nodeList) : can.view.render(localPartialName, scope, options, nodeList);
                        };
                    }
                    var res = can.__notObserve(renderer)();
                    return can.frag(res);
                });
                partialFrag.computeInstance.setPrimaryDepth(nodeList.nesting);
                live.html(this, partialFrag, this.parentNode, nodeList);
            };
        },
        makeStringBranchRenderer: function (mode, expressionString) {
            var exprData = core.expression.parse(expressionString), fullExpression = mode + expressionString;
            if (!(exprData instanceof expression.Helper) && !(exprData instanceof expression.Call)) {
                exprData = new expression.Helper(exprData, [], {});
            }
            return function branchRenderer(scope, options, truthyRenderer, falseyRenderer) {
                var evaluator = scope.__cache[fullExpression];
                if (mode || !evaluator) {
                    evaluator = makeEvaluator(scope, options, null, mode, exprData, truthyRenderer, falseyRenderer, true);
                    if (!mode) {
                        scope.__cache[fullExpression] = evaluator;
                    }
                }
                var res = evaluator();
                return res == null ? '' : '' + res;
            };
        },
        makeLiveBindingBranchRenderer: function (mode, expressionString, state) {
            var exprData = core.expression.parse(expressionString);
            if (!(exprData instanceof expression.Helper) && !(exprData instanceof expression.Call)) {
                exprData = new expression.Helper(exprData, [], {});
            }
            return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer) {
                var nodeList = [this];
                nodeList.expression = expressionString;
                nodeLists.register(nodeList, null, parentSectionNodeList || true, state.directlyNested);
                var evaluator = makeEvaluator(scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, state.tag);
                var gotCompute = evaluator.isComputed, compute;
                if (gotCompute) {
                    compute = evaluator;
                } else {
                    compute = can.compute(evaluator, null, false);
                }
                compute.computeInstance.setPrimaryDepth(nodeList.nesting);
                compute.computeInstance.bind('change', k);
                var value = compute();
                if (typeof value === 'function') {
                    can.__notObserve(value)(this);
                } else if (gotCompute || compute.computeInstance.hasDependencies) {
                    if (state.attr) {
                        live.simpleAttribute(this, state.attr, compute);
                    } else if (state.tag) {
                        live.attributes(this, compute);
                    } else if (state.text && typeof value !== 'object') {
                        live.text(this, compute, this.parentNode, nodeList);
                    } else {
                        live.html(this, compute, this.parentNode, nodeList);
                    }
                } else {
                    if (state.attr) {
                        can.attr.set(this, state.attr, value);
                    } else if (state.tag) {
                        live.setAttributes(this, value);
                    } else if (state.text && typeof value === 'string') {
                        this.nodeValue = value;
                    } else if (value != null) {
                        elements.replace([this], can.frag(value, this.ownerDocument));
                    }
                }
                compute.computeInstance.unbind('change', k);
            };
        },
        splitModeFromExpression: function (expression, state) {
            expression = can.trim(expression);
            var mode = expression.charAt(0);
            if ('#/{&^>!'.indexOf(mode) >= 0) {
                expression = can.trim(expression.substr(1));
            } else {
                mode = null;
            }
            if (mode === '{' && state.node) {
                mode = null;
            }
            return {
                mode: mode,
                expression: expression
            };
        },
        cleanLineEndings: function (template) {
            return template.replace(mustacheLineBreakRegExp, function (whole, returnBefore, spaceBefore, special, expression, spaceAfter, returnAfter, spaceLessSpecial, spaceLessExpression, matchIndex) {
                spaceAfter = spaceAfter || '';
                returnBefore = returnBefore || '';
                spaceBefore = spaceBefore || '';
                var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression, {});
                if (spaceLessSpecial || '>{'.indexOf(modeAndExpression.mode) >= 0) {
                    return whole;
                } else if ('^#!/'.indexOf(modeAndExpression.mode) >= 0) {
                    return special + (matchIndex !== 0 && returnAfter.length ? returnBefore + '\n' : '');
                } else {
                    return spaceBefore + special + spaceAfter + (spaceBefore.length || matchIndex !== 0 ? returnBefore + '\n' : '');
                }
            });
        },
        Options: utils.Options
    };
    var makeEvaluator = core.makeEvaluator, splitModeFromExpression = core.splitModeFromExpression;
    can.view.mustacheCore = core;
    return core;
});
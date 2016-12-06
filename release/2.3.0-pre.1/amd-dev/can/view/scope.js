/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#view/scope/scope*/
define([
    'can/util/library',
    'can/view/compute_data',
    'can/construct',
    'can/map',
    'can/list',
    'can/view',
    'can/compute'
], function (can, makeComputeData) {
    var escapeReg = /(\\)?\./g, escapeDotReg = /\\\./g, getNames = function (attr) {
            var names = [], last = 0;
            attr.replace(escapeReg, function (first, second, index) {
                if (!second) {
                    names.push(attr.slice(last, index).replace(escapeDotReg, '.'));
                    last = index + first.length;
                }
            });
            names.push(attr.slice(last).replace(escapeDotReg, '.'));
            return names;
        };
    var Scope = can.Construct.extend({
            read: can.compute.read,
            Refs: can.Map.extend({}),
            refsScope: function () {
                return new can.view.Scope(new this.Refs());
            }
        }, {
            init: function (context, parent) {
                this._context = context;
                this._parent = parent;
                this.__cache = {};
            },
            attr: can.__notObserve(function (key, value) {
                var options = {
                        isArgument: true,
                        returnObserveMethods: true,
                        proxyMethods: false
                    }, res = this.read(key, options);
                if (arguments.length === 2) {
                    var lastIndex = key.lastIndexOf('.'), readKey = lastIndex !== -1 ? key.substring(0, lastIndex) : '.', obj = this.read(readKey, options).value;
                    if (lastIndex !== -1) {
                        key = key.substring(lastIndex + 1, key.length);
                    }
                    can.compute.set(obj, key, value, options);
                }
                return res.value;
            }),
            add: function (context) {
                if (context !== this._context) {
                    return new this.constructor(context, this);
                } else {
                    return this;
                }
            },
            computeData: function (key, options) {
                return makeComputeData(this, key, options);
            },
            compute: function (key, options) {
                return this.computeData(key, options).compute;
            },
            getRefs: function () {
                var scope = this, context;
                while (scope) {
                    context = scope._context;
                    if (context instanceof Scope.Refs) {
                        return context;
                    }
                    scope = scope._parent;
                }
            },
            cloneFromRef: function () {
                var contexts = [];
                var scope = this, context, parent;
                while (scope) {
                    context = scope._context;
                    if (context instanceof Scope.Refs) {
                        parent = scope._parent;
                        break;
                    }
                    contexts.push(context);
                    scope = scope._parent;
                }
                if (parent) {
                    can.each(contexts, function (context) {
                        parent = parent.add(context);
                    });
                    return parent;
                } else {
                    return this;
                }
            },
            read: function (attr, options) {
                var stopLookup;
                if (attr.substr(0, 2) === './') {
                    stopLookup = true;
                    attr = attr.substr(2);
                } else if (attr.substr(0, 3) === '../') {
                    return this._parent.read(attr.substr(3), options);
                } else if (attr === '..') {
                    return { value: this._parent._context };
                } else if (attr === '.' || attr === 'this') {
                    return { value: this._context };
                } else if (attr === '@root') {
                    var cur = this, child = this;
                    while (cur._parent) {
                        child = cur;
                        cur = cur._parent;
                    }
                    if (cur._context instanceof Scope.Refs) {
                        cur = child;
                    }
                    return { value: cur._context };
                }
                var names = attr.indexOf('\\.') === -1 ? attr.split('.') : getNames(attr), context, scope = this, undefinedObserves = [], currentObserve, currentReads, setObserveDepth = -1, currentSetReads, currentSetObserve, searchedRefsScope = false, refInstance, readOptions = can.simpleExtend({
                        foundObservable: function (observe, nameIndex) {
                            currentObserve = observe;
                            currentReads = names.slice(nameIndex);
                        },
                        earlyExit: function (parentValue, nameIndex) {
                            if (nameIndex > setObserveDepth) {
                                currentSetObserve = currentObserve;
                                currentSetReads = currentReads;
                                setObserveDepth = nameIndex;
                            }
                        },
                        executeAnonymousFunctions: true
                    }, options);
                while (scope) {
                    context = scope._context;
                    refInstance = context instanceof Scope.Refs;
                    if (context !== null && (typeof context === 'object' || typeof context === 'function') && !(searchedRefsScope && refInstance)) {
                        if (refInstance) {
                            searchedRefsScope = true;
                        }
                        var data = can.compute.read(context, names, readOptions);
                        if (data.value !== undefined) {
                            return {
                                scope: scope,
                                rootObserve: currentObserve,
                                value: data.value,
                                reads: currentReads
                            };
                        } else {
                            undefinedObserves.push(can.__clearObserved());
                        }
                    }
                    if (!stopLookup) {
                        scope = scope._parent;
                    } else {
                        scope = null;
                    }
                }
                var len = undefinedObserves.length;
                if (len) {
                    for (var i = 0; i < len; i++) {
                        can.__addObserved(undefinedObserves[i]);
                    }
                }
                return {
                    setRoot: currentSetObserve,
                    reads: currentSetReads,
                    value: undefined
                };
            }
        });
    can.view.Scope = Scope;
    return Scope;
});
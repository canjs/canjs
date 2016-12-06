/*!
 * CanJS - 2.3.19
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 05 Mar 2016 00:00:37 GMT
 * Licensed MIT
 */

/*can@2.3.19#view/scope/scope*/
define([
    'can/util/library',
    'can/view/compute_data',
    'can/construct',
    'can/map',
    'can/list',
    'can/view',
    'can/compute'
], function (can, makeComputeData) {
    function Scope(context, parent, meta) {
        this._context = context;
        this._parent = parent;
        this._meta = meta || {};
        this.__cache = {};
    }
    can.simpleExtend(Scope, {
        read: can.compute.read,
        Refs: can.Map.extend({ shortName: 'ReferenceMap' }, {}),
        refsScope: function () {
            return new can.view.Scope(new this.Refs());
        }
    });
    can.simpleExtend(Scope.prototype, {
        add: function (context, meta) {
            if (context !== this._context) {
                return new this.constructor(context, this, meta);
            } else {
                return this;
            }
        },
        read: function (attr, options) {
            if (attr === '%root') {
                return { value: this.getRoot() };
            }
            var isInCurrentContext = attr.substr(0, 2) === './', isInParentContext = attr.substr(0, 3) === '../', isCurrentContext = attr === '.' || attr === 'this', isParentContext = attr === '..', isContextBased = isInCurrentContext || isInParentContext || isCurrentContext || isParentContext;
            if (isContextBased && this._meta.notContext) {
                return this._parent.read(attr, options);
            }
            var currentScopeOnly;
            if (isInCurrentContext) {
                currentScopeOnly = true;
                attr = attr.substr(2);
            } else if (isInParentContext) {
                var parent = this._parent;
                while (parent._meta.notContext) {
                    parent = parent._parent;
                }
                return parent.read(attr.substr(3) || '.', options);
            } else if (isCurrentContext) {
                return { value: this._context };
            } else if (isParentContext) {
                return { value: this._parent._context };
            }
            var keyReads = can.compute.read.reads(attr);
            if (keyReads[0].key.charAt(0) === '*') {
                return this.getRefs()._read(keyReads, options, true);
            } else {
                return this._read(keyReads, options, currentScopeOnly);
            }
        },
        _read: function (keyReads, options, currentScopeOnly) {
            var currentScope = this, currentContext, undefinedObserves = [], currentObserve, currentReads, setObserveDepth = -1, currentSetReads, currentSetObserve, readOptions = can.simpleExtend({
                    foundObservable: function (observe, nameIndex) {
                        currentObserve = observe;
                        currentReads = keyReads.slice(nameIndex);
                    },
                    earlyExit: function (parentValue, nameIndex) {
                        if (nameIndex > setObserveDepth) {
                            currentSetObserve = currentObserve;
                            currentSetReads = currentReads;
                            setObserveDepth = nameIndex;
                        }
                    }
                }, options);
            while (currentScope) {
                currentContext = currentScope._context;
                if (currentContext !== null && (typeof currentContext === 'object' || typeof currentContext === 'function')) {
                    var getObserves = can.__trapObserves();
                    var data = can.compute.read(currentContext, keyReads, readOptions);
                    var observes = getObserves();
                    if (data.value !== undefined) {
                        can.__observes(observes);
                        return {
                            scope: currentScope,
                            rootObserve: currentObserve,
                            value: data.value,
                            reads: currentReads
                        };
                    } else {
                        undefinedObserves.push.apply(undefinedObserves, observes);
                    }
                }
                if (currentScopeOnly) {
                    currentScope = null;
                } else {
                    currentScope = currentScope._parent;
                }
            }
            can.__observes(undefinedObserves);
            return {
                setRoot: currentSetObserve,
                reads: currentSetReads,
                value: undefined
            };
        },
        get: can.__notObserve(function (key, options) {
            options = can.simpleExtend({ isArgument: true }, options);
            var res = this.read(key, options);
            return res.value;
        }),
        getScope: function (tester) {
            var scope = this;
            while (scope) {
                if (tester(scope)) {
                    return scope;
                }
                scope = scope._parent;
            }
        },
        getContext: function (tester) {
            var res = this.getScope(tester);
            return res && res._context;
        },
        getRefs: function () {
            return this.getScope(function (scope) {
                return scope._context instanceof Scope.Refs;
            });
        },
        getRoot: function () {
            var cur = this, child = this;
            while (cur._parent) {
                child = cur;
                cur = cur._parent;
            }
            if (cur._context instanceof Scope.Refs) {
                cur = child;
            }
            return cur._context;
        },
        set: function (key, value, options) {
            var dotIndex = key.lastIndexOf('.'), slashIndex = key.lastIndexOf('/'), contextPath, propName;
            if (slashIndex > dotIndex) {
                contextPath = key.substring(0, slashIndex);
                propName = key.substring(slashIndex + 1, key.length);
            } else {
                if (dotIndex !== -1) {
                    contextPath = key.substring(0, dotIndex);
                    propName = key.substring(dotIndex + 1, key.length);
                } else {
                    contextPath = '.';
                    propName = key;
                }
            }
            if (key.charAt(0) === '*') {
                can.compute.set(this.getRefs()._context, key, value, options);
            } else {
                var context = this.read(contextPath, options).value;
                can.compute.set(context, propName, value, options);
            }
        },
        attr: can.__notObserve(function (key, value, options) {
            options = can.simpleExtend({ isArgument: true }, options);
            if (arguments.length === 2) {
                return this.set(key, value, options);
            } else {
                return this.get(key, options);
            }
        }),
        computeData: function (key, options) {
            return makeComputeData(this, key, options);
        },
        compute: function (key, options) {
            return this.computeData(key, options).compute;
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
                contexts.unshift(context);
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
        }
    });
    can.view.Scope = Scope;
    function Options(data, parent, meta) {
        if (!data.helpers && !data.partials && !data.tags) {
            data = { helpers: data };
        }
        Scope.call(this, data, parent, meta);
    }
    Options.prototype = new Scope();
    Options.prototype.constructor = Options;
    can.view.Options = Options;
    return Scope;
});
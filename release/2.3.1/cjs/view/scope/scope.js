/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*can@2.3.1#view/scope/scope*/
var can = require('../../util/util.js');
var makeComputeData = require('./compute_data.js');
require('../../construct/construct.js');
require('../../map/map.js');
require('../../list/list.js');
require('../view.js');
require('../../compute/compute.js');
var Scope = can.Construct.extend({
        read: can.compute.read,
        Refs: can.Map.extend({ shortName: 'ReferenceMap' }, {}),
        Break: function () {
        },
        refsScope: function () {
            return new can.view.Scope(new this.Refs());
        }
    }, {
        init: function (context, parent, meta) {
            this._context = context;
            this._parent = parent;
            this.__cache = {};
            this._meta = meta || {};
        },
        get: can.__notObserve(function (key, options) {
            options = can.simpleExtend({ isArgument: true }, options);
            var res = this.read(key, options);
            return res.value;
        }),
        attr: can.__notObserve(function (key, value, options) {
            options = can.simpleExtend({ isArgument: true }, options);
            if (arguments.length === 2) {
                var lastIndex = key.lastIndexOf('.'), readKey = lastIndex !== -1 ? key.substring(0, lastIndex) : '.', obj = this.read(readKey, options).value;
                if (lastIndex !== -1) {
                    key = key.substring(lastIndex + 1, key.length);
                }
                can.compute.set(obj, key, value, options);
            } else {
                return this.get(key, options);
            }
        }),
        add: function (context, meta) {
            if (context !== this._context) {
                return new this.constructor(context, this, meta);
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
            return this.getScope(function (scope) {
                return scope._context instanceof Scope.Refs;
            });
        },
        getViewModel: function () {
            return this.getContext(function (scope) {
                return scope._meta.viewModel;
            });
        },
        getContext: function (tester) {
            var res = this.getScope(tester);
            return res && res._context;
        },
        getScope: function (tester) {
            var scope = this;
            while (scope) {
                if (tester(scope)) {
                    return scope;
                }
                scope = scope._parent;
            }
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
            if (this._meta.protected) {
                return this._parent.read(attr, options);
            }
            var isInCurrentContext = attr.substr(0, 2) === './', isInParentContext = attr.substr(0, 3) === '../', isCurrentContext = attr === '.' || attr === 'this', isParentContext = attr === '..', isContextBased = isInCurrentContext || isInParentContext || isCurrentContext || isParentContext;
            if (isContextBased && this._meta.notContext) {
                return this._parent.read(attr, options);
            }
            var stopLookup;
            if (isInCurrentContext) {
                stopLookup = true;
                attr = attr.substr(2);
            } else if (isInParentContext) {
                return this._parent.read(attr.substr(3), options);
            } else if (isCurrentContext) {
                return { value: this._context };
            } else if (isParentContext) {
                return { value: this._parent._context };
            } else if (attr === '%root') {
                return { value: this.getRoot() };
            }
            var names = can.compute.read.reads(attr), context, scope = attr.charAt(0) === '*' ? this.getRefs() : this, undefinedObserves = [], currentObserve, currentReads, setObserveDepth = -1, currentSetReads, currentSetObserve, searchedRefsScope = false, refInstance, readOptions = can.simpleExtend({
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
                    }
                }, options);
            while (scope) {
                context = scope._context;
                refInstance = context instanceof Scope.Refs;
                if (context !== null && (typeof context === 'object' || typeof context === 'function') && !(searchedRefsScope && refInstance) && !scope._meta.protected) {
                    if (refInstance) {
                        searchedRefsScope = true;
                    }
                    var getObserves = can.__trapObserves();
                    var data = can.compute.read(context, names, readOptions);
                    var observes = getObserves();
                    if (data.value !== undefined) {
                        can.__observes(observes);
                        return {
                            scope: scope,
                            rootObserve: currentObserve,
                            value: data.value,
                            reads: currentReads
                        };
                    } else {
                        undefinedObserves.push.apply(undefinedObserves, observes);
                    }
                }
                if (!stopLookup) {
                    scope = scope._parent;
                } else {
                    scope = null;
                }
            }
            can.__observes(undefinedObserves);
            return {
                setRoot: currentSetObserve,
                reads: currentSetReads,
                value: undefined
            };
        }
    });
can.view.Scope = Scope;
module.exports = Scope;
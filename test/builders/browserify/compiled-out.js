(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var render = require('./compiled.stache.js');

document.body.appendChild( render() );

},{"./compiled.stache.js":3}],3:[function(require,module,exports){
var stache = require('can/view/stache/stache');
var mustacheCore = require('can/view/stache/mustache_core');
var renderer = stache([
    {
        'tokenType': 'start',
        'args': [
            'h1',
            false
        ]
    },
    {
        'tokenType': 'end',
        'args': [
            'h1',
            false
        ]
    },
    {
        'tokenType': 'chars',
        'args': ['Hello World']
    },
    {
        'tokenType': 'close',
        'args': ['h1']
    },
    {
        'tokenType': 'chars',
        'args': ['\n']
    },
    {
        'tokenType': 'done',
        'args': []
    }
]);
module.exports = function (scope, options, nodeList) {
    var moduleOptions = { module: module };
    if (!(options instanceof mustacheCore.Options)) {
        options = new mustacheCore.Options(options || {});
    }
    return renderer(scope, options.add(moduleOptions), nodeList);
};

},{"can/view/stache/mustache_core":41,"can/view/stache/stache":43}],4:[function(require,module,exports){
/*can@2.3.22#compute/compute*/
var can = require('../util/util.js');
var bind = require('../util/bind/bind.js');
require('../util/batch/batch.js');
require('./proto_compute.js');
can.compute = function (getterSetter, context, eventName, bindOnce) {
    var internalCompute = new can.Compute(getterSetter, context, eventName, bindOnce);
    var bind = internalCompute.bind;
    var unbind = internalCompute.unbind;
    var compute = function (val) {
        if (arguments.length) {
            return internalCompute.set(val);
        }
        return internalCompute.get();
    };
    var cid = can.cid(compute, 'compute');
    var handlerKey = '__handler' + cid;
    compute.bind = function (ev, handler) {
        var computeHandler = handler && handler[handlerKey];
        if (handler && !computeHandler) {
            computeHandler = handler[handlerKey] = function () {
                handler.apply(compute, arguments);
            };
        }
        return bind.call(internalCompute, ev, computeHandler);
    };
    compute.unbind = function (ev, handler) {
        var computeHandler = handler && handler[handlerKey];
        if (computeHandler) {
            delete handler[handlerKey];
            return internalCompute.unbind(ev, computeHandler);
        }
        return unbind.apply(internalCompute, arguments);
    };
    compute.isComputed = internalCompute.isComputed;
    compute.clone = function (ctx) {
        if (typeof getterSetter === 'function') {
            context = ctx;
        }
        return can.compute(getterSetter, context, ctx, bindOnce);
    };
    compute.computeInstance = internalCompute;
    return compute;
};
can.compute.truthy = function (compute) {
    return can.compute(function () {
        var res = compute();
        if (typeof res === 'function') {
            res = res();
        }
        return !!res;
    });
};
can.compute.async = function (initialValue, asyncComputer, context) {
    return can.compute(initialValue, {
        fn: asyncComputer,
        context: context
    });
};
can.compute.read = can.Compute.read;
can.compute.set = can.Compute.set;
can.compute.temporarilyBind = can.Compute.temporarilyBind;
module.exports = can.compute;
},{"../util/batch/batch.js":18,"../util/bind/bind.js":19,"../util/util.js":26,"./proto_compute.js":6}],5:[function(require,module,exports){
/*can@2.3.22#compute/get_value_and_bind*/
var can = require('../util/util.js');
function ObservedInfo(func, context, compute) {
    this.newObserved = {};
    this.oldObserved = null;
    this.func = func;
    this.context = context;
    this.compute = compute;
    this.onDependencyChange = can.proxy(this.onDependencyChange, this);
    this.depth = null;
    this.childDepths = {};
    this.ignore = 0;
    this.inBatch = false;
    this.ready = false;
    compute.observedInfo = this;
    this.setReady = can.proxy(this._setReady, this);
}
can.simpleExtend(ObservedInfo.prototype, {
    getPrimaryDepth: function () {
        return this.compute._primaryDepth;
    },
    _setReady: function () {
        this.ready = true;
    },
    getDepth: function () {
        if (this.depth !== null) {
            return this.depth;
        } else {
            return this.depth = this._getDepth();
        }
    },
    _getDepth: function () {
        var max = 0, childDepths = this.childDepths;
        for (var cid in childDepths) {
            if (childDepths[cid] > max) {
                max = childDepths[cid];
            }
        }
        return max + 1;
    },
    addEdge: function (objEv) {
        objEv.obj.bind(objEv.event, this.onDependencyChange);
        if (objEv.obj.observedInfo) {
            this.childDepths[objEv.obj._cid] = objEv.obj.observedInfo.getDepth();
            this.depth = null;
        }
    },
    removeEdge: function (objEv) {
        objEv.obj.unbind(objEv.event, this.onDependencyChange);
        if (objEv.obj.observedInfo) {
            delete this.childDepths[objEv.obj._cid];
            this.depth = null;
        }
    },
    dependencyChange: function (ev) {
        if (this.bound && this.ready) {
            if (ev.batchNum !== undefined) {
                if (ev.batchNum !== this.batchNum) {
                    ObservedInfo.registerUpdate(this);
                    this.batchNum = ev.batchNum;
                }
            } else {
                this.updateCompute(ev.batchNum);
            }
        }
    },
    onDependencyChange: function (ev, newVal, oldVal) {
        this.dependencyChange(ev, newVal, oldVal);
    },
    updateCompute: function (batchNum) {
        if (this.bound) {
            var oldValue = this.value;
            this.getValueAndBind();
            this.compute.updater(this.value, oldValue, batchNum);
        }
    },
    getValueAndBind: function () {
        this.bound = true;
        this.oldObserved = this.newObserved || {};
        this.ignore = 0;
        this.newObserved = {};
        this.ready = false;
        observedInfoStack.push(this);
        this.value = this.func.call(this.context);
        observedInfoStack.pop();
        this.updateBindings();
        can.batch.afterPreviousEvents(this.setReady);
    },
    updateBindings: function () {
        var newObserved = this.newObserved, oldObserved = this.oldObserved, name, obEv;
        for (name in newObserved) {
            obEv = newObserved[name];
            if (!oldObserved[name]) {
                this.addEdge(obEv);
            } else {
                oldObserved[name] = null;
            }
        }
        for (name in oldObserved) {
            obEv = oldObserved[name];
            if (obEv) {
                this.removeEdge(obEv);
            }
        }
    },
    teardown: function () {
        this.bound = false;
        for (var name in this.newObserved) {
            var ob = this.newObserved[name];
            this.removeEdge(ob);
        }
        this.newObserved = {};
    }
});
var updateOrder = [], curPrimaryDepth = Infinity, maxPrimaryDepth = 0;
ObservedInfo.registerUpdate = function (observeInfo, batchNum) {
    var depth = observeInfo.getDepth() - 1;
    var primaryDepth = observeInfo.getPrimaryDepth();
    curPrimaryDepth = Math.min(primaryDepth, curPrimaryDepth);
    maxPrimaryDepth = Math.max(primaryDepth, maxPrimaryDepth);
    var primary = updateOrder[primaryDepth] || (updateOrder[primaryDepth] = {
        observeInfos: [],
        current: Infinity,
        max: 0
    });
    var objs = primary.observeInfos[depth] || (primary.observeInfos[depth] = []);
    objs.push(observeInfo);
    primary.current = Math.min(depth, primary.current);
    primary.max = Math.max(depth, primary.max);
};
ObservedInfo.batchEnd = function (batchNum) {
    var cur;
    while (true) {
        if (curPrimaryDepth <= maxPrimaryDepth) {
            var primary = updateOrder[curPrimaryDepth];
            if (primary && primary.current <= primary.max) {
                var last = primary.observeInfos[primary.current];
                if (last && (cur = last.pop())) {
                    cur.updateCompute(batchNum);
                } else {
                    primary.current++;
                }
            } else {
                curPrimaryDepth++;
            }
        } else {
            updateOrder = [];
            curPrimaryDepth = Infinity;
            maxPrimaryDepth = 0;
            return;
        }
    }
};
var observedInfoStack = [];
can.__observe = function (obj, event) {
    var top = observedInfoStack[observedInfoStack.length - 1];
    if (top && !top.ignore) {
        var evStr = event + '', name = obj._cid + '|' + evStr;
        if (top.traps) {
            top.traps.push({
                obj: obj,
                event: evStr,
                name: name
            });
        } else if (!top.newObserved[name]) {
            top.newObserved[name] = {
                obj: obj,
                event: evStr
            };
        }
    }
};
can.__reading = can.__observe;
can.__trapObserves = function () {
    if (observedInfoStack.length) {
        var top = observedInfoStack[observedInfoStack.length - 1];
        var traps = top.traps = [];
        return function () {
            top.traps = null;
            return traps;
        };
    } else {
        return function () {
            return [];
        };
    }
};
can.__observes = function (observes) {
    var top = observedInfoStack[observedInfoStack.length - 1];
    if (top) {
        for (var i = 0, len = observes.length; i < len; i++) {
            var trap = observes[i], name = trap.name;
            if (!top.newObserved[name]) {
                top.newObserved[name] = trap;
            }
        }
    }
};
can.__isRecordingObserves = function () {
    var len = observedInfoStack.length;
    return len && observedInfoStack[len - 1].ignore === 0;
};
can.__notObserve = function (fn) {
    return function () {
        if (observedInfoStack.length) {
            var top = observedInfoStack[observedInfoStack.length - 1];
            top.ignore++;
            var res = fn.apply(this, arguments);
            top.ignore--;
            return res;
        } else {
            return fn.apply(this, arguments);
        }
    };
};
can.batch._onDispatchedEvents = ObservedInfo.batchEnd;
module.exports = ObservedInfo;
},{"../util/util.js":26}],6:[function(require,module,exports){
/*can@2.3.22#compute/proto_compute*/
var can = require('../util/util.js');
var bind = require('../util/bind/bind.js');
var read = require('./read.js');
var ObservedInfo = require('./get_value_and_bind.js');
require('../util/batch/batch.js');
can.Compute = function (getterSetter, context, eventName, bindOnce) {
    can.cid(this, 'compute');
    var args = [];
    for (var i = 0, arglen = arguments.length; i < arglen; i++) {
        args[i] = arguments[i];
    }
    var contextType = typeof args[1];
    if (typeof args[0] === 'function') {
        this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
    } else if (args[1]) {
        if (contextType === 'string') {
            this._setupProperty(args[0], args[1], args[2]);
        } else if (contextType === 'function') {
            this._setupSetter(args[0], args[1], args[2]);
        } else {
            if (args[1] && args[1].fn) {
                this._setupAsyncCompute(args[0], args[1]);
            } else {
                this._setupSettings(args[0], args[1]);
            }
        }
    } else {
        this._setupSimpleValue(args[0]);
    }
    this._args = args;
    this._primaryDepth = 0;
    this.isComputed = true;
};
can.simpleExtend(can.Compute.prototype, {
    setPrimaryDepth: function (depth) {
        this._primaryDepth = depth;
    },
    _setupGetterSetterFn: function (getterSetter, context, eventName) {
        this._set = context ? can.proxy(getterSetter, context) : getterSetter;
        this._get = context ? can.proxy(getterSetter, context) : getterSetter;
        this._canObserve = eventName === false ? false : true;
        var handlers = setupComputeHandlers(this, getterSetter, context || this);
        can.simpleExtend(this, handlers);
    },
    _setupProperty: function (target, propertyName, eventName) {
        var isObserve = can.isMapLike(target), self = this, handler;
        if (isObserve) {
            handler = function (ev, newVal, oldVal) {
                self.updater(newVal, oldVal, ev.batchNum);
            };
            this.hasDependencies = true;
            this._get = function () {
                return target.attr(propertyName);
            };
            this._set = function (val) {
                target.attr(propertyName, val);
            };
        } else {
            handler = function () {
                self.updater(self._get(), self.value);
            };
            this._get = function () {
                return can.getObject(propertyName, [target]);
            };
            this._set = function (value) {
                var properties = propertyName.split('.'), leafPropertyName = properties.pop(), targetProperty = can.getObject(properties.join('.'), [target]);
                targetProperty[leafPropertyName] = value;
            };
        }
        this._on = function (update) {
            can.bind.call(target, eventName || propertyName, handler);
            this.value = this._get();
        };
        this._off = function () {
            return can.unbind.call(target, eventName || propertyName, handler);
        };
    },
    _setupSetter: function (initialValue, setter, eventName) {
        this.value = initialValue;
        this._set = setter;
        can.simpleExtend(this, eventName);
    },
    _setupSettings: function (initialValue, settings) {
        this.value = initialValue;
        this._set = settings.set || this._set;
        this._get = settings.get || this._get;
        if (!settings.__selfUpdater) {
            var self = this, oldUpdater = this.updater;
            this.updater = function () {
                oldUpdater.call(self, self._get(), self.value);
            };
        }
        this._on = settings.on ? settings.on : this._on;
        this._off = settings.off ? settings.off : this._off;
    },
    _setupAsyncCompute: function (initialValue, settings) {
        var self = this;
        this.value = initialValue;
        this._setUpdates = true;
        this.lastSetValue = new can.Compute(initialValue);
        this._set = function (newVal) {
            if (newVal === self.lastSetValue.get()) {
                return this.value;
            }
            return self.lastSetValue.set(newVal);
        };
        this._get = function () {
            return getter.call(settings.context, self.lastSetValue.get());
        };
        var getter = settings.fn, bindings;
        if (getter.length === 0) {
            bindings = setupComputeHandlers(this, getter, settings.context);
        } else if (getter.length === 1) {
            bindings = setupComputeHandlers(this, function () {
                return getter.call(settings.context, self.lastSetValue.get());
            }, settings);
        } else {
            var oldUpdater = this.updater, setValue = function (newVal) {
                    oldUpdater.call(self, newVal, self.value);
                };
            this.updater = function (newVal) {
                oldUpdater.call(self, newVal, self.value);
            };
            bindings = setupComputeHandlers(this, function () {
                var res = getter.call(settings.context, self.lastSetValue.get(), setValue);
                return res !== undefined ? res : this.value;
            }, this);
        }
        can.simpleExtend(this, bindings);
    },
    _setupSimpleValue: function (initialValue) {
        this.value = initialValue;
    },
    _bindsetup: can.__notObserve(function () {
        this.bound = true;
        this._on(this.updater);
    }),
    _bindteardown: function () {
        this._off(this.updater);
        this.bound = false;
    },
    bind: can.bindAndSetup,
    unbind: can.unbindAndTeardown,
    clone: function (context) {
        if (context && typeof this._args[0] === 'function') {
            this._args[1] = context;
        } else if (context) {
            this._args[2] = context;
        }
        return new can.Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
    },
    _on: can.k,
    _off: can.k,
    get: function () {
        if (can.__isRecordingObserves() && this._canObserve !== false) {
            can.__observe(this, 'change');
            if (!this.bound) {
                can.Compute.temporarilyBind(this);
            }
        }
        if (this.bound) {
            return this.value;
        } else {
            return this._get();
        }
    },
    _get: function () {
        return this.value;
    },
    set: function (newVal) {
        var old = this.value;
        var setVal = this._set(newVal, old);
        if (this._setUpdates) {
            return this.value;
        }
        if (this.hasDependencies) {
            return this._get();
        }
        if (setVal === undefined) {
            this.value = this._get();
        } else {
            this.value = setVal;
        }
        updateOnChange(this, this.value, old);
        return this.value;
    },
    _set: function (newVal) {
        return this.value = newVal;
    },
    updater: function (newVal, oldVal, batchNum) {
        this.value = newVal;
        updateOnChange(this, newVal, oldVal, batchNum);
    },
    toFunction: function () {
        return can.proxy(this._computeFn, this);
    },
    _computeFn: function (newVal) {
        if (arguments.length) {
            return this.set(newVal);
        }
        return this.get();
    }
});
var updateOnChange = function (compute, newValue, oldValue, batchNum) {
    var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
    if (valueChanged) {
        can.batch.trigger(compute, {
            type: 'change',
            batchNum: batchNum
        }, [
            newValue,
            oldValue
        ]);
    }
};
var setupComputeHandlers = function (compute, func, context) {
    var readInfo = new ObservedInfo(func, context, compute);
    return {
        _on: function () {
            readInfo.getValueAndBind();
            compute.value = readInfo.value;
            compute.hasDependencies = !can.isEmptyObject(readInfo.newObserved);
        },
        _off: function () {
            readInfo.teardown();
        },
        getDepth: function () {
            return readInfo.getDepth();
        }
    };
};
can.Compute.temporarilyBind = function (compute) {
    var computeInstance = compute.computeInstance || compute;
    computeInstance.bind('change', can.k);
    if (!computes) {
        computes = [];
        setTimeout(unbindComputes, 10);
    }
    computes.push(computeInstance);
};
var computes, unbindComputes = function () {
        for (var i = 0, len = computes.length; i < len; i++) {
            computes[i].unbind('change', can.k);
        }
        computes = null;
    };
can.Compute.async = function (initialValue, asyncComputer, context) {
    return new can.Compute(initialValue, {
        fn: asyncComputer,
        context: context
    });
};
can.Compute.truthy = function (compute) {
    return new can.Compute(function () {
        var res = compute.get();
        if (typeof res === 'function') {
            res = res.get();
        }
        return !!res;
    });
};
can.Compute.read = read;
can.Compute.set = read.write;
module.exports = can.Compute;
},{"../util/batch/batch.js":18,"../util/bind/bind.js":19,"../util/util.js":26,"./get_value_and_bind.js":5,"./read.js":7}],7:[function(require,module,exports){
/*can@2.3.22#compute/read*/
var can = require('../util/util.js');
var read = function (parent, reads, options) {
    options = options || {};
    var state = { foundObservable: false };
    var cur = readValue(parent, 0, reads, options, state), type, prev, readLength = reads.length, i = 0;
    while (i < readLength) {
        prev = cur;
        for (var r = 0, readersLength = read.propertyReaders.length; r < readersLength; r++) {
            var reader = read.propertyReaders[r];
            if (reader.test(cur)) {
                cur = reader.read(cur, reads[i], i, options, state);
                break;
            }
        }
        i = i + 1;
        cur = readValue(cur, i, reads, options, state, prev);
        type = typeof cur;
        if (i < reads.length && (cur === null || type !== 'function' && type !== 'object')) {
            if (options.earlyExit) {
                options.earlyExit(prev, i - 1, cur);
            }
            return {
                value: undefined,
                parent: prev
            };
        }
    }
    if (cur === undefined) {
        if (options.earlyExit) {
            options.earlyExit(prev, i - 1);
        }
    }
    return {
        value: cur,
        parent: prev
    };
};
var isAt = function (index, reads) {
    var prevRead = reads[index - 1];
    return prevRead && prevRead.at;
};
var readValue = function (value, index, reads, options, state, prev) {
    var usedValueReader;
    do {
        usedValueReader = false;
        for (var i = 0, len = read.valueReaders.length; i < len; i++) {
            if (read.valueReaders[i].test(value, index, reads, options)) {
                value = read.valueReaders[i].read(value, index, reads, options, state, prev);
            }
        }
    } while (usedValueReader);
    return value;
};
read.valueReaders = [
    {
        name: 'compute',
        test: function (value, i, reads, options) {
            return value && value.isComputed && !isAt(i, reads);
        },
        read: function (value, i, reads, options, state) {
            if (options.readCompute === false && i === reads.length) {
                return value;
            }
            if (!state.foundObservable && options.foundObservable) {
                options.foundObservable(value, i);
                state.foundObservable = true;
            }
            return value instanceof can.Compute ? value.get() : value();
        }
    },
    {
        name: 'function',
        test: function (value, i, reads, options) {
            var type = typeof value;
            return type === 'function' && !value.isComputed && !(can.Construct && value.prototype instanceof can.Construct) && !(can.route && value === can.route);
        },
        read: function (value, i, reads, options, state, prev) {
            if (isAt(i, reads)) {
                return i === reads.length ? can.proxy(value, prev) : value;
            } else if (options.callMethodsOnObservables && can.isMapLike(prev)) {
                return value.apply(prev, options.args || []);
            } else if (options.isArgument && i === reads.length) {
                return options.proxyMethods !== false ? can.proxy(value, prev) : value;
            }
            return value.apply(prev, options.args || []);
        }
    }
];
read.propertyReaders = [
    {
        name: 'map',
        test: can.isMapLike,
        read: function (value, prop, index, options, state) {
            if (!state.foundObservable && options.foundObservable) {
                options.foundObservable(value, index);
                state.foundObservable = true;
            }
            var res = value.attr(prop.key);
            if (res !== undefined) {
                return res;
            } else {
                return value[prop.key];
            }
        }
    },
    {
        name: 'promise',
        test: function (value) {
            return can.isPromise(value);
        },
        read: function (value, prop, index, options, state) {
            if (!state.foundObservable && options.foundObservable) {
                options.foundObservable(value, index);
                state.foundObservable = true;
            }
            var observeData = value.__observeData;
            if (!value.__observeData) {
                observeData = value.__observeData = {
                    isPending: true,
                    state: 'pending',
                    isResolved: false,
                    isRejected: false,
                    value: undefined,
                    reason: undefined
                };
                can.cid(observeData);
                can.simpleExtend(observeData, can.event);
                value.then(function (value) {
                    observeData.isPending = false;
                    observeData.isResolved = true;
                    observeData.value = value;
                    observeData.state = 'resolved';
                    observeData.dispatch('state', [
                        'resolved',
                        'pending'
                    ]);
                }, function (reason) {
                    observeData.isPending = false;
                    observeData.isRejected = true;
                    observeData.reason = reason;
                    observeData.state = 'rejected';
                    observeData.dispatch('state', [
                        'rejected',
                        'pending'
                    ]);
                });
            }
            can.__observe(observeData, 'state');
            return prop.key in observeData ? observeData[prop.key] : value[prop.key];
        }
    },
    {
        name: 'object',
        test: function () {
            return true;
        },
        read: function (value, prop) {
            if (value == null) {
                return undefined;
            } else {
                if (prop.key in value) {
                    return value[prop.key];
                } else if (prop.at && specialRead[prop.key] && '@' + prop.key in value) {
                    prop.at = false;
                    return value['@' + prop.key];
                }
            }
        }
    }
];
var specialRead = {
    index: true,
    key: true,
    event: true,
    element: true,
    viewModel: true
};
read.write = function (parent, key, value, options) {
    options = options || {};
    if (can.isMapLike(parent)) {
        if (!options.isArgument && parent._data && parent._data[key] && parent._data[key].isComputed) {
            return parent._data[key](value);
        } else {
            return parent.attr(key, value);
        }
    }
    if (parent[key] && parent[key].isComputed) {
        return parent[key](value);
    }
    if (typeof parent === 'object') {
        parent[key] = value;
    }
};
read.reads = function (key) {
    var keys = [];
    var last = 0;
    var at = false;
    if (key.charAt(0) === '@') {
        last = 1;
        at = true;
    }
    var keyToAdd = '';
    for (var i = last; i < key.length; i++) {
        var character = key.charAt(i);
        if (character === '.' || character === '@') {
            if (key.charAt(i - 1) !== '\\') {
                keys.push({
                    key: keyToAdd,
                    at: at
                });
                at = character === '@';
                keyToAdd = '';
            } else {
                keyToAdd = keyToAdd.substr(0, keyToAdd.length - 1) + '.';
            }
        } else {
            keyToAdd += character;
        }
    }
    keys.push({
        key: keyToAdd,
        at: at
    });
    return keys;
};
module.exports = read;
},{"../util/util.js":26}],8:[function(require,module,exports){
/*can@2.3.22#construct/construct*/
var can = require('../util/string/string.js');
var initializing = 0;
var canGetDescriptor;
try {
    Object.getOwnPropertyDescriptor({});
    canGetDescriptor = true;
} catch (e) {
    canGetDescriptor = false;
}
var getDescriptor = function (newProps, name) {
        var descriptor = Object.getOwnPropertyDescriptor(newProps, name);
        if (descriptor && (descriptor.get || descriptor.set)) {
            return descriptor;
        }
        return null;
    }, inheritGetterSetter = function (newProps, oldProps, addTo) {
        addTo = addTo || newProps;
        var descriptor;
        for (var name in newProps) {
            if (descriptor = getDescriptor(newProps, name)) {
                this._defineProperty(addTo, oldProps, name, descriptor);
            } else {
                can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
            }
        }
    }, simpleInherit = function (newProps, oldProps, addTo) {
        addTo = addTo || newProps;
        for (var name in newProps) {
            can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
        }
    };
can.Construct = function () {
    if (arguments.length) {
        return can.Construct.extend.apply(can.Construct, arguments);
    }
};
can.extend(can.Construct, {
    constructorExtends: true,
    newInstance: function () {
        var inst = this.instance(), args;
        if (inst.setup) {
            inst.__inSetup = true;
            args = inst.setup.apply(inst, arguments);
            delete inst.__inSetup;
        }
        if (inst.init) {
            inst.init.apply(inst, args || arguments);
        }
        return inst;
    },
    _inherit: canGetDescriptor ? inheritGetterSetter : simpleInherit,
    _defineProperty: function (what, oldProps, propName, descriptor) {
        Object.defineProperty(what, propName, descriptor);
    },
    _overwrite: function (what, oldProps, propName, val) {
        what[propName] = val;
    },
    setup: function (base, fullName) {
        this.defaults = can.extend(true, {}, base.defaults, this.defaults);
    },
    instance: function () {
        initializing = 1;
        var inst = new this();
        initializing = 0;
        return inst;
    },
    extend: function (name, staticProperties, instanceProperties) {
        var fullName = name, klass = staticProperties, proto = instanceProperties;
        if (typeof fullName !== 'string') {
            proto = klass;
            klass = fullName;
            fullName = null;
        }
        if (!proto) {
            proto = klass;
            klass = null;
        }
        proto = proto || {};
        var _super_class = this, _super = this.prototype, Constructor, parts, current, _fullName, _shortName, propName, shortName, namespace, prototype;
        prototype = this.instance();
        can.Construct._inherit(proto, _super, prototype);
        if (fullName) {
            parts = fullName.split('.');
            shortName = parts.pop();
        } else if (klass && klass.shortName) {
            shortName = klass.shortName;
        } else if (this.shortName) {
            shortName = this.shortName;
        }
        if (typeof constructorName === 'undefined') {
            Constructor = function () {
                return init.apply(this, arguments);
            };
        }
        function init() {
            if (!initializing) {
                return this.constructor !== Constructor && arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) : Constructor.newInstance.apply(Constructor, arguments);
            }
        }
        for (propName in _super_class) {
            if (_super_class.hasOwnProperty(propName)) {
                Constructor[propName] = _super_class[propName];
            }
        }
        can.Construct._inherit(klass, _super_class, Constructor);
        if (fullName) {
            current = can.getObject(parts.join('.'), window, true);
            namespace = current;
            _fullName = can.underscore(fullName.replace(/\./g, '_'));
            _shortName = can.underscore(shortName);
            current[shortName] = Constructor;
        }
        can.extend(Constructor, {
            constructor: Constructor,
            prototype: prototype,
            namespace: namespace,
            _shortName: _shortName,
            fullName: fullName,
            _fullName: _fullName
        });
        if (shortName !== undefined) {
            Constructor.shortName = shortName;
        }
        Constructor.prototype.constructor = Constructor;
        var t = [_super_class].concat(can.makeArray(arguments)), args = Constructor.setup.apply(Constructor, t);
        if (Constructor.init) {
            Constructor.init.apply(Constructor, args || t);
        }
        return Constructor;
    }
});
can.Construct.prototype.setup = function () {
};
can.Construct.prototype.init = function () {
};
module.exports = can.Construct;
},{"../util/string/string.js":25}],9:[function(require,module,exports){
/*can@2.3.22#event/event*/
var can = require('../util/can.js');
can.addEvent = function (event, handler) {
    var allEvents = this.__bindEvents || (this.__bindEvents = {}), eventList = allEvents[event] || (allEvents[event] = []);
    eventList.push({
        handler: handler,
        name: event
    });
    return this;
};
can.listenTo = function (other, event, handler) {
    var idedEvents = this.__listenToEvents;
    if (!idedEvents) {
        idedEvents = this.__listenToEvents = {};
    }
    var otherId = can.cid(other);
    var othersEvents = idedEvents[otherId];
    if (!othersEvents) {
        othersEvents = idedEvents[otherId] = {
            obj: other,
            events: {}
        };
    }
    var eventsEvents = othersEvents.events[event];
    if (!eventsEvents) {
        eventsEvents = othersEvents.events[event] = [];
    }
    eventsEvents.push(handler);
    can.bind.call(other, event, handler);
};
can.stopListening = function (other, event, handler) {
    var idedEvents = this.__listenToEvents, iterIdedEvents = idedEvents, i = 0;
    if (!idedEvents) {
        return this;
    }
    if (other) {
        var othercid = can.cid(other);
        (iterIdedEvents = {})[othercid] = idedEvents[othercid];
        if (!idedEvents[othercid]) {
            return this;
        }
    }
    for (var cid in iterIdedEvents) {
        var othersEvents = iterIdedEvents[cid], eventsEvents;
        other = idedEvents[cid].obj;
        if (!event) {
            eventsEvents = othersEvents.events;
        } else {
            (eventsEvents = {})[event] = othersEvents.events[event];
        }
        for (var eventName in eventsEvents) {
            var handlers = eventsEvents[eventName] || [];
            i = 0;
            while (i < handlers.length) {
                if (handler && handler === handlers[i] || !handler) {
                    can.unbind.call(other, eventName, handlers[i]);
                    handlers.splice(i, 1);
                } else {
                    i++;
                }
            }
            if (!handlers.length) {
                delete othersEvents.events[eventName];
            }
        }
        if (can.isEmptyObject(othersEvents.events)) {
            delete idedEvents[cid];
        }
    }
    return this;
};
can.removeEvent = function (event, fn, __validate) {
    if (!this.__bindEvents) {
        return this;
    }
    var events = this.__bindEvents[event] || [], i = 0, ev, isFunction = typeof fn === 'function';
    while (i < events.length) {
        ev = events[i];
        if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
            events.splice(i, 1);
        } else {
            i++;
        }
    }
    return this;
};
can.dispatch = function (event, args) {
    var events = this.__bindEvents;
    if (!events) {
        return;
    }
    var eventName;
    if (typeof event === 'string') {
        eventName = event;
        event = { type: event };
    } else {
        eventName = event.type;
    }
    var handlers = events[eventName];
    if (!handlers) {
        return;
    } else {
        handlers = handlers.slice(0);
    }
    var passed = [event];
    if (args) {
        passed.push.apply(passed, args);
    }
    for (var i = 0, len = handlers.length; i < len; i++) {
        handlers[i].handler.apply(this, passed);
    }
    return event;
};
can.one = function (event, handler) {
    var one = function () {
        can.unbind.call(this, event, one);
        return handler.apply(this, arguments);
    };
    can.bind.call(this, event, one);
    return this;
};
can.event = {
    on: function () {
        if (arguments.length === 0 && can.Control && this instanceof can.Control) {
            return can.Control.prototype.on.call(this);
        } else {
            return can.addEvent.apply(this, arguments);
        }
    },
    off: function () {
        if (arguments.length === 0 && can.Control && this instanceof can.Control) {
            return can.Control.prototype.off.call(this);
        } else {
            return can.removeEvent.apply(this, arguments);
        }
    },
    bind: can.addEvent,
    unbind: can.removeEvent,
    delegate: function (selector, event, handler) {
        return can.addEvent.call(this, event, handler);
    },
    undelegate: function (selector, event, handler) {
        return can.removeEvent.call(this, event, handler);
    },
    trigger: can.dispatch,
    one: can.one,
    addEvent: can.addEvent,
    removeEvent: can.removeEvent,
    listenTo: can.listenTo,
    stopListening: can.stopListening,
    dispatch: can.dispatch
};
module.exports = can.event;
},{"../util/can.js":20}],10:[function(require,module,exports){
/*can@2.3.22#list/list*/
var can = require('../util/util.js');
var Map = require('../map/map.js');
var bubble = require('../map/bubble.js');
var mapHelpers = require('../map/map_helpers.js');
var splice = [].splice, spliceRemovesProps = function () {
        var obj = {
            0: 'a',
            length: 1
        };
        splice.call(obj, 0, 1);
        return !obj[0];
    }();
var list = Map.extend({ Map: Map }, {
        setup: function (instances, options) {
            this.length = 0;
            can.cid(this, '.map');
            this._setupComputedProperties();
            instances = instances || [];
            var teardownMapping;
            if (can.isDeferred(instances)) {
                this.replace(instances);
            } else {
                teardownMapping = instances.length && mapHelpers.addToMap(instances, this);
                this.push.apply(this, can.makeArray(instances || []));
            }
            if (teardownMapping) {
                teardownMapping();
            }
            can.simpleExtend(this, options);
        },
        _triggerChange: function (attr, how, newVal, oldVal) {
            Map.prototype._triggerChange.apply(this, arguments);
            var index = +attr;
            if (!~('' + attr).indexOf('.') && !isNaN(index)) {
                if (how === 'add') {
                    can.batch.trigger(this, how, [
                        newVal,
                        index
                    ]);
                    can.batch.trigger(this, 'length', [this.length]);
                } else if (how === 'remove') {
                    can.batch.trigger(this, how, [
                        oldVal,
                        index
                    ]);
                    can.batch.trigger(this, 'length', [this.length]);
                } else {
                    can.batch.trigger(this, how, [
                        newVal,
                        index
                    ]);
                }
            }
        },
        ___get: function (attr) {
            if (attr) {
                var computedAttr = this._computedAttrs[attr];
                if (computedAttr && computedAttr.compute) {
                    return computedAttr.compute();
                } else {
                    return this[attr];
                }
            } else {
                return this;
            }
        },
        __set: function (prop, value, current) {
            prop = isNaN(+prop) || prop % 1 ? prop : +prop;
            if (typeof prop === 'number' && prop > this.length - 1) {
                var newArr = new Array(prop + 1 - this.length);
                newArr[newArr.length - 1] = value;
                this.push.apply(this, newArr);
                return newArr;
            }
            return can.Map.prototype.__set.call(this, '' + prop, value, current);
        },
        ___set: function (attr, val) {
            this[attr] = val;
            if (+attr >= this.length) {
                this.length = +attr + 1;
            }
        },
        __remove: function (prop, current) {
            if (isNaN(+prop)) {
                delete this[prop];
                this._triggerChange(prop, 'remove', undefined, current);
            } else {
                this.splice(prop, 1);
            }
        },
        _each: function (callback) {
            var data = this.___get();
            for (var i = 0; i < data.length; i++) {
                callback(data[i], i);
            }
        },
        serialize: function () {
            return mapHelpers.serialize(this, 'serialize', []);
        },
        splice: function (index, howMany) {
            var args = can.makeArray(arguments), added = [], i, len, listIndex, allSame = args.length > 2;
            index = index || 0;
            for (i = 0, len = args.length - 2; i < len; i++) {
                listIndex = i + 2;
                args[listIndex] = this.__type(args[listIndex], listIndex);
                added.push(args[listIndex]);
                if (this[i + index] !== args[listIndex]) {
                    allSame = false;
                }
            }
            if (allSame && this.length <= added.length) {
                return added;
            }
            if (howMany === undefined) {
                howMany = args[1] = this.length - index;
            }
            var removed = splice.apply(this, args);
            if (!spliceRemovesProps) {
                for (i = this.length; i < removed.length + this.length; i++) {
                    delete this[i];
                }
            }
            can.batch.start();
            if (howMany > 0) {
                bubble.removeMany(this, removed);
                this._triggerChange('' + index, 'remove', undefined, removed);
            }
            if (args.length > 2) {
                bubble.addMany(this, added);
                this._triggerChange('' + index, 'add', added, removed);
            }
            can.batch.stop();
            return removed;
        },
        _getAttrs: function () {
            return mapHelpers.serialize(this, 'attr', []);
        },
        _setAttrs: function (items, remove) {
            items = can.makeArray(items);
            can.batch.start();
            this._updateAttrs(items, remove);
            can.batch.stop();
        },
        _updateAttrs: function (items, remove) {
            var len = Math.min(items.length, this.length);
            for (var prop = 0; prop < len; prop++) {
                var curVal = this[prop], newVal = items[prop];
                if (can.isMapLike(curVal) && mapHelpers.canMakeObserve(newVal)) {
                    curVal.attr(newVal, remove);
                } else if (curVal !== newVal) {
                    this._set(prop + '', newVal);
                } else {
                }
            }
            if (items.length > this.length) {
                this.push.apply(this, items.slice(this.length));
            } else if (items.length < this.length && remove) {
                this.splice(items.length);
            }
        }
    }), getArgs = function (args) {
        return args[0] && can.isArray(args[0]) ? args[0] : can.makeArray(args);
    };
can.each({
    push: 'length',
    unshift: 0
}, function (where, name) {
    var orig = [][name];
    list.prototype[name] = function () {
        can.batch.start();
        var args = [], len = where ? this.length : 0, i = arguments.length, res, val;
        while (i--) {
            val = arguments[i];
            args[i] = bubble.set(this, i, this.__type(val, i));
        }
        res = orig.apply(this, args);
        if (!this.comparator || args.length) {
            this._triggerChange('' + len, 'add', args, undefined);
        }
        can.batch.stop();
        return res;
    };
});
can.each({
    pop: 'length',
    shift: 0
}, function (where, name) {
    list.prototype[name] = function () {
        if (!this.length) {
            return undefined;
        }
        var args = getArgs(arguments), len = where && this.length ? this.length - 1 : 0;
        var res = [][name].apply(this, args);
        can.batch.start();
        this._triggerChange('' + len, 'remove', undefined, [res]);
        if (res && res.unbind) {
            bubble.remove(this, res);
        }
        can.batch.stop();
        return res;
    };
});
can.extend(list.prototype, {
    indexOf: function (item, fromIndex) {
        can.__observe(this, 'length');
        return can.inArray(item, this, fromIndex);
    },
    join: function () {
        can.__observe(this, 'length');
        return [].join.apply(this, arguments);
    },
    reverse: function () {
        var list = [].reverse.call(can.makeArray(this));
        return this.replace(list);
    },
    slice: function () {
        can.__observe(this, 'length');
        var temp = Array.prototype.slice.apply(this, arguments);
        return new this.constructor(temp);
    },
    concat: function () {
        var args = [];
        can.each(can.makeArray(arguments), function (arg, i) {
            args[i] = arg instanceof can.List ? arg.serialize() : arg;
        });
        return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
    },
    forEach: function (cb, thisarg) {
        return can.each(this, cb, thisarg || this);
    },
    replace: function (newList) {
        if (can.isDeferred(newList)) {
            if (this._promise) {
                this._promise.__isCurrentPromise = false;
            }
            var promise = this._promise = newList;
            promise.__isCurrentPromise = true;
            var self = this;
            newList.then(function (newList) {
                if (promise.__isCurrentPromise) {
                    self.replace(newList);
                }
            });
        } else {
            this.splice.apply(this, [
                0,
                this.length
            ].concat(can.makeArray(newList || [])));
        }
        return this;
    },
    filter: function (callback, thisArg) {
        var filteredList = new this.constructor(), self = this, filtered;
        this.each(function (item, index, list) {
            filtered = callback.call(thisArg | self, item, index, self);
            if (filtered) {
                filteredList.push(item);
            }
        });
        return filteredList;
    },
    map: function (callback, thisArg) {
        var filteredList = new can.List(), self = this;
        this.each(function (item, index, list) {
            var mapped = callback.call(thisArg | self, item, index, self);
            filteredList.push(mapped);
        });
        return filteredList;
    }
});
can.List = Map.List = list;
module.exports = can.List;
},{"../map/bubble.js":11,"../map/map.js":12,"../map/map_helpers.js":13,"../util/util.js":26}],11:[function(require,module,exports){
/*can@2.3.22#map/bubble*/
var can = require('../util/util.js');
var bubble = can.bubble = {
    bind: function (parent, eventName) {
        if (!parent.__inSetup) {
            var bubbleEvents = bubble.events(parent, eventName), len = bubbleEvents.length, bubbleEvent;
            if (!parent._bubbleBindings) {
                parent._bubbleBindings = {};
            }
            for (var i = 0; i < len; i++) {
                bubbleEvent = bubbleEvents[i];
                if (!parent._bubbleBindings[bubbleEvent]) {
                    parent._bubbleBindings[bubbleEvent] = 1;
                    bubble.childrenOf(parent, bubbleEvent);
                } else {
                    parent._bubbleBindings[bubbleEvent]++;
                }
            }
        }
    },
    unbind: function (parent, eventName) {
        var bubbleEvents = bubble.events(parent, eventName), len = bubbleEvents.length, bubbleEvent;
        for (var i = 0; i < len; i++) {
            bubbleEvent = bubbleEvents[i];
            if (parent._bubbleBindings) {
                parent._bubbleBindings[bubbleEvent]--;
            }
            if (parent._bubbleBindings && !parent._bubbleBindings[bubbleEvent]) {
                delete parent._bubbleBindings[bubbleEvent];
                bubble.teardownChildrenFrom(parent, bubbleEvent);
                if (can.isEmptyObject(parent._bubbleBindings)) {
                    delete parent._bubbleBindings;
                }
            }
        }
    },
    add: function (parent, child, prop) {
        if (child instanceof can.Map && parent._bubbleBindings) {
            for (var eventName in parent._bubbleBindings) {
                if (parent._bubbleBindings[eventName]) {
                    bubble.teardownFromParent(parent, child, eventName);
                    bubble.toParent(child, parent, prop, eventName);
                }
            }
        }
    },
    addMany: function (parent, children) {
        for (var i = 0, len = children.length; i < len; i++) {
            bubble.add(parent, children[i], i);
        }
    },
    remove: function (parent, child) {
        if (child instanceof can.Map && parent._bubbleBindings) {
            for (var eventName in parent._bubbleBindings) {
                if (parent._bubbleBindings[eventName]) {
                    bubble.teardownFromParent(parent, child, eventName);
                }
            }
        }
    },
    removeMany: function (parent, children) {
        for (var i = 0, len = children.length; i < len; i++) {
            bubble.remove(parent, children[i]);
        }
    },
    set: function (parent, prop, value, current) {
        if (can.isMapLike(value)) {
            bubble.add(parent, value, prop);
        }
        if (can.isMapLike(current)) {
            bubble.remove(parent, current);
        }
        return value;
    },
    events: function (map, boundEventName) {
        return map.constructor._bubbleRule(boundEventName, map);
    },
    toParent: function (child, parent, prop, eventName) {
        can.listenTo.call(parent, child, eventName, function () {
            var args = can.makeArray(arguments), ev = args.shift();
            args[0] = (can.List && parent instanceof can.List ? parent.indexOf(child) : prop) + (args[0] ? '.' + args[0] : '');
            ev.triggeredNS = ev.triggeredNS || {};
            if (ev.triggeredNS[parent._cid]) {
                return;
            }
            ev.triggeredNS[parent._cid] = true;
            can.trigger(parent, ev, args);
            if (eventName === 'change') {
                can.trigger(parent, args[0], [
                    args[2],
                    args[3]
                ]);
            }
        });
    },
    childrenOf: function (parent, eventName) {
        parent._each(function (child, prop) {
            if (child && child.bind) {
                bubble.toParent(child, parent, prop, eventName);
            }
        });
    },
    teardownFromParent: function (parent, child, eventName) {
        if (child && child.unbind) {
            can.stopListening.call(parent, child, eventName);
        }
    },
    teardownChildrenFrom: function (parent, eventName) {
        parent._each(function (child) {
            bubble.teardownFromParent(parent, child, eventName);
        });
    },
    isBubbling: function (parent, eventName) {
        return parent._bubbleBindings && parent._bubbleBindings[eventName];
    }
};
module.exports = bubble;
},{"../util/util.js":26}],12:[function(require,module,exports){
/*can@2.3.22#map/map*/
var can = require('../util/util.js');
var bind = require('../util/bind/bind.js');
var bubble = require('./bubble.js');
var mapHelpers = require('./map_helpers.js');
require('../construct/construct.js');
require('../util/batch/batch.js');
require('../compute/get_value_and_bind.js');
var unobservable = { 'constructor': true };
var Map = can.Map = can.Construct.extend({
    setup: function () {
        can.Construct.setup.apply(this, arguments);
        this._computedPropertyNames = [];
        if (can.Map) {
            if (!this.defaults) {
                this.defaults = {};
            }
            for (var prop in this.prototype) {
                if (prop !== 'define' && prop !== 'constructor' && (typeof this.prototype[prop] !== 'function' || this.prototype[prop].prototype instanceof can.Construct)) {
                    this.defaults[prop] = this.prototype[prop];
                } else if (this.prototype[prop].isComputed) {
                    this._computedPropertyNames.push(prop);
                }
            }
            if (mapHelpers.define) {
                mapHelpers.define(this);
            }
        }
        if (can.List && !(this.prototype instanceof can.List)) {
            this.List = Map.List.extend({ Map: this }, {});
        }
    },
    shortName: 'Map',
    _bubbleRule: function (eventName) {
        return eventName === 'change' || eventName.indexOf('.') >= 0 ? ['change'] : [];
    },
    bind: can.bindAndSetup,
    unbind: can.unbindAndTeardown,
    id: 'id',
    keys: function (map) {
        var keys = [];
        can.__observe(map, '__keys');
        for (var keyName in map._data) {
            keys.push(keyName);
        }
        return keys;
    }
}, {
    setup: function (obj) {
        if (obj instanceof can.Map) {
            obj = obj.serialize();
        }
        this._data = {};
        can.cid(this, '.map');
        this._setupComputedProperties();
        var teardownMapping = obj && mapHelpers.addToMap(obj, this);
        var defaultValues = this._setupDefaults(obj);
        var data = can.extend(can.extend(true, {}, defaultValues), obj);
        this.attr(data);
        if (teardownMapping) {
            teardownMapping();
        }
    },
    _setupComputedProperties: function () {
        this._computedAttrs = {};
        var computes = this.constructor._computedPropertyNames;
        for (var i = 0, len = computes.length; i < len; i++) {
            var attrName = computes[i];
            mapHelpers.addComputedAttr(this, attrName, this[attrName].clone(this));
        }
    },
    _setupDefaults: function () {
        return this.constructor.defaults || {};
    },
    attr: function (attr, val) {
        var type = typeof attr;
        if (attr === undefined) {
            return this._getAttrs();
        } else if (type !== 'string' && type !== 'number') {
            return this._setAttrs(attr, val);
        } else if (arguments.length === 1) {
            return this._get(attr + '');
        } else {
            this._set(attr + '', val);
            return this;
        }
    },
    _get: function (attr) {
        var dotIndex = attr.indexOf('.');
        if (dotIndex >= 0) {
            var value = this.___get(attr);
            if (value !== undefined) {
                can.__observe(this, attr);
                return value;
            }
            var first = attr.substr(0, dotIndex), second = attr.substr(dotIndex + 1);
            var current = this.__get(first);
            return current && current._get ? current._get(second) : undefined;
        } else {
            return this.__get(attr);
        }
    },
    __get: function (attr) {
        if (!unobservable[attr] && !this._computedAttrs[attr]) {
            can.__observe(this, attr);
        }
        return this.___get(attr);
    },
    ___get: function (attr) {
        if (attr !== undefined) {
            var computedAttr = this._computedAttrs[attr];
            if (computedAttr && computedAttr.compute) {
                return computedAttr.compute();
            } else {
                return this._data.hasOwnProperty(attr) ? this._data[attr] : undefined;
            }
        } else {
            return this._data;
        }
    },
    _set: function (attr, value, keepKey) {
        var dotIndex = attr.indexOf('.'), current;
        if (dotIndex >= 0 && !keepKey) {
            var first = attr.substr(0, dotIndex), second = attr.substr(dotIndex + 1);
            current = this.__inSetup ? undefined : this.___get(first);
            if (can.isMapLike(current)) {
                current._set(second, value);
            } else {
                throw new Error('can.Map: Object does not exist');
            }
        } else {
            current = this.__inSetup ? undefined : this.___get(attr);
            if (this.__convert) {
                value = this.__convert(attr, value);
            }
            this.__set(attr, this.__type(value, attr), current);
        }
    },
    __type: function (value, prop) {
        if (typeof value === 'object' && !(value instanceof can.Map) && mapHelpers.canMakeObserve(value)) {
            var cached = mapHelpers.getMapFromObject(value);
            if (cached) {
                return cached;
            }
            if (can.isArray(value)) {
                var List = can.List;
                return new List(value);
            } else {
                var Map = this.constructor.Map || can.Map;
                return new Map(value);
            }
        }
        return value;
    },
    __set: function (prop, value, current) {
        if (value !== current) {
            var computedAttr = this._computedAttrs[prop];
            var changeType = computedAttr || current !== undefined || this.___get().hasOwnProperty(prop) ? 'set' : 'add';
            this.___set(prop, typeof value === 'object' ? bubble.set(this, prop, value, current) : value);
            if (!computedAttr || !computedAttr.count) {
                this._triggerChange(prop, changeType, value, current);
            }
            if (typeof current === 'object') {
                bubble.teardownFromParent(this, current);
            }
        }
    },
    ___set: function (prop, val) {
        var computedAttr = this._computedAttrs[prop];
        if (computedAttr) {
            computedAttr.compute(val);
        } else {
            this._data[prop] = val;
        }
        if (typeof this.constructor.prototype[prop] !== 'function' && !computedAttr) {
            this[prop] = val;
        }
    },
    removeAttr: function (attr) {
        return this._remove(attr);
    },
    _remove: function (attr) {
        var parts = mapHelpers.attrParts(attr), prop = parts.shift(), current = this.___get(prop);
        if (parts.length && current) {
            return current.removeAttr(parts);
        } else {
            if (typeof attr === 'string' && !!~attr.indexOf('.')) {
                prop = attr;
            }
            this.__remove(prop, current);
            return current;
        }
    },
    __remove: function (prop, current) {
        if (prop in this._data) {
            this.___remove(prop);
            this._triggerChange(prop, 'remove', undefined, current);
        }
    },
    ___remove: function (prop) {
        delete this._data[prop];
        if (!(prop in this.constructor.prototype)) {
            delete this[prop];
        }
    },
    ___serialize: function (name, val) {
        return mapHelpers.getValue(this, name, val, 'serialize');
    },
    _getAttrs: function () {
        return mapHelpers.serialize(this, 'attr', {});
    },
    _setAttrs: function (props, remove) {
        props = can.simpleExtend({}, props);
        var prop, self = this, newVal;
        can.batch.start();
        this._each(function (curVal, prop) {
            if (prop === '_cid') {
                return;
            }
            newVal = props[prop];
            if (newVal === undefined) {
                if (remove) {
                    self.removeAttr(prop);
                }
                return;
            }
            if (self.__convert) {
                newVal = self.__convert(prop, newVal);
            }
            if (can.isMapLike(curVal) && mapHelpers.canMakeObserve(newVal)) {
                curVal.attr(newVal, remove);
            } else if (curVal !== newVal) {
                self.__set(prop, self.__type(newVal, prop), curVal);
            }
            delete props[prop];
        });
        for (prop in props) {
            if (prop !== '_cid') {
                newVal = props[prop];
                this._set(prop, newVal, true);
            }
        }
        can.batch.stop();
        return this;
    },
    serialize: function () {
        return mapHelpers.serialize(this, 'serialize', {});
    },
    _triggerChange: function (attr, how, newVal, oldVal, batchNum) {
        if (bubble.isBubbling(this, 'change')) {
            can.batch.trigger(this, {
                type: 'change',
                target: this,
                batchNum: batchNum
            }, [
                attr,
                how,
                newVal,
                oldVal
            ]);
        }
        can.batch.trigger(this, {
            type: attr,
            target: this,
            batchNum: batchNum
        }, [
            newVal,
            oldVal
        ]);
        if (how === 'remove' || how === 'add') {
            can.batch.trigger(this, {
                type: '__keys',
                target: this,
                batchNum: batchNum
            });
        }
    },
    _bindsetup: function () {
    },
    _bindteardown: function () {
    },
    one: can.one,
    bind: function (eventName, handler) {
        var computedBinding = this._computedAttrs && this._computedAttrs[eventName];
        if (computedBinding && computedBinding.compute) {
            if (!computedBinding.count) {
                computedBinding.count = 1;
                computedBinding.compute.bind('change', computedBinding.handler);
            } else {
                computedBinding.count++;
            }
        }
        bubble.bind(this, eventName);
        return can.bindAndSetup.apply(this, arguments);
    },
    unbind: function (eventName, handler) {
        var computedBinding = this._computedAttrs && this._computedAttrs[eventName];
        if (computedBinding) {
            if (computedBinding.count === 1) {
                computedBinding.count = 0;
                computedBinding.compute.unbind('change', computedBinding.handler);
            } else {
                computedBinding.count--;
            }
        }
        bubble.unbind(this, eventName);
        return can.unbindAndTeardown.apply(this, arguments);
    },
    compute: function (prop) {
        if (can.isFunction(this.constructor.prototype[prop])) {
            return can.compute(this[prop], this);
        } else {
            var reads = can.compute.read.reads(prop), last = reads.length - 1;
            return can.compute(function (newVal) {
                if (arguments.length) {
                    can.compute.read(this, reads.slice(0, last)).value.attr(reads[last].key, newVal);
                } else {
                    return can.compute.read(this, reads, { args: [] }).value;
                }
            }, this);
        }
    },
    each: function () {
        return can.each.apply(undefined, [this].concat(can.makeArray(arguments)));
    },
    _each: function (callback) {
        var data = this.___get();
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                callback(data[prop], prop);
            }
        }
    },
    dispatch: can.dispatch
});
Map.prototype.on = Map.prototype.bind;
Map.prototype.off = Map.prototype.unbind;
Map.on = Map.bind;
Map.off = Map.unbind;
module.exports = Map;
},{"../compute/get_value_and_bind.js":5,"../construct/construct.js":8,"../util/batch/batch.js":18,"../util/bind/bind.js":19,"../util/util.js":26,"./bubble.js":11,"./map_helpers.js":13}],13:[function(require,module,exports){
/*can@2.3.22#map/map_helpers*/
var can = require('../util/util.js');
require('../util/object/isplain/isplain.js');
var mapHelpers = {
    attrParts: function (attr, keepKey) {
        if (keepKey) {
            return [attr];
        }
        return typeof attr === 'object' ? attr : ('' + attr).split('.');
    },
    canMakeObserve: function (obj) {
        return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj));
    },
    serialize: function () {
        var serializeMap = null;
        return function (map, how, where) {
            var cid = can.cid(map), firstSerialize = false;
            if (!serializeMap) {
                firstSerialize = true;
                serializeMap = {
                    attr: {},
                    serialize: {}
                };
            }
            serializeMap[how][cid] = where;
            map.each(function (val, name) {
                var result, isObservable = can.isMapLike(val), serialized = isObservable && serializeMap[how][can.cid(val)];
                if (serialized) {
                    result = serialized;
                } else {
                    if (map['___' + how]) {
                        result = map['___' + how](name, val);
                    } else {
                        result = mapHelpers.getValue(map, name, val, how);
                    }
                }
                if (result !== undefined) {
                    where[name] = result;
                }
            });
            if (firstSerialize) {
                serializeMap = null;
            }
            return where;
        };
    }(),
    getValue: function (map, name, val, how) {
        if (can.isMapLike(val)) {
            return val[how]();
        } else {
            return val;
        }
    },
    define: null,
    addComputedAttr: function (map, attrName, compute) {
        map._computedAttrs[attrName] = {
            compute: compute,
            count: 0,
            handler: function (ev, newVal, oldVal) {
                map._triggerChange(attrName, 'set', newVal, oldVal, ev.batchNum);
            }
        };
    },
    addToMap: function addToMap(obj, instance) {
        var teardown;
        if (!madeMap) {
            teardown = teardownMap;
            madeMap = {};
        }
        var hasCid = obj._cid;
        var cid = can.cid(obj);
        if (!madeMap[cid]) {
            madeMap[cid] = {
                obj: obj,
                instance: instance,
                added: !hasCid
            };
        }
        return teardown;
    },
    getMapFromObject: function (obj) {
        return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
    }
};
var madeMap = null;
var teardownMap = function () {
    for (var cid in madeMap) {
        if (madeMap[cid].added) {
            delete madeMap[cid].obj._cid;
        }
    }
    madeMap = null;
};
module.exports = mapHelpers;
},{"../util/object/isplain/isplain.js":24,"../util/util.js":26}],14:[function(require,module,exports){
/*can@2.3.22#util/array/diff*/
var slice = [].slice;
module.exports = function (oldList, newList) {
    var oldIndex = 0, newIndex = 0, oldLength = oldList.length, newLength = newList.length, patches = [];
    while (oldIndex < oldLength && newIndex < newLength) {
        var oldItem = oldList[oldIndex], newItem = newList[newIndex];
        if (oldItem === newItem) {
            oldIndex++;
            newIndex++;
            continue;
        }
        if (newIndex + 1 < newLength && newList[newIndex + 1] === oldItem) {
            patches.push({
                index: newIndex,
                deleteCount: 0,
                insert: [newList[newIndex]]
            });
            oldIndex++;
            newIndex += 2;
            continue;
        } else if (oldIndex + 1 < oldLength && oldList[oldIndex + 1] === newItem) {
            patches.push({
                index: newIndex,
                deleteCount: 1,
                insert: []
            });
            oldIndex += 2;
            newIndex++;
            continue;
        } else {
            patches.push({
                index: newIndex,
                deleteCount: oldLength - oldIndex,
                insert: slice.call(newList, newIndex)
            });
            return patches;
        }
    }
    if (newIndex === newLength && oldIndex === oldLength) {
        return patches;
    }
    patches.push({
        index: newIndex,
        deleteCount: oldLength - oldIndex,
        insert: slice.call(newList, newIndex)
    });
    return patches;
};
},{}],15:[function(require,module,exports){
/*can@2.3.22#util/array/each*/
var can = require('../can.js');
require('./isArrayLike.js');
can.each = function (elements, callback, context) {
    var i = 0, key, len, item;
    if (elements) {
        if (can.isArrayLike(elements)) {
            if (can.List && elements instanceof can.List) {
                for (len = elements.attr('length'); i < len; i++) {
                    item = elements.attr(i);
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            } else {
                for (len = elements.length; i < len; i++) {
                    item = elements[i];
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            }
        } else if (typeof elements === 'object') {
            if (can.Map && elements instanceof can.Map || elements === can.route) {
                var keys = can.Map.keys(elements);
                for (i = 0, len = keys.length; i < len; i++) {
                    key = keys[i];
                    item = elements.attr(key);
                    if (callback.call(context || item, item, key, elements) === false) {
                        break;
                    }
                }
            } else {
                for (key in elements) {
                    if (Object.prototype.hasOwnProperty.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
    }
    return elements;
};
module.exports = can;
},{"../can.js":20,"./isArrayLike.js":16}],16:[function(require,module,exports){
/*can@2.3.22#util/array/isArrayLike*/
var can = require('../can.js');
can.isArrayLike = function (obj) {
    var length = obj && typeof obj !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
    return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
};
},{"../can.js":20}],17:[function(require,module,exports){
/*can@2.3.22#util/attr/attr*/
var can = require('../can.js');
var setImmediate = can.global.setImmediate || function (cb) {
        return setTimeout(cb, 0);
    }, formElements = {
        'input': true,
        'textarea': true,
        'select': true
    }, hasProperty = function (el, attrName) {
        return attrName in el || can.document && formElements[el.nodeName.toLowerCase()];
    }, attr = {
        MutationObserver: can.global.MutationObserver || can.global.WebKitMutationObserver || can.global.MozMutationObserver,
        map: {
            'class': function (el, val) {
                val = val || '';
                if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
                    el.setAttribute('class', val);
                } else {
                    el.className = val;
                }
                return val;
            },
            'value': 'value',
            'innertext': 'innerText',
            'innerhtml': 'innerHTML',
            'textcontent': 'textContent',
            'for': 'htmlFor',
            'checked': true,
            'disabled': true,
            'readonly': function (el, val) {
                el.readOnly = true;
                return val;
            },
            'required': true,
            src: function (el, val) {
                if (val == null || val === '') {
                    el.removeAttribute('src');
                    return null;
                } else {
                    el.setAttribute('src', val);
                    return val;
                }
            },
            style: function () {
                var el = can.global.document && document.createElement('div');
                if (el && el.style && 'cssText' in el.style) {
                    return function (el, val) {
                        return el.style.cssText = val || '';
                    };
                } else {
                    return function (el, val) {
                        return el.setAttribute('style', val);
                    };
                }
            }()
        },
        defaultValue: [
            'input',
            'textarea'
        ],
        setAttrOrProp: function (el, attrName, val) {
            attrName = attrName.toLowerCase();
            var prop = attr.map[attrName];
            if (prop === true && !val) {
                this.remove(el, attrName);
            } else {
                this.set(el, attrName, val);
            }
        },
        setSelectValue: function (el, val) {
            if (val != null) {
                var options = el.getElementsByTagName('option');
                for (var i = 0; i < options.length; i++) {
                    if (val == options[i].value) {
                        options[i].selected = true;
                        return;
                    }
                }
            }
            el.selectedIndex = -1;
        },
        set: function (el, attrName, val) {
            var usingMutationObserver = can.isDOM(el) && attr.MutationObserver;
            attrName = attrName.toLowerCase();
            var oldValue;
            if (!usingMutationObserver) {
                oldValue = attr.get(el, attrName);
            }
            var prop = attr.map[attrName], newValue;
            if (typeof prop === 'function') {
                newValue = prop(el, val);
            } else if (prop === true && hasProperty(el, attrName)) {
                newValue = el[attrName] = true;
                if (attrName === 'checked' && el.type === 'radio') {
                    if (can.inArray((el.nodeName + '').toLowerCase(), attr.defaultValue) >= 0) {
                        el.defaultChecked = true;
                    }
                }
            } else if (typeof prop === 'string' && hasProperty(el, prop)) {
                newValue = val;
                if (el[prop] !== val || el.nodeName.toUpperCase() === 'OPTION') {
                    el[prop] = val;
                }
                if (prop === 'value' && can.inArray((el.nodeName + '').toLowerCase(), attr.defaultValue) >= 0) {
                    el.defaultValue = val;
                }
            } else {
                attr.setAttribute(el, attrName, val);
            }
            if (!usingMutationObserver && newValue !== oldValue) {
                attr.trigger(el, attrName, oldValue);
            }
        },
        setAttribute: function () {
            var doc = can.global.document;
            if (doc && document.createAttribute) {
                try {
                    doc.createAttribute('{}');
                } catch (e) {
                    var invalidNodes = {}, attributeDummy = document.createElement('div');
                    return function (el, attrName, val) {
                        var first = attrName.charAt(0), cachedNode, node;
                        if ((first === '{' || first === '(' || first === '*') && el.setAttributeNode) {
                            cachedNode = invalidNodes[attrName];
                            if (!cachedNode) {
                                attributeDummy.innerHTML = '<div ' + attrName + '=""></div>';
                                cachedNode = invalidNodes[attrName] = attributeDummy.childNodes[0].attributes[0];
                            }
                            node = cachedNode.cloneNode();
                            node.value = val;
                            el.setAttributeNode(node);
                        } else {
                            el.setAttribute(attrName, val);
                        }
                    };
                }
            }
            return function (el, attrName, val) {
                el.setAttribute(attrName, val);
            };
        }(),
        trigger: function (el, attrName, oldValue) {
            if (can.data(can.$(el), 'canHasAttributesBindings')) {
                attrName = attrName.toLowerCase();
                return setImmediate(function () {
                    can.trigger(el, {
                        type: 'attributes',
                        attributeName: attrName,
                        target: el,
                        oldValue: oldValue,
                        bubbles: false
                    }, []);
                });
            }
        },
        get: function (el, attrName) {
            attrName = attrName.toLowerCase();
            var prop = attr.map[attrName];
            if (typeof prop === 'string' && hasProperty(el, prop)) {
                return el[prop];
            } else if (prop === true && hasProperty(el, attrName)) {
                return el[attrName];
            }
            return el.getAttribute(attrName);
        },
        remove: function (el, attrName) {
            attrName = attrName.toLowerCase();
            var oldValue;
            if (!attr.MutationObserver) {
                oldValue = attr.get(el, attrName);
            }
            var setter = attr.map[attrName];
            if (typeof setter === 'function') {
                setter(el, undefined);
            }
            if (setter === true && hasProperty(el, attrName)) {
                el[attrName] = false;
            } else if (typeof setter === 'string' && hasProperty(el, setter)) {
                el[setter] = '';
            } else {
                el.removeAttribute(attrName);
            }
            if (!attr.MutationObserver && oldValue != null) {
                attr.trigger(el, attrName, oldValue);
            }
        },
        has: function () {
            var el = can.global.document && document.createElement('div');
            if (el && el.hasAttribute) {
                return function (el, name) {
                    return el.hasAttribute(name);
                };
            } else {
                return function (el, name) {
                    return el.getAttribute(name) !== null;
                };
            }
        }()
    };
module.exports = attr;
},{"../can.js":20}],18:[function(require,module,exports){
/*can@2.3.22#util/batch/batch*/
var can = require('../can.js');
var batchNum = 1, transactions = 0, dispatchingBatch = null, collectingBatch = null, batches = [], dispatchingBatches = false;
can.batch = {
    start: function (batchStopHandler) {
        transactions++;
        if (transactions === 1) {
            var batch = {
                events: [],
                callbacks: [],
                number: batchNum++
            };
            batches.push(batch);
            if (batchStopHandler) {
                batch.callbacks.push(batchStopHandler);
            }
            collectingBatch = batch;
        }
    },
    stop: function (force, callStart) {
        if (force) {
            transactions = 0;
        } else {
            transactions--;
        }
        if (transactions === 0) {
            collectingBatch = null;
            var batch;
            if (dispatchingBatches === false) {
                dispatchingBatches = true;
                var callbacks = [], i;
                while (batch = batches.shift()) {
                    var events = batch.events;
                    callbacks.push.apply(callbacks, batch.callbacks);
                    dispatchingBatch = batch;
                    can.batch.batchNum = batch.number;
                    var len;
                    if (callStart) {
                        can.batch.start();
                    }
                    for (i = 0, len = events.length; i < len; i++) {
                        can.dispatch.apply(events[i][0], events[i][1]);
                    }
                    can.batch._onDispatchedEvents(batch.number);
                    dispatchingBatch = null;
                    can.batch.batchNum = undefined;
                }
                for (i = callbacks.length - 1; i >= 0; i--) {
                    callbacks[i]();
                }
                dispatchingBatches = false;
            }
        }
    },
    _onDispatchedEvents: function () {
    },
    trigger: function (item, event, args) {
        if (!item.__inSetup) {
            event = typeof event === 'string' ? { type: event } : event;
            if (collectingBatch) {
                event.batchNum = collectingBatch.number;
                collectingBatch.events.push([
                    item,
                    [
                        event,
                        args
                    ]
                ]);
            } else if (event.batchNum) {
                can.dispatch.call(item, event, args);
            } else if (batches.length) {
                can.batch.start();
                event.batchNum = collectingBatch.number;
                collectingBatch.events.push([
                    item,
                    [
                        event,
                        args
                    ]
                ]);
                can.batch.stop();
            } else {
                can.dispatch.call(item, event, args);
            }
        }
    },
    afterPreviousEvents: function (handler) {
        var batch = can.last(batches);
        if (batch) {
            var obj = {};
            can.bind.call(obj, 'ready', handler);
            batch.events.push([
                obj,
                [
                    { type: 'ready' },
                    []
                ]
            ]);
        } else {
            handler({});
        }
    },
    after: function (handler) {
        var batch = collectingBatch || dispatchingBatch;
        if (batch) {
            batch.callbacks.push(handler);
        } else {
            handler({});
        }
    }
};
},{"../can.js":20}],19:[function(require,module,exports){
/*can@2.3.22#util/bind/bind*/
var can = require('../util.js');
can.bindAndSetup = function () {
    can.addEvent.apply(this, arguments);
    if (!this.__inSetup) {
        if (!this._bindings) {
            this._bindings = 1;
            if (this._bindsetup) {
                this._bindsetup();
            }
        } else {
            this._bindings++;
        }
    }
    return this;
};
can.unbindAndTeardown = function (event, handler) {
    if (!this.__bindEvents) {
        return this;
    }
    var handlers = this.__bindEvents[event] || [];
    var handlerCount = handlers.length;
    can.removeEvent.apply(this, arguments);
    if (this._bindings === null) {
        this._bindings = 0;
    } else {
        this._bindings = this._bindings - (handlerCount - handlers.length);
    }
    if (!this._bindings && this._bindteardown) {
        this._bindteardown();
    }
    return this;
};
module.exports = can;
},{"../util.js":26}],20:[function(require,module,exports){
(function (process,global){
/*can@2.3.22#util/can*/
var glbl = typeof window !== 'undefined' ? window : typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : global;
var can = {};
if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
    glbl.can = can;
}
can.global = glbl;
can.k = function () {
};
can.isDeferred = can.isPromise = function (obj) {
    return obj && typeof obj.then === 'function' && typeof obj.pipe === 'function';
};
can.isMapLike = function (obj) {
    return can.Map && (obj instanceof can.Map || obj && obj.___get);
};
var cid = 0;
can.cid = function (object, name) {
    if (!object._cid) {
        cid++;
        object._cid = (name || '') + cid;
    }
    return object._cid;
};
can.VERSION = '@EDGE';
can.simpleExtend = function (d, s) {
    for (var prop in s) {
        d[prop] = s[prop];
    }
    return d;
};
can.last = function (arr) {
    return arr && arr[arr.length - 1];
};
can.isDOM = function (el) {
    return (el.ownerDocument || el) === can.global.document;
};
can.childNodes = function (node) {
    var childNodes = node.childNodes;
    if ('length' in childNodes) {
        return childNodes;
    } else {
        var cur = node.firstChild;
        var nodes = [];
        while (cur) {
            nodes.push(cur);
            cur = cur.nextSibling;
        }
        return nodes;
    }
};
var protoBind = Function.prototype.bind;
if (protoBind) {
    can.proxy = function (fn, context) {
        return protoBind.call(fn, context);
    };
} else {
    can.proxy = function (fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    };
}
can.frag = function (item, doc) {
    var document = doc || can.document || can.global.document;
    var frag;
    if (!item || typeof item === 'string') {
        frag = can.buildFragment(item == null ? '' : '' + item, document);
        if (!frag.childNodes.length) {
            frag.appendChild(document.createTextNode(''));
        }
        return frag;
    } else if (item.nodeType === 11) {
        return item;
    } else if (typeof item.nodeType === 'number') {
        frag = document.createDocumentFragment();
        frag.appendChild(item);
        return frag;
    } else if (typeof item.length === 'number') {
        frag = document.createDocumentFragment();
        can.each(item, function (item) {
            frag.appendChild(can.frag(item));
        });
        if (!can.childNodes(frag).length) {
            frag.appendChild(document.createTextNode(''));
        }
        return frag;
    } else {
        frag = can.buildFragment('' + item, document);
        if (!can.childNodes(frag).length) {
            frag.appendChild(document.createTextNode(''));
        }
        return frag;
    }
};
can.scope = can.viewModel = function (el, attr, val) {
    el = can.$(el);
    var scope = can.data(el, 'scope') || can.data(el, 'viewModel');
    if (!scope) {
        scope = new can.Map();
        can.data(el, 'scope', scope);
        can.data(el, 'viewModel', scope);
    }
    switch (arguments.length) {
    case 0:
    case 1:
        return scope;
    case 2:
        return scope.attr(attr);
    default:
        scope.attr(attr, val);
        return el;
    }
};
var parseURI = function (url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    return m ? {
        href: m[0] || '',
        protocol: m[1] || '',
        authority: m[2] || '',
        host: m[3] || '',
        hostname: m[4] || '',
        port: m[5] || '',
        pathname: m[6] || '',
        search: m[7] || '',
        hash: m[8] || ''
    } : null;
};
can.joinURIs = function (base, href) {
    function removeDotSegments(input) {
        var output = [];
        input.replace(/^(\.\.?(\/|$))+/, '').replace(/\/(\.(\/|$))+/g, '/').replace(/\/\.\.$/, '/../').replace(/\/?[^\/]*/g, function (p) {
            if (p === '/..') {
                output.pop();
            } else {
                output.push(p);
            }
        });
        return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }
    href = parseURI(href || '');
    base = parseURI(base || '');
    return !href || !base ? null : (href.protocol || base.protocol) + (href.protocol || href.authority ? href.authority : base.authority) + removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : href.pathname ? (base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname : base.pathname) + (href.protocol || href.authority || href.pathname ? href.search : href.search || base.search) + href.hash;
};
can['import'] = function (moduleName, parentName) {
    var deferred = new can.Deferred();
    if (typeof window.System === 'object' && can.isFunction(window.System['import'])) {
        window.System['import'](moduleName, { name: parentName }).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
    } else if (window.define && window.define.amd) {
        window.require([moduleName], function (value) {
            deferred.resolve(value);
        });
    } else if (window.steal) {
        steal.steal(moduleName, function (value) {
            deferred.resolve(value);
        });
    } else if (window.require) {
        deferred.resolve(window.require(moduleName));
    } else {
        deferred.resolve();
    }
    return deferred.promise();
};
can.__observe = function () {
};
can.isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';
can.isBrowserWindow = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof SimpleDOM === 'undefined';
can.isWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
module.exports = can;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}],21:[function(require,module,exports){
/*can@2.3.22#util/fragment*/
var can = require('./can.js');
var fragmentRE = /^\s*<(\w+)[^>]*>/, toString = {}.toString, fragment = function (html, name, doc) {
        if (name === undefined) {
            name = fragmentRE.test(html) && RegExp.$1;
        }
        if (html && toString.call(html.replace) === '[object Function]') {
            html = html.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, '<$1></$2>');
        }
        var container = doc.createElement('div'), temp = doc.createElement('div');
        if (name === 'tbody' || name === 'tfoot' || name === 'thead' || name === 'colgroup') {
            temp.innerHTML = '<table>' + html + '</table>';
            container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
        } else if (name === 'col') {
            temp.innerHTML = '<table><colgroup>' + html + '</colgroup></table>';
            container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
        } else if (name === 'tr') {
            temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
            container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
        } else if (name === 'td' || name === 'th') {
            temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
            container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild.firstChild;
        } else if (name === 'option') {
            temp.innerHTML = '<select>' + html + '</select>';
            container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
        } else {
            container.innerHTML = '' + html;
        }
        var tmp = {}, children = can.childNodes(container);
        tmp.length = children.length;
        for (var i = 0; i < children.length; i++) {
            tmp[i] = children[i];
        }
        return [].slice.call(tmp);
    };
can.buildFragment = function (html, doc) {
    if (html && html.nodeType === 11) {
        return html;
    }
    if (!doc) {
        doc = document;
    } else if (doc.length) {
        doc = doc[0];
    }
    var parts = fragment(html, undefined, doc), frag = (doc || document).createDocumentFragment();
    for (var i = 0, length = parts.length; i < length; i++) {
        frag.appendChild(parts[i]);
    }
    return frag;
};
(function () {
    var text = '<-\n>', frag = can.buildFragment(text, document);
    if (text !== frag.firstChild.nodeValue) {
        var oldBuildFragment = can.buildFragment;
        can.buildFragment = function (html, nodes) {
            var res = oldBuildFragment(html, nodes);
            if (res.childNodes.length === 1 && res.childNodes[0].nodeType === 3) {
                res.childNodes[0].nodeValue = html;
            }
            return res;
        };
    }
}());
module.exports = can;
},{"./can.js":20}],22:[function(require,module,exports){
/*can@2.3.22#util/inserted/inserted*/
var can = require('../can.js');
can.inserted = function (elems, document) {
    if (!elems.length) {
        return;
    }
    elems = can.makeArray(elems);
    var doc = document || elems[0].ownerDocument || elems[0], inDocument = false, root = can.$(doc.contains ? doc : doc.body), children;
    for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
        if (!inDocument) {
            if (elem.getElementsByTagName) {
                if (can.has(root, elem).length) {
                    inDocument = true;
                } else {
                    return;
                }
            } else {
                continue;
            }
        }
        if (inDocument && elem.getElementsByTagName) {
            children = can.makeArray(elem.getElementsByTagName('*'));
            can.trigger(elem, 'inserted', [], false);
            for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                can.trigger(child, 'inserted', [], false);
            }
        }
    }
};
can.appendChild = function (el, child, document) {
    var children;
    if (child.nodeType === 11) {
        children = can.makeArray(can.childNodes(child));
    } else {
        children = [child];
    }
    el.appendChild(child);
    can.inserted(children, document);
};
can.insertBefore = function (el, child, ref, document) {
    var children;
    if (child.nodeType === 11) {
        children = can.makeArray(can.childNodes(child));
    } else {
        children = [child];
    }
    el.insertBefore(child, ref);
    can.inserted(children, document);
};
},{"../can.js":20}],23:[function(require,module,exports){
/*can@2.3.22#util/jquery/jquery*/
var $ = require('jquery');
var can = require('../can.js');
var attr = require('../attr/attr.js');
var event = require('../../event/event.js');
require('../fragment.js');
require('../array/each.js');
require('../inserted/inserted.js');
var isBindableElement = function (node) {
    return node.nodeName && (node.nodeType === 1 || node.nodeType === 9) || node == window || node.addEventListener;
};
$ = $ || window.jQuery;
$.extend(can, $, {
    trigger: function (obj, event, args, bubbles) {
        if (isBindableElement(obj)) {
            $.event.trigger(event, args, obj, !bubbles);
        } else if (obj.trigger) {
            obj.trigger(event, args);
        } else {
            if (typeof event === 'string') {
                event = { type: event };
            }
            event.target = event.target || obj;
            if (args) {
                if (args.length && typeof args === 'string') {
                    args = [args];
                } else if (!args.length) {
                    args = [args];
                }
            }
            if (!args) {
                args = [];
            }
            can.dispatch.call(obj, event, args);
        }
    },
    event: can.event,
    addEvent: can.addEvent,
    removeEvent: can.removeEvent,
    buildFragment: can.buildFragment,
    $: $,
    each: can.each,
    bind: function (ev, cb) {
        if (this.bind && this.bind !== can.bind) {
            this.bind(ev, cb);
        } else if (isBindableElement(this)) {
            $.event.add(this, ev, cb);
        } else {
            can.addEvent.call(this, ev, cb);
        }
        return this;
    },
    unbind: function (ev, cb) {
        if (this.unbind && this.unbind !== can.unbind) {
            this.unbind(ev, cb);
        } else if (isBindableElement(this)) {
            $.event.remove(this, ev, cb);
        } else {
            can.removeEvent.call(this, ev, cb);
        }
        return this;
    },
    delegate: function (selector, ev, cb) {
        if (this.delegate) {
            this.delegate(selector, ev, cb);
        } else if (isBindableElement(this)) {
            $(this).delegate(selector, ev, cb);
        } else {
            can.bind.call(this, ev, cb);
        }
        return this;
    },
    undelegate: function (selector, ev, cb) {
        if (this.undelegate) {
            this.undelegate(selector, ev, cb);
        } else if (isBindableElement(this)) {
            $(this).undelegate(selector, ev, cb);
        } else {
            can.unbind.call(this, ev, cb);
        }
        return this;
    },
    proxy: can.proxy,
    attr: attr
});
can.on = can.bind;
can.off = can.unbind;
$.each([
    'append',
    'filter',
    'addClass',
    'remove',
    'data',
    'get',
    'has'
], function (i, name) {
    can[name] = function (wrapped) {
        return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
    };
});
var oldClean = $.cleanData;
$.cleanData = function (elems) {
    $.each(elems, function (i, elem) {
        if (elem) {
            can.trigger(elem, 'removed', [], false);
        }
    });
    oldClean(elems);
};
var oldDomManip = $.fn.domManip, cbIndex;
$.fn.domManip = function (args, cb1, cb2) {
    for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === 'function') {
            cbIndex = i;
            break;
        }
    }
    return oldDomManip.apply(this, arguments);
};
$(document.createElement('div')).append(document.createElement('div'));
var getChildNodes = function (node) {
    var childNodes = node.childNodes;
    if ('length' in childNodes) {
        return can.makeArray(childNodes);
    } else {
        var cur = node.firstChild;
        var nodes = [];
        while (cur) {
            nodes.push(cur);
            cur = cur.nextSibling;
        }
        return nodes;
    }
};
if (cbIndex === undefined) {
    $.fn.domManip = oldDomManip;
    can.each([
        'after',
        'prepend',
        'before',
        'append',
        'replaceWith'
    ], function (name) {
        var original = $.fn[name];
        $.fn[name] = function () {
            var elems = [], args = can.makeArray(arguments);
            if (args[0] != null) {
                if (typeof args[0] === 'string') {
                    args[0] = can.buildFragment(args[0]);
                }
                if (args[0].nodeType === 11) {
                    elems = getChildNodes(args[0]);
                } else if (can.isArrayLike(args[0])) {
                    elems = can.makeArray(args[0]);
                } else {
                    elems = [args[0]];
                }
            }
            var ret = original.apply(this, args);
            can.inserted(elems);
            return ret;
        };
    });
} else {
    $.fn.domManip = cbIndex === 2 ? function (args, table, callback) {
        return oldDomManip.call(this, args, table, function (elem) {
            var elems;
            if (elem.nodeType === 11) {
                elems = can.makeArray(can.childNodes(elem));
            }
            var ret = callback.apply(this, arguments);
            can.inserted(elems ? elems : [elem]);
            return ret;
        });
    } : function (args, callback) {
        return oldDomManip.call(this, args, function (elem) {
            var elems;
            if (elem.nodeType === 11) {
                elems = can.makeArray(can.childNodes(elem));
            }
            var ret = callback.apply(this, arguments);
            can.inserted(elems ? elems : [elem]);
            return ret;
        });
    };
}
var oldAttr = $.attr;
$.attr = function (el, attrName) {
    if (can.isDOM(el) && can.attr.MutationObserver) {
        return oldAttr.apply(this, arguments);
    } else {
        var oldValue, newValue;
        if (arguments.length >= 3) {
            oldValue = oldAttr.call(this, el, attrName);
        }
        var res = oldAttr.apply(this, arguments);
        if (arguments.length >= 3) {
            newValue = oldAttr.call(this, el, attrName);
        }
        if (newValue !== oldValue) {
            can.attr.trigger(el, attrName, oldValue);
        }
        return res;
    }
};
var oldRemove = $.removeAttr;
$.removeAttr = function (el, attrName) {
    if (can.isDOM(el) && can.attr.MutationObserver) {
        return oldRemove.apply(this, arguments);
    } else {
        var oldValue = oldAttr.call(this, el, attrName), res = oldRemove.apply(this, arguments);
        if (oldValue != null) {
            can.attr.trigger(el, attrName, oldValue);
        }
        return res;
    }
};
$.event.special.attributes = {
    setup: function () {
        if (can.isDOM(this) && can.attr.MutationObserver) {
            var self = this;
            var observer = new can.attr.MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    var copy = can.simpleExtend({}, mutation);
                    can.trigger(self, copy, []);
                });
            });
            observer.observe(this, {
                attributes: true,
                attributeOldValue: true
            });
            can.data(can.$(this), 'canAttributesObserver', observer);
        } else {
            can.data(can.$(this), 'canHasAttributesBindings', true);
        }
    },
    teardown: function () {
        if (can.isDOM(this) && can.attr.MutationObserver) {
            can.data(can.$(this), 'canAttributesObserver').disconnect();
            $.removeData(this, 'canAttributesObserver');
        } else {
            $.removeData(this, 'canHasAttributesBindings');
        }
    }
};
$.event.special.inserted = {};
$.event.special.removed = {};
module.exports = can;
},{"../../event/event.js":9,"../array/each.js":15,"../attr/attr.js":17,"../can.js":20,"../fragment.js":21,"../inserted/inserted.js":22,"jquery":48}],24:[function(require,module,exports){
/*can@2.3.22#util/object/isplain/isplain*/
var can = require('../../can.js');
var core_hasOwn = Object.prototype.hasOwnProperty, isWindow = function (obj) {
        return obj !== null && obj == obj.window;
    }, isPlainObject = function (obj) {
        if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || core_hasOwn.call(obj, key);
    };
can.isPlainObject = isPlainObject;
module.exports = can;
},{"../../can.js":20}],25:[function(require,module,exports){
/*can@2.3.22#util/string/string*/
var can = require('../util.js');
var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, getNext = function (obj, prop, add) {
        var result = obj[prop];
        if (result === undefined && add === true) {
            result = obj[prop] = {};
        }
        return result;
    }, isContainer = function (current) {
        return /^f|^o/.test(typeof current);
    }, convertBadValues = function (content) {
        var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
        return '' + (isInvalid ? '' : content);
    };
can.extend(can, {
    esc: function (content) {
        return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
    },
    getObject: function (name, roots, add) {
        var parts = name ? name.split('.') : [], length = parts.length, current, r = 0, i, container, rootsLength;
        roots = can.isArray(roots) ? roots : [roots || window];
        rootsLength = roots.length;
        if (!length) {
            return roots[0];
        }
        for (r; r < rootsLength; r++) {
            current = roots[r];
            container = undefined;
            for (i = 0; i < length && isContainer(current); i++) {
                container = current;
                current = getNext(container, parts[i]);
            }
            if (container !== undefined && current !== undefined) {
                break;
            }
        }
        if (add === false && current !== undefined) {
            delete container[parts[i - 1]];
        }
        if (add === true && current === undefined) {
            current = roots[0];
            for (i = 0; i < length && isContainer(current); i++) {
                current = getNext(current, parts[i], true);
            }
        }
        return current;
    },
    capitalize: function (s, cache) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },
    camelize: function (str) {
        return convertBadValues(str).replace(strHyphenMatch, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    },
    hyphenate: function (str) {
        return convertBadValues(str).replace(strCamelMatch, function (str, offset) {
            return str.charAt(0) + '-' + str.charAt(1).toLowerCase();
        });
    },
    underscore: function (s) {
        return s.replace(strColons, '/').replace(strWords, '$1_$2').replace(strLowUp, '$1_$2').replace(strDash, '_').toLowerCase();
    },
    sub: function (str, data, remove) {
        var obs = [];
        str = str || '';
        obs.push(str.replace(strReplacer, function (whole, inside) {
            var ob = can.getObject(inside, data, remove === true ? false : undefined);
            if (ob === undefined || ob === null) {
                obs = null;
                return '';
            }
            if (isContainer(ob) && obs) {
                obs.push(ob);
                return '';
            }
            return '' + ob;
        }));
        return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
    },
    replacer: strReplacer,
    undHash: strUndHash
});
module.exports = can;
},{"../util.js":26}],26:[function(require,module,exports){
/*can@2.3.22#util/util*/
var can = require('./jquery/jquery.js');
module.exports = can;
},{"./jquery/jquery.js":23}],27:[function(require,module,exports){
/*can@2.3.22#view/bindings/bindings*/
var can = require('../../util/util.js');
var expression = require('../stache/expression.js');
var viewCallbacks = require('../callbacks/callbacks.js');
var live = require('../live/live.js');
require('../scope/scope.js');
require('../href/href.js');
var behaviors = {
    viewModel: function (el, tagData, makeViewModel, initialViewModelData) {
        initialViewModelData = initialViewModelData || {};
        var bindingsSemaphore = {}, viewModel, onCompleteBindings = [], onTeardowns = {}, bindingInfos = {}, attributeViewModelBindings = can.extend({}, initialViewModelData);
        can.each(can.makeArray(el.attributes), function (node) {
            var dataBinding = makeDataBinding(node, el, {
                templateType: tagData.templateType,
                scope: tagData.scope,
                semaphore: bindingsSemaphore,
                getViewModel: function () {
                    return viewModel;
                },
                attributeViewModelBindings: attributeViewModelBindings,
                alreadyUpdatedChild: true,
                nodeList: tagData.parentNodeList
            });
            if (dataBinding) {
                if (dataBinding.onCompleteBinding) {
                    if (dataBinding.bindingInfo.parentToChild && dataBinding.value !== undefined) {
                        initialViewModelData[cleanVMName(dataBinding.bindingInfo.childName)] = dataBinding.value;
                    }
                    onCompleteBindings.push(dataBinding.onCompleteBinding);
                }
                onTeardowns[node.name] = dataBinding.onTeardown;
            }
        });
        viewModel = makeViewModel(initialViewModelData);
        for (var i = 0, len = onCompleteBindings.length; i < len; i++) {
            onCompleteBindings[i]();
        }
        can.bind.call(el, 'attributes', function (ev) {
            var attrName = ev.attributeName, value = el.getAttribute(attrName);
            if (onTeardowns[attrName]) {
                onTeardowns[attrName]();
            }
            var parentBindingWasAttribute = bindingInfos[attrName] && bindingInfos[attrName].parent === 'attribute';
            if (value !== null || parentBindingWasAttribute) {
                var dataBinding = makeDataBinding({
                    name: attrName,
                    value: value
                }, el, {
                    templateType: tagData.templateType,
                    scope: tagData.scope,
                    semaphore: {},
                    getViewModel: function () {
                        return viewModel;
                    },
                    attributeViewModelBindings: attributeViewModelBindings,
                    initializeValues: true,
                    nodeList: tagData.parentNodeList
                });
                if (dataBinding) {
                    if (dataBinding.onCompleteBinding) {
                        dataBinding.onCompleteBinding();
                    }
                    bindingInfos[attrName] = dataBinding.bindingInfo;
                    onTeardowns[attrName] = dataBinding.onTeardown;
                }
            }
        });
        return function () {
            for (var attrName in onTeardowns) {
                onTeardowns[attrName]();
            }
        };
    },
    data: function (el, attrData) {
        if (can.data(can.$(el), 'preventDataBindings')) {
            return;
        }
        var viewModel = can.viewModel(el), semaphore = {}, teardown;
        var dataBinding = makeDataBinding({
            name: attrData.attributeName,
            value: el.getAttribute(attrData.attributeName),
            nodeList: attrData.nodeList
        }, el, {
            templateType: attrData.templateType,
            scope: attrData.scope,
            semaphore: semaphore,
            getViewModel: function () {
                return viewModel;
            }
        });
        if (dataBinding.onCompleteBinding) {
            dataBinding.onCompleteBinding();
        }
        teardown = dataBinding.onTeardown;
        can.one.call(el, 'removed', function () {
            teardown();
        });
        can.bind.call(el, 'attributes', function (ev) {
            var attrName = ev.attributeName, value = el.getAttribute(attrName);
            if (attrName === attrData.attributeName) {
                if (teardown) {
                    teardown();
                }
                if (value !== null) {
                    var dataBinding = makeDataBinding({
                        name: attrName,
                        value: value
                    }, el, {
                        templateType: attrData.templateType,
                        scope: attrData.scope,
                        semaphore: semaphore,
                        getViewModel: function () {
                            return viewModel;
                        },
                        initializeValues: true,
                        nodeList: attrData.nodeList
                    });
                    if (dataBinding) {
                        if (dataBinding.onCompleteBinding) {
                            dataBinding.onCompleteBinding();
                        }
                        teardown = dataBinding.onTeardown;
                    }
                }
            }
        });
    },
    reference: function (el, attrData) {
        if (el.getAttribute(attrData.attributeName)) {
            console.warn('*reference attributes can only export the view model.');
        }
        var name = can.camelize(attrData.attributeName.substr(1).toLowerCase());
        var viewModel = can.viewModel(el);
        var refs = attrData.scope.getRefs();
        refs._context.attr('*' + name, viewModel);
    },
    event: function (el, data) {
        var attributeName = data.attributeName, legacyBinding = attributeName.indexOf('can-') === 0, event = attributeName.indexOf('can-') === 0 ? attributeName.substr('can-'.length) : removeBrackets(attributeName, '(', ')'), onBindElement = legacyBinding;
        if (event.charAt(0) === '$') {
            event = event.substr(1);
            onBindElement = true;
        }
        var handler = function (ev) {
            var attrVal = el.getAttribute(attributeName);
            if (!attrVal) {
                return;
            }
            var $el = can.$(el), viewModel = can.viewModel($el[0]);
            var expr = expression.parse(removeBrackets(attrVal), {
                lookupRule: 'method',
                methodRule: 'call'
            });
            if (!(expr instanceof expression.Call) && !(expr instanceof expression.Helper)) {
                var defaultArgs = can.map([
                    data.scope._context,
                    $el
                ].concat(can.makeArray(arguments)), function (data) {
                    return new expression.Literal(data);
                });
                expr = new expression.Call(expr, defaultArgs, {});
            }
            var scopeData = data.scope.read(expr.methodExpr.key, { isArgument: true });
            if (!scopeData.value) {
                scopeData = data.scope.read(expr.methodExpr.key, { isArgument: true });
                return null;
            }
            var localScope = data.scope.add({
                '@element': $el,
                '@event': ev,
                '@viewModel': viewModel,
                '@scope': data.scope,
                '@context': data.scope._context,
                '%element': this,
                '$element': $el,
                '%event': ev,
                '%viewModel': viewModel,
                '%scope': data.scope,
                '%context': data.scope._context
            }, { notContext: true });
            var args = expr.args(localScope, null)();
            return scopeData.value.apply(scopeData.parent, args);
        };
        if (special[event]) {
            var specialData = special[event](data, el, handler);
            handler = specialData.handler;
            event = specialData.event;
        }
        can.bind.call(onBindElement ? el : can.viewModel(el), event, handler);
        var attributesHandler = function (ev) {
            if (ev.attributeName === attributeName && !this.getAttribute(attributeName)) {
                can.unbind.call(onBindElement ? el : can.viewModel(el), event, handler);
                can.unbind.call(el, 'attributes', attributesHandler);
            }
        };
        can.bind.call(el, 'attributes', attributesHandler);
    },
    value: function (el, data) {
        var propName = '$value', attrValue = can.trim(removeBrackets(el.getAttribute('can-value'))), getterSetter;
        if (el.nodeName.toLowerCase() === 'input' && (el.type === 'checkbox' || el.type === 'radio')) {
            var property = getComputeFrom.scope(el, data.scope, attrValue, {}, true);
            if (el.type === 'checkbox') {
                var trueValue = can.attr.has(el, 'can-true-value') ? el.getAttribute('can-true-value') : true, falseValue = can.attr.has(el, 'can-false-value') ? el.getAttribute('can-false-value') : false;
                getterSetter = can.compute(function (newValue) {
                    if (arguments.length) {
                        property(newValue ? trueValue : falseValue);
                    } else {
                        return property() == trueValue;
                    }
                });
            } else if (el.type === 'radio') {
                getterSetter = can.compute(function (newValue) {
                    if (arguments.length) {
                        if (newValue) {
                            property(el.value);
                        }
                    } else {
                        return property() == el.value;
                    }
                });
            }
            propName = '$checked';
            attrValue = 'getterSetter';
            data.scope = new can.view.Scope({ getterSetter: getterSetter });
        } else if (isContentEditable(el)) {
            propName = '$innerHTML';
        }
        var dataBinding = makeDataBinding({
            name: '{(' + propName + '})',
            value: attrValue
        }, el, {
            templateType: data.templateType,
            scope: data.scope,
            semaphore: {},
            initializeValues: true,
            legacyBindings: true,
            syncChildWithParent: true
        });
        can.one.call(el, 'removed', function () {
            dataBinding.onTeardown();
        });
    }
};
can.view.attr(/^\{[^\}]+\}$/, behaviors.data);
can.view.attr(/\*[\w\.\-_]+/, behaviors.reference);
can.view.attr(/^\([\$?\w\.]+\)$/, behaviors.event);
can.view.attr(/can-[\w\.]+/, behaviors.event);
can.view.attr('can-value', behaviors.value);
var getComputeFrom = {
    scope: function (el, scope, scopeProp, bindingData, mustBeACompute, stickyCompute) {
        if (!scopeProp) {
            return can.compute();
        } else {
            if (mustBeACompute) {
                var parentExpression = expression.parse(scopeProp, { baseMethodType: 'Call' });
                return parentExpression.value(scope, new can.view.Options({}));
            } else {
                return function (newVal) {
                    scope.attr(cleanVMName(scopeProp), newVal);
                };
            }
        }
    },
    viewModel: function (el, scope, vmName, bindingData, mustBeACompute, stickyCompute) {
        var setName = cleanVMName(vmName);
        if (mustBeACompute) {
            return can.compute(function (newVal) {
                var viewModel = bindingData.getViewModel();
                if (arguments.length) {
                    viewModel.attr(setName, newVal);
                } else {
                    return vmName === '.' ? viewModel : can.compute.read(viewModel, can.compute.read.reads(vmName), {}).value;
                }
            });
        } else {
            return function (newVal) {
                bindingData.getViewModel().attr(setName, newVal);
            };
        }
    },
    attribute: function (el, scope, prop, bindingData, mustBeACompute, stickyCompute, event) {
        var hasChildren = el.nodeName.toLowerCase() === 'select', isMultiselectValue = prop === 'value' && hasChildren && el.multiple, isStringValue, lastSet, scheduledAsyncSet = false, timer, parentEvents, originalValue;
        if (!event) {
            if (prop === 'innerHTML') {
                event = [
                    'blur',
                    'change'
                ];
            } else {
                event = 'change';
            }
        }
        if (!can.isArray(event)) {
            event = [event];
        }
        var set = function (newVal) {
                if (hasChildren && !scheduledAsyncSet) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        set(newVal);
                    }, 1);
                }
                lastSet = newVal;
                if (isMultiselectValue) {
                    if (newVal && typeof newVal === 'string') {
                        newVal = newVal.split(';');
                        isStringValue = true;
                    } else if (newVal) {
                        newVal = can.makeArray(newVal);
                    } else {
                        newVal = [];
                    }
                    var isSelected = {};
                    can.each(newVal, function (val) {
                        isSelected[val] = true;
                    });
                    can.each(el.childNodes, function (option) {
                        if (option.value) {
                            option.selected = !!isSelected[option.value];
                        }
                    });
                } else {
                    if (!bindingData.legacyBindings && hasChildren && 'selectedIndex' in el && prop === 'value') {
                        can.attr.setSelectValue(el, newVal);
                    } else {
                        can.attr.setAttrOrProp(el, prop, newVal == null ? '' : newVal);
                    }
                }
                return newVal;
            }, get = function () {
                if (isMultiselectValue) {
                    var values = [], children = el.childNodes;
                    can.each(children, function (child) {
                        if (child.selected && child.value) {
                            values.push(child.value);
                        }
                    });
                    return isStringValue ? values.join(';') : values;
                } else if (hasChildren && 'selectedIndex' in el && el.selectedIndex === -1) {
                    return undefined;
                }
                return can.attr.get(el, prop);
            };
        if (hasChildren) {
            setTimeout(function () {
                scheduledAsyncSet = true;
            }, 1);
        }
        if (el.tagName && el.tagName.toLowerCase() === 'input' && el.form) {
            parentEvents = [{
                    el: el.form,
                    eventName: 'reset',
                    handler: function () {
                        set(originalValue);
                    }
                }];
        }
        var observer;
        originalValue = get();
        return can.compute(originalValue, {
            on: function (updater) {
                can.each(event, function (eventName) {
                    can.bind.call(el, eventName, updater);
                });
                can.each(parentEvents, function (parentEvent) {
                    can.bind.call(parentEvent.el, parentEvent.eventName, parentEvent.handler);
                });
                if (hasChildren) {
                    var onMutation = function (mutations) {
                        if (stickyCompute) {
                            set(stickyCompute());
                        }
                        updater();
                    };
                    if (can.attr.MutationObserver) {
                        observer = new can.attr.MutationObserver(onMutation);
                        observer.observe(el, {
                            childList: true,
                            subtree: true
                        });
                    } else {
                        can.data(can.$(el), 'canBindingCallback', { onMutation: onMutation });
                    }
                }
            },
            off: function (updater) {
                can.each(event, function (eventName) {
                    can.unbind.call(el, eventName, updater);
                });
                can.each(parentEvents, function (parentEvent) {
                    can.unbind.call(parentEvent.el, parentEvent.eventName, parentEvent.handler);
                });
                if (hasChildren) {
                    if (can.attr.MutationObserver) {
                        observer.disconnect();
                    } else {
                        can.data(can.$(el), 'canBindingCallback', null);
                    }
                }
            },
            get: get,
            set: set
        });
    }
};
var bind = {
    childToParent: function (el, parentCompute, childCompute, bindingsSemaphore, attrName, syncChild) {
        var parentUpdateIsFunction = typeof parentCompute === 'function';
        var updateParent = function (ev, newVal) {
            if (!bindingsSemaphore[attrName]) {
                if (parentUpdateIsFunction) {
                    parentCompute(newVal);
                    if (syncChild) {
                        if (parentCompute() !== childCompute()) {
                            bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                            can.batch.start();
                            childCompute(parentCompute());
                            can.batch.after(function () {
                                --bindingsSemaphore[attrName];
                            });
                            can.batch.stop();
                        }
                    }
                } else if (parentCompute instanceof can.Map) {
                    parentCompute.attr(newVal, true);
                }
            }
        };
        if (childCompute && childCompute.isComputed) {
            childCompute.bind('change', updateParent);
        }
        return updateParent;
    },
    parentToChild: function (el, parentCompute, childUpdate, bindingsSemaphore, attrName) {
        var updateChild = function (ev, newValue) {
            bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
            can.batch.start();
            childUpdate(newValue);
            can.batch.after(function () {
                --bindingsSemaphore[attrName];
            });
            can.batch.stop();
        };
        if (parentCompute && parentCompute.isComputed) {
            parentCompute.bind('change', updateChild);
        }
        return updateChild;
    }
};
var getBindingInfo = function (node, attributeViewModelBindings, templateType, tagName) {
    var attributeName = node.name, attributeValue = node.value || '';
    var matches = attributeName.match(bindingsRegExp);
    if (!matches) {
        var ignoreAttribute = ignoreAttributesRegExp.test(attributeName);
        var vmName = can.camelize(attributeName);
        if (ignoreAttribute || viewCallbacks.attr(attributeName)) {
            return;
        }
        var syntaxRight = attributeValue[0] === '{' && can.last(attributeValue) === '}';
        var isAttributeToChild = templateType === 'legacy' ? attributeViewModelBindings[vmName] : !syntaxRight;
        var scopeName = syntaxRight ? attributeValue.substr(1, attributeValue.length - 2) : attributeValue;
        if (isAttributeToChild) {
            return {
                bindingAttributeName: attributeName,
                parent: 'attribute',
                parentName: attributeName,
                child: 'viewModel',
                childName: vmName,
                parentToChild: true,
                childToParent: true
            };
        } else {
            return {
                bindingAttributeName: attributeName,
                parent: 'scope',
                parentName: scopeName,
                child: 'viewModel',
                childName: vmName,
                parentToChild: true,
                childToParent: true
            };
        }
    }
    var twoWay = !!matches[1], childToParent = twoWay || !!matches[2], parentToChild = twoWay || !childToParent;
    var childName = matches[3];
    var isDOM = childName.charAt(0) === '$';
    if (isDOM) {
        var bindingInfo = {
            parent: 'scope',
            child: 'attribute',
            childToParent: childToParent,
            parentToChild: parentToChild,
            bindingAttributeName: attributeName,
            childName: childName.substr(1),
            parentName: attributeValue,
            initializeValues: true
        };
        if (tagName === 'select') {
            bindingInfo.stickyParentToChild = true;
        }
        return bindingInfo;
    } else {
        return {
            parent: 'scope',
            child: 'viewModel',
            childToParent: childToParent,
            parentToChild: parentToChild,
            bindingAttributeName: attributeName,
            childName: can.camelize(childName),
            parentName: attributeValue,
            initializeValues: true
        };
    }
};
var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/, ignoreAttributesRegExp = /^(data-view-id|class|id|\[[\w\.-]+\]|#[\w\.-])$/i;
var makeDataBinding = function (node, el, bindingData) {
    var bindingInfo = getBindingInfo(node, bindingData.attributeViewModelBindings, bindingData.templateType, el.nodeName.toLowerCase());
    if (!bindingInfo) {
        return;
    }
    bindingInfo.alreadyUpdatedChild = bindingData.alreadyUpdatedChild;
    if (bindingData.initializeValues) {
        bindingInfo.initializeValues = true;
    }
    var parentCompute = getComputeFrom[bindingInfo.parent](el, bindingData.scope, bindingInfo.parentName, bindingData, bindingInfo.parentToChild), childCompute = getComputeFrom[bindingInfo.child](el, bindingData.scope, bindingInfo.childName, bindingData, bindingInfo.childToParent, bindingInfo.stickyParentToChild && parentCompute), updateParent, updateChild, childLifecycle;
    if (bindingData.nodeList) {
        if (parentCompute && parentCompute.isComputed) {
            parentCompute.computeInstance.setPrimaryDepth(bindingData.nodeList.nesting + 1);
        }
        if (childCompute && childCompute.isComputed) {
            childCompute.computeInstance.setPrimaryDepth(bindingData.nodeList.nesting + 1);
        }
    }
    if (bindingInfo.parentToChild) {
        updateChild = bind.parentToChild(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName);
    }
    var completeBinding = function () {
        if (bindingInfo.childToParent) {
            updateParent = bind.childToParent(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName, bindingData.syncChildWithParent);
        } else if (bindingInfo.stickyParentToChild) {
            childCompute.bind('change', childLifecycle = can.k);
        }
        if (bindingInfo.initializeValues) {
            initializeValues(bindingInfo, childCompute, parentCompute, updateChild, updateParent);
        }
    };
    var onTeardown = function () {
        unbindUpdate(parentCompute, updateChild);
        unbindUpdate(childCompute, updateParent);
        unbindUpdate(childCompute, childLifecycle);
    };
    if (bindingInfo.child === 'viewModel') {
        return {
            value: getValue(parentCompute),
            onCompleteBinding: completeBinding,
            bindingInfo: bindingInfo,
            onTeardown: onTeardown
        };
    } else {
        completeBinding();
        return {
            bindingInfo: bindingInfo,
            onTeardown: onTeardown
        };
    }
};
var initializeValues = function (bindingInfo, childCompute, parentCompute, updateChild, updateParent) {
    var doUpdateParent = false;
    if (bindingInfo.parentToChild && !bindingInfo.childToParent) {
    } else if (!bindingInfo.parentToChild && bindingInfo.childToParent) {
        doUpdateParent = true;
    } else if (getValue(childCompute) === undefined) {
    } else if (getValue(parentCompute) === undefined) {
        doUpdateParent = true;
    }
    if (doUpdateParent) {
        updateParent({}, getValue(childCompute));
    } else {
        if (!bindingInfo.alreadyUpdatedChild) {
            updateChild({}, getValue(parentCompute));
        }
    }
};
if (!can.attr.MutationObserver) {
    var updateSelectValue = function (el) {
        var bindingCallback = can.data(can.$(el), 'canBindingCallback');
        if (bindingCallback) {
            bindingCallback.onMutation(el);
        }
    };
    live.registerChildMutationCallback('select', updateSelectValue);
    live.registerChildMutationCallback('optgroup', function (el) {
        updateSelectValue(el.parentNode);
    });
}
var isContentEditable = function () {
        var values = {
            '': true,
            'true': true,
            'false': false
        };
        var editable = function (el) {
            if (!el || !el.getAttribute) {
                return;
            }
            var attr = el.getAttribute('contenteditable');
            return values[attr];
        };
        return function (el) {
            var val = editable(el);
            if (typeof val === 'boolean') {
                return val;
            } else {
                return !!editable(el.parentNode);
            }
        };
    }(), removeBrackets = function (value, open, close) {
        open = open || '{';
        close = close || '}';
        if (value[0] === open && value[value.length - 1] === close) {
            return value.substr(1, value.length - 2);
        }
        return value;
    }, getValue = function (value) {
        return value && value.isComputed ? value() : value;
    }, unbindUpdate = function (compute, updateOther) {
        if (compute && compute.isComputed && typeof updateOther === 'function') {
            compute.unbind('change', updateOther);
        }
    }, cleanVMName = function (name) {
        return name.replace(/@/g, '');
    };
var special = {
    enter: function (data, el, original) {
        return {
            event: 'keyup',
            handler: function (ev) {
                if (ev.keyCode === 13) {
                    return original.call(this, ev);
                }
            }
        };
    }
};
can.bindings = {
    behaviors: behaviors,
    getBindingInfo: getBindingInfo,
    special: special
};
module.exports = can.bindings;
},{"../../util/util.js":26,"../callbacks/callbacks.js":28,"../href/href.js":30,"../live/live.js":32,"../scope/scope.js":36,"../stache/expression.js":37}],28:[function(require,module,exports){
/*can@2.3.22#view/callbacks/callbacks*/
var can = require('../../util/util.js');
require('../view.js');
var attr = can.view.attr = function (attributeName, attrHandler) {
    if (attrHandler) {
        if (typeof attributeName === 'string') {
            attributes[attributeName] = attrHandler;
        } else {
            regExpAttributes.push({
                match: attributeName,
                handler: attrHandler
            });
        }
    } else {
        var cb = attributes[attributeName];
        if (!cb) {
            for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                var attrMatcher = regExpAttributes[i];
                if (attrMatcher.match.test(attributeName)) {
                    cb = attrMatcher.handler;
                    break;
                }
            }
        }
        return cb;
    }
};
var attributes = {}, regExpAttributes = [], automaticCustomElementCharacters = /[-\:]/;
var tag = can.view.tag = function (tagName, tagHandler) {
    if (tagHandler) {
        if (can.global.html5) {
            can.global.html5.elements += ' ' + tagName;
            can.global.html5.shivDocument();
        }
        tags[tagName.toLowerCase()] = tagHandler;
    } else {
        var cb = tags[tagName.toLowerCase()];
        if (!cb && automaticCustomElementCharacters.test(tagName)) {
            cb = function () {
            };
        }
        return cb;
    }
};
var tags = {};
can.view.callbacks = {
    _tags: tags,
    _attributes: attributes,
    _regExpAttributes: regExpAttributes,
    tag: tag,
    attr: attr,
    tagHandler: function (el, tagName, tagData) {
        var helperTagCallback = tagData.options.get('tags.' + tagName, { proxyMethods: false }), tagCallback = helperTagCallback || tags[tagName];
        var scope = tagData.scope, res;
        if (tagCallback) {
            res = can.__notObserve(tagCallback)(el, tagData);
        } else {
            res = scope;
        }
        if (res && tagData.subtemplate) {
            if (scope !== res) {
                scope = scope.add(res);
            }
            var result = tagData.subtemplate(scope, tagData.options);
            var frag = typeof result === 'string' ? can.view.frag(result) : result;
            can.appendChild(el, frag);
        }
    }
};
module.exports = can.view.callbacks;
},{"../../util/util.js":26,"../view.js":47}],29:[function(require,module,exports){
/*can@2.3.22#view/elements*/
var can = require('../util/util.js');
require('./view.js');
var doc = typeof document !== 'undefined' ? document : null;
var selectsCommentNodes = doc && function () {
    return can.$(document.createComment('~')).length === 1;
}();
var elements = {
    tagToContentPropMap: {
        option: doc && 'textContent' in document.createElement('option') ? 'textContent' : 'innerText',
        textarea: 'value'
    },
    attrMap: can.attr.map,
    attrReg: /([^\s=]+)[\s]*=[\s]*/,
    defaultValue: can.attr.defaultValue,
    tagMap: {
        '': 'span',
        colgroup: 'col',
        table: 'tbody',
        tr: 'td',
        ol: 'li',
        ul: 'li',
        tbody: 'tr',
        thead: 'tr',
        tfoot: 'tr',
        select: 'option',
        optgroup: 'option'
    },
    reverseTagMap: {
        col: 'colgroup',
        tr: 'tbody',
        option: 'select',
        td: 'tr',
        th: 'tr',
        li: 'ul'
    },
    selfClosingTags: { col: true },
    getParentNode: function (el, defaultParentNode) {
        return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
    },
    setAttr: can.attr.set,
    getAttr: can.attr.get,
    removeAttr: can.attr.remove,
    contentText: function (text) {
        if (typeof text === 'string') {
            return text;
        }
        if (!text && text !== 0) {
            return '';
        }
        return '' + text;
    },
    after: function (oldElements, newFrag) {
        var last = oldElements[oldElements.length - 1];
        if (last.nextSibling) {
            can.insertBefore(last.parentNode, newFrag, last.nextSibling, can.document);
        } else {
            can.appendChild(last.parentNode, newFrag, can.document);
        }
    },
    replace: function (oldElements, newFrag) {
        var selectedValue, parentNode = oldElements[0].parentNode;
        if (parentNode.nodeName.toUpperCase() === 'SELECT' && parentNode.selectedIndex >= 0) {
            selectedValue = parentNode.value;
        }
        elements.after(oldElements, newFrag);
        if (can.remove(can.$(oldElements)).length < oldElements.length && !selectsCommentNodes) {
            can.each(oldElements, function (el) {
                if (el.nodeType === 8) {
                    el.parentNode.removeChild(el);
                }
            });
        }
        if (selectedValue !== undefined) {
            parentNode.value = selectedValue;
        }
    }
};
can.view.elements = elements;
module.exports = elements;
},{"../util/util.js":26,"./view.js":47}],30:[function(require,module,exports){
/*can@2.3.22#view/href/href*/
var can = require('../../util/util.js');
var expression = require('../stache/expression.js');
require('../callbacks/callbacks.js');
require('../scope/scope.js');
var removeCurly = function (value) {
    if (value[0] === '{' && value[value.length - 1] === '}') {
        return value.substr(1, value.length - 2);
    }
    return value;
};
can.view.attr('can-href', function (el, attrData) {
    var attrInfo = expression.parse('tmp(' + removeCurly(el.getAttribute('can-href')) + ')', { baseMethodType: 'Call' });
    var getHash = attrInfo.argExprs[0].value(attrData.scope, null);
    var routeHref = can.compute(function () {
        return can.route.url(getHash());
    });
    el.setAttribute('href', routeHref());
    var handler = function (ev, newVal) {
        el.setAttribute('href', newVal);
    };
    routeHref.bind('change', handler);
    can.bind.call(el, 'removed', function () {
        routeHref.unbind('change', handler);
    });
});
},{"../../util/util.js":26,"../callbacks/callbacks.js":28,"../scope/scope.js":36,"../stache/expression.js":37}],31:[function(require,module,exports){
/*can@2.3.22#view/import/import*/
var can = require('../../util/util.js');
require('../callbacks/callbacks.js');
can.view.tag('can-import', function (el, tagData) {
    var $el = can.$(el);
    var moduleName = el.getAttribute('from');
    var templateModule = tagData.options.attr('helpers.module');
    var parentName = templateModule ? templateModule.id : undefined;
    var importPromise;
    if (moduleName) {
        importPromise = can['import'](moduleName, parentName);
    } else {
        importPromise = can.Deferred().reject('No moduleName provided').promise();
    }
    var root = tagData.scope.attr('%root');
    if (root && can.isFunction(root.waitFor)) {
        root.waitFor(importPromise);
    }
    can.data($el, 'viewModel', importPromise);
    can.data($el, 'scope', importPromise);
    var scope = tagData.scope.add(importPromise);
    var handOffTag = el.getAttribute('can-tag');
    if (handOffTag) {
        var callback = can.view.tag(handOffTag);
        can.data($el, 'preventDataBindings', true);
        callback(el, can.extend(tagData, { scope: scope }));
        can.data($el, 'preventDataBindings', false);
        can.data($el, 'viewModel', importPromise);
        can.data($el, 'scope', importPromise);
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
},{"../../util/util.js":26,"../callbacks/callbacks.js":28}],32:[function(require,module,exports){
/*can@2.3.22#view/live/live*/
var can = require('../../util/util.js');
var elements = require('../elements.js');
var view = require('../view.js');
var nodeLists = require('../node_lists/node_lists.js');
var parser = require('../parser/parser.js');
var diff = require('../../util/array/diff.js');
elements = elements || can.view.elements;
nodeLists = nodeLists || can.view.NodeLists;
parser = parser || can.view.parser;
var setup = function (el, bind, unbind) {
        var tornDown = false, teardown = function () {
                if (!tornDown) {
                    tornDown = true;
                    unbind(data);
                    can.unbind.call(el, 'removed', teardown);
                }
                return true;
            }, data = {
                teardownCheck: function (parent) {
                    return parent ? false : teardown();
                }
            };
        can.bind.call(el, 'removed', teardown);
        bind(data);
        return data;
    }, getChildNodes = function (node) {
        var childNodes = node.childNodes;
        if ('length' in childNodes) {
            return childNodes;
        } else {
            var cur = node.firstChild;
            var nodes = [];
            while (cur) {
                nodes.push(cur);
                cur = cur.nextSibling;
            }
            return nodes;
        }
    }, listen = function (el, compute, change) {
        return setup(el, function () {
            compute.computeInstance.bind('change', change);
        }, function (data) {
            compute.computeInstance.unbind('change', change);
            if (data.nodeList) {
                nodeLists.unregister(data.nodeList);
            }
        });
    }, getAttributeParts = function (newVal) {
        var attrs = {}, attr;
        parser.parseAttrs(newVal, {
            attrStart: function (name) {
                attrs[name] = '';
                attr = name;
            },
            attrValue: function (value) {
                attrs[attr] += value;
            },
            attrEnd: function () {
            }
        });
        return attrs;
    }, splice = [].splice, isNode = function (obj) {
        return obj && obj.nodeType;
    }, addTextNodeIfNoChildren = function (frag) {
        if (!frag.firstChild) {
            frag.appendChild(frag.ownerDocument.createTextNode(''));
        }
    }, getLiveFragment = function (itemHTML) {
        var gotText = typeof itemHTML === 'string', itemFrag = can.frag(itemHTML);
        return gotText ? can.view.hookup(itemFrag) : itemFrag;
    }, renderAndAddToNodeLists = function (newNodeLists, parentNodeList, render, context, args) {
        var itemNodeList = [];
        if (parentNodeList) {
            nodeLists.register(itemNodeList, null, true, true);
            itemNodeList.parentList = parentNodeList;
            itemNodeList.expression = '#each SUBEXPRESSION';
        }
        var itemHTML = render.apply(context, args.concat([itemNodeList])), itemFrag = getLiveFragment(itemHTML);
        var childNodes = can.makeArray(getChildNodes(itemFrag));
        if (parentNodeList) {
            nodeLists.update(itemNodeList, childNodes);
            newNodeLists.push(itemNodeList);
        } else {
            newNodeLists.push(nodeLists.register(childNodes));
        }
        return itemFrag;
    }, removeFromNodeList = function (masterNodeList, index, length) {
        var removedMappings = masterNodeList.splice(index + 1, length), itemsToRemove = [];
        can.each(removedMappings, function (nodeList) {
            var nodesToRemove = nodeLists.unregister(nodeList);
            [].push.apply(itemsToRemove, nodesToRemove);
        });
        return itemsToRemove;
    }, addFalseyIfEmpty = function (list, falseyRender, masterNodeList, nodeList) {
        if (falseyRender && list.length === 0) {
            var falseyNodeLists = [];
            var falseyFrag = renderAndAddToNodeLists(falseyNodeLists, nodeList, falseyRender, list, [list]);
            elements.after([masterNodeList[0]], falseyFrag);
            masterNodeList.push(falseyNodeLists[0]);
        }
    }, childMutationCallbacks = {};
var live = {
    registerChildMutationCallback: function (tag, callback) {
        if (callback) {
            childMutationCallbacks[tag] = callback;
        } else {
            return childMutationCallbacks[tag];
        }
    },
    callChildMutationCallback: function (el) {
        var callback = el && childMutationCallbacks[el.nodeName.toLowerCase()];
        if (callback) {
            callback(el);
        }
    },
    list: function (el, compute, render, context, parentNode, nodeList, falseyRender) {
        var masterNodeList = nodeList || [el], indexMap = [], afterPreviousEvents = false, isTornDown = false, add = function (ev, items, index) {
                if (!afterPreviousEvents) {
                    return;
                }
                var frag = text.ownerDocument.createDocumentFragment(), newNodeLists = [], newIndicies = [];
                can.each(items, function (item, key) {
                    var itemIndex = can.compute(key + index), itemFrag = renderAndAddToNodeLists(newNodeLists, nodeList, render, context, [
                            item,
                            itemIndex
                        ]);
                    frag.appendChild(itemFrag);
                    newIndicies.push(itemIndex);
                });
                var masterListIndex = index + 1;
                if (!indexMap.length) {
                    var falseyItemsToRemove = removeFromNodeList(masterNodeList, 0, masterNodeList.length - 1);
                    can.remove(can.$(falseyItemsToRemove));
                }
                if (!masterNodeList[masterListIndex]) {
                    elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                } else {
                    var el = nodeLists.first(masterNodeList[masterListIndex]);
                    can.insertBefore(el.parentNode, frag, el);
                }
                splice.apply(masterNodeList, [
                    masterListIndex,
                    0
                ].concat(newNodeLists));
                splice.apply(indexMap, [
                    index,
                    0
                ].concat(newIndicies));
                for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                    indexMap[i](i);
                }
                if (ev.callChildMutationCallback !== false) {
                    live.callChildMutationCallback(text.parentNode);
                }
            }, set = function (ev, newVal, index) {
                remove({}, { length: 1 }, index, true);
                add({}, [newVal], index);
            }, remove = function (ev, items, index, duringTeardown, fullTeardown) {
                if (!afterPreviousEvents) {
                    return;
                }
                if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                    return;
                }
                if (index < 0) {
                    index = indexMap.length + index;
                }
                var itemsToRemove = removeFromNodeList(masterNodeList, index, items.length);
                indexMap.splice(index, items.length);
                for (var i = index, len = indexMap.length; i < len; i++) {
                    indexMap[i](i);
                }
                if (!fullTeardown) {
                    addFalseyIfEmpty(list, falseyRender, masterNodeList, nodeList);
                    can.remove(can.$(itemsToRemove));
                    if (ev.callChildMutationCallback !== false) {
                        live.callChildMutationCallback(text.parentNode);
                    }
                } else {
                    nodeLists.unregister(masterNodeList);
                }
            }, move = function (ev, item, newIndex, currentIndex) {
                if (!afterPreviousEvents) {
                    return;
                }
                newIndex = newIndex + 1;
                currentIndex = currentIndex + 1;
                var referenceNodeList = masterNodeList[newIndex];
                var movedElements = can.frag(nodeLists.flatten(masterNodeList[currentIndex]));
                var referenceElement;
                if (currentIndex < newIndex) {
                    referenceElement = nodeLists.last(referenceNodeList).nextSibling;
                } else {
                    referenceElement = nodeLists.first(referenceNodeList);
                }
                var parentNode = masterNodeList[0].parentNode;
                parentNode.insertBefore(movedElements, referenceElement);
                var temp = masterNodeList[currentIndex];
                [].splice.apply(masterNodeList, [
                    currentIndex,
                    1
                ]);
                [].splice.apply(masterNodeList, [
                    newIndex,
                    0,
                    temp
                ]);
                newIndex = newIndex - 1;
                currentIndex = currentIndex - 1;
                var indexCompute = indexMap[currentIndex];
                [].splice.apply(indexMap, [
                    currentIndex,
                    1
                ]);
                [].splice.apply(indexMap, [
                    newIndex,
                    0,
                    indexCompute
                ]);
                var i = Math.min(currentIndex, newIndex);
                var len = indexMap.length;
                for (i, len; i < len; i++) {
                    indexMap[i](i);
                }
                if (ev.callChildMutationCallback !== false) {
                    live.callChildMutationCallback(text.parentNode);
                }
            }, text = el.ownerDocument.createTextNode(''), list, teardownList = function (fullTeardown) {
                if (list && list.unbind) {
                    list.unbind('add', add).unbind('set', set).unbind('remove', remove).unbind('move', move);
                }
                remove({ callChildMutationCallback: !!fullTeardown }, { length: masterNodeList.length - 1 }, 0, true, fullTeardown);
            }, updateList = function (ev, newList, oldList) {
                if (isTornDown) {
                    return;
                }
                afterPreviousEvents = true;
                if (newList && oldList) {
                    list = newList || [];
                    var patches = diff(oldList, newList);
                    if (oldList.unbind) {
                        oldList.unbind('add', add).unbind('set', set).unbind('remove', remove).unbind('move', move);
                    }
                    for (var i = 0, patchLen = patches.length; i < patchLen; i++) {
                        var patch = patches[i];
                        if (patch.deleteCount) {
                            remove({ callChildMutationCallback: false }, { length: patch.deleteCount }, patch.index, true);
                        }
                        if (patch.insert.length) {
                            add({ callChildMutationCallback: false }, patch.insert, patch.index);
                        }
                    }
                } else {
                    if (oldList) {
                        teardownList();
                    }
                    list = newList || [];
                    add({ callChildMutationCallback: false }, list, 0);
                    addFalseyIfEmpty(list, falseyRender, masterNodeList, nodeList);
                }
                live.callChildMutationCallback(text.parentNode);
                afterPreviousEvents = false;
                if (list.bind) {
                    list.bind('add', add).bind('set', set).bind('remove', remove).bind('move', move);
                }
                can.batch.afterPreviousEvents(function () {
                    afterPreviousEvents = true;
                });
            };
        parentNode = elements.getParentNode(el, parentNode);
        var data = setup(parentNode, function () {
            if (can.isFunction(compute)) {
                compute.bind('change', updateList);
            }
        }, function () {
            if (can.isFunction(compute)) {
                compute.unbind('change', updateList);
            }
            teardownList(true);
        });
        if (!nodeList) {
            live.replace(masterNodeList, text, data.teardownCheck);
        } else {
            elements.replace(masterNodeList, text);
            nodeLists.update(masterNodeList, [text]);
            nodeList.unregistered = function () {
                data.teardownCheck();
                isTornDown = true;
            };
        }
        updateList({}, can.isFunction(compute) ? compute() : compute);
    },
    html: function (el, compute, parentNode, nodeList) {
        var data;
        parentNode = elements.getParentNode(el, parentNode);
        data = listen(parentNode, compute, function (ev, newVal, oldVal) {
            var attached = nodeLists.first(nodes).parentNode;
            if (attached) {
                makeAndPut(newVal);
            }
            var pn = nodeLists.first(nodes).parentNode;
            data.teardownCheck(pn);
            live.callChildMutationCallback(pn);
        });
        var nodes = nodeList || [el], makeAndPut = function (val) {
                var isFunction = typeof val === 'function', aNode = isNode(val), frag = can.frag(isFunction ? '' : val), oldNodes = can.makeArray(nodes);
                addTextNodeIfNoChildren(frag);
                if (!aNode && !isFunction) {
                    frag = can.view.hookup(frag, parentNode);
                }
                oldNodes = nodeLists.update(nodes, getChildNodes(frag));
                if (isFunction) {
                    val(frag.firstChild);
                }
                elements.replace(oldNodes, frag);
            };
        data.nodeList = nodes;
        if (!nodeList) {
            nodeLists.register(nodes, data.teardownCheck);
        } else {
            nodeList.unregistered = data.teardownCheck;
        }
        makeAndPut(compute());
    },
    replace: function (nodes, val, teardown) {
        var oldNodes = nodes.slice(0), frag = can.frag(val);
        nodeLists.register(nodes, teardown);
        if (typeof val === 'string') {
            frag = can.view.hookup(frag, nodes[0].parentNode);
        }
        nodeLists.update(nodes, getChildNodes(frag));
        elements.replace(oldNodes, frag);
        return nodes;
    },
    text: function (el, compute, parentNode, nodeList) {
        var parent = elements.getParentNode(el, parentNode);
        var data = listen(parent, compute, function (ev, newVal, oldVal) {
            if (typeof node.nodeValue !== 'unknown') {
                node.nodeValue = can.view.toStr(newVal);
            }
            data.teardownCheck(node.parentNode);
        });
        var node = el.ownerDocument.createTextNode(can.view.toStr(compute()));
        if (nodeList) {
            nodeList.unregistered = data.teardownCheck;
            data.nodeList = nodeList;
            nodeLists.update(nodeList, [node]);
            elements.replace([el], node);
        } else {
            data.nodeList = live.replace([el], node, data.teardownCheck);
        }
    },
    setAttributes: function (el, newVal) {
        var attrs = getAttributeParts(newVal);
        for (var name in attrs) {
            can.attr.set(el, name, attrs[name]);
        }
    },
    attributes: function (el, compute, currentValue) {
        var oldAttrs = {};
        var setAttrs = function (newVal) {
            var newAttrs = getAttributeParts(newVal), name;
            for (name in newAttrs) {
                var newValue = newAttrs[name], oldValue = oldAttrs[name];
                if (newValue !== oldValue) {
                    can.attr.set(el, name, newValue);
                }
                delete oldAttrs[name];
            }
            for (name in oldAttrs) {
                elements.removeAttr(el, name);
            }
            oldAttrs = newAttrs;
        };
        listen(el, compute, function (ev, newVal) {
            setAttrs(newVal);
        });
        if (arguments.length >= 3) {
            oldAttrs = getAttributeParts(currentValue);
        } else {
            setAttrs(compute());
        }
    },
    attributePlaceholder: '__!!__',
    attributeReplace: /__!!__/g,
    attribute: function (el, attributeName, compute) {
        listen(el, compute, function (ev, newVal) {
            elements.setAttr(el, attributeName, hook.render());
        });
        var wrapped = can.$(el), hooks;
        hooks = can.data(wrapped, 'hooks');
        if (!hooks) {
            can.data(wrapped, 'hooks', hooks = {});
        }
        var attr = String(elements.getAttr(el, attributeName)), parts = attr.split(live.attributePlaceholder), goodParts = [], hook;
        goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
        if (hooks[attributeName]) {
            hooks[attributeName].computes.push(compute);
        } else {
            hooks[attributeName] = {
                render: function () {
                    var i = 0, newAttr = attr ? attr.replace(live.attributeReplace, function () {
                            return elements.contentText(hook.computes[i++]());
                        }) : elements.contentText(hook.computes[i++]());
                    return newAttr;
                },
                computes: [compute],
                batchNum: undefined
            };
        }
        hook = hooks[attributeName];
        goodParts.splice(1, 0, compute());
        elements.setAttr(el, attributeName, goodParts.join(''));
    },
    specialAttribute: function (el, attributeName, compute) {
        listen(el, compute, function (ev, newVal) {
            elements.setAttr(el, attributeName, getValue(newVal));
        });
        elements.setAttr(el, attributeName, getValue(compute()));
    },
    simpleAttribute: function (el, attributeName, compute) {
        listen(el, compute, function (ev, newVal) {
            elements.setAttr(el, attributeName, newVal);
        });
        elements.setAttr(el, attributeName, compute());
    }
};
live.attr = live.simpleAttribute;
live.attrs = live.attributes;
live.getAttributeParts = getAttributeParts;
var newLine = /(\r|\n)+/g;
var getValue = function (val) {
    var regexp = /^["'].*["']$/;
    val = val.replace(elements.attrReg, '').replace(newLine, '');
    return regexp.test(val) ? val.substr(1, val.length - 2) : val;
};
can.view.live = live;
module.exports = live;
},{"../../util/array/diff.js":14,"../../util/util.js":26,"../elements.js":29,"../node_lists/node_lists.js":33,"../parser/parser.js":34,"../view.js":47}],33:[function(require,module,exports){
/*can@2.3.22#view/node_lists/node_lists*/
var can = require('../../util/util.js');
require('../elements.js');
var canExpando = true;
try {
    document.createTextNode('')._ = 0;
} catch (ex) {
    canExpando = false;
}
var nodeMap = {}, textNodeMap = {}, expando = 'ejs_' + Math.random(), _id = 0, id = function (node, localMap) {
        var _textNodeMap = localMap || textNodeMap;
        var id = readId(node, _textNodeMap);
        if (id) {
            return id;
        } else {
            if (canExpando || node.nodeType !== 3) {
                ++_id;
                return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
            } else {
                ++_id;
                _textNodeMap['text_' + _id] = node;
                return 'text_' + _id;
            }
        }
    }, readId = function (node, textNodeMap) {
        if (canExpando || node.nodeType !== 3) {
            return node[expando];
        } else {
            for (var textNodeID in textNodeMap) {
                if (textNodeMap[textNodeID] === node) {
                    return textNodeID;
                }
            }
        }
    }, splice = [].splice, push = [].push, itemsInChildListTree = function (list) {
        var count = 0;
        for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            if (item.nodeType) {
                count++;
            } else {
                count += itemsInChildListTree(item);
            }
        }
        return count;
    }, replacementMap = function (replacements, idMap) {
        var map = {};
        for (var i = 0, len = replacements.length; i < len; i++) {
            var node = nodeLists.first(replacements[i]);
            map[id(node, idMap)] = replacements[i];
        }
        return map;
    }, addUnfoundAsDeepChildren = function (list, rMap, foundIds) {
        for (var repId in rMap) {
            if (!foundIds[repId]) {
                list.newDeepChildren.push(rMap[repId]);
            }
        }
    };
var nodeLists = {
    id: id,
    update: function (nodeList, newNodes) {
        var oldNodes = nodeLists.unregisterChildren(nodeList);
        newNodes = can.makeArray(newNodes);
        var oldListLength = nodeList.length;
        splice.apply(nodeList, [
            0,
            oldListLength
        ].concat(newNodes));
        if (nodeList.replacements) {
            nodeLists.nestReplacements(nodeList);
            nodeList.deepChildren = nodeList.newDeepChildren;
            nodeList.newDeepChildren = [];
        } else {
            nodeLists.nestList(nodeList);
        }
        return oldNodes;
    },
    nestReplacements: function (list) {
        var index = 0, idMap = {}, rMap = replacementMap(list.replacements, idMap), rCount = list.replacements.length, foundIds = {};
        while (index < list.length && rCount) {
            var node = list[index], nodeId = readId(node, idMap), replacement = rMap[nodeId];
            if (replacement) {
                list.splice(index, itemsInChildListTree(replacement), replacement);
                foundIds[nodeId] = true;
                rCount--;
            }
            index++;
        }
        if (rCount) {
            addUnfoundAsDeepChildren(list, rMap, foundIds);
        }
        list.replacements = [];
    },
    nestList: function (list) {
        var index = 0;
        while (index < list.length) {
            var node = list[index], childNodeList = nodeMap[id(node)];
            if (childNodeList) {
                if (childNodeList !== list) {
                    list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                }
            } else {
                nodeMap[id(node)] = list;
            }
            index++;
        }
    },
    last: function (nodeList) {
        var last = nodeList[nodeList.length - 1];
        if (last.nodeType) {
            return last;
        } else {
            return nodeLists.last(last);
        }
    },
    first: function (nodeList) {
        var first = nodeList[0];
        if (first.nodeType) {
            return first;
        } else {
            return nodeLists.first(first);
        }
    },
    flatten: function (nodeList) {
        var items = [];
        for (var i = 0; i < nodeList.length; i++) {
            var item = nodeList[i];
            if (item.nodeType) {
                items.push(item);
            } else {
                items.push.apply(items, nodeLists.flatten(item));
            }
        }
        return items;
    },
    register: function (nodeList, unregistered, parent, directlyNested) {
        can.cid(nodeList);
        nodeList.unregistered = unregistered;
        nodeList.parentList = parent;
        nodeList.nesting = parent && typeof parent.nesting !== 'undefined' ? parent.nesting + 1 : 0;
        if (parent) {
            nodeList.deepChildren = [];
            nodeList.newDeepChildren = [];
            nodeList.replacements = [];
            if (parent !== true) {
                if (directlyNested) {
                    parent.replacements.push(nodeList);
                } else {
                    parent.newDeepChildren.push(nodeList);
                }
            }
        } else {
            nodeLists.nestList(nodeList);
        }
        return nodeList;
    },
    unregisterChildren: function (nodeList) {
        var nodes = [];
        can.each(nodeList, function (node) {
            if (node.nodeType) {
                if (!nodeList.replacements) {
                    delete nodeMap[id(node)];
                }
                nodes.push(node);
            } else {
                push.apply(nodes, nodeLists.unregister(node, true));
            }
        });
        can.each(nodeList.deepChildren, function (nodeList) {
            nodeLists.unregister(nodeList, true);
        });
        return nodes;
    },
    unregister: function (nodeList, isChild) {
        var nodes = nodeLists.unregisterChildren(nodeList, true);
        if (nodeList.unregistered) {
            var unregisteredCallback = nodeList.unregistered;
            nodeList.replacements = nodeList.unregistered = null;
            if (!isChild) {
                var deepChildren = nodeList.parentList && nodeList.parentList.deepChildren;
                if (deepChildren) {
                    var index = deepChildren.indexOf(nodeList);
                    if (index !== -1) {
                        deepChildren.splice(index, 1);
                    }
                }
            }
            unregisteredCallback();
        }
        return nodes;
    },
    nodeMap: nodeMap
};
can.view.nodeLists = nodeLists;
module.exports = nodeLists;
},{"../../util/util.js":26,"../elements.js":29}],34:[function(require,module,exports){
/*can@2.3.22#view/parser/parser*/
function each(items, callback) {
    for (var i = 0; i < items.length; i++) {
        callback(items[i], i);
    }
}
function makeMap(str) {
    var obj = {}, items = str.split(',');
    each(items, function (name) {
        obj[name] = true;
    });
    return obj;
}
function handleIntermediate(intermediate, handler) {
    for (var i = 0, len = intermediate.length; i < len; i++) {
        var item = intermediate[i];
        handler[item.tokenType].apply(handler, item.args);
    }
    return intermediate;
}
var alphaNumeric = 'A-Za-z0-9', alphaNumericHU = '-:_' + alphaNumeric, attributeNames = '[^=>\\s\\/]+', spaceEQspace = '\\s*=\\s*', singleCurly = '\\{[^\\}\\{]\\}', doubleCurly = '\\{\\{[^\\}]\\}\\}\\}?', attributeEqAndValue = '(?:' + spaceEQspace + '(?:' + '(?:' + doubleCurly + ')|(?:' + singleCurly + ')|(?:"[^"]*")|(?:\'[^\']*\')|[^>\\s]+))?', matchStash = '\\{\\{[^\\}]*\\}\\}\\}?', stash = '\\{\\{([^\\}]*)\\}\\}\\}?', startTag = new RegExp('^<([' + alphaNumeric + '][' + alphaNumericHU + ']*)' + '(' + '(?:\\s*' + '(?:(?:' + '(?:' + attributeNames + ')?' + attributeEqAndValue + ')|' + '(?:' + matchStash + ')+)' + ')*' + ')\\s*(\\/?)>'), endTag = new RegExp('^<\\/([' + alphaNumericHU + ']+)[^>]*>'), mustache = new RegExp(stash, 'g'), txtBreak = /<|\{\{/, space = /\s/;
var empty = makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed');
var block = makeMap('a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video');
var inline = makeMap('a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var');
var closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');
var special = makeMap('script');
var tokenTypes = 'start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done'.split(',');
var fn = function () {
};
var HTMLParser = function (html, handler, returnIntermediate) {
    if (typeof html === 'object') {
        return handleIntermediate(html, handler);
    }
    var intermediate = [];
    handler = handler || {};
    if (returnIntermediate) {
        each(tokenTypes, function (name) {
            var callback = handler[name] || fn;
            handler[name] = function () {
                if (callback.apply(this, arguments) !== false) {
                    intermediate.push({
                        tokenType: name,
                        args: [].slice.call(arguments, 0)
                    });
                }
            };
        });
    }
    function parseStartTag(tag, tagName, rest, unary) {
        tagName = tagName.toLowerCase();
        if (block[tagName] && !inline[tagName]) {
            var last = stack.last();
            while (last && inline[last] && !block[last]) {
                parseEndTag('', last);
                last = stack.last();
            }
        }
        if (closeSelf[tagName] && stack.last() === tagName) {
            parseEndTag('', tagName);
        }
        unary = empty[tagName] || !!unary;
        handler.start(tagName, unary);
        if (!unary) {
            stack.push(tagName);
        }
        HTMLParser.parseAttrs(rest, handler);
        handler.end(tagName, unary);
    }
    function parseEndTag(tag, tagName) {
        var pos;
        if (!tagName) {
            pos = 0;
        } else {
            tagName = tagName.toLowerCase();
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos] === tagName) {
                    break;
                }
            }
        }
        if (pos >= 0) {
            for (var i = stack.length - 1; i >= pos; i--) {
                if (handler.close) {
                    handler.close(stack[i]);
                }
            }
            stack.length = pos;
        }
    }
    function parseMustache(mustache, inside) {
        if (handler.special) {
            handler.special(inside);
        }
    }
    var callChars = function () {
        if (charsText) {
            if (handler.chars) {
                handler.chars(charsText);
            }
        }
        charsText = '';
    };
    var index, chars, match, stack = [], last = html, charsText = '';
    stack.last = function () {
        return this[this.length - 1];
    };
    while (html) {
        chars = true;
        if (!stack.last() || !special[stack.last()]) {
            if (html.indexOf('<!--') === 0) {
                index = html.indexOf('-->');
                if (index >= 0) {
                    callChars();
                    if (handler.comment) {
                        handler.comment(html.substring(4, index));
                    }
                    html = html.substring(index + 3);
                    chars = false;
                }
            } else if (html.indexOf('</') === 0) {
                match = html.match(endTag);
                if (match) {
                    callChars();
                    html = html.substring(match[0].length);
                    match[0].replace(endTag, parseEndTag);
                    chars = false;
                }
            } else if (html.indexOf('<') === 0) {
                match = html.match(startTag);
                if (match) {
                    callChars();
                    html = html.substring(match[0].length);
                    match[0].replace(startTag, parseStartTag);
                    chars = false;
                }
            } else if (html.indexOf('{{') === 0) {
                match = html.match(mustache);
                if (match) {
                    callChars();
                    html = html.substring(match[0].length);
                    match[0].replace(mustache, parseMustache);
                }
            }
            if (chars) {
                index = html.search(txtBreak);
                if (index === 0 && html === last) {
                    charsText += html.charAt(0);
                    html = html.substr(1);
                    index = html.search(txtBreak);
                }
                var text = index < 0 ? html : html.substring(0, index);
                html = index < 0 ? '' : html.substring(index);
                if (text) {
                    charsText += text;
                }
            }
        } else {
            html = html.replace(new RegExp('([\\s\\S]*?)</' + stack.last() + '[^>]*>'), function (all, text) {
                text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2');
                if (handler.chars) {
                    handler.chars(text);
                }
                return '';
            });
            parseEndTag('', stack.last());
        }
        if (html === last) {
            throw new Error('Parse Error: ' + html);
        }
        last = html;
    }
    callChars();
    parseEndTag();
    handler.done();
    return intermediate;
};
var callAttrStart = function (state, curIndex, handler, rest) {
    state.attrStart = rest.substring(typeof state.nameStart === 'number' ? state.nameStart : curIndex, curIndex);
    handler.attrStart(state.attrStart);
    state.inName = false;
};
var callAttrEnd = function (state, curIndex, handler, rest) {
    if (state.valueStart !== undefined && state.valueStart < curIndex) {
        handler.attrValue(rest.substring(state.valueStart, curIndex));
    } else if (!state.inValue) {
    }
    handler.attrEnd(state.attrStart);
    state.attrStart = undefined;
    state.valueStart = undefined;
    state.inValue = false;
    state.inName = false;
    state.lookingForEq = false;
    state.inQuote = false;
    state.lookingForName = true;
};
HTMLParser.parseAttrs = function (rest, handler) {
    if (!rest) {
        return;
    }
    var i = 0;
    var curIndex;
    var state = {
        inDoubleCurly: false,
        inName: false,
        nameStart: undefined,
        inValue: false,
        valueStart: undefined,
        inQuote: false,
        attrStart: undefined,
        lookingForName: true,
        lookingForValue: false,
        lookingForEq: false
    };
    while (i < rest.length) {
        curIndex = i;
        var cur = rest.charAt(i);
        var next = rest.charAt(i + 1);
        var nextNext = rest.charAt(i + 2);
        i++;
        if (cur === '{' && next === '{') {
            if (state.inValue && curIndex > state.valueStart) {
                handler.attrValue(rest.substring(state.valueStart, curIndex));
            } else if (state.inName && state.nameStart < curIndex) {
                callAttrStart(state, curIndex, handler, rest);
                callAttrEnd(state, curIndex, handler, rest);
            } else if (state.lookingForValue) {
                state.inValue = true;
            } else if (state.lookingForEq && state.attrStart) {
                callAttrEnd(state, curIndex, handler, rest);
            }
            state.inDoubleCurly = true;
            state.doubleCurlyStart = curIndex + 2;
            i++;
        } else if (state.inDoubleCurly) {
            if (cur === '}' && next === '}') {
                var isTriple = nextNext === '}' ? 1 : 0;
                handler.special(rest.substring(state.doubleCurlyStart, curIndex));
                state.inDoubleCurly = false;
                if (state.inValue) {
                    state.valueStart = curIndex + 2 + isTriple;
                }
                i += 1 + isTriple;
            }
        } else if (state.inValue) {
            if (state.inQuote) {
                if (cur === state.inQuote) {
                    callAttrEnd(state, curIndex, handler, rest);
                }
            } else if (space.test(cur)) {
                callAttrEnd(state, curIndex, handler, rest);
            }
        } else if (cur === '=' && (state.lookingForEq || state.lookingForName || state.inName)) {
            if (!state.attrStart) {
                callAttrStart(state, curIndex, handler, rest);
            }
            state.lookingForValue = true;
            state.lookingForEq = false;
            state.lookingForName = false;
        } else if (state.inName) {
            if (space.test(cur)) {
                callAttrStart(state, curIndex, handler, rest);
                state.lookingForEq = true;
            }
        } else if (state.lookingForName) {
            if (!space.test(cur)) {
                if (state.attrStart) {
                    callAttrEnd(state, curIndex, handler, rest);
                }
                state.nameStart = curIndex;
                state.inName = true;
            }
        } else if (state.lookingForValue) {
            if (!space.test(cur)) {
                state.lookingForValue = false;
                state.inValue = true;
                if (cur === '\'' || cur === '"') {
                    state.inQuote = cur;
                    state.valueStart = curIndex + 1;
                } else {
                    state.valueStart = curIndex;
                }
            }
        }
    }
    if (state.inName) {
        callAttrStart(state, curIndex + 1, handler, rest);
        callAttrEnd(state, curIndex + 1, handler, rest);
    } else if (state.lookingForEq) {
        callAttrEnd(state, curIndex + 1, handler, rest);
    } else if (state.inValue) {
        callAttrEnd(state, curIndex + 1, handler, rest);
    }
};
module.exports = HTMLParser;
},{}],35:[function(require,module,exports){
/*can@2.3.22#view/scope/compute_data*/
var can = require('../../util/util.js');
var compute = require('../../compute/compute.js');
var ObservedInfo = require('../../compute/get_value_and_bind.js');
var isFastPath = function (computeData) {
    return computeData.reads && computeData.reads.length === 1 && computeData.root instanceof can.Map && !can.isFunction(computeData.root[computeData.reads[0].key]);
};
var scopeReader = function (scope, key, options, computeData, newVal) {
    if (arguments.length > 4) {
        var root = computeData.root || computeData.setRoot;
        if (root) {
            if (root.isComputed) {
                root(newVal);
            } else if (computeData.reads.length) {
                var last = computeData.reads.length - 1;
                var obj = computeData.reads.length ? can.compute.read(root, computeData.reads.slice(0, last)).value : root;
                can.compute.set(obj, computeData.reads[last].key, newVal, options);
            }
        } else {
        }
    } else {
        if (computeData.root) {
            return can.compute.read(computeData.root, computeData.reads, options).value;
        }
        var data = scope.read(key, options);
        computeData.scope = data.scope;
        computeData.initialValue = data.value;
        computeData.reads = data.reads;
        computeData.root = data.rootObserve;
        computeData.setRoot = data.setRoot;
        return data.value;
    }
};
module.exports = function (scope, key, options) {
    options = options || { args: [] };
    var computeData = {}, scopeRead = function (newVal) {
            if (arguments.length) {
                return scopeReader(scope, key, options, computeData, newVal);
            } else {
                return scopeReader(scope, key, options, computeData);
            }
        }, compute = can.compute(undefined, {
            on: function () {
                readInfo.getValueAndBind();
                if (isFastPath(computeData)) {
                    readInfo.dependencyChange = function (ev, newVal) {
                        if (typeof newVal !== 'function') {
                            this.newVal = newVal;
                        } else {
                            readInfo.dependencyChange = ObservedInfo.prototype.dependencyChange;
                            readInfo.getValueAndBind = ObservedInfo.prototype.getValueAndBind;
                        }
                        return ObservedInfo.prototype.dependencyChange.call(this, ev);
                    };
                    readInfo.getValueAndBind = function () {
                        this.value = this.newVal;
                    };
                }
                compute.computeInstance.value = readInfo.value;
                compute.computeInstance.hasDependencies = !can.isEmptyObject(readInfo.newObserved);
            },
            off: function () {
                readInfo.dependencyChange = ObservedInfo.prototype.dependencyChange;
                readInfo.getValueAndBind = ObservedInfo.prototype.getValueAndBind;
                readInfo.teardown();
            },
            set: scopeRead,
            get: scopeRead,
            __selfUpdater: true
        }), readInfo = new ObservedInfo(scopeRead, null, compute.computeInstance);
    computeData.compute = compute;
    return computeData;
};
},{"../../compute/compute.js":4,"../../compute/get_value_and_bind.js":5,"../../util/util.js":26}],36:[function(require,module,exports){
/*can@2.3.22#view/scope/scope*/
var can = require('../../util/util.js');
var makeComputeData = require('./compute_data.js');
require('../../construct/construct.js');
require('../../map/map.js');
require('../../list/list.js');
require('../view.js');
require('../../compute/compute.js');
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
module.exports = Scope;
},{"../../compute/compute.js":4,"../../construct/construct.js":8,"../../list/list.js":10,"../../map/map.js":12,"../../util/util.js":26,"../view.js":47,"./compute_data.js":35}],37:[function(require,module,exports){
/*can@2.3.22#view/stache/expression*/
var can = require('../../util/util.js');
var utils = require('./utils.js');
var mustacheHelpers = require('./mustache_helpers.js');
var Scope = require('../scope/scope.js');
var getKeyComputeData = function (key, scope, readOptions) {
        var data = scope.computeData(key, readOptions);
        can.compute.temporarilyBind(data.compute);
        return data;
    }, lookupValue = function (key, scope, helperOptions, readOptions) {
        var computeData = getKeyComputeData(key, scope, readOptions);
        if (!computeData.compute.computeInstance.hasDependencies) {
            return {
                value: computeData.initialValue,
                computeData: computeData
            };
        } else {
            return {
                value: computeData.compute,
                computeData: computeData
            };
        }
    }, lookupValueOrHelper = function (key, scope, helperOptions, readOptions) {
        var res = lookupValue(key, scope, helperOptions, readOptions);
        if (res.computeData.initialValue === undefined) {
            if (key.charAt(0) === '@' && key !== '@index') {
                key = key.substr(1);
            }
            var helper = mustacheHelpers.getHelper(key, helperOptions);
            res.helper = helper && helper.fn;
        }
        return res;
    }, convertToArgExpression = function (expr) {
        if (!(expr instanceof Arg) && !(expr instanceof Literal) && !(expr instanceof Hashes)) {
            return new Arg(expr);
        } else {
            return expr;
        }
    };
var Literal = function (value) {
    this._value = value;
};
Literal.prototype.value = function () {
    return this._value;
};
var Lookup = function (key, root) {
    this.key = key;
    this.rootExpr = root;
};
Lookup.prototype.value = function (scope, helperOptions) {
    var result = lookupValueOrHelper(this.key, scope, helperOptions);
    this.isHelper = result.helper && !result.helper.callAsMethod;
    return result.helper || result.value;
};
var ScopeLookup = function (key, root) {
    Lookup.apply(this, arguments);
};
ScopeLookup.prototype.value = function (scope, helperOptions) {
    return lookupValue(this.key, scope, helperOptions).value;
};
var Arg = function (expression, modifiers) {
    this.expr = expression;
    this.modifiers = modifiers || {};
    this.isCompute = false;
};
Arg.prototype.value = function () {
    return this.expr.value.apply(this.expr, arguments);
};
var Hashes = function (hashExpressions) {
    this.hashExprs = hashExpressions;
};
Hashes.prototype.value = function () {
    var hash = {};
    for (var prop in this.hashExprs) {
        var val = this.hashExprs[prop], value = val.value.apply(val, arguments);
        hash[prop] = {
            call: value && value.isComputed && (!val.modifiers || !val.modifiers.compute),
            value: value
        };
    }
    return can.compute(function () {
        var finalHash = {};
        for (var prop in hash) {
            finalHash[prop] = hash[prop].call ? hash[prop].value() : hash[prop].value;
        }
        return finalHash;
    });
};
var Call = function (methodExpression, argExpressions, hashes) {
    if (hashes && !can.isEmptyObject(hashes)) {
        argExpressions.push(new Hashes(hashes));
    }
    this.methodExpr = methodExpression;
    this.argExprs = can.map(argExpressions, convertToArgExpression);
};
Call.prototype.args = function (scope, helperOptions) {
    var args = [];
    for (var i = 0, len = this.argExprs.length; i < len; i++) {
        var arg = this.argExprs[i];
        var value = arg.value.apply(arg, arguments);
        args.push({
            call: value && value.isComputed && (!arg.modifiers || !arg.modifiers.compute),
            value: value
        });
    }
    return function () {
        var finalArgs = [];
        for (var i = 0, len = args.length; i < len; i++) {
            finalArgs[i] = args[i].call ? args[i].value() : args[i].value;
        }
        return finalArgs;
    };
};
Call.prototype.value = function (scope, helperScope, helperOptions) {
    var method = this.methodExpr.value(scope, helperScope);
    this.isHelper = this.methodExpr.isHelper;
    var getArgs = this.args(scope, helperScope);
    return can.compute(function (newVal) {
        var func = method;
        if (func && func.isComputed) {
            func = func();
        }
        if (typeof func === 'function') {
            var args = getArgs();
            if (helperOptions) {
                args.push(helperOptions);
            }
            if (arguments.length) {
                args.unshift(new expression.SetIdentifier(newVal));
            }
            return func.apply(null, args);
        }
    });
};
var HelperLookup = function () {
    Lookup.apply(this, arguments);
};
HelperLookup.prototype.value = function (scope, helperOptions) {
    var result = lookupValueOrHelper(this.key, scope, helperOptions, {
        isArgument: true,
        args: [
            scope.attr('.'),
            scope
        ]
    });
    return result.helper || result.value;
};
var HelperScopeLookup = function () {
    Lookup.apply(this, arguments);
};
HelperScopeLookup.prototype.value = function (scope, helperOptions) {
    return lookupValue(this.key, scope, helperOptions, {
        callMethodsOnObservables: true,
        isArgument: true,
        args: [
            scope.attr('.'),
            scope
        ]
    }).value;
};
var Helper = function (methodExpression, argExpressions, hashExpressions) {
    this.methodExpr = methodExpression;
    this.argExprs = argExpressions;
    this.hashExprs = hashExpressions;
    this.mode = null;
};
Helper.prototype.args = function (scope, helperOptions) {
    var args = [];
    for (var i = 0, len = this.argExprs.length; i < len; i++) {
        var arg = this.argExprs[i];
        args.push(arg.value.apply(arg, arguments));
    }
    return args;
};
Helper.prototype.hash = function (scope, helperOptions) {
    var hash = {};
    for (var prop in this.hashExprs) {
        var val = this.hashExprs[prop];
        hash[prop] = val.value.apply(val, arguments);
    }
    return hash;
};
Helper.prototype.helperAndValue = function (scope, helperOptions) {
    var looksLikeAHelper = this.argExprs.length || !can.isEmptyObject(this.hashExprs), helper, value, methodKey = this.methodExpr instanceof Literal ? '' + this.methodExpr._value : this.methodExpr.key, initialValue, args;
    if (looksLikeAHelper) {
        helper = mustacheHelpers.getHelper(methodKey, helperOptions);
        var context = scope.attr('.');
        if (!helper && typeof context[methodKey] === 'function') {
            helper = { fn: context[methodKey] };
        }
    }
    if (!helper) {
        args = this.args(scope, helperOptions);
        var computeData = getKeyComputeData(methodKey, scope, {
                isArgument: false,
                args: args && args.length ? args : [
                    scope.attr('.'),
                    scope
                ]
            }), compute = computeData.compute;
        initialValue = computeData.initialValue;
        if (computeData.compute.computeInstance.hasDependencies) {
            value = compute;
        } else {
            value = initialValue;
        }
        if (!looksLikeAHelper && initialValue === undefined) {
            helper = mustacheHelpers.getHelper(methodKey, helperOptions);
        }
    }
    return {
        value: value,
        args: args,
        helper: helper && helper.fn
    };
};
Helper.prototype.evaluator = function (helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly) {
    var helperOptionArg = {
            fn: function () {
            },
            inverse: function () {
            }
        }, context = scope.attr('.'), args = this.args(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly), hash = this.hash(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
    utils.convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer);
    can.simpleExtend(helperOptionArg, {
        context: context,
        scope: scope,
        contexts: scope,
        hash: hash,
        nodeList: nodeList,
        exprData: this,
        helperOptions: helperOptions,
        helpers: helperOptions
    });
    args.push(helperOptionArg);
    return function () {
        return helper.apply(context, args);
    };
};
Helper.prototype.value = function (scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly) {
    var helperAndValue = this.helperAndValue(scope, helperOptions);
    var helper = helperAndValue.helper;
    if (!helper) {
        return helperAndValue.value;
    }
    var fn = this.evaluator(helper, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
    var compute = can.compute(fn);
    can.compute.temporarilyBind(compute);
    if (!compute.computeInstance.hasDependencies) {
        return compute();
    } else {
        return compute;
    }
};
var keyRegExp = /[\w\.\\\-_@\/\&%]+/, tokensRegExp = /('.*?'|".*?"|=|[\w\.\\\-_@\/*%\$]+|[\(\)]|,|\~)/g, literalRegExp = /^('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)$/;
var isTokenKey = function (token) {
    return keyRegExp.test(token);
};
var testDot = /^[\.@]\w/;
var isAddingToExpression = function (token) {
    return isTokenKey(token) && testDot.test(token);
};
var ensureChildren = function (type) {
    if (!type.children) {
        type.children = [];
    }
    return type;
};
var Stack = function () {
    this.root = {
        children: [],
        type: 'Root'
    };
    this.current = this.root;
    this.stack = [this.root];
};
can.simpleExtend(Stack.prototype, {
    top: function () {
        return can.last(this.stack);
    },
    isRootTop: function () {
        return this.top() === this.root;
    },
    popTo: function (types) {
        this.popUntil(types);
        if (!this.isRootTop()) {
            this.stack.pop();
        }
    },
    firstParent: function (types) {
        var curIndex = this.stack.length - 2;
        while (curIndex > 0 && can.inArray(this.stack[curIndex].type, types) === -1) {
            curIndex--;
        }
        return this.stack[curIndex];
    },
    popUntil: function (types) {
        while (can.inArray(this.top().type, types) === -1 && !this.isRootTop()) {
            this.stack.pop();
        }
        return this.top();
    },
    addTo: function (types, type) {
        var cur = this.popUntil(types);
        ensureChildren(cur).children.push(type);
    },
    addToAndPush: function (types, type) {
        this.addTo(types, type);
        this.stack.push(type);
    },
    topLastChild: function () {
        return can.last(this.top().children);
    },
    replaceTopLastChild: function (type) {
        var children = ensureChildren(this.top()).children;
        children.pop();
        children.push(type);
        return type;
    },
    replaceTopLastChildAndPush: function (type) {
        this.replaceTopLastChild(type);
        this.stack.push(type);
    },
    replaceTopAndPush: function (type) {
        var children;
        if (this.top() === this.root) {
            children = ensureChildren(this.top()).children;
        } else {
            this.stack.pop();
            children = ensureChildren(this.top()).children;
        }
        children.pop();
        children.push(type);
        this.stack.push(type);
        return type;
    }
});
var convertKeyToLookup = function (key) {
    var lastPath = key.lastIndexOf('./');
    var lastDot = key.lastIndexOf('.');
    if (lastDot > lastPath) {
        return key.substr(0, lastDot) + '@' + key.substr(lastDot + 1);
    }
    var firstNonPathCharIndex = lastPath === -1 ? 0 : lastPath + 2;
    var firstNonPathChar = key.charAt(firstNonPathCharIndex);
    if (firstNonPathChar === '.' || firstNonPathChar === '@') {
        return key.substr(0, firstNonPathCharIndex) + '@' + key.substr(firstNonPathCharIndex + 1);
    } else {
        return key.substr(0, firstNonPathCharIndex) + '@' + key.substr(firstNonPathCharIndex);
    }
};
var convertToAtLookup = function (ast) {
    if (ast.type === 'Lookup') {
        ast.key = convertKeyToLookup(ast.key);
    }
    return ast;
};
var convertToHelperIfTopIsLookup = function (stack) {
    var top = stack.top();
    if (top && top.type === 'Lookup') {
        var base = stack.stack[stack.stack.length - 2];
        if (base.type !== 'Helper' && base) {
            stack.replaceTopAndPush({
                type: 'Helper',
                method: top
            });
        }
    }
};
var expression = {
    convertKeyToLookup: convertKeyToLookup,
    Literal: Literal,
    Lookup: Lookup,
    ScopeLookup: ScopeLookup,
    Arg: Arg,
    Hashes: Hashes,
    Call: Call,
    Helper: Helper,
    HelperLookup: HelperLookup,
    HelperScopeLookup: HelperScopeLookup,
    SetIdentifier: function (value) {
        this.value = value;
    },
    tokenize: function (expression) {
        var tokens = [];
        (can.trim(expression) + ' ').replace(tokensRegExp, function (whole, arg) {
            tokens.push(arg);
        });
        return tokens;
    },
    lookupRules: {
        'default': function (ast, methodType, isArg) {
            var name = (methodType === 'Helper' && !ast.root ? 'Helper' : '') + (isArg ? 'Scope' : '') + 'Lookup';
            return expression[name];
        },
        'method': function (ast, methodType, isArg) {
            return ScopeLookup;
        }
    },
    methodRules: {
        'default': function (ast) {
            return ast.type === 'Call' ? Call : Helper;
        },
        'call': function (ast) {
            return Call;
        }
    },
    parse: function (expressionString, options) {
        options = options || {};
        var ast = this.ast(expressionString);
        if (!options.lookupRule) {
            options.lookupRule = 'default';
        }
        if (typeof options.lookupRule === 'string') {
            options.lookupRule = expression.lookupRules[options.lookupRule];
        }
        if (!options.methodRule) {
            options.methodRule = 'default';
        }
        if (typeof options.methodRule === 'string') {
            options.methodRule = expression.methodRules[options.methodRule];
        }
        var expr = this.hydrateAst(ast, options, options.baseMethodType || 'Helper');
        return expr;
    },
    hydrateAst: function (ast, options, methodType, isArg) {
        var hashes, self = this;
        if (ast.type === 'Lookup') {
            return new (options.lookupRule(ast, methodType, isArg))(ast.key, ast.root && this.hydrateAst(ast.root, options, methodType));
        } else if (ast.type === 'Literal') {
            return new Literal(ast.value);
        } else if (ast.type === 'Arg') {
            return new Arg(this.hydrateAst(ast.children[0], options, methodType, isArg), { compute: true });
        } else if (ast.type === 'Hashes') {
            hashes = {};
            can.each(ast.children, function (child) {
                hashes[child.prop] = self.hydrateAst(child.children[0], options, ast.type, true);
            });
            return new Hashes(hashes);
        } else if (ast.type === 'Hash') {
            throw new Error('');
        } else if (ast.type === 'Call' || ast.type === 'Helper') {
            var args = [];
            hashes = {};
            can.each(ast.children, function (child) {
                if (child.type === 'Hash') {
                    hashes[child.prop] = self.hydrateAst(child.children[0], options, ast.type, true);
                } else {
                    args.push(self.hydrateAst(child, options, ast.type, true));
                }
            });
            return new (options.methodRule(ast))(this.hydrateAst(ast.method, options, ast.type), args, hashes);
        }
    },
    ast: function (expression) {
        var tokens = this.tokenize(expression);
        return this.parseAst(tokens, { index: 0 });
    },
    parseAst: function (tokens, cursor) {
        var stack = new Stack(), top;
        while (cursor.index < tokens.length) {
            var token = tokens[cursor.index], nextToken = tokens[cursor.index + 1];
            cursor.index++;
            if (literalRegExp.test(token)) {
                convertToHelperIfTopIsLookup(stack);
                stack.addTo([
                    'Helper',
                    'Call',
                    'Hash'
                ], {
                    type: 'Literal',
                    value: utils.jsonParse(token)
                });
            } else if (nextToken === '=') {
                top = stack.top();
                if (top && top.type === 'Lookup') {
                    var firstParent = stack.firstParent([
                        'Call',
                        'Helper',
                        'Hash'
                    ]);
                    if (firstParent.type === 'Call' || firstParent.type === 'Root') {
                        stack.popUntil(['Call']);
                        top = stack.top();
                        stack.replaceTopAndPush({
                            type: 'Helper',
                            method: top.type === 'Root' ? can.last(top.children) : top
                        });
                    }
                }
                top = stack.popUntil([
                    'Helper',
                    'Call',
                    'Hashes'
                ]);
                if (top.type === 'Call') {
                    stack.addToAndPush(['Call'], { type: 'Hashes' });
                }
                stack.addToAndPush([
                    'Helper',
                    'Hashes'
                ], {
                    type: 'Hash',
                    prop: token
                });
                cursor.index++;
            } else if (keyRegExp.test(token)) {
                var last = stack.topLastChild();
                if (last && last.type === 'Call' && isAddingToExpression(token)) {
                    stack.replaceTopLastChildAndPush({
                        type: 'Lookup',
                        root: last,
                        key: token
                    });
                } else {
                    convertToHelperIfTopIsLookup(stack);
                    stack.addToAndPush([
                        'Helper',
                        'Call',
                        'Hash',
                        'Arg'
                    ], {
                        type: 'Lookup',
                        key: token
                    });
                }
            } else if (token === '~') {
                convertToHelperIfTopIsLookup(stack);
                stack.addToAndPush([
                    'Helper',
                    'Call',
                    'Hash'
                ], {
                    type: 'Arg',
                    key: token
                });
            } else if (token === '(') {
                top = stack.top();
                if (top.type === 'Lookup') {
                    stack.replaceTopAndPush({
                        type: 'Call',
                        method: convertToAtLookup(top)
                    });
                } else {
                    throw new Error('Unable to understand expression ' + tokens.join(''));
                }
            } else if (token === ')') {
                stack.popTo(['Call']);
            } else if (token === ',') {
                stack.popUntil(['Call']);
            }
        }
        return stack.root.children[0];
    }
};
can.expression = expression;
module.exports = expression;
},{"../../util/util.js":26,"../scope/scope.js":36,"./mustache_helpers.js":42,"./utils.js":45}],38:[function(require,module,exports){
/*can@2.3.22#view/stache/html_section*/
var can = require('../../util/util.js');
var target = require('../target/target.js');
var utils = require('./utils.js');
var mustacheCore = require('./mustache_core.js');
var decodeHTML = typeof document !== 'undefined' && function () {
    var el = document.createElement('div');
    return function (html) {
        if (html.indexOf('&') === -1) {
            return html.replace(/\r\n/g, '\n');
        }
        el.innerHTML = html;
        return el.childNodes.length === 0 ? '' : el.childNodes.item(0).nodeValue;
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
            can.last(this.targetStack).children.push(data);
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
        this.targetStack = this.targetData = null;
        return this.compiled;
    },
    children: function () {
        if (this.targetStack.length) {
            return can.last(this.targetStack).children;
        } else {
            return this[this.data];
        }
    },
    isEmpty: function () {
        return !this.targetData.length;
    }
});
HTMLSectionBuilder.HTMLSection = HTMLSection;
module.exports = HTMLSectionBuilder;
},{"../../util/util.js":26,"../target/target.js":46,"./mustache_core.js":41,"./utils.js":45}],39:[function(require,module,exports){
/*can@2.3.22#view/stache/intermediate_and_imports*/
var mustacheCore = require('./mustache_core.js');
var parser = require('../parser/parser.js');
require('../import/import.js');
module.exports = function (source) {
    var template = mustacheCore.cleanLineEndings(source);
    var imports = [], dynamicImports = [], ases = {}, inImport = false, inFrom = false, inAs = false, isUnary = false, currentAs = '', currentFrom = '';
    var intermediate = parser(template, {
        start: function (tagName, unary) {
            isUnary = unary;
            if (tagName === 'can-import') {
                inImport = true;
            } else if (inImport) {
                inImport = false;
            }
        },
        attrStart: function (attrName) {
            if (attrName === 'from') {
                inFrom = true;
            } else if (attrName === 'as' || attrName === 'export-as') {
                inAs = true;
            }
        },
        attrEnd: function (attrName) {
            if (attrName === 'from') {
                inFrom = false;
            } else if (attrName === 'as' || attrName === 'export-as') {
                inAs = false;
            }
        },
        attrValue: function (value) {
            if (inFrom && inImport) {
                imports.push(value);
                if (!isUnary) {
                    dynamicImports.push(value);
                }
                currentFrom = value;
            } else if (inAs && inImport) {
                currentAs = value;
            }
        },
        end: function (tagName) {
            if (tagName === 'can-import') {
                if (currentAs) {
                    ases[currentAs] = currentFrom;
                    currentAs = '';
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
        dynamicImports: dynamicImports,
        ases: ases,
        exports: ases
    };
};
},{"../import/import.js":31,"../parser/parser.js":34,"./mustache_core.js":41}],40:[function(require,module,exports){
/*can@2.3.22#view/stache/live_attr*/
var can = require('../../util/util.js');
var live = require('../live/live.js');
var elements = require('../elements.js');
var viewCallbacks = require('../callbacks/callbacks.js');
live = live || can.view.live;
elements = elements || can.view.elements;
viewCallbacks = viewCallbacks || can.view.callbacks;
module.exports = {
    attributes: function (el, compute, scope, options) {
        var oldAttrs = {};
        var setAttrs = function (newVal) {
            var newAttrs = live.getAttributeParts(newVal), name;
            for (name in newAttrs) {
                var newValue = newAttrs[name], oldValue = oldAttrs[name];
                if (newValue !== oldValue) {
                    can.attr.set(el, name, newValue);
                    var callback = viewCallbacks.attr(name);
                    if (callback) {
                        callback(el, {
                            attributeName: name,
                            scope: scope,
                            options: options
                        });
                    }
                }
                delete oldAttrs[name];
            }
            for (name in oldAttrs) {
                elements.removeAttr(el, name);
            }
            oldAttrs = newAttrs;
        };
        var handler = function (ev, newVal) {
            setAttrs(newVal);
        };
        compute.bind('change', handler);
        can.bind.call(el, 'removed', function () {
            compute.unbind('change', handler);
        });
        setAttrs(compute());
    }
};
},{"../../util/util.js":26,"../callbacks/callbacks.js":28,"../elements.js":29,"../live/live.js":32}],41:[function(require,module,exports){
/*can@2.3.22#view/stache/mustache_core*/
var can = require('../../util/util.js');
var utils = require('./utils.js');
var mustacheHelpers = require('./mustache_helpers.js');
var expression = require('./expression.js');
var live = require('../live/live.js');
var elements = require('../elements.js');
var Scope = require('../scope/scope.js');
var nodeLists = require('../node_lists/node_lists.js');
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
module.exports = core;
},{"../../util/util.js":26,"../elements.js":29,"../live/live.js":32,"../node_lists/node_lists.js":33,"../scope/scope.js":36,"./expression.js":37,"./mustache_helpers.js":42,"./utils.js":45}],42:[function(require,module,exports){
/*can@2.3.22#view/stache/mustache_helpers*/
var can = require('../../util/util.js');
var utils = require('./utils.js');
var live = require('../live/live.js');
live = live || can.view.live;
var resolve = function (value) {
    if (utils.isObserveLike(value) && utils.isArrayLike(value) && value.attr('length')) {
        return value;
    } else if (can.isFunction(value)) {
        return value();
    } else {
        return value;
    }
};
var resolveHash = function (hash) {
    var params = {};
    for (var prop in hash) {
        var value = hash[prop];
        if (value && value.isComputed) {
            params[prop] = value();
        } else {
            params[prop] = value;
        }
    }
    return params;
};
var looksLikeOptions = function (options) {
    return options && typeof options.fn === 'function' && typeof options.inverse === 'function';
};
var helpers = {
    'each': function (items, options) {
        var resolved = resolve(items), result = [], keys, key, i;
        if (resolved instanceof can.List) {
            return function (el) {
                var nodeList = [el];
                nodeList.expression = 'live.list';
                can.view.nodeLists.register(nodeList, null, options.nodeList, true);
                can.view.nodeLists.update(options.nodeList, [el]);
                var cb = function (item, index, parentNodeList) {
                    return options.fn(options.scope.add({
                        '%index': index,
                        '@index': index
                    }, { notContext: true }).add(item), options.options, parentNodeList);
                };
                live.list(el, items, cb, options.context, el.parentNode, nodeList, function (list, parentNodeList) {
                    return options.inverse(options.scope.add(list), options.options, parentNodeList);
                });
            };
        }
        var expr = resolved;
        if (!!expr && utils.isArrayLike(expr)) {
            for (i = 0; i < expr.length; i++) {
                result.push(options.fn(options.scope.add({
                    '%index': i,
                    '@index': i
                }, { notContext: true }).add(expr[i])));
            }
        } else if (utils.isObserveLike(expr)) {
            keys = can.Map.keys(expr);
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                result.push(options.fn(options.scope.add({
                    '%key': key,
                    '@key': key
                }, { notContext: true }).add(expr[key])));
            }
        } else if (expr instanceof Object) {
            for (key in expr) {
                result.push(options.fn(options.scope.add({
                    '%key': key,
                    '@key': key
                }, { notContext: true }).add(expr[key])));
            }
        }
        return result;
    },
    '@index': function (offset, options) {
        if (!options) {
            options = offset;
            offset = 0;
        }
        var index = options.scope.attr('@index');
        return '' + ((can.isFunction(index) ? index() : index) + offset);
    },
    'if': function (expr, options) {
        var value;
        if (can.isFunction(expr)) {
            value = can.compute.truthy(expr)();
        } else {
            value = !!resolve(expr);
        }
        if (value) {
            return options.fn(options.scope || this);
        } else {
            return options.inverse(options.scope || this);
        }
    },
    'is': function () {
        var lastValue, curValue, options = arguments[arguments.length - 1];
        if (arguments.length - 2 <= 0) {
            return options.inverse();
        }
        var args = arguments;
        var callFn = can.compute(function () {
            for (var i = 0; i < args.length - 1; i++) {
                curValue = resolve(args[i]);
                curValue = can.isFunction(curValue) ? curValue() : curValue;
                if (i > 0) {
                    if (curValue !== lastValue) {
                        return false;
                    }
                }
                lastValue = curValue;
            }
            return true;
        });
        return callFn() ? options.fn() : options.inverse();
    },
    'eq': function () {
        return helpers.is.apply(this, arguments);
    },
    'unless': function (expr, options) {
        return helpers['if'].apply(this, [
            expr,
            can.extend({}, options, {
                fn: options.inverse,
                inverse: options.fn
            })
        ]);
    },
    'with': function (expr, options) {
        var ctx = expr;
        expr = resolve(expr);
        if (!!expr) {
            return options.fn(ctx);
        }
    },
    'log': function (expr, options) {
        if (typeof console !== 'undefined' && console.log) {
            if (!options) {
                console.log(expr.context);
            } else {
                console.log(expr, options.context);
            }
        }
    },
    'data': function (attr) {
        var data = arguments.length === 2 ? this : arguments[1];
        return function (el) {
            can.data(can.$(el), attr, data || this.context);
        };
    },
    'switch': function (expression, options) {
        resolve(expression);
        var found = false;
        var newOptions = options.helpers.add({
            'case': function (value, options) {
                if (!found && resolve(expression) === resolve(value)) {
                    found = true;
                    return options.fn(options.scope || this);
                }
            },
            'default': function (options) {
                if (!found) {
                    return options.fn(options.scope || this);
                }
            }
        });
        return options.fn(options.scope, newOptions);
    },
    'joinBase': function (firstExpr) {
        var args = [].slice.call(arguments);
        var options = args.pop();
        var moduleReference = can.map(args, function (expr) {
            var value = resolve(expr);
            return can.isFunction(value) ? value() : value;
        }).join('');
        var templateModule = options.helpers.attr('helpers.module');
        var parentAddress = templateModule ? templateModule.uri : undefined;
        var isRelative = moduleReference[0] === '.';
        if (isRelative && parentAddress) {
            return can.joinURIs(parentAddress, moduleReference);
        } else {
            var baseURL = can.baseURL || typeof System !== 'undefined' && (System.renderingLoader && System.renderingLoader.baseURL || System.baseURL) || location.pathname;
            if (moduleReference[0] !== '/' && baseURL[baseURL.length - 1] !== '/') {
                baseURL += '/';
            }
            return can.joinURIs(baseURL, moduleReference);
        }
    },
    routeUrl: function (params, merge) {
        if (!params) {
            params = {};
        }
        if (typeof params.fn === 'function' && typeof params.inverse === 'function') {
            params = resolveHash(params.hash);
        }
        return can.route.url(params, typeof merge === 'boolean' ? merge : undefined);
    },
    routeCurrent: function (params) {
        var last = can.last(arguments), isOptions = last && looksLikeOptions(last);
        if (last && isOptions && !(last.exprData instanceof can.expression.Call)) {
            if (can.route.current(resolveHash(params.hash || {}))) {
                return params.fn();
            } else {
                return params.inverse();
            }
        } else {
            return can.route.current(looksLikeOptions(params) ? {} : params || {});
        }
    }
};
helpers.routeCurrent.callAsMethod = true;
helpers.eachOf = helpers.each;
var registerHelper = function (name, callback) {
    helpers[name] = callback;
};
module.exports = {
    registerHelper: registerHelper,
    registerSimpleHelper: function (name, callback) {
        registerHelper(name, can.view.simpleHelper(callback));
    },
    getHelper: function (name, options) {
        var helper = options && options.get('helpers.' + name, { proxyMethods: false });
        if (!helper) {
            helper = helpers[name];
        }
        if (helper) {
            return { fn: helper };
        }
    }
};
},{"../../util/util.js":26,"../live/live.js":32,"./utils.js":45}],43:[function(require,module,exports){
/*can@2.3.22#view/stache/stache*/
var can = require('../../util/util.js');
var parser = require('../parser/parser.js');
var target = require('../target/target.js');
var HTMLSectionBuilder = require('./html_section.js');
var TextSectionBuilder = require('./text_section.js');
var mustacheCore = require('./mustache_core.js');
var mustacheHelpers = require('./mustache_helpers.js');
var getIntermediateAndImports = require('./intermediate_and_imports.js');
var viewCallbacks = require('../callbacks/callbacks.js');
require('../bindings/bindings.js');
parser = parser || can.view.parser;
can.view.parser = parser;
viewCallbacks = viewCallbacks || can.view.callbacks;
var svgNamespace = 'http://www.w3.org/2000/svg';
var namespaces = {
        'svg': svgNamespace,
        'g': svgNamespace
    }, textContentOnlyTag = {
        style: true,
        script: true
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
            namespaceStack: [],
            textContentOnly: null
        }, makeRendererAndUpdateSection = function (section, mode, stache) {
            if (mode === '>') {
                section.add(mustacheCore.makeLiveBindingPartialRenderer(stache, copyState()));
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
                directlyNested: state.sectionElementStack.length ? lastElement === 'section' || lastElement === 'custom' : true,
                textContentOnly: !!state.textContentOnly
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
                state.sectionElementStack.push(isCustomTag ? 'custom' : tagName);
                if (isCustomTag) {
                    section.startSubSection();
                } else if (textContentOnlyTag[tagName]) {
                    state.textContentOnly = new TextSectionBuilder();
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
            if (textContentOnlyTag[tagName]) {
                section.last().add(state.textContentOnly.compile(copyState()));
                state.textContentOnly = null;
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
                    state.node.attributes.push(function (scope, options, nodeList) {
                        attrCallback(this, {
                            attributeName: attrName,
                            scope: scope,
                            options: options,
                            nodeList: nodeList
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
            (state.textContentOnly || section).add(text);
        },
        special: function (text) {
            var firstAndText = mustacheCore.splitModeFromExpression(text, state), mode = firstAndText.mode, expression = firstAndText.expression;
            if (expression === 'else') {
                var inverseSection;
                if (state.attr && state.attr.section) {
                    inverseSection = state.attr.section;
                } else if (state.node && state.node.section) {
                    inverseSection = state.node.section;
                } else {
                    inverseSection = state.textContentOnly || section;
                }
                inverseSection.inverse();
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
                    throw new Error(mode + ' is currently not supported within a tag.');
                }
            } else {
                makeRendererAndUpdateSection(state.textContentOnly || section, mode, expression);
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
module.exports = stache;
},{"../../util/util.js":26,"../bindings/bindings.js":27,"../callbacks/callbacks.js":28,"../parser/parser.js":34,"../target/target.js":46,"./html_section.js":38,"./intermediate_and_imports.js":39,"./mustache_core.js":41,"./mustache_helpers.js":42,"./text_section.js":44}],44:[function(require,module,exports){
/*can@2.3.22#view/stache/text_section*/
var can = require('../../util/util.js');
var live = require('../live/live.js');
var utils = require('./utils.js');
var liveStache = require('./live_attr.js');
live = live || can.view.live;
var TextSectionBuilder = function () {
    this.stack = [new TextSection()];
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
            }, null, false);
            compute.computeInstance.bind('change', can.k);
            var value = compute();
            if (compute.computeInstance.hasDependencies) {
                if (state.textContentOnly) {
                    live.text(this, compute);
                } else if (state.attr) {
                    live.simpleAttribute(this, state.attr, compute);
                } else {
                    liveStache.attributes(this, compute, scope, options);
                }
                compute.computeInstance.unbind('change', can.k);
            } else {
                if (state.textContentOnly) {
                    this.nodeValue = value;
                } else if (state.attr) {
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
module.exports = TextSectionBuilder;
},{"../../util/util.js":26,"../live/live.js":32,"./live_attr.js":40,"./utils.js":45}],45:[function(require,module,exports){
/*can@2.3.22#view/stache/utils*/
var can = require('../../util/util.js');
require('../scope/scope.js');
var Options = can.view.Options;
module.exports = {
    isArrayLike: function (obj) {
        return obj && obj.splice && typeof obj.length === 'number';
    },
    isObserveLike: function (obj) {
        return obj instanceof can.Map || obj && !!obj._get;
    },
    emptyHandler: function () {
    },
    jsonParse: function (str) {
        if (str[0] === '\'') {
            return str.substr(1, str.length - 2);
        } else if (str === 'undefined') {
            return undefined;
        } else if (can.global.JSON) {
            return JSON.parse(str);
        } else {
            return eval('(' + str + ')');
        }
    },
    mixins: {
        last: function () {
            return this.stack[this.stack.length - 1];
        },
        add: function (chars) {
            this.last().add(chars);
        },
        subSectionDepth: function () {
            return this.stack.length - 1;
        }
    },
    convertToScopes: function (helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer) {
        if (truthyRenderer) {
            helperOptions.fn = this.makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
        }
        if (falseyRenderer) {
            helperOptions.inverse = this.makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
        }
    },
    makeRendererConvertScopes: function (renderer, parentScope, parentOptions, nodeList) {
        var rendererWithScope = function (ctx, opts, parentNodeList) {
            return renderer(ctx || parentScope, opts, parentNodeList);
        };
        return can.__notObserve(function (newScope, newOptions, parentNodeList) {
            if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
                newScope = parentScope.add(newScope);
            }
            if (newOptions !== undefined && !(newOptions instanceof Options)) {
                newOptions = parentOptions.add(newOptions);
            }
            var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList || nodeList);
            return result;
        });
    },
    Options: Options
};
},{"../../util/util.js":26,"../scope/scope.js":36}],46:[function(require,module,exports){
/*can@2.3.22#view/target/target*/
var can = require('../../util/util.js');
var elements = require('../elements.js');
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
    }(), namespacesWork = typeof document !== 'undefined' && !!document.createElementNS, setAttribute = can.attr.setAttribute;
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
    var setAttr = function (el, attr) {
        var value = node.attrs[attr];
        if (typeof value === 'function') {
            getCallback().callbacks.push({ callback: value });
        } else {
            setAttribute(el, attr, value);
        }
    };
    if (nodeType === 'object') {
        if (node.tag) {
            if (namespacesWork && node.namespace) {
                el = document.createElementNS(node.namespace, node.tag);
            } else {
                el = document.createElement(node.tag);
            }
            if (node.attrs) {
                if (node.tag === 'input' && node.attrs.type) {
                    setAttr(el, 'type');
                    delete node.attrs.type;
                }
                for (var attrName in node.attrs) {
                    setAttr(el, attrName);
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
    for (i = 0; i < pathsLength; i++) {
        getCallbacks(child, paths[i], elementCallbacks);
    }
    elementCallbacks.push({
        element: child,
        callbacks: callbacks
    });
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
module.exports = makeTarget;
},{"../../util/util.js":26,"../elements.js":29}],47:[function(require,module,exports){
/*can@2.3.22#view/view*/
var can = require('../util/util.js');
var isFunction = can.isFunction, makeArray = can.makeArray, hookupId = 1;
var makeRenderer = function (textRenderer) {
    var renderer = function () {
        return $view.frag(textRenderer.apply(this, arguments));
    };
    renderer.render = function () {
        return textRenderer.apply(textRenderer, arguments);
    };
    return renderer;
};
var checkText = function (text, url) {
    if (!text.length) {
        throw new Error('can.view: No template or empty template:' + url);
    }
};
var getRenderer = function (obj, async) {
    if (isFunction(obj)) {
        var def = can.Deferred();
        return def.resolve(obj);
    }
    var url = typeof obj === 'string' ? obj : obj.url, suffix = obj.engine && '.' + obj.engine || url.match(/\.[\w\d]+$/), type, el, id;
    if (url.match(/^#/)) {
        url = url.substr(1);
    }
    if (el = document.getElementById(url)) {
        suffix = '.' + el.type.match(/\/(x\-)?(.+)/)[2];
    }
    if (!suffix && !$view.cached[url]) {
        url += suffix = $view.ext;
    }
    if (can.isArray(suffix)) {
        suffix = suffix[0];
    }
    id = $view.toId(url);
    if (url.match(/^\/\//)) {
        url = url.substr(2);
        url = !window.steal ? url : steal.config().root.mapJoin('' + steal.id(url));
    }
    if (window.require) {
        if (require.toUrl) {
            url = require.toUrl(url);
        }
    }
    type = $view.types[suffix];
    if ($view.cached[id]) {
        return $view.cached[id];
    } else if (el) {
        return $view.registerView(id, el.innerHTML, type);
    } else {
        var d = new can.Deferred();
        can.ajax({
            async: async,
            url: url,
            dataType: 'text',
            error: function (jqXHR) {
                checkText('', url);
                d.reject(jqXHR);
            },
            success: function (text) {
                checkText(text, url);
                $view.registerView(id, text, type, d);
            }
        });
        return d;
    }
};
var getDeferreds = function (data) {
    var deferreds = [];
    if (can.isDeferred(data)) {
        return [data];
    } else {
        for (var prop in data) {
            if (can.isDeferred(data[prop])) {
                deferreds.push(data[prop]);
            }
        }
    }
    return deferreds;
};
var usefulPart = function (resolved) {
    return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved;
};
var $view = can.view = can.template = function (view, data, helpers, callback) {
    if (isFunction(helpers)) {
        callback = helpers;
        helpers = undefined;
    }
    return $view.renderAs('fragment', view, data, helpers, callback);
};
can.extend($view, {
    frag: function (result, parentNode) {
        return $view.hookup($view.fragment(result), parentNode);
    },
    fragment: function (result) {
        return can.frag(result, document);
    },
    toId: function (src) {
        return can.map(src.toString().split(/\/|\./g), function (part) {
            if (part) {
                return part;
            }
        }).join('_');
    },
    toStr: function (txt) {
        return txt == null ? '' : '' + txt;
    },
    hookup: function (fragment, parentNode) {
        var hookupEls = [], id, func;
        can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function (node) {
            if (node.nodeType === 1) {
                hookupEls.push(node);
                hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
            }
        });
        can.each(hookupEls, function (el) {
            if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
                func(el, parentNode, id);
                delete $view.hookups[id];
                el.removeAttribute('data-view-id');
            }
        });
        return fragment;
    },
    hookups: {},
    hook: function (cb) {
        $view.hookups[++hookupId] = cb;
        return ' data-view-id=\'' + hookupId + '\'';
    },
    cached: {},
    cachedRenderers: {},
    cache: true,
    register: function (info) {
        this.types['.' + info.suffix] = info;
        can[info.suffix] = $view[info.suffix] = function (id, text) {
            var renderer, renderFunc;
            if (!text) {
                renderFunc = function () {
                    if (!renderer) {
                        if (info.fragRenderer) {
                            renderer = info.fragRenderer(null, id);
                        } else {
                            renderer = makeRenderer(info.renderer(null, id));
                        }
                    }
                    return renderer.apply(this, arguments);
                };
                renderFunc.render = function () {
                    var textRenderer = info.renderer(null, id);
                    return textRenderer.apply(textRenderer, arguments);
                };
                return renderFunc;
            }
            var registeredRenderer = function () {
                if (!renderer) {
                    if (info.fragRenderer) {
                        renderer = info.fragRenderer(id, text);
                    } else {
                        renderer = info.renderer(id, text);
                    }
                }
                return renderer.apply(this, arguments);
            };
            if (info.fragRenderer) {
                return $view.preload(id, registeredRenderer);
            } else {
                return $view.preloadStringRenderer(id, registeredRenderer);
            }
        };
    },
    types: {},
    ext: '.ejs',
    registerScript: function (type, id, src) {
        return 'can.view.preloadStringRenderer(\'' + id + '\',' + $view.types['.' + type].script(id, src) + ');';
    },
    preload: function (id, renderer) {
        var def = $view.cached[id] = new can.Deferred().resolve(function (data, helpers) {
            return renderer.call(data, data, helpers);
        });
        def.__view_id = id;
        $view.cachedRenderers[id] = renderer;
        return renderer;
    },
    preloadStringRenderer: function (id, stringRenderer) {
        return this.preload(id, makeRenderer(stringRenderer));
    },
    render: function (view, data, helpers, callback, nodelist) {
        return can.view.renderAs('string', view, data, helpers, callback, nodelist);
    },
    renderTo: function (format, renderer, data, helpers, nodelist) {
        return (format === 'string' && renderer.render ? renderer.render : renderer)(data, helpers, nodelist);
    },
    renderAs: function (format, view, data, helpers, callback, nodelist) {
        if (callback !== undefined && typeof callback.expression === 'string') {
            nodelist = callback;
            callback = undefined;
        }
        if (isFunction(helpers)) {
            callback = helpers;
            helpers = undefined;
        }
        var deferreds = getDeferreds(data);
        var deferred, dataCopy, async, response;
        if (deferreds.length) {
            deferred = new can.Deferred();
            dataCopy = can.extend({}, data);
            deferreds.push(getRenderer(view, true));
            can.when.apply(can, deferreds).then(function (resolved) {
                var objs = makeArray(arguments), renderer = objs.pop(), result;
                if (can.isDeferred(data)) {
                    dataCopy = usefulPart(resolved);
                } else {
                    for (var prop in data) {
                        if (can.isDeferred(data[prop])) {
                            dataCopy[prop] = usefulPart(objs.shift());
                        }
                    }
                }
                result = can.view.renderTo(format, renderer, dataCopy, helpers, nodelist);
                deferred.resolve(result, dataCopy);
                if (callback) {
                    callback(result, dataCopy);
                }
            }, function () {
                deferred.reject.apply(deferred, arguments);
            });
            return deferred;
        } else {
            async = isFunction(callback);
            deferred = can.__notObserve(getRenderer)(view, async);
            if (async) {
                response = deferred;
                deferred.then(function (renderer) {
                    callback(data ? can.view.renderTo(format, renderer, data, helpers, nodelist) : renderer);
                });
            } else {
                if (deferred.state() === 'resolved' && deferred.__view_id) {
                    var currentRenderer = $view.cachedRenderers[deferred.__view_id];
                    return data ? can.view.renderTo(format, currentRenderer, data, helpers, nodelist) : currentRenderer;
                } else {
                    deferred.then(function (renderer) {
                        response = data ? can.view.renderTo(format, renderer, data, helpers, nodelist) : renderer;
                    });
                }
            }
            return response;
        }
    },
    registerView: function (id, text, type, def) {
        var info = typeof type === 'object' ? type : $view.types[type || $view.ext], renderer;
        if (info.fragRenderer) {
            renderer = info.fragRenderer(id, text);
        } else {
            renderer = makeRenderer(info.renderer(id, text));
        }
        def = def || new can.Deferred();
        if ($view.cache) {
            $view.cached[id] = def;
            def.__view_id = id;
            $view.cachedRenderers[id] = renderer;
        }
        return def.resolve(renderer);
    },
    simpleHelper: function (fn) {
        return function () {
            var realArgs = [];
            can.each(arguments, function (val, i) {
                if (i <= arguments.length) {
                    while (val && val.isComputed) {
                        val = val();
                    }
                    realArgs.push(val);
                }
            });
            return fn.apply(this, realArgs);
        };
    }
});
module.exports = can;
},{"../util/util.js":26}],48:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v2.2.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-02-22T19:11Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var arr = [];

var document = window.document;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "2.2.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isPlainObject: function( obj ) {

		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {

			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf( "use strict" ) === 1 ) {
				script = document.createElement( "script" );
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {

				// Otherwise, avoid the DOM node creation, insertion
				// and removal by using an indirect global eval

				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {

						// Inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE9-10 only
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	register: function( owner, initial ) {
		var value = initial || {};

		// If it is a node unlikely to be stringify-ed or looped over
		// use plain assignment
		if ( owner.nodeType ) {
			owner[ this.expando ] = value;

		// Otherwise secure it in a non-enumerable, non-writable property
		// configurability must be true to allow the property to be
		// deleted with the delete operator
		} else {
			Object.defineProperty( owner, this.expando, {
				value: value,
				writable: true,
				configurable: true
			} );
		}
		return owner[ this.expando ];
	},
	cache: function( owner ) {

		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return an empty object.
		if ( !acceptData( owner ) ) {
			return {};
		}

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ prop ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :
			owner[ this.expando ] && owner[ this.expando ][ key ];
	},
	access: function( owner, key, value ) {
		var stored;

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase( key ) );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key === undefined ) {
			this.register( owner );

		} else {

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );

				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;

			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <= 35-45+
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://code.google.com/p/chromium/issues/detail?id=378607
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data, camelKey;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// with the key as-is
				data = dataUser.get( elem, key ) ||

					// Try to find dashed key if it exists (gh-2779)
					// This is for 2.2.x only
					dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

				if ( data !== undefined ) {
					return data;
				}

				camelKey = jQuery.camelCase( key );

				// Attempt to get data from the cache
				// with the key camelized
				data = dataUser.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			camelKey = jQuery.camelCase( key );
			this.each( function() {

				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = dataUser.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				dataUser.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
					dataUser.set( this, key, value );
				}
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE9
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE9-11+
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0-4.3, Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
			"screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {
	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {
		div.style.cssText =

			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );
	}

	jQuery.extend( support, {
		pixelPosition: function() {

			// This test is executed only once but we still do memoizing
			// since we can use the boxSizingReliable pre-computing.
			// No need to check if the test was already performed, though.
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
			// since that compresses better and they're computed together anyway.
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		},
		reliableMarginRight: function() {

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// This support function is only executed once so no memoizing is needed.
			var ret,
				marginDiv = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			marginDiv.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;box-sizing:content-box;" +
				"display:block;margin:0;border:0;padding:0";
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			documentElement.appendChild( container );

			ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

			documentElement.removeChild( container );
			div.removeChild( marginDiv );

			return ret;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );
	ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

	// Support: Opera 12.1x only
	// Fall back to style even without computed
	// computed is undefined for elems on document fragments
	if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
		ret = jQuery.style( elem, name );
	}

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// http://dev.w3.org/csswg/cssom/#resolved-values
		if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE9-11+
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Support: IE11 only
	// In IE 11 fullscreen elements inside of an iframe have
	// 100x too small dimensions (gh-1764).
	if ( document.msFullscreenElement && window.top !== window ) {

		// Support: IE11 only
		// Running getBoundingClientRect on a disconnected node
		// in IE throws an error.
		if ( elem.getClientRects().length ) {
			val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
		}
	}

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = dataPriv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = dataPriv.access(
					elem,
					"olddisplay",
					defaultDisplay( elem.nodeName )
				);
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				dataPriv.set(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = dataPriv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;

			dataPriv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {
	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
		opt.duration : opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );

	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// Handle most common string cases
					ret.replace( rreturn, "" ) :

					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				// Support: IE<11
				// option.value not trimmed (#14858)
				return jQuery.trim( elem.value );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// But now, this "simulate" function is used only for events
				// for which stopPropagation() is noop, so there is no need for that anymore.
				//
				// For the 1.x branch though, guard for "click" and "submit"
				// events is still used, but was moved to jQuery.event.stopPropagation function
				// because `originalEvent` should point to the original event for the constancy
				// with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




support.focusin = "onfocusin" in window;


// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE8-11+
			// IE throws exception if url is malformed, e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE8-11+
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


jQuery.expr.filters.hidden = function( elem ) {
	return !jQuery.expr.filters.visible( elem );
};
jQuery.expr.filters.visible = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	// Use OR instead of AND as the element is not visible if either is true
	// See tickets #10406 and #13132
	return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE9
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE9
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8+
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	// Stop scripts or inline event handlers from being executed immediately
	// by using document.implementation
	context = context || ( support.createHTMLDocument ?
		document.implementation.createHTMLDocument( "" ) :
		document );

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		box = elem.getBoundingClientRect();
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},
	size: function() {
		return this.length;
	}
} );

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

},{}]},{},[2]);

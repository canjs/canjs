/*!
 * CanJS - 2.3.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Mon, 30 Nov 2015 23:22:54 GMT
 * Licensed MIT
 */

/*can@2.3.3#compute/get_value_and_bind*/
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
    compute.observedInfo = this;
}
can.simpleExtend(ObservedInfo.prototype, {
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
    onDependencyChange: function (ev) {
        if (this.bound) {
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
    updateCompute: function (batchNum) {
        var oldValue = this.value;
        this.getValueAndBind();
        this.compute.updater(this.value, oldValue, batchNum);
    },
    getValueAndBind: function () {
        this.bound = true;
        this.oldObserved = this.newObserved || {};
        this.ignore = 0;
        this.newObserved = {};
        observedInfoStack.push(this);
        this.value = this.func.call(this.context);
        observedInfoStack.pop();
        this.updateBindings();
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
var updateOrder = [], curDepth = Infinity, maxDepth = 0;
ObservedInfo.registerUpdate = function (observeInfo, batchNum) {
    var depth = observeInfo.getDepth() - 1;
    curDepth = Math.min(depth, curDepth);
    maxDepth = Math.max(maxDepth, depth);
    var objs = updateOrder[depth];
    if (!objs) {
        objs = updateOrder[depth] = [];
    }
    objs.push(observeInfo);
};
ObservedInfo.batchEnd = function (batchNum) {
    while (curDepth <= maxDepth) {
        var cur = updateOrder[curDepth].pop();
        if (cur) {
            cur.updateCompute(batchNum);
        } else {
            curDepth++;
        }
    }
    updateOrder = [];
    curDepth = Infinity;
    maxDepth = 0;
};
var observedInfoStack = [];
can.__observe = function (obj, event) {
    var top = observedInfoStack[observedInfoStack.length - 1];
    if (top) {
        var evStr = event + '', name = obj._cid + '|' + evStr;
        if (top.traps) {
            top.traps.push({
                obj: obj,
                event: evStr,
                name: name
            });
        } else if (!top.ignore && !top.newObserved[name]) {
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
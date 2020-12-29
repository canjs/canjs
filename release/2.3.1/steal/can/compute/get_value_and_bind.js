/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*can@2.3.1#compute/get_value_and_bind*/
steal('can/util', function (can) {
    function ObservedInfo(func, context, onchanged) {
        this.func = func;
        this.context = context;
        this.onchanged = onchanged;
    }
    function getValueAndBind(observedInfo) {
        observedInfo.oldObserved = observedInfo.newObserved || {};
        observedInfo.ignore = 0;
        observedInfo.newObserved = {};
        observedInfo.ready = false;
        observedInfoStack.push(observedInfo);
        observedInfo.value = observedInfo.func.call(observedInfo.context);
        observedInfoStack.pop();
        unbindOldSet(observedInfo);
        can.batch.afterPreviousEvents(function () {
            observedInfo.ready = true;
        });
        return observedInfo;
    }
    var unbindOldSet = function (observedInfo) {
        var onchanged = observedInfo.onchanged, oldObserved = observedInfo.oldObserved;
        for (var name in oldObserved) {
            var obEv = oldObserved[name];
            if (obEv) {
                obEv.obj.unbind(obEv.event, onchanged);
            }
        }
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
                if (!top.oldObserved[name]) {
                    obj.bind(evStr, top.onchanged);
                }
                top.oldObserved[name] = null;
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
                    if (!top.oldObserved[name]) {
                        trap.obj.bind(trap.event, top.onchanged);
                    }
                    top.oldObserved[name] = null;
                }
            }
        }
    };
    can.__isRecordingObserves = function () {
        return observedInfoStack.length;
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
    getValueAndBind.unbindReadInfo = function (readInfo) {
        var onchanged = readInfo.onchanged;
        for (var name in readInfo.newObserved) {
            var ob = readInfo.newObserved[name];
            ob.obj.unbind(ob.event, onchanged);
        }
    };
    getValueAndBind.ObservedInfo = ObservedInfo;
    return getValueAndBind;
});
/*!
 * CanJS - 2.3.5
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 03 Dec 2015 23:34:11 GMT
 * Licensed MIT
 */

/*can@2.3.5#view/scope/compute_data*/
var can = require('../../util/util.js');
var compute = require('../../compute/compute.js');
var ObservedInfo = require('../../compute/get_value_and_bind.js');
var isFastPath = function (computeData) {
    return computeData.reads && computeData.reads.length === 1 && computeData.root instanceof can.Map && !can.isFunction(computeData.root[computeData.reads[0].key]);
};
var getValueAndBindSinglePropertyRead = function (readInfo, computeData, singlePropertyReadChanged) {
    var target = computeData.root, prop = computeData.reads[0].key;
    target.bind(prop, singlePropertyReadChanged);
    readInfo.value = computeData.initialValue;
};
var unbindSinglePropertyRead = function (computeData, singlePropertyReadChanged) {
    computeData.root.unbind(computeData.reads[0].key, singlePropertyReadChanged);
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
        }, singlePropertyReadChanged = function (ev, newVal, oldVal) {
            if (typeof newVal !== 'function') {
                compute.computeInstance.updater(newVal, oldVal, ev.batchNum);
            } else {
                unbindSinglePropertyRead(computeData, singlePropertyReadChanged);
                readInfo.getValueAndBind();
                isFastPathBound = false;
                compute.computeInstance.updater(readInfo.value, oldVal, ev.batchNum);
            }
        }, isFastPathBound = false, compute = can.compute(undefined, {
            on: function () {
                readInfo.getValueAndBind();
                if (isFastPath(computeData)) {
                    getValueAndBindSinglePropertyRead(readInfo, computeData, singlePropertyReadChanged);
                    readInfo.teardown();
                    readInfo.newObserved = {};
                    isFastPathBound = true;
                }
                compute.computeInstance.value = readInfo.value;
                compute.computeInstance.hasDependencies = isFastPathBound || !can.isEmptyObject(readInfo.newObserved);
            },
            off: function () {
                if (isFastPathBound) {
                    unbindSinglePropertyRead(computeData, singlePropertyReadChanged);
                } else {
                    readInfo.teardown();
                }
            },
            set: scopeRead,
            get: scopeRead,
            __selfUpdater: true
        }), readInfo = new ObservedInfo(scopeRead, null, compute.computeInstance);
    computeData.compute = compute;
    return computeData;
};
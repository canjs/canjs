/*!
 * CanJS - 2.3.0-pre.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 30 Apr 2015 21:40:42 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.0#compute/compute*/
var can = require('../util/util.js');
var bind = require('../util/bind/bind.js');
require('../util/batch/batch.js');
require('./proto_compute.js');
can.compute = function (getterSetter, context, eventName, bindOnce) {
    var internalCompute = new can.Compute(getterSetter, context, eventName, bindOnce);
    var compute = function (val) {
        if (arguments.length) {
            return internalCompute.set(val);
        }
        return internalCompute.get();
    };
    compute.bind = can.proxy(internalCompute.bind, internalCompute);
    compute.unbind = can.proxy(internalCompute.unbind, internalCompute);
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
var k = function () {
};
var computes, unbindComputes = function () {
        for (var i = 0, len = computes.length; i < len; i++) {
            computes[i].unbind('change', k);
        }
        computes = null;
    };
can.compute.temporarilyBind = function (compute) {
    compute.bind('change', k);
    if (!computes) {
        computes = [];
        setTimeout(unbindComputes, 10);
    }
    computes.push(compute);
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
module.exports = can.compute;

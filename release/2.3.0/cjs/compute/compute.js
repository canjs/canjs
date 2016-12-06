/*!
 * CanJS - 2.3.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 23 Oct 2015 20:30:08 GMT
 * Licensed MIT
 */

/*can@2.3.0#compute/compute*/
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
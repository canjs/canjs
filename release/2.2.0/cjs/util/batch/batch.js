/*!
 * CanJS - 2.2.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 13 Mar 2015 19:55:12 GMT
 * Licensed MIT
 */

/*can@2.2.0#util/batch/batch*/
var can = require('../can.js');
var batchNum = 1, transactions = 0, batchEvents = [], stopCallbacks = [];
can.batch = {
    start: function (batchStopHandler) {
        transactions++;
        if (batchStopHandler) {
            stopCallbacks.push(batchStopHandler);
        }
    },
    stop: function (force, callStart) {
        if (force) {
            transactions = 0;
        } else {
            transactions--;
        }
        if (transactions === 0) {
            var items = batchEvents.slice(0), callbacks = stopCallbacks.slice(0), i, len;
            batchEvents = [];
            stopCallbacks = [];
            can.batch.batchNum = batchNum;
            batchNum++;
            if (callStart) {
                can.batch.start();
            }
            for (i = 0, len = items.length; i < len; i++) {
                can.dispatch.apply(items[i][0], items[i][1]);
            }
            for (i = 0, len = callbacks.length; i < callbacks.length; i++) {
                callbacks[i]();
            }
            can.batch.batchNum = undefined;
        }
    },
    trigger: function (item, event, args) {
        if (!item._init) {
            if (transactions === 0) {
                return can.dispatch.call(item, event, args);
            } else {
                event = typeof event === 'string' ? { type: event } : event;
                event.batchNum = batchNum;
                batchEvents.push([
                    item,
                    [
                        event,
                        args
                    ]
                ]);
            }
        }
    }
};

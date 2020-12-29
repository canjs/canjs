/*!
 * CanJS - 2.3.34
 * http://canjs.com/
 * Copyright (c) 2018 Bitovi
 * Fri, 20 Apr 2018 19:04:13 GMT
 * Licensed MIT
 */

/*can@2.3.34#util/batch/batch*/
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
                    callbacks.push.apply(callbacks, batch.callbacks);
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
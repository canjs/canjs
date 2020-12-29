/*!
 * CanJS - 2.3.11
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 21 Jan 2016 23:41:15 GMT
 * Licensed MIT
 */

/*can@2.3.11#util/batch/batch*/
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
                while (batch = batches.shift()) {
                    var events = batch.events;
                    var callbacks = batch.callbacks;
                    dispatchingBatch = batch;
                    can.batch.batchNum = batch.number;
                    var i, len;
                    if (callStart) {
                        can.batch.start();
                    }
                    for (i = 0, len = events.length; i < len; i++) {
                        can.dispatch.apply(events[i][0], events[i][1]);
                    }
                    can.batch._onDispatchedEvents(batch.number);
                    for (i = 0; i < callbacks.length; i++) {
                        callbacks[i]();
                    }
                    dispatchingBatch = null;
                    can.batch.batchNum = undefined;
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
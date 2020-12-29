/*!
 * CanJS - 2.3.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Sat, 12 Dec 2015 01:07:53 GMT
 * Licensed MIT
 */

/*can@2.3.6#util/batch/batch*/
var can = require('../can.js');
var batchNum = 1, transactions = 0, dispatchingBatch = null, collectingBatch = null, batches = [];
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
            if (batches.length === 1) {
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
            } else {
                if (dispatchingBatch) {
                    event.batchNum = dispatchingBatch.number;
                }
                can.dispatch.call(item, event, args);
            }
        }
    },
    afterPreviousEvents: function (handler) {
        handler({});
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
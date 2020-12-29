/*!
 * CanJS - 2.3.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 23 Oct 2015 20:30:08 GMT
 * Licensed MIT
 */

/*can@2.3.0#util/batch/batch*/
steal('can/util/can.js', function (can) {
    var batchNum = 1, transactions = 0, batchEvents = [], stopCallbacks = [], currentBatchEvents = null, currentBatchCallbacks = null;
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
                if (currentBatchEvents !== null) {
                    return;
                }
                currentBatchEvents = batchEvents;
                currentBatchCallbacks = stopCallbacks;
                var i, len;
                batchEvents = [];
                stopCallbacks = [];
                can.batch.batchNum = batchNum;
                batchNum++;
                if (callStart) {
                    can.batch.start();
                }
                for (i = 0; i < currentBatchEvents.length; i++) {
                    can.dispatch.apply(currentBatchEvents[i][0], currentBatchEvents[i][1]);
                }
                currentBatchEvents = null;
                for (i = 0, len = currentBatchCallbacks.length; i < currentBatchCallbacks.length; i++) {
                    currentBatchCallbacks[i]();
                }
                currentBatchCallbacks = null;
                can.batch.batchNum = undefined;
            }
        },
        trigger: function (item, event, args) {
            if (!item.__inSetup) {
                event = typeof event === 'string' ? {
                    type: event,
                    batchNum: can.batch.batchNum
                } : event;
                if (currentBatchEvents) {
                    currentBatchEvents.push([
                        item,
                        [
                            event,
                            args
                        ]
                    ]);
                } else if (transactions === 0) {
                    return can.dispatch.call(item, event, args);
                } else {
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
        },
        afterPreviousEvents: function (handler) {
            if (currentBatchEvents) {
                var obj = { __bindEvents: { ready: [{ handler: handler }] } };
                currentBatchEvents.push([
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
            if (currentBatchEvents) {
                currentBatchCallbacks.push(handler);
            } else {
                handler({});
            }
        }
    };
});
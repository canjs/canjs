/*!
 * CanJS - 2.3.17
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 19 Feb 2016 22:54:51 GMT
 * Licensed MIT
 */

/*can@2.3.17#observe/observe*/
steal('can/util', 'can/map', 'can/list', 'can/compute', function (can) {
    can.Observe = can.Map;
    can.Observe.startBatch = can.batch.start;
    can.Observe.stopBatch = can.batch.stop;
    can.Observe.triggerBatch = can.batch.trigger;
    return can;
});
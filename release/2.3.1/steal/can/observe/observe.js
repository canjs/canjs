/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*can@2.3.1#observe/observe*/
steal('can/util', 'can/map', 'can/list', 'can/compute', function (can) {
    can.Observe = can.Map;
    can.Observe.startBatch = can.batch.start;
    can.Observe.stopBatch = can.batch.stop;
    can.Observe.triggerBatch = can.batch.trigger;
    return can;
});
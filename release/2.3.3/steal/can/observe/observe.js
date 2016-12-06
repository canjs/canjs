/*!
 * CanJS - 2.3.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Mon, 30 Nov 2015 23:22:54 GMT
 * Licensed MIT
 */

/*can@2.3.3#observe/observe*/
steal('can/util', 'can/map', 'can/list', 'can/compute', function (can) {
    can.Observe = can.Map;
    can.Observe.startBatch = can.batch.start;
    can.Observe.stopBatch = can.batch.stop;
    can.Observe.triggerBatch = can.batch.trigger;
    return can;
});
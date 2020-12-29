/*!
 * CanJS - 2.2.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Tue, 24 Mar 2015 22:13:03 GMT
 * Licensed MIT
 */

/*can@2.2.1#observe/observe*/
define([
    'can/util/library',
    'can/map',
    'can/list',
    'can/compute'
], function (can) {
    can.Observe = can.Map;
    can.Observe.startBatch = can.batch.start;
    can.Observe.stopBatch = can.batch.stop;
    can.Observe.triggerBatch = can.batch.trigger;
    return can;
});

/*!
 * CanJS - 2.3.2
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 13 Nov 2015 23:57:31 GMT
 * Licensed MIT
 */

/*can@2.3.2#observe/observe*/
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
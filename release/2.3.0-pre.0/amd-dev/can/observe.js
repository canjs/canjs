/*!
 * CanJS - 2.3.0-pre.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 30 Apr 2015 21:40:42 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.0#observe/observe*/
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

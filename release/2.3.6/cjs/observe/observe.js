/*!
 * CanJS - 2.3.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Sat, 12 Dec 2015 01:07:53 GMT
 * Licensed MIT
 */

/*can@2.3.6#observe/observe*/
var can = require('../util/util.js');
require('../map/map.js');
require('../list/list.js');
require('../compute/compute.js');
can.Observe = can.Map;
can.Observe.startBatch = can.batch.start;
can.Observe.stopBatch = can.batch.stop;
can.Observe.triggerBatch = can.batch.trigger;
module.exports = can;
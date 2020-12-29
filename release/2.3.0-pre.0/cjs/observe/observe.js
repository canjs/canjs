/*!
 * CanJS - 2.3.0-pre.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 30 Apr 2015 21:40:42 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.0#observe/observe*/
var can = require('../util/util.js');
require('../map/map.js');
require('../list/list.js');
require('../compute/compute.js');
can.Observe = can.Map;
can.Observe.startBatch = can.batch.start;
can.Observe.stopBatch = can.batch.stop;
can.Observe.triggerBatch = can.batch.trigger;
module.exports = can;

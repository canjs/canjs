/*!
 * CanJS - 2.3.29
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Mon, 06 Mar 2017 22:40:28 GMT
 * Licensed MIT
 */

/*can@2.3.29#observe/observe*/
var can = require('../util/util.js');
require('../map/map.js');
require('../list/list.js');
require('../compute/compute.js');
can.Observe = can.Map;
can.Observe.startBatch = can.batch.start;
can.Observe.stopBatch = can.batch.stop;
can.Observe.triggerBatch = can.batch.trigger;
module.exports = can;
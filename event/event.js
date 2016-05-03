var can = require('../util/can');

can.assign(can, require('can-event'));
can.assign(can, require('can-event/batch/batch'));

module.exports = can;

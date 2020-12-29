'use strict';

var globals = require('can-globals/can-globals-instance');

require('./global/global');
require('./document/document');
require('./location/location');
require('./mutation-observer/mutation-observer');
require('./is-browser-window/is-browser-window');
require('./is-node/is-node');
require('./custom-elements/custom-elements');

module.exports = globals;

'use strict';

var namespace = require('can-namespace');
var node = require('./node/node');

// backwards compatibility
module.exports = namespace.node = node;

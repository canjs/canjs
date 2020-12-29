'use strict';

var namespace = require('can-namespace');
var domMutateEvents = require('./events/events');

// backwards compatibility
module.exports = namespace.domMutateDomEvents = domMutateEvents;

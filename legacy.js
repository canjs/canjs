var can = require("can-util/namespace");

require("can-component");
require("can-route");
require("can-stache");
require("can-stache-bindings");
require("can-compute");
require("can-event");
require("can-view-model");

// Extra stuff
require("can-map");
require("can-list");
require("can-map-backup");
require("can-map-define");
require("can-connect/can/model/model");
require("can-ejs");
require("can-validate-legacy");

// Legacy namespacing for these
can.view.attr = can.view.callbacks.attr;
can.view.tag = can.view.callbacks.tag;

module.exports = can;

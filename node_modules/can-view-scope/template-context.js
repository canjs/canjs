"use strict";
var SimpleMap = require("can-simple-map");

var TemplateContext = function(options) {
	options = options || {};
	this.vars = new SimpleMap(options.vars || {});
	this.helpers = new SimpleMap(options.helpers || {});
	this.partials = new SimpleMap(options.partials || {});
	this.tags = new SimpleMap(options.tags || {});
};

module.exports = TemplateContext;

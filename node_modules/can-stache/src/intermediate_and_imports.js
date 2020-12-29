"use strict";
var canStacheAst = require("can-stache-ast");
var canDev = require("can-log/dev/dev");

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	canDev.warn('can-stache/src/intermediate_and_imports is deprecated; please use can-stache-ast instead: https://github.com/canjs/can-stache-ast');
}
//!steal-remove-end

module.exports = canStacheAst.parse;

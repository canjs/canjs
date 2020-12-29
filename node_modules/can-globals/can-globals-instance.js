'use strict';
var namespace = require('can-namespace');
var Globals = require('./can-globals-proto');
var globals = new Globals();

if (namespace.globals) {
	throw new Error("You can't have two versions of can-globals, check your dependencies");
} else {
	module.exports = namespace.globals = globals;
}

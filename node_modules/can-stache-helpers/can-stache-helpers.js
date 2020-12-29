"use strict";
var namespace = require('can-namespace');

if (namespace.stacheHelpers) {
	throw new Error("You can't have two versions of can-stache-helpers, check your dependencies");
} else {
	module.exports = namespace.stacheHelpers = {};
}

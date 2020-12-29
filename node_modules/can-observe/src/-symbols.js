"use strict";
var canSymbol = require("can-symbol");

module.exports = {
	metaSymbol: canSymbol.for("can.meta"),
	// not an actual symbol. This is so it can be enumerable
	// by default. We could create a KeyTree with a type where symbols are
	// enumerable.
	patchesSymbol: "can.patches",
	keysSymbol: "can.keys"
};

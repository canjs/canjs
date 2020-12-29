"use strict";
var canSet = require("can-set");
// This helper is used to add something to a set of data.
// if the set algebra doesn't know where to put it, we add it at the end.
module.exports = function(connection, setItems, items, item, algebra){
	var index = canSet.index(setItems, items, item, algebra);
	if(index === undefined) {
		index = items.length;
	}

	var copy = items.slice(0);
	copy.splice(index, 0, item);

	return copy;
};

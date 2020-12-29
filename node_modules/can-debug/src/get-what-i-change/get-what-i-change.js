"use strict";
var getData = require("../get-data/get-data");
var getGraph = require("../get-graph/get-graph");

module.exports = function getWhatChangesMe(obj, key) {
	var gotKey = arguments.length === 2;

	return getData(
		gotKey ? getGraph(obj, key) : getGraph(obj),
		"whatIChange"
	);
};

var constructor = require("can-connect/constructor/constructor");
var canMap = require("can-connect/can/map/map");
var dataParse = require("can-connect/data/parse/parse");
var dataUrl = require("can-connect/data/url/url");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var namespace = require("can-namespace");
var base = require("can-connect/base/base");

function defineRestModel(optionsOrUrl) {

	// If optionsOrUrl is a string, make options = {url: optionsOrUrl}
	var options = (typeof optionsOrUrl === "string") ? {url: optionsOrUrl} : optionsOrUrl;

	// If options.Map or .List aren’t provided, define them
	if (typeof options.Map === "undefined") {
		options.Map = DefineMap.extend({seal: false}, {});
	}
	if (typeof options.List === "undefined") {
		options.List = options.Map.List || DefineList.extend({"#": options.Map});
	}

	var connection = [base,dataUrl, dataParse, constructor, canMap].reduce(function(prev, behavior){
		return behavior(prev);
	}, options);
	connection.init();
	return connection;
}

module.exports = namespace.defineRestModel = defineRestModel;

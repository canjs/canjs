var connect = require("can-connect");

var constructor = require("can-connect/constructor/constructor");
var canMap = require("can-connect/can/map/map");
var constructorStore = require("can-connect/constructor/store/store");
var dataCallbacks = require("can-connect/data/callbacks/callbacks");
var dataParse = require("can-connect/data/parse/parse");
var dataUrl = require("can-connect/data/url/url");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var realTime = require("can-connect/real-time/real-time");
var callbacksOnce = require("can-connect/constructor/callbacks-once/callbacks-once");
var namespace = require("can-namespace");

function defineRealtimeRestModel(optionsOrUrl) {

	// If optionsOrUrl is a string, make options = {url: optionsOrUrl}
	var options = (typeof optionsOrUrl === "string") ? {url: optionsOrUrl} : optionsOrUrl;

	// If options.Map or .List aren’t provided, define them
	if (typeof options.Map === "undefined") {
		options.Map = DefineMap.extend({seal: false}, {});
	}
	if (typeof options.List === "undefined") {
		options.List = options.Map.List || DefineList.extend({"#": options.Map});
	}

	var behaviors = [
		constructor,
		canMap,
		constructorStore,
		dataCallbacks,
		dataParse,
		dataUrl,
		realTime,
		callbacksOnce
	];

	return connect(behaviors,options);
}

module.exports = namespace.defineRealtimeRestModel = defineRealtimeRestModel;

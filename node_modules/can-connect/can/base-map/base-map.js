var connect = require("../../can-connect");

var constructor = require("../../constructor/constructor");
var canMap = require("../map/map");
var canRef = require("../ref/ref");
var constructorStore = require("../../constructor/store/store");
var dataCallbacks = require("../../data/callbacks/callbacks");
var dataParse = require("../../data/parse/parse");
var dataUrl = require("../../data/url/url");
var realTime = require("../../real-time/real-time");
var callbacksOnce = require("../../constructor/callbacks-once/callbacks-once");
var GLOBAL = require("can-globals/global/global");


var $ = GLOBAL().$;

connect.baseMap = function(options){

	var behaviors = [
		constructor,
		canMap,
		canRef,
		constructorStore,
		dataCallbacks,
		dataParse,
		dataUrl,
		realTime,
		callbacksOnce
	];

	// Handles if jQuery isn't provided.
	if($ && $.ajax) {
		options.ajax = $.ajax;
	}

	return connect(behaviors,options);
};

module.exports = connect.baseMap;

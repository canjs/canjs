"use strict";
var connect = require("../../can-connect");

var constructor = require("../../constructor/constructor");
var canMap = require("../map/map");
var canRef = require("../ref/ref");
var constructorStore = require("../../constructor/store/store");
var dataCallbacks = require("../../data/callbacks/callbacks");
var callbacksCache = require("../../data/callbacks-cache/callbacks-cache");
var combineRequests = require("../../data/combine-requests/combine-requests");
var localCache = require("../../data/localstorage-cache/localstorage-cache");
var dataParse = require("../../data/parse/parse");
var dataUrl = require("../../data/url/url");
var fallThroughCache = require("../../fall-through-cache/fall-through-cache");
var realTime = require("../../real-time/real-time");
var callbacksOnce = require("../../constructor/callbacks-once/callbacks-once");
var GLOBAL = require("can-globals/global/global");

var $ = GLOBAL().$;

connect.superMap = function(options){

	var behaviors = [
		constructor,
		canMap,
		canRef,
		constructorStore,
		dataCallbacks,
		combineRequests,
		dataParse,
		dataUrl,
		realTime,
		callbacksOnce];

	if(typeof localStorage !== "undefined") {
		if(!options.cacheConnection) {
			options.cacheConnection = connect([localCache],{
				name: options.name+"Cache",
				idProp: options.idProp,
				queryLogic: options.queryLogic
			});
		}
		behaviors.push(callbacksCache,fallThroughCache);
	}
	// Handles if jQuery isn't provided.
	if($ && $.ajax) {
		options.ajax = $.ajax;
	}
	return connect(behaviors,options);
};

module.exports = connect.superMap;

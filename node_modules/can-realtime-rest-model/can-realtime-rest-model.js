var connect = require("can-connect");

var constructor = require("can-connect/constructor/constructor");
var canMap = require("can-connect/can/map/map");
var constructorStore = require("can-connect/constructor/store/store");
var dataCallbacks = require("can-connect/data/callbacks/callbacks");
var dataParse = require("can-connect/data/parse/parse");
var dataUrl = require("can-connect/data/url/url");
var ObservableArray = require("can-observable-array");
var ObservableObject = require("can-observable-object");
var realTime = require("can-connect/real-time/real-time");
var callbacksOnce = require("can-connect/constructor/callbacks-once/callbacks-once");
var namespace = require("can-namespace");
var type = require("can-type");

function realtimeRestModel(optionsOrUrl) {

	// If optionsOrUrl is a string, make options = {url: optionsOrUrl}
	var options = (typeof optionsOrUrl === "string") ? {url: optionsOrUrl} : optionsOrUrl;

	// If options.ObjectType or .ArrayType aren’t provided, define them
	if (typeof options.ObjectType === "undefined") {
		options.ObjectType = class DefaultObjectType extends ObservableObject {};
	}
	if (typeof options.ArrayType === "undefined") {
		options.ArrayType = class DefaultArrayType extends ObservableArray {
			static get items() {
				return type.convert(options.ObjectType);
			}
		};
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

module.exports = namespace.realtimeRestModel = realtimeRestModel;

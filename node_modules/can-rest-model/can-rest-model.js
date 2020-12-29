var constructor = require("can-connect/constructor/constructor");
var canMap = require("can-connect/can/map/map");
var dataParse = require("can-connect/data/parse/parse");
var dataUrl = require("can-connect/data/url/url");
var namespace = require("can-namespace");
var ObservableArray = require("can-observable-array");
var ObservableObject = require("can-observable-object");
var base = require("can-connect/base/base");
var type = require("can-type");

function restModel(optionsOrUrl) {

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

	var connection = [base,dataUrl, dataParse, constructor, canMap].reduce(function(prev, behavior){
		return behavior(prev);
	}, options);
	connection.init();
	return connection;
}

module.exports = namespace.restModel = restModel;

"use strict";
var helpers = require('can-stache/helpers/core');
var route = require('can-route');

var stacheExpression = require('can-stache/src/expression');
var canReflect = require("can-reflect");

var looksLikeOptions = helpers.looksLikeOptions;

var calculateArgs = function(){
	var finalParams,
		finalMerge,
		optionsArg;

	canReflect.eachIndex(arguments, function(arg){
		if(typeof arg === "boolean") {
			finalMerge = arg;
		} else if( arg && typeof arg === "object"  ) {
			if(!looksLikeOptions(arg) ) {
				finalParams = helpers.resolveHash(arg);
			} else {
				optionsArg = arg;
			}
		}
	});

	if(!finalParams && optionsArg) {
		finalParams = helpers.resolveHash(optionsArg.hash);
	}
	return {
		finalParams: finalParams || {},
		finalMerge: finalMerge,
		optionsArg: optionsArg
	};
};


// go through arguments ... if there's a boolean ... if there's a plain object
var routeUrl = function(){
	var args = calculateArgs.apply(this, arguments);

	return route.url(args.finalParams, typeof args.finalMerge === "boolean" ? args.finalMerge : undefined);
};
helpers.registerHelper('routeUrl', routeUrl);

var routeCurrent = function(){

	var args = calculateArgs.apply(this, arguments);
	var result = route.isCurrent( args.finalParams, typeof args.finalMerge === "boolean" ? args.finalMerge : undefined );

	if( args.optionsArg && !(args.optionsArg instanceof stacheExpression.Call) ) {
		if( result ) {
			return args.optionsArg.fn();
		} else {
			return args.optionsArg.inverse();
		}
	} else {
		return result;
	}
};
routeCurrent.callAsMethod = true;

helpers.registerHelper('routeCurrent', routeCurrent);

module.exports = {
	routeUrl: routeUrl,
	routeCurrent: routeCurrent
};

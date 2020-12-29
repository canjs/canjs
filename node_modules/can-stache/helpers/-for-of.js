var canReflect = require("can-reflect");
var Observation = require("can-observation");
var live = require('can-view-live');
var expression = require("../src/expression");
var KeyObservable = require("../src/key-observable");

var bindAndRead = function (value) {
	if ( value && canReflect.isValueLike(value) ) {
		Observation.temporarilyBind(value);
		return canReflect.getValue(value);
	} else {
		return value;
	}
};

function forOfInteger(integer, variableName, options) {
	var result = [];
	for (var i = 0; i < integer; i++) {
		var variableScope = {};
		if(variableName !== undefined){
			variableScope[variableName] = i;
		}
		result.push(
			options.fn( options.scope
				.add({ index: i }, { special: true })
				.addLetContext(variableScope) )
		);
	}

	return options.stringOnly ? result.join('') : result;
}

function forOfObject(object, variableName, options){
	var result = [];
	canReflect.each(object, function(val, key){
		// Allow key to contain a dot, for example: "My.key.has.dot"
		var value = new KeyObservable(object, key.replace(/\./g, "\\."));
		var variableScope = {};
		if(variableName !== undefined){
			variableScope[variableName] = value;
		}
		result.push(
			options.fn( options.scope
				.add({ key: key }, { special: true })
				.addLetContext(variableScope) )
		);
	});

	return options.stringOnly ? result.join('') : result;
}

// this is called with the ast ... we are going to use that to our advantage.
var forHelper = function(helperOptions) {
	// lookup

	// TODO: remove in prod
	// make sure we got called with the right stuff
	if(helperOptions.exprData.argExprs.length !== 1) {
		throw new Error("for(of) broken syntax");
	}

	// TODO: check if an instance of helper;

	var helperExpr = helperOptions.exprData.argExprs[0].expr;
	var variableName, valueLookup, valueObservable;
	if(helperExpr instanceof expression.Lookup) {

		valueObservable = helperExpr.value(helperOptions.scope);

	} else if(helperExpr instanceof expression.Helper) {
		// TODO: remove in prod
		var inLookup = helperExpr.argExprs[0];
		if(inLookup.key !== "of") {
			throw new Error("for(of) broken syntax");
		}
		variableName = helperExpr.methodExpr.key;
		valueLookup = helperExpr.argExprs[1];
		valueObservable = valueLookup.value(helperOptions.scope);
	}

	var items =  valueObservable;

	var args = [].slice.call(arguments),
		options = args.pop(),
		resolved = bindAndRead(items);

	if(resolved && resolved === Math.floor(resolved)) {
		return forOfInteger(resolved, variableName, helperOptions);
	}
	if(resolved && !canReflect.isListLike(resolved)) {
		return forOfObject(resolved,variableName, helperOptions);
	}
	if(options.stringOnly) {
		var parts = [];
		canReflect.eachIndex(resolved, function(value, index){
			var variableScope = {};
			if(variableName !== undefined){
				variableScope[variableName] = value;
			}
			parts.push(
				helperOptions.fn( options.scope
					.add({ index: index }, { special: true })
					.addLetContext(variableScope) )
			);
		});
		return parts.join("");
	} else {
		// Tells that a helper has been called, this function should be returned through
		// checking its value.
		options.metadata.rendered = true;
		return function(el){

			var cb = function (item, index) {
				var variableScope = {};
				if(variableName !== undefined){
					variableScope[variableName] = item;
				}
				return options.fn(
					options.scope
					.add({ index: index }, { special: true })
					.addLetContext(variableScope),
					options.options
				);
			};

			live.list(el, items, cb, options.context, function(list){
				return options.inverse(options.scope, options.options);
			});
		};
	}
};
forHelper.isLiveBound = true;
forHelper.requiresOptionsArgument = true;
forHelper.ignoreArgLookup = function ignoreArgLookup(index) {
	return index === 0;
};

module.exports = forHelper;

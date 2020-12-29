"use strict";
var live = require('can-view-live');
var utils = require('../src/utils');
var getBaseURL = require('can-globals/base-url/base-url');
var joinURIs = require('can-join-uris');
var assign = require('can-assign');
var dev = require('can-log/dev/dev');
var canReflect = require("can-reflect");
var debuggerHelper = require('./-debugger').helper;
var KeyObservable = require("../src/key-observable");
var Observation = require("can-observation");
var TruthyObservable = require("../src/truthy-observable");
var helpers = require("can-stache-helpers");
var makeConverter = require('./converter');

var domData = require('can-dom-data');

var forHelper = require("./-for-of");
var letHelper = require("./-let");
var portalHelper = require("./-portal");

var builtInHelpers = {};
var builtInConverters = {};
var converterPackages = new WeakMap();

// ## Helpers
var helpersCore = {
	looksLikeOptions: function(options){
		return options && typeof options.fn === "function" && typeof options.inverse === "function";
	},
	resolve: function(value) {
		if (value && canReflect.isValueLike(value)) {
			return canReflect.getValue(value);
		} else {
			return value;
		}
	},
	resolveHash: function(hash){
		var params = {};
		for(var prop in hash) {
			params[prop] = helpersCore.resolve(hash[prop]);
		}
		return params;
	},
	bindAndRead: function (value) {
		if ( value && canReflect.isValueLike(value) ) {
			Observation.temporarilyBind(value);
			return canReflect.getValue(value);
		} else {
			return value;
		}
	},
	registerHelper: function(name, callback){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (helpers[name]) {
				dev.warn('The helper ' + name + ' has already been registered.');
			}
		}
		//!steal-remove-end

		// mark passed in helper so it will be automatically passed
		// helperOptions (.fn, .inverse, etc) when called as Call Expressions
		callback.requiresOptionsArgument = true;

		// store on global helpers list
		helpers[name] = callback;
	},
	registerHelpers: function(helpers) {
		var name, callback;
		for(name in helpers) {
			callback = helpers[name];
			helpersCore.registerHelper(name, helpersCore.makeSimpleHelper(callback));
		}
	},
	registerConverter: function(name, getterSetter) {
		helpersCore.registerHelper(name, makeConverter(getterSetter));
	},
	makeSimpleHelper: function(fn) {
		return function() {
			var realArgs = [];
			canReflect.eachIndex(arguments, function(val) {
				realArgs.push(helpersCore.resolve(val));
			});
			return fn.apply(this, realArgs);
		};
	},
	addHelper: function(name, callback) {
		if(typeof name === "object") {
			return helpersCore.registerHelpers(name);
		}
		return helpersCore.registerHelper(name, helpersCore.makeSimpleHelper(callback));
	},
	addConverter: function(name, getterSetter) {
		if(typeof name === "object") {
			if(!converterPackages.has(name)) {
				converterPackages.set(name, true);
				canReflect.eachKey(name, function(getterSetter, name) {
					helpersCore.addConverter(name, getterSetter);
				});
			}
			return;
		}

		var helper = makeConverter(getterSetter);
		helper.isLiveBound = true;
		helpersCore.registerHelper(name, helper);
	},

	// add helpers that set up their own internal live-binding
	// these helpers will not be wrapped in computes and will
	// receive observable arguments when called with Call Expressions
	addLiveHelper: function(name, callback) {
		callback.isLiveBound = true;
		return helpersCore.registerHelper(name, callback);
	},

	getHelper: function(name, scope) {
		var helper = scope && scope.getHelper(name);

		if (!helper) {
			helper = helpers[name];
		}

		return helper;
	},
	__resetHelpers: function() {
		// remove all helpers from can-stache-helpers object
		for (var helper in helpers) {
			delete helpers[helper];
		}
		// Clear converterPackages map before re-adding converters
		converterPackages.delete(builtInConverters);

		helpersCore.addBuiltInHelpers();
		helpersCore.addBuiltInConverters();
	},
	addBuiltInHelpers: function() {
		canReflect.each(builtInHelpers, function(helper, helperName) {
			helpers[helperName] = helper;
		});
	},
	addBuiltInConverters: function () {
		helpersCore.addConverter(builtInConverters);
	},
	_makeLogicHelper: function(name, logic){
		var logicHelper =  assign(function() {
			var args = Array.prototype.slice.call(arguments, 0),
				options;

			if( helpersCore.looksLikeOptions(args[args.length - 1]) ){
				options = args.pop();
			}

			function callLogic(){
				// if there are options, we want to prevent re-rendering if values are still truthy
				if(options) {
					return logic(args) ? true: false;
				} else {
					return logic(args);
				}

			}

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				Object.defineProperty(callLogic, "name", {
					value: name+"("+args.map(function(arg){
						return canReflect.getName(arg);
					}).join(",")+")",
					configurable: true
				});
			}
			//!steal-remove-end
			var callFn = new Observation(callLogic);

			if(options) {
				return callFn.get() ? options.fn() : options.inverse();
			} else {
				return callFn.get();
			}

		},{requiresOptionsArgument: true, isLiveBound: true});

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			Object.defineProperty(logicHelper, "name", {
				value: name,
				configurable: true
			});
		}
		//!steal-remove-end

		return logicHelper;
	}
};



// ## IF HELPER
var ifHelper = assign(function ifHelper(expr, options) {
	var value;
	// if it's a function, wrap its value in a compute
	// that will only change values from true to false
	if (expr && canReflect.isValueLike(expr)) {
		value = canReflect.getValue(new TruthyObservable(expr));
	} else {
		value = !! helpersCore.resolve(expr);
	}

	if (options) {
		return value ? options.fn(options.scope || this) : options.inverse(options.scope || this);
	}

	return !!value;
}, {requiresOptionsArgument: true, isLiveBound: true});




//## EQ/IS HELPER
var isHelper = helpersCore._makeLogicHelper("eq", function eqHelper(args){
	var curValue, lastValue;
	for (var i = 0; i < args.length; i++) {
		curValue = helpersCore.resolve(args[i]);
		curValue = typeof curValue === "function" ? curValue() : curValue;

		if (i > 0) {
			if (curValue !== lastValue) {
				return false;
			}
		}
		lastValue = curValue;
	}
	return true;
});

var andHelper = helpersCore._makeLogicHelper("and", function andHelper(args){
	if(args.length === 0 ) {
		return false;
	}
	var last;
	for (var i = 0, len = args.length; i < len; i++) {
		last = helpersCore.resolve(args[i]);
		if( !last  ) {
			return last;
		}
	}
	return last;
});

var orHelper = helpersCore._makeLogicHelper("or", function orHelper(args){
	if(args.length === 0 ) {
		return false;
	}
	var last;
	for (var i = 0, len = args.length; i < len; i++) {
		last = helpersCore.resolve(args[i]);
		if( last  ) {
			return last;
		}
	}
	return last;
});


var switchHelper = function(expression, options){
	helpersCore.resolve(expression);
	var found = false;

	var caseHelper = function(value, options) {
		if(!found && helpersCore.resolve(expression) === helpersCore.resolve(value)) {
			found = true;
			return options.fn(options.scope);
		}
	};
	caseHelper.requiresOptionsArgument = true;

	// create default helper as a value-like function
	// so that either {{#default}} or {{#default()}} will work
	var defaultHelper = function(options) {
		if (!found) {
			return options ? options.scope.peek('this') : true;
		}
	};
	defaultHelper.requiresOptionsArgument = true;
	canReflect.assignSymbols(defaultHelper, {
		"can.isValueLike": true,
		"can.isFunctionLike": false,
		"can.getValue": function() {
			// pass the helperOptions passed to {{#switch}}
			return this(options);
		}
	});

	var newScope = options.scope.add({
		case: caseHelper,
		default: defaultHelper
	}, { notContext: true });

	return options.fn(newScope, options);
};
switchHelper.requiresOptionsArgument = true;


// ## ODD HELPERS

var domDataHelper = function(attr, value) {
	var data = (helpersCore.looksLikeOptions(value) ? value.context : value) || this;
	return function setDomData(el) {
		domData.set( el, attr, data );
	};
};

var joinBaseHelper = function(firstExpr/* , expr... */){
	var args = [].slice.call(arguments);
	var options = args.pop();

	var moduleReference = args.map( function(expr){
		var value = helpersCore.resolve(expr);
		return typeof value === "function" ? value() : value;
	}).join("");

	var templateModule = canReflect.getKeyValue(options.scope.templateContext.helpers, 'module');
	var parentAddress = templateModule ? templateModule.uri: undefined;

	var isRelative = moduleReference[0] === ".";

	if(isRelative && parentAddress) {
		return joinURIs(parentAddress, moduleReference);
	} else {
		var baseURL = (typeof System !== "undefined" &&
			(System.renderingBaseURL || System.baseURL)) ||	getBaseURL();

		// Make sure one of them has a needed /
		if(moduleReference[0] !== "/" && baseURL[baseURL.length - 1] !== "/") {
			baseURL += "/";
		}

		return joinURIs(baseURL, moduleReference);
	}
};
joinBaseHelper.requiresOptionsArgument = true;

// ## LEGACY HELPERS

// ### each
var eachHelper = function(items) {
	var args = [].slice.call(arguments),
		options = args.pop(),
		hashExprs = options.exprData.hashExprs,
		resolved = helpersCore.bindAndRead(items),
		hashOptions,
		aliases;

	// Check if using hash
	if (canReflect.size(hashExprs) > 0) {
		hashOptions = {};
		canReflect.eachKey(hashExprs, function (exprs, key) {
			hashOptions[exprs.key] = key;
		});
	}

	if ((
		canReflect.isObservableLike(resolved) && canReflect.isListLike(resolved) ||
			( canReflect.isListLike(resolved) && canReflect.isValueLike(items) )
	) && !options.stringOnly) {
		// Tells that a helper has been called, this function should be returned through
		// checking its value.
		options.metadata.rendered = true;
		return function(el){
			var cb = function (item, index) {
				var aliases = {};

				if (canReflect.size(hashOptions) > 0) {
					if (hashOptions.value) {
						aliases[hashOptions.value] = item;
					}
					if (hashOptions.index) {
						aliases[hashOptions.index] = index;
					}
				}

				return options.fn(
					options.scope
					.add(aliases, { notContext: true })
					.add({ index: index }, { special: true })
					.add(item),
				options.options
				);
			};

			live.list(el, items, cb, options.context , function(list){
				return options.inverse(options.scope.add(list), options.options);
			});
		};
	}

	var expr = helpersCore.resolve(items),
		result;

	if (!!expr && canReflect.isListLike(expr)) {
		result = utils.getItemsFragContent(expr, options, options.scope);
		return options.stringOnly ? result.join('') : result;
	} else if (canReflect.isObservableLike(expr) && canReflect.isMapLike(expr) || expr instanceof Object) {
		result = [];
		canReflect.each(expr, function(val, key){
			var value = new KeyObservable(expr, key);
			aliases = {};

			if (canReflect.size(hashOptions) > 0) {
				if (hashOptions.value) {
					aliases[hashOptions.value] = value;
				}
				if (hashOptions.key) {
					aliases[hashOptions.key] = key;
				}
			}
			result.push(options.fn(
				options.scope
				.add(aliases, { notContext: true })
				.add({ key: key }, { special: true })
				.add(value)
			));
		});

		return options.stringOnly ? result.join('') : result;
	}
};
eachHelper.isLiveBound = true;
eachHelper.requiresOptionsArgument = true;
eachHelper.ignoreArgLookup = function ignoreArgLookup(index) {
	return index === 1;
};

// ### index
// This is legacy for `{{index(5)}}`
var indexHelper = assign(function indexHelper(offset, options) {
	if (!options) {
		options = offset;
		offset = 0;
	}
	var index = options.scope.peek("scope.index");
	return ""+((typeof(index) === "function" ? index() : index) + offset);
}, {requiresOptionsArgument: true});

// ### WITH HELPER
var withHelper = function (expr, options) {
	var ctx = expr;
	if(!options) {
		// hash-only case if no current context expression
		options = expr;
		expr = true;
		ctx = options.hash;
	} else {
		expr = helpersCore.resolve(expr);
		if(options.hash && canReflect.size(options.hash) > 0) {
			// presumably rare case of both a context object AND hash keys
			// Leaving it undocumented for now, but no reason not to support it.
			ctx = options.scope.add(options.hash, { notContext: true }).add(ctx);
		}
	}
	return options.fn(ctx || {});
};
withHelper.requiresOptionsArgument = true;

// ### data helper
var dataHelper = function(attr, value) {
	var data = (helpersCore.looksLikeOptions(value) ? value.context : value) || this;
	return function setData(el) {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('The {{data}} helper has been deprecated; use {{domData}} instead: https://canjs.com/doc/can-stache.helpers.domData.html');
		}
		//!steal-remove-end
		domData.set( el, attr, data );
	};
};

// ## UNLESS HELPER
var unlessHelper = function (expr, options) {
	if(!options) {
		return !ifHelper.apply(this, [expr]);
	}
	return ifHelper.apply(this, [expr, assign(assign({}, options), {
		fn: options.inverse,
		inverse: options.fn
	})]);
};
unlessHelper.requiresOptionsArgument = true;
unlessHelper.isLiveBound = true;


// ## Converters
// ## NOT converter
var notConverter = {
	get: function(obs, options){
		if(helpersCore.looksLikeOptions(options)) {
			return canReflect.getValue(obs) ? options.inverse() : options.fn();
		} else {
			return !canReflect.getValue(obs);
		}
	},
	set: function(newVal, obs){
		canReflect.setValue(obs, !newVal);
	}
};

// ## Register as defaults

assign(builtInHelpers, {
	'debugger': debuggerHelper,
	each: eachHelper,
	eachOf: eachHelper,
	index: indexHelper,
	'if': ifHelper,
	is: isHelper,
	eq: isHelper,
	unless: unlessHelper,
	'with': withHelper,
	console: console,
	data: dataHelper,
	domData: domDataHelper,
	'switch': switchHelper,
	joinBase: joinBaseHelper,
	and: andHelper,
	or: orHelper,
	'let': letHelper,
	'for': forHelper,
	portal: portalHelper
});

assign(builtInConverters, {
	'not': notConverter
});

// add all the built-in helpers when stache is loaded
helpersCore.addBuiltInHelpers();
helpersCore.addBuiltInConverters();

module.exports = helpersCore;

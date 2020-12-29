"use strict";
var Scope = require('can-view-scope');
var ObservationRecorder = require('can-observation-recorder');
var observationReader = require('can-stache-key');
var canReflect = require('can-reflect');
var KeyObservable = require("./key-observable");

var canSymbol = require("can-symbol");
var isViewSymbol = canSymbol.for("can.isView");

// this creates a noop that marks that a renderer was called
// this is for situations where a helper function calls a renderer
// that was not provided such as
// {{#if false}} ... {{/if}}
// with no {{else}}
var createNoOpRenderer = function (metadata) {
	return function noop() {
		if (metadata) {
			metadata.rendered = true;
		}
	};
};

module.exports = {
	last: function(arr){
		return arr !=null && arr[arr.length-1];
	},
	// A generic empty function
	emptyHandler: function(){},
	// Converts a string like "1" into 1. "null" into null, etc.
	// This doesn't have to do full JSON, so removing eval would be good.
	jsonParse: function(str){
		// if it starts with a quote, assume a string.
		if(str[0] === "'") {
			return str.substr(1, str.length -2);
		} else if(str === "undefined") {
			return undefined;
		} else {
			return JSON.parse(str);
		}
	},
	mixins: {
		last: function(){
			return this.stack[this.stack.length - 1];
		},
		add: function(chars){
			this.last().add(chars);
		},
		subSectionDepth: function(){
			return this.stack.length - 1;
		}
	},
	// Sets .fn and .inverse on a helperOptions object and makes sure
	// they can reference the current scope and options.
	createRenderers: function(helperOptions, scope, truthyRenderer, falseyRenderer, isStringOnly){
		helperOptions.fn = truthyRenderer ? this.makeRendererConvertScopes(truthyRenderer, scope, isStringOnly, helperOptions.metadata) : createNoOpRenderer(helperOptions.metadata);
		helperOptions.inverse = falseyRenderer ? this.makeRendererConvertScopes(falseyRenderer, scope, isStringOnly, helperOptions.metadata) : createNoOpRenderer(helperOptions.metadata);
		helperOptions.isSection = !!(truthyRenderer || falseyRenderer);
	},
	// Returns a new renderer function that makes sure any data or helpers passed
	// to it are converted to a can.view.Scope and a can.view.Options.
	makeRendererConvertScopes: function (renderer, parentScope, observeObservables, metadata) {
		var convertedRenderer = function (newScope, newOptions) {
			// prevent binding on fn.
			// If a non-scope value is passed, add that to the parent scope.
			if (newScope !== undefined && !(newScope instanceof Scope)) {
				if (parentScope) {
					newScope = parentScope.add(newScope);
				}
				else {
					newScope = new Scope(newScope || {});
				}
			}
			if (metadata) {
				metadata.rendered = true;
			}

			var result = renderer(newScope || parentScope );
			return result;
		};
		return observeObservables ? convertedRenderer :
			ObservationRecorder.ignore(convertedRenderer);
	},
	makeView: function(renderer){
		var view = ObservationRecorder.ignore(function(scope){
			if(!(scope instanceof Scope)) {
				scope = new Scope(scope);
			}
			return renderer(scope);
		});
		view[isViewSymbol] = true;
		return view;
	},
	// Calls the truthy subsection for each item in a list and returning them in a string.
	getItemsStringContent: function(items, isObserveList, helperOptions){
		var txt = "",
			len = observationReader.get(items, 'length'),
			isObservable = canReflect.isObservableLike(items);

		for (var i = 0; i < len; i++) {
			var item = isObservable ? new KeyObservable(items, i) :items[i];
			txt += helperOptions.fn(item);
		}
		return txt;
	},
	// Calls the truthy subsection for each item in a list and returns them in a document Fragment.
	getItemsFragContent: function(items, helperOptions, scope) {
		var result = [],
			len = observationReader.get(items, 'length'),
			isObservable = canReflect.isObservableLike(items),
			hashExprs = helperOptions.exprData && helperOptions.exprData.hashExprs,
			hashOptions;

		// Check if using hash
		if (canReflect.size(hashExprs) > 0) {
			hashOptions = {};
			canReflect.eachKey(hashExprs, function (exprs, key) {
				hashOptions[exprs.key] = key;
			});
		}

		for (var i = 0; i < len; i++) {
			var aliases = {};

			var item = isObservable ? new KeyObservable(items, i) :items[i];

			if (canReflect.size(hashOptions) > 0) {
				if (hashOptions.value) {
					aliases[hashOptions.value] = item;
				}
				if (hashOptions.index) {
					aliases[hashOptions.index] = i;
				}
			}

			result.push(helperOptions.fn(
				scope
				.add(aliases, { notContext: true })
				.add({ index: i }, { special: true })
				.add(item))
			);
		}
		return result;
	}
};

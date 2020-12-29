"use strict";
//
// This provides helper utilities for Mustache processing. Currently,
// only stache uses these helpers.  Ideally, these utilities could be used
// in other libraries implementing Mustache-like features.
var live = require('can-view-live');
var liveHelpers = require("can-view-live/lib/helpers");

var Observation = require('can-observation');
var ObservationRecorder = require('can-observation-recorder');
var utils = require('./utils');
var expression = require('./expression');
var frag = require("can-fragment");
var domMutate = require("can-dom-mutate");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var dev = require("can-log/dev/dev");
var getDocument = require("can-globals/document/document");
var defineLazyValue = require("can-define-lazy-value");

var toDOMSymbol = canSymbol.for("can.toDOM");

// Lazily lookup the context only if it's needed.
function HelperOptions(scope, exprData, stringOnly) {
	this.metadata = { rendered: false };
	this.stringOnly = stringOnly;
	this.scope = scope;
	this.exprData = exprData;
}
defineLazyValue(HelperOptions.prototype,"context", function(){
	return this.scope.peek("this");
});




// ## Helpers

var mustacheLineBreakRegExp = /(?:(^|\r?\n)(\s*)(\{\{([\s\S]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([\s\S]*)\}\}\}?)/g,
	mustacheWhitespaceRegExp = /\s*\{\{--\}\}\s*|\s*(\{\{\{?)-|-(\}\}\}?)\s*/g,
	k = function(){};
var viewInsertSymbol = canSymbol.for("can.viewInsert");


// DOM, safeString or the insertSymbol can opt-out of updating as text
function valueShouldBeInsertedAsHTML(value) {
	return value !== null && typeof value === "object" && (
		typeof value[toDOMSymbol] === "function" ||
		typeof value[viewInsertSymbol] === "function" ||
		typeof value.nodeType === "number" );
}




var core = {
	expression: expression,
	// ## mustacheCore.makeEvaluator
	// Given a scope and expression, returns a function that evaluates that expression in the scope.
	//
	// This function first reads lookup values in the args and hash.  Then it tries to figure out
	// if a helper is being called or a value is being read.  Finally, depending on
	// if it's a helper, or not, and which mode the expression is in, it returns
	// a function that can quickly evaluate the expression.
	/**
	 * @hide
	 * Given a mode and expression data, returns a function that evaluates that expression.
	 * @param {can-view-scope} The scope in which the expression is evaluated.
	 * @param {can.view.Options} The option helpers in which the expression is evaluated.
	 * @param {String} mode Either null, #, ^. > is handled elsewhere
	 * @param {Object} exprData Data about what was in the mustache expression
	 * @param {renderer} [truthyRenderer] Used to render a subsection
	 * @param {renderer} [falseyRenderer] Used to render the inverse subsection
	 * @param {String} [stringOnly] A flag to indicate that only strings will be returned by subsections.
	 * @return {Function} An 'evaluator' function that evaluates the expression.
	 */
	makeEvaluator: function (scope, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {

		if(mode === "^") {
			var temp = truthyRenderer;
			truthyRenderer = falseyRenderer;
			falseyRenderer = temp;
		}

		var value,
			helperOptions = new HelperOptions(scope , exprData, stringOnly);
			// set up renderers
			utils.createRenderers(helperOptions, scope ,truthyRenderer, falseyRenderer, stringOnly);

		if(exprData instanceof expression.Call) {
			value = exprData.value(scope, helperOptions);
		} else if (exprData instanceof expression.Bracket) {
			value = exprData.value(scope);
		} else if (exprData instanceof expression.Lookup) {
			value = exprData.value(scope);
		} else if (exprData instanceof expression.Literal) {
			value = exprData.value.bind(exprData);
		} else if (exprData instanceof expression.Helper && exprData.methodExpr instanceof expression.Bracket) {
			// Brackets get wrapped in Helpers when used in attributes
			// like `<p class="{{ foo[bar] }}" />`
			value = exprData.methodExpr.value(scope, helperOptions);
		} else {
			value = exprData.value(scope, helperOptions);
			if (typeof value === "function") {
				return value;
			}
		}
		// {{#something()}}foo{{/something}}
		// return evaluator for no mode or rendered value if a renderer was called
		if(!mode || helperOptions.metadata.rendered) {
			return value;
		} else if( mode === "#" || mode === "^" ) {

			return function(){
				// Get the value
				var finalValue = canReflect.getValue(value);
				var result;

				// if options.fn or options.inverse was called, we take the observable's return value
				// as what should be put in the DOM.
				if(helperOptions.metadata.rendered) {
					result = finalValue;
				}
				// If it's an array, render.
				else if ( typeof finalValue !== "string" && canReflect.isListLike(finalValue) ) {
					var isObserveList = canReflect.isObservableLike(finalValue) &&
						canReflect.isListLike(finalValue);

					if(canReflect.getKeyValue(finalValue, "length")) {
						if (stringOnly) {
							result = utils.getItemsStringContent(finalValue, isObserveList, helperOptions);
						} else {
							result = frag(utils.getItemsFragContent(finalValue, helperOptions, scope));
						}
					} else {
						result = helperOptions.inverse(scope);
					}
				}
				else {
					result = finalValue ? helperOptions.fn(finalValue || scope) : helperOptions.inverse(scope);
				}
				// We always set the rendered result back to false.
				// - Future calls might change from returning a value to calling `.fn`
				// - We are calling `.fn` and `.inverse` ourselves.
				helperOptions.metadata.rendered = false;
				return result;
			};
		} else {
			// not supported!
		}
	},
	// ## mustacheCore.makeLiveBindingPartialRenderer
	// Returns a renderer function that live binds a partial.
	/**
	 * @hide
	 * Returns a renderer function that live binds a partial.
	 * @param {String} expressionString
	 * @param {Object} state The html state of where the expression was found.
	 * @return {function(this:HTMLElement,can-view-scope,can.view.Options)} A renderer function
	 * live binds a partial.
	 */
	makeLiveBindingPartialRenderer: function(expressionString, state){
		expressionString = expressionString.trim();
		var exprData,
				partialName = expressionString.split(/\s+/).shift();

		if(partialName !== expressionString) {
			exprData = core.expression.parse(expressionString);
		}

		return function(scope){
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				scope.set('scope.filename', state.filename);
				scope.set('scope.lineNumber', state.lineNo);
			}
			//!steal-remove-end

			var partialFrag = new Observation(function(){
				var localPartialName = partialName;
				var partialScope = scope;
				// If the second parameter of a partial is a custom context
				if(exprData && exprData.argExprs.length === 1) {
					var newContext = canReflect.getValue( exprData.argExprs[0].value(scope) );
					if(typeof newContext === "undefined") {
						//!steal-remove-start
						if (process.env.NODE_ENV !== 'production') {
							dev.warn('The context ('+ exprData.argExprs[0].key +') you passed into the' +
								'partial ('+ partialName +') is not defined in the scope!');
						}
						//!steal-remove-end
					}else{
						partialScope = scope.add(newContext);
					}
				}
				// Look up partials in templateContext first
				var partial = canReflect.getKeyValue(partialScope.templateContext.partials, localPartialName);
				var renderer;

				if (partial) {
					renderer = function() {
						return partial.render ? partial.render(partialScope)
							: partial(partialScope);
					};
				}
				// Use can.view to get and render the partial.
				else {
					var scopePartialName = partialScope.read(localPartialName, {
						isArgument: true
					}).value;

					if (scopePartialName === null || !scopePartialName && localPartialName[0] === '*') {
						return frag("");
					}
					if (scopePartialName) {
						localPartialName = scopePartialName;
					}

					renderer = function() {
						if(typeof localPartialName === "function"){
							return localPartialName(partialScope, {});
						} else {
							var domRenderer = core.getTemplateById(localPartialName);
							//!steal-remove-start
							if (process.env.NODE_ENV !== 'production') {
								if (!domRenderer) {
									dev.warn(
										(state.filename ? state.filename + ':' : '') +
										(state.lineNo ? state.lineNo + ': ' : '') +
										'Unable to find partial "' + localPartialName + '".');
								}
							}
							//!steal-remove-end
							return domRenderer ? domRenderer(partialScope, {}) : getDocument().createDocumentFragment();
						}
					};
				}
				var res = ObservationRecorder.ignore(renderer)();
				return frag(res);
			});

			live.html(this, partialFrag);
		};
	},
	// ## mustacheCore.makeStringBranchRenderer
	// Return a renderer function that evalutes to a string and caches
	// the evaluator on the scope.
	/**
	 * @hide
	 * Return a renderer function that evaluates to a string.
	 * @param {String} mode
	 * @param {can.stache.Expression} expression
	 * @param {Object} state The html state of where the expression was found.
	 * @return {function(can.view.Scope,can.view.Options, can-stache.view, can.view.renderer)}
	 */
	makeStringBranchRenderer: function(mode, expressionString, state){
		var exprData = core.expression.parse(expressionString),
			// Use the full mustache expression as the cache key.
			fullExpression = mode+expressionString;

		// A branching renderer takes truthy and falsey renderer.
		var branchRenderer = function branchRenderer(scope, truthyRenderer, falseyRenderer){
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				scope.set('scope.filename', state.filename);
				scope.set('scope.lineNumber', state.lineNo);
			}
			//!steal-remove-end
			// Check the scope's cache if the evaluator already exists for performance.
			var evaluator = scope.__cache[fullExpression];
			if(mode || !evaluator) {
				evaluator = makeEvaluator( scope, mode, exprData, truthyRenderer, falseyRenderer, true);
				if(!mode) {
					scope.__cache[fullExpression] = evaluator;
				}
			}
			var gotObservableValue = evaluator[canSymbol.for("can.onValue")],
				res;

			// Run the evaluator and return the result.
			if(gotObservableValue) {
				res = canReflect.getValue(evaluator);
			} else {
				res = evaluator();
			}

			if (res == null) {
				return "";
			}
			return res.nodeType === 11 ? res.textContent : ""+res;
		};

		branchRenderer.exprData = exprData;

		return branchRenderer;
	},
	// ## mustacheCore.makeLiveBindingBranchRenderer
	// Return a renderer function that evaluates the mustache expression and
	// sets up live binding if a compute with dependencies is found. Otherwise,
	// the element's value is set.
	//
	// This function works by creating a `can.compute` from the mustache expression.
	// If the compute has dependent observables, it passes the compute to `can.view.live`; otherwise,
	// it updates the element's property based on the compute's value.
	/**
	 * @hide
	 * Returns a renderer function that evaluates the mustache expression.
	 * @param {String} mode
	 * @param {can.stache.Expression} expression
	 * @param {Object} state The html state of where the expression was found.
	 */
	makeLiveBindingBranchRenderer: function(mode, expressionString, state){
		// Pre-process the expression.
		var exprData = core.expression.parse(expressionString);

		// A branching renderer takes truthy and falsey renderer.
		var branchRenderer = function branchRenderer(scope, truthyRenderer, falseyRenderer){
			// If this is within a tag, make sure we only get string values.
			var stringOnly = state.tag;
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				scope.set('scope.filename', state.filename);
				scope.set('scope.lineNumber', state.lineNo);
			}
			//!steal-remove-end

			// Get the evaluator. This does not need to be cached (probably) because if there
			// an observable value, it will be handled by `can.view.live`.
			var evaluator = makeEvaluator( scope, mode, exprData, truthyRenderer, falseyRenderer, stringOnly );

			// Create a compute that can not be observed by other
			// computes. This is important because this renderer is likely called by
			// parent expressions.  If this value changes, the parent expressions should
			// not re-evaluate. We prevent that by making sure this compute is ignored by
			// everyone else.
			//var compute = can.compute(evaluator, null, false);
			var gotObservableValue = evaluator[canSymbol.for("can.onValue")];
			var observable;
			if(gotObservableValue) {
				observable = evaluator;
			} else {
				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					Object.defineProperty(evaluator,"name",{
						value: "{{"+(mode || "")+expressionString+"}}"
					});
				}
				//!steal-remove-end
				observable = new Observation(evaluator,null,{isObservable: false});
			}

			// Bind on the computeValue to set the cached value. This helps performance
			// so live binding can read a cached value instead of re-calculating.
			canReflect.onValue(observable, k);

			var value = canReflect.getValue(observable);

			// If value is a function and not a Lookup ({{foo}}),
			// it's a helper that returned a function and should be called.
			if(typeof value === "function" && !(exprData instanceof expression.Lookup)) {

				// A helper function should do it's own binding.  Similar to how
				// we prevented this function's compute from being noticed by parent expressions,
				// we hide any observables read in the function by saving any observables that
				// have been read and then setting them back which overwrites any `can.__observe` calls
				// performed in value.
				ObservationRecorder.ignore(value)(this);

			}
			// If the computeValue has observable dependencies, setup live binding.
			else if( canReflect.valueHasDependencies(observable) ) {
				// Depending on where the template is, setup live-binding differently.
				if(state.attr) {
					live.attr(this, state.attr, observable);
				}
				else if( state.tag )  {
					live.attrs( this, observable );
				}
				else if(state.text && !valueShouldBeInsertedAsHTML(value)) {
					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						if(value !== null && typeof value === "object") {
							dev.warn("Previously, the result of "+
								expressionString+" in "+state.filename+":"+state.lineNo+
								", was being inserted as HTML instead of TEXT. Please use stache.safeString(obj) "+
								"if you would like the object to be treated as HTML.");
						}
					}
					//!steal-remove-end
					live.text(this, observable);
				} else {
					live.html(this, observable);
				}
			}
			// If the computeValue has no observable dependencies, just set the value on the element.
			else {

				if(state.attr) {
					domMutate.setAttribute(this, state.attr, value);
				}
				else if(state.tag) {
					live.attrs(this, value);
				}
				else if(state.text && !valueShouldBeInsertedAsHTML(value)) {
					this.nodeValue = liveHelpers.makeString(value);
				}
				else if( value != null ){
					if (typeof value[viewInsertSymbol] === "function") {
						var insert = value[viewInsertSymbol]({});
						this.parentNode.replaceChild( insert, this );
					} else {
						this.parentNode.replaceChild(frag(value, this.ownerDocument), this);
						//domMutateNode.replaceChild.call(this.parentNode, frag(value, this.ownerDocument), this);
					}
				}
			}
			// Unbind the compute.
			canReflect.offValue(observable, k);
		};

		branchRenderer.exprData = exprData;

		return branchRenderer;
	},
	// ## mustacheCore.splitModeFromExpression
	// Returns the mustache mode split from the rest of the expression.
	/**
	 * @hide
	 * Returns the mustache mode split from the rest of the expression.
	 * @param {can.stache.Expression} expression
	 * @param {Object} state The state of HTML where the expression was found.
	 */
	splitModeFromExpression: function(expression, state){
		expression = expression.trim();
		var mode = expression.charAt(0);

		if( "#/{&^>!<".indexOf(mode) >= 0 ) {
			expression =  expression.substr(1).trim();
		} else {
			mode = null;
		}
		// Triple braces do nothing within a tag.
		if(mode === "{" && state.node) {
			mode = null;
		}
		return {
			mode: mode,
			expression: expression
		};
	},
	// ## mustacheCore.cleanLineEndings
	// Removes line breaks accoding to the mustache specification.
	/**
	 * @hide
	 * Prunes line breaks accoding to the mustache specification.
	 * @param {String} template
	 * @return {String}
	 */
	cleanLineEndings: function(template){

		// Finds mustache tags with space around them or no space around them.
		return template.replace( mustacheLineBreakRegExp,
			function(whole,
				returnBefore,
				spaceBefore,
				special,
				expression,
				spaceAfter,
				returnAfter,
				// A mustache magic tag that has no space around it.
				spaceLessSpecial,
				spaceLessExpression,
				matchIndex){

			// IE 8 will provide undefined
			spaceAfter = (spaceAfter || "");
			returnBefore = (returnBefore || "");
			spaceBefore = (spaceBefore || "");

			var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression,{});

			// If it's a partial or tripple stache, leave in place.
			if(spaceLessSpecial || ">{".indexOf( modeAndExpression.mode) >= 0) {
				return whole;
			}  else if( "^#!/".indexOf(  modeAndExpression.mode ) >= 0 ) {
				// Return the magic tag and a trailing linebreak if this did not
				// start a new line and there was an end line.
				// Add a normalized leading space, if there was any leading space, in case this abuts a tag name
				spaceBefore = (returnBefore + spaceBefore) && " ";
				return spaceBefore+special+( matchIndex !== 0 && returnAfter.length ? returnBefore+"\n" :"");


			} else {
				// There is no mode, return special with spaces around it.
				return spaceBefore+special+spaceAfter+(spaceBefore.length || matchIndex !== 0 ? returnBefore+"\n" : "");
			}

		});
	},
	// ## mustacheCore.cleanWhitespaceControl
	// Removes whitespace according to the whitespace control.
	/**
	 * @hide
	 * Prunes whitespace according to the whitespace control.
	 * @param {String} template
	 * @return {String}
	 */
	cleanWhitespaceControl: function(template) {
		return template.replace(mustacheWhitespaceRegExp, "$1$2");
	},
	getTemplateById: function(){}
};

// ## Local Variable Cache
//
// The following creates slightly more quickly accessible references of the following
// core functions.
var makeEvaluator = core.makeEvaluator,
	splitModeFromExpression = core.splitModeFromExpression;

module.exports = core;

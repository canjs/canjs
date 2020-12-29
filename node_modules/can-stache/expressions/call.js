"use strict";
var Hashes = require('./hashes');
var SetIdentifier = require("../src/set-identifier");
var canSymbol = require("can-symbol");

var SetterObservable = require("can-simple-observable/setter/setter");
var expressionHelpers = require("../src/expression-helpers");
var canReflect = require("can-reflect");
var assign = require('can-assign');

var sourceTextSymbol = canSymbol.for("can-stache.sourceText");
var isViewSymbol = canSymbol.for("can.isView");
var Scope = require("can-view-scope");
var Observation = require("can-observation");

// ### Call
// `new Call( new Lookup("method"), [new ScopeExpr("name")], {})`
// A call expression like `method(arg1, arg2)` that, by default,
// calls `method` with non compute values.
var Call = function(methodExpression, argExpressions){
	this.methodExpr = methodExpression;
	this.argExprs = argExpressions.map(expressionHelpers.convertToArgExpression);
};
Call.prototype.args = function(scope, ignoreArgLookup) {
	var hashExprs = {};
	var args = [];
	var gotIgnoreFunction = typeof ignoreArgLookup === "function";

	for (var i = 0, len = this.argExprs.length; i < len; i++) {
		var arg = this.argExprs[i];
		if(arg.expr instanceof Hashes){
			assign(hashExprs, arg.expr.hashExprs);
		}
		if (!gotIgnoreFunction || !ignoreArgLookup(i)) {
			var value = arg.value.apply(arg, arguments);
			args.push({
				// always do getValue unless compute is false
				call: !arg.modifiers || !arg.modifiers.compute,
				value: value
			});
		}
	}
	return function(doNotWrapArguments){
		var finalArgs = [];
		if(canReflect.size(hashExprs) > 0){
			finalArgs.hashExprs = hashExprs;
		}
		for(var i = 0, len = args.length; i < len; i++) {
			if (doNotWrapArguments) {
				finalArgs[i] = args[i].value;
			} else {
				finalArgs[i] = args[i].call ?
					canReflect.getValue( args[i].value ) :
					expressionHelpers.toCompute( args[i].value );
			}
		}
		return finalArgs;
	};
};

Call.prototype.value = function(scope, helperOptions){
	var callExpression = this;

	// proxyMethods must be false so that the `requiresOptionsArgument` and any
	// other flags stored on the function are preserved
	var method = this.methodExpr.value(scope, { proxyMethods: false });
	Observation.temporarilyBind(method);
	var func = canReflect.getValue( method );

	var getArgs = callExpression.args(scope , func && func.ignoreArgLookup);

	var computeFn = function(newVal){
		var func = canReflect.getValue( method );
		if(typeof func === "function") {
			if (canReflect.isObservableLike(func)) {
				func = canReflect.getValue(func);
			}
			var args = getArgs(
				func.isLiveBound
			);

			if (func.requiresOptionsArgument) {
				if(args.hashExprs && helperOptions && helperOptions.exprData){
					helperOptions.exprData.hashExprs = args.hashExprs;
				}
				// For #581
				if(helperOptions !== undefined) {
					args.push(helperOptions);
				}
			}
			// we are calling a view!
			if(func[isViewSymbol] === true) {
				// if not a scope, we should create a scope that
				// includes the template scope
				if(!(args[0] instanceof Scope)){
					args[0] = scope.getTemplateContext().add(args[0]);
				}
			}
			if(arguments.length) {
				args.unshift(new SetIdentifier(newVal));
			}

			// if this is a call like `foo.bar()` the method.thisArg will be set to `foo`
			// for a call like `foo()`, method.thisArg will not be set and we will default
			// to setting the scope as the context of the function
			return func.apply(method.thisArg || scope.peek("this"), args);
		}
	};
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		Object.defineProperty(computeFn, "name", {
			value: "{{" + this.sourceText() + "}}"
		});
	}
	//!steal-remove-end

	if (helperOptions && helperOptions.doNotWrapInObservation) {
		return computeFn();
	} else {
		var computeValue = new SetterObservable(computeFn, computeFn);

		return computeValue;
	}
};
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Call.prototype.sourceText = function(){
		var args = this.argExprs.map(function(arg){
			return arg.sourceText();
		});
		return this.methodExpr.sourceText()+"("+args.join(",")+")";
	};
}
//!steal-remove-end
Call.prototype.closingTag = function() {
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		if(this.methodExpr[sourceTextSymbol]) {
			return this.methodExpr[sourceTextSymbol];
		}
	}
	//!steal-remove-end
	return this.methodExpr.key;
};

module.exports = Call;

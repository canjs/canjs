"use strict";
var expressionHelpers = require("../src/expression-helpers");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var sourceTextSymbol = canSymbol.for("can-stache.sourceText");
var assign = require("can-assign");

// ### Lookup
// `new Lookup(String, [Expression])`
// Finds a value in the scope or a helper.
var Lookup = function(key, root, sourceText) {
	this.key = key;
	this.rootExpr = root;
	canReflect.setKeyValue(this, sourceTextSymbol, sourceText);
};
Lookup.prototype.value = function(scope, readOptions){
	if (this.rootExpr) {
		return expressionHelpers.getObservableValue_fromDynamicKey_fromObservable(this.key, this.rootExpr.value(scope), scope, {}, {});
	} else {
		return scope.computeData(this.key, assign({
			warnOnMissingKey: true
		},readOptions));
	}
};
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Lookup.prototype.sourceText = function(){
		if(this[sourceTextSymbol]) {
			return this[sourceTextSymbol];
		} else if(this.rootExpr) {
			return this.rootExpr.sourceText()+"."+this.key;
		} else {
			return this.key;
		}
	};
}
//!steal-remove-end

module.exports = Lookup;

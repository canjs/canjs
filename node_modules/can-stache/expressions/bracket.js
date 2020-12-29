"use strict";
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	var canSymbol = require('can-symbol');
}
//!steal-remove-end
var expressionHelpers = require("../src/expression-helpers");

// ### Bracket
// For accessing properties using bracket notation like `foo[bar]`
var Bracket = function (key, root, originalKey) {
	this.root = root;
	this.key = key;
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		this[canSymbol.for("can-stache.originalKey")] = originalKey;
	}
	//!steal-remove-end
};
Bracket.prototype.value = function (scope, helpers) {
	var root = this.root ? this.root.value(scope, helpers) : scope.peek("this");
	return expressionHelpers.getObservableValue_fromDynamicKey_fromObservable(this.key.value(scope, helpers), root, scope, helpers, {});
};
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Bracket.prototype.sourceText = function(){
		if(this.rootExpr) {
			return this.rootExpr.sourceText()+"["+this.key+"]";
		} else {
			return "["+this.key+"]";
		}
	};
}
//!steal-remove-end

Bracket.prototype.closingTag = function() {
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		return this[canSymbol.for('can-stache.originalKey')] || '';
	}
	//!steal-remove-end
};

module.exports = Bracket;

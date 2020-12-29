"use strict";
// ### Arg
// `new Arg(Expression [,modifierOptions] )`
// Used to identify an expression that should return a value.
var Arg = function(expression, modifiers){
	this.expr = expression;
	this.modifiers = modifiers || {};
	this.isCompute = false;
};
Arg.prototype.value = function(){
	return this.expr.value.apply(this.expr, arguments);
};
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Arg.prototype.sourceText = function(){
		return (this.modifiers.compute ? "~" : "")+ this.expr.sourceText();
	};
}
//!steal-remove-end

module.exports = Arg;

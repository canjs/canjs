"use strict";
// ### Literal
// For inline static values like `{{"Hello World"}}`
var Literal = function(value){
	this._value = value;
};
Literal.prototype.value = function(){
	return this._value;
};
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Literal.prototype.sourceText = function(){
		return JSON.stringify(this._value);
	};
}
//!steal-remove-end

module.exports = Literal;

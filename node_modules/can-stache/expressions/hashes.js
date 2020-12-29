"use strict";
var canReflect = require("can-reflect");
var Observation = require("can-observation");
var expressionHelpers = require("../src/expression-helpers");

var Hashes = function(hashes){
	this.hashExprs = hashes;
};
Hashes.prototype.value = function(scope, helperOptions){
	var hash = {};
	for(var prop in this.hashExprs) {
		var val = expressionHelpers.convertToArgExpression(this.hashExprs[prop]),
			value = val.value.apply(val, arguments);

		hash[prop] = {
			call: !val.modifiers || !val.modifiers.compute,
			value: value
		};
	}
	return new Observation(function(){
		var finalHash = {};
		for(var prop in hash) {
			finalHash[prop] = hash[prop].call ? canReflect.getValue( hash[prop].value ) : expressionHelpers.toComputeOrValue( hash[prop].value );
		}
		return finalHash;
	});
};
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Hashes.prototype.sourceText = function(){
		var hashes = [];
		canReflect.eachKey(this.hashExprs, function(expr, prop){
			hashes.push( prop+"="+expr.sourceText() );
		});
		return hashes.join(" ");
	};
}
//!steal-remove-end

module.exports = Hashes;

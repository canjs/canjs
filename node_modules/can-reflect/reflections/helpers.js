"use strict";
var canSymbol = require("can-symbol");

module.exports = {
	makeGetFirstSymbolValue: function(symbolNames){
		var symbols = symbolNames.map(function(name){
			return canSymbol.for(name);
		});
		var length = symbols.length;

		return function getFirstSymbol(obj){
			var index = -1;

			while (++index < length) {
				if(obj[symbols[index]] !== undefined) {
					return obj[symbols[index]];
				}
			}
		};
	},
	// The `in` check is from jQuery’s fix for an iOS 8 64-bit JIT object length bug:
	// https://github.com/jquery/jquery/pull/2185
	hasLength: function(list){
		var type = typeof list;
		if(type === "string" || Array.isArray(list)) {
			return true;
		}
		var length = list && (type !== 'boolean' && type !== 'number' && "length" in list) && list.length;

		// var length = "length" in obj && obj.length;
		return typeof list !== "function" &&
			( length === 0 || typeof length === "number" && length > 0 && ( length - 1 ) in list );
	}
};

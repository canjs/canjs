
"use strict";
module.exports = function(){
	var def = {};
	def.promise = new Promise(function(resolve, reject){
		def.resolve = resolve;
		def.reject = reject;
	});
	return def;
};

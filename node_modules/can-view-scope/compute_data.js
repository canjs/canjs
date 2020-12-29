"use strict";

var ScopeKeyData = require('./scope-key-data');

module.exports = function(scope, key, options){
	return new ScopeKeyData(scope, key, options || {
		args: []
	});
};

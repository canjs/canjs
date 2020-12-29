"use strict";

var canReflect = require("can-reflect");
var diffList = require("can-diff/list/list");

module.exports = function(list, update, id, make){

	var patches = diffList(list, update, function(a, b){
		return id(a) === id(b);
	});
	patches.forEach(function(patch){
		canReflect.splice(list, patch.index, patch.deleteCount, patch.insert.map(make));
	});
};

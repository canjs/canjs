'use strict';
var getCID = require("../can-cid").get;
var helpers = require("../helpers");

var CIDSet;

if(typeof Set !== "undefined") {
	CIDSet = Set;
} else {
	var CIDSet = function(){
		this.values = {};
	};
	CIDSet.prototype.add = function(value){
		this.values[getCID(value)] = value;
	};
	CIDSet.prototype["delete"] = function(key){
		var has = getCID(key) in this.values;
		if(has) {
			delete this.values[getCID(key)];
		}
		return has;
	};
	CIDSet.prototype.forEach = function(cb, thisArg) {
		helpers.each(this.values, cb, thisArg);
	};
	CIDSet.prototype.has = function(value) {
		return getCID(value) in this.values;
	};
	CIDSet.prototype.clear = function() {
		return this.values = {};
	};
	Object.defineProperty(CIDSet.prototype,"size",{
		get: function(){
			var size = 0;
			helpers.each(this.values, function(){
				size++;
			});
			return size;
		}
	});
}

module.exports = CIDSet;

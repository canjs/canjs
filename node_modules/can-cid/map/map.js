'use strict';

var getCID = require("../can-cid").get;
var helpers = require("../helpers");

var CIDMap;

if(typeof Map !== "undefined") {
	CIDMap = Map;
} else {
	var CIDMap = function(){
		this.values = {};
	};
	CIDMap.prototype.set = function(key, value){
		this.values[getCID(key)] = {key: key, value: value};
	};
	CIDMap.prototype["delete"] = function(key){
		var has = getCID(key) in this.values;
		if(has) {
			delete this.values[getCID(key)];
		}
		return has;
	};
	CIDMap.prototype.forEach = function(cb, thisArg) {
		helpers.each(this.values, function(pair){
			return cb.call(thisArg || this, pair.value, pair.key, this);
		}, this);
	};
	CIDMap.prototype.has = function(key) {
		return getCID(key) in this.values;
	};
	CIDMap.prototype.get = function(key) {
		var obj = this.values[getCID(key)];
		return obj && obj.value;
	};
	CIDMap.prototype.clear = function() {
		return this.values = {};
	};
	Object.defineProperty(CIDMap.prototype,"size",{
		get: function(){
			var size = 0;
			helpers.each(this.values, function(){
				size++;
			});
			return size;
		}
	});
}

module.exports = CIDMap;

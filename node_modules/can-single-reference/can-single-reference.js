"use strict";
var CID = require("can-cid");

var singleReference;

function getKeyName(key, extraKey) {
	var keyName = extraKey ? CID(key) + ":" + extraKey : CID(key);
	return keyName || key;
}

// weak maps are slow
/* if(typeof WeakMap !== "undefined") {
	var globalMap = new WeakMap();
	singleReference = {
		set: function(obj, key, value){
			var localMap = globalMap.get(obj);
			if( !localMap ) {
				globalMap.set(obj, localMap = new WeakMap());
			}
			localMap.set(key, value);
		},
		getAndDelete: function(obj, key){
			return globalMap.get(obj).get(key);
		},
		references: globalMap
	};
} else {*/
singleReference = {
	// obj is a function ... we need to place `value` on it so we can retreive it
	// we can't use a global map
	set: function(obj, key, value, extraKey){
		// check if it has a single reference map
		obj[getKeyName(key, extraKey)] = value;
	},

	getAndDelete: function(obj, key, extraKey){
		var keyName = getKeyName(key, extraKey);
		var value = obj[keyName];
		delete obj[keyName];
		return value;
	}
};
/*}*/

module.exports = singleReference;

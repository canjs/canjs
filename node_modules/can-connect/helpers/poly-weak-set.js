"use strict";
var canReflect = require("can-reflect");

var PolyWeakSet = function(getKey){
	this.set = {};
	this.getKey = getKey;
};

// if weakmap, we can add and never worry ...
// otherwise, we need to have a count ...

canReflect.assignMap(PolyWeakSet,{
	has: function(item){
		return !!this.set( this.getKey(item) );
	},
	addReference: function(item){
		var id = this.getKey(item);
		var data = this.set[id];
		if(!data) {
			data = this.set[this.getKey(item)] = {
				item: item,
				referenceCount: 0,
				key: this.getKey(item)
			};
		}
		data.referenceCount++;
	},
	deleteReference: function(item){
		var id = this.getKey(item);
		var data = this.set[id];
		if(data){
			data.referenceCount--;
			if( data.referenceCount === 0 ) {
				delete this.set[id];
			}
		}
	},
	get: function(item){
		var id = this.getKey(item);
		var data = this.set[id];
		if(data) {
			return data.item;
		}
	}
});

module.exports = PolyWeakSet;

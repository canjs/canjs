"use strict";
var canReflect = require("can-reflect");

function toDate(str) {
	var type = typeof str;
	if (type === 'string') {
		str = Date.parse(str);
		return isNaN(str) ? null : new Date(str);
	} else if (type === 'number') {
		return new Date(str);
	} else {
		return str;
	}
}

function DateStringSet(dateStr){
	this.setValue = dateStr;
	var date = toDate(dateStr);
	this.value = date == null ? date : date.getTime();
}
DateStringSet.prototype.valueOf = function(){
	return this.value;
};
canReflect.assignSymbols(DateStringSet.prototype,{
	"can.serialize": function(){
		return this.setValue;
	}
});

module.exports = canReflect.assignSymbols(toDate,{
	"can.new": toDate,
	"can.getSchema": function(){
		return {
			type: "Or",
			values: [Date, undefined, null]
		};
	},
	"can.ComparisonSetType": DateStringSet,
    "can.getName": function(){
        return "MaybeDate";
    },
	"can.isMember": function(value) {
		return value == null || (value instanceof Date);
	}
});

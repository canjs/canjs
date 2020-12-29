"use strict";
var canReflect = require("can-reflect");

function toBoolean(val) {
	if(val == null) {
		return val;
	}
	if (val === 'false' || val === '0' || !val) {
		return false;
	}
	return true;
}

module.exports = canReflect.assignSymbols(toBoolean,{
	"can.new": toBoolean,
	"can.getSchema": function(){
		return {
			type: "Or",
			values: [true, false, undefined, null]
		};
	},
    "can.getName": function(){
        return "MaybeBoolean";
    },
	"can.isMember": function(value) {
		return value == null || typeof value === "boolean";
	}
});

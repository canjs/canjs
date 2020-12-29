"use strict";
var canReflect = require("can-reflect");

function toNumber(val) {
	if (val == null) {
		return val;
	}
	return +(val);
}

module.exports = canReflect.assignSymbols(toNumber,{
	"can.new": toNumber,
	"can.getSchema": function(){
		return {
			type: "Or",
			values: [Number, undefined, null]
		};
	},
    "can.getName": function(){
        return "MaybeNumber";
    },
	"can.isMember": function(value) {
		return value == null || typeof value === "number";
	}
});

"use strict";
var Observation = require("can-observation");
var compute = require("can-compute");
var canReflect = require("can-reflect");
var DefineMap = require("can-define/map/map");


var map = new DefineMap({first: "Justin", last: "Meyer"});

window.doNothing= function(arg){
	window.SOMETHING = arg;
};

var now = new Date();
for(var i = 0; i< 100000; i++) {
	var c = new Observation(function(){
		return map.first + map.last;
	});
	canReflect.onValue(c,function(){});
	doNothing(c);
}
console.log(new Date() - now);




var now = new Date();
for(var i = 0; i< 100000; i++) {
	var c = compute(function(){
		return map.first + map.last;
	});
	c.on("change", function(){});
	doNothing(c);
}
console.log(new Date() - now);

var steal = require("steal").clone();

global.System = steal.System;

steal.import("can/util/vdom/test/main.stache!").then(function(renderer){
	var res = renderer({});
	var div = document.createElement("div");
	div.appendChild(res);
	console.log("got it!", div.innerHTML);
}, function(e){
	console.log(e);
});

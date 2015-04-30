/* global __dirname */
var steal = require("steal").clone();
var path = require("path");

steal.config({
	config: path.join(__dirname,"..","..", "..","package.json!npm")
});

steal.import("can/util/vdom/test/main.stache!").then(function(renderer){
	var res = renderer({});
	var div = document.createElement("div");
	div.appendChild(res);
	console.log("got it!", div.innerHTML);
}, function(e){
	console.log(e);
});

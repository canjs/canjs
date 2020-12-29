var can = require("can");
var stache = require("can/view/stache/");

can.Component.extend({
	tag: "hello-world",
	template: stache("Hello world!")
});

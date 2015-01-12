var can = require("../../../can.js");

can.Component.extend({
	tag: "hello-world",
	template: "{{message}}",
	scope: {
		message: "Hello World"
	}
});

window.can= can;

var can = require("../../../dist/cjs/can.js");

can.Component.extend({
	tag: "hello-world",
	template: "{{message}}",
	scope: {
		message: "Hello World"
	},
	events: {
		init: function() {
			// Access scope from $.fn.scope.
			var scope = this.element.scope();
			scope.attr("name", "Matthew");
		}
	}
});

window.can = can;

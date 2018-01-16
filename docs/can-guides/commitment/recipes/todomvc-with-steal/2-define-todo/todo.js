// models/todo.js
var DefineMap = require("can-define/map/");

var Todo = DefineMap.extend("Todo", {
	id: "string",
	name: "string",
	complete: {
		type: "boolean",
		default: false
	},
	toggleComplete: function() {
		this.complete = !this.complete;
	}
});

module.exports = Todo;

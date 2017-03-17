// models/todo.js
var DefineMap = require("can-define/map/"),
	DefineList = require("can-define/list/");

var Todo = DefineMap.extend("Todo", {
	id: "string",
	name: "string",
	complete: {
		type: "boolean",
		value: false
	},
	toggleComplete: function() {
		this.complete = !this.complete;
	}
});

Todo.List = DefineList.extend("TodoList", {
	"#": Todo,
	get active() {
		return this.filter({
			complete: false
		});
	},
	get complete() {
		return this.filter({
			complete: true
		});
	},
	get allComplete() {
		return this.length === this.complete.length;
	}
});

module.exports = Todo;
